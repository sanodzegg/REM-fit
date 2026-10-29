# Booster → Dawn migration

Moving www.rem-fit.co.uk off **Booster 6.0.5** (paid third-party theme, heavily customised) onto **Dawn**. The redesign follows after functional parity.

**The old theme** lives in [sanodzegg/REM-fit](https://github.com/sanodzegg/REM-fit) (`master`) and stays live until cutover. Every file path in these docs that isn't a Dawn or `rf-` file (e.g. `snippets/block__product-page--atc.liquid`, `assets/booster.js`) refers to that repo, as audited at commit `42abd2b` (2026-10-29). Keep a checkout of it next to this repo while porting.

| Doc | What's in it |
|---|---|
| [01-base-theme-decision.md](01-base-theme-decision.md) | Decision record: why Dawn (vs Horizon and Skeleton), measured performance, Rebuy Smart Cart setup on Dawn, the spike |
| [02-custom-inventory.md](02-custom-inventory.md) | **Every custom implementation in the old theme**: tracking, ATC/cart, order data, finance, PDP, SEO, metafields, apps, bugs, dead code. Tick items off as they're ported. |
| [03-migration-plan.md](03-migration-plan.md) | Phases, conventions, block and template mapping, parity QA checklist, cutover and rollback |
| [scripts/audit-usage.py](scripts/audit-usage.py) | Lists unused sections, snippets and assets in a theme folder |
| [queries/template-assignments.graphql](queries/template-assignments.graphql) | Admin API queries: which products, collections, pages and articles use which template |

Repo conventions, the touched-Dawn-files list and the upstream update process are in the [repo README](../README.md).

## Status

| Item | State |
|---|---|
| Base theme | **Dawn**, decided 2026-10-29 |
| Dawn version | v16.0.0 (`bc39a7d`) + upstream #4004 until 16.0.x ships; _record the actual base SHA/download here_ |
| Repo | this repo; _record how it was created (git clone or zip) and the remote URL_ |
| Dev theme | _not pushed yet: record name + ID_ |
| Spike (decision doc §7) | _not started_ |
| Customer accounts (legacy vs new) | _unknown: check admin. Dawn 16 needs new customer accounts (decision doc §6)_ |
| Template assignment export | _not run_ |
| Baseline (Lighthouse, conversions, crawl) | _not recorded_ |

## Next steps

1. Push this repo to an unpublished theme and record its ID above.
2. Check customer accounts in admin.
3. Run `queries/template-assignments.graphql` and save the result as `migration/data/template-assignments.json`.
4. Record the baseline (plan, Phase 0).
5. Run the spike: Rebuy bridge, `Add To Cart` push, one mattress PDP (decision doc §7).
6. Chase answers to the open questions below.

## Open questions

Each needs an owner's answer before the matching work starts. Inventory section in brackets.

1. **Cart owner:** plan assumes Rebuy Smart Cart V2 stays the cart (as live today), with Dawn's drawer hidden. Confirm, and decide whether `/cart` stays a real page (Rebuy "Use Cart Page"). (§2.1)
2. **Order data:** do CS/fulfilment rely on line-item `Note` / `Trial` and the `delayed-delivery` cart attribute? What should `Note` contain? (§2.2)
3. **Quantity bundles:** is the pillow/protector discount applied by Discounty or a Shopify automatic discount, and at what rates? Is the code `pillows` still active? (§2.4)
4. **Delivery cutoff rules:** is the weekday table (12:00 cutoff, start/end days) still correct? (§2.3)
5. **Finance:** confirm the DivideBuy APR table (0% to 12 months, 9.9% for 18–48 months, 9.9% hidden under £400). (§3)
6. **GTM ownership:** who can fix the double load, remove the dead UA / chatservice tags and confirm the `Add To Cart` trigger? (§1.2, §1.3)
7. **Clarity:** which project is canonical, `xbg1rj5w2u` (theme + app) or `qnqjpu9idi` (GTM)? (§1.1)
8. **Hyros / Convert:** is the theme copy of Hyros still needed alongside the custom pixel? Is Convert Experiences still used? (§1.1)
9. **Consent:** should tags be gated on Shopify's privacy banner, or does GTM consent mode already handle it? (§1.4)
10. **Mattress finder:** ship the quiz built in Aug 2026 (not placed on any template today)? (§4.5)
11. **Section Store:** reinstall the `ss-*` sections under the existing licence, or rebuild them? (§4.4)
12. **Checkout:** are the old `checkout.liquid` features (shipping method descriptions, delivery date picker, postcode lookup) now in Checkout Extensibility? (§11, item 14)
13. **Unknown app:** which app loads `content.9gtb.com`? (§1.5)
14. **Metafields:** OK with Laurie to restructure repeated metafield sets into metaobjects, and when? (§8)

## Fixes that belong in the old theme, not here

These are live bugs in the Booster theme (inventory §11). They can be fixed in the old repo now without waiting for cutover:

- GTM loads twice, so every GTM tag fires twice: remove the `GTM-2` entry in `snippets/inject-js-after-scroll-or-click.liquid`.
- The Klarna `content_for_header | remove:` hack is stale and the delayed loader requests a dead Klarna URL.
- Pages using `landing-alt-header` reference a missing `header-alt` section.
