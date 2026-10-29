"""Report which sections, snippets and assets a Shopify theme actually uses.

Usage:  python3 -I migration/scripts/audit-usage.py <theme root>
(e.g. ../REM-fit for the old Booster theme, or . for this theme)

Static analysis only: a section fetched by JS through `?section_id=` (e.g. Booster's
api__minicart) or a snippet rendered through a variable will show as unused, so
grep for the name before deleting anything.
"""
import os
import re
import sys
from collections import defaultdict

root = sys.argv[1] if len(sys.argv) > 1 else '.'


def files(d, ext=None):
    out = []
    for dp, _, fs in os.walk(os.path.join(root, d)):
        for f in fs:
            if ext is None or f.endswith(ext):
                out.append(os.path.join(dp, f))
    return out


def read(p):
    with open(p, encoding='utf-8', errors='replace') as fh:
        return fh.read()


def rel(p):
    return os.path.relpath(p, root)


liquid = {p: read(p) for d in ['layout', 'sections', 'snippets', 'templates', 'blocks'] for p in files(d, '.liquid')}
jsons = {p: read(p) for d in ['templates', 'sections', 'config'] for p in files(d, '.json')}
js = {p: read(p) for p in files('assets', '.js')}

# Snippets: static render/include tags
snippet_names = [os.path.basename(p)[:-7] for p in files('snippets', '.liquid')]
snippet_refs = defaultdict(set)
for p, t in liquid.items():
    for m in re.finditer(r"(?:render|include)\s+['\"]([^'\"]+)['\"]", t):
        snippet_refs[m.group(1).removesuffix('.liquid')].add(rel(p))

# Sections: JSON templates / section groups / settings_data, {% section %} tags, ?section_id= fetches
section_names = [os.path.basename(p)[:-7] for p in files('sections', '.liquid')]
section_refs = defaultdict(set)
for p, t in jsons.items():
    for m in re.finditer(r'"type"\s*:\s*"([^"]+)"', t):
        section_refs[m.group(1)].add(rel(p))
for p, t in liquid.items():
    for m in re.finditer(r"\{%-?\s*section\s+['\"]([^'\"]+)['\"]", t):
        section_refs[m.group(1)].add(rel(p))
for p, t in list(liquid.items()) + list(js.items()):
    for m in re.finditer(r"section_id=([A-Za-z0-9_\-]+)", t):
        section_refs[m.group(1)].add(rel(p) + ' (section_id)')

# Assets: referenced by file name anywhere outside themselves
asset_paths = files('assets')
haystack = {p: read(p) for p in list(liquid) + list(jsons) + asset_paths if not p.endswith(('.png', '.jpg', '.gif', '.webp', '.woff', '.woff2'))}

print('## Snippets with no static render/include')
for n in sorted(snippet_names):
    if not (snippet_refs.get(n, set()) - {f'snippets/{n}.liquid'}):
        print('  ', n)

print('\n## Sections: reference count')
for n in sorted(section_names):
    r = section_refs.get(n, set())
    print(f'   {len(r):3d}  {n}' + ('' if r else '  UNUSED'))

print('\n## Section types referenced in JSON/Liquid with no file (app blocks and block types excluded)')
for n in sorted(section_refs):
    if n in section_names or n.startswith('shopify://') or n.startswith('@'):
        continue
    if any(r.startswith('layout/') for r in section_refs[n]):
        print('  ', n, sorted(section_refs[n]))

print('\n## Assets referenced by nothing')
for a in sorted(asset_paths):
    name = os.path.basename(a)
    if not any(name in t for p, t in haystack.items() if p != a):
        print('  ', rel(a))
