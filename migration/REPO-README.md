# REM-Fit UK theme

Shopify theme for **www.rem-fit.co.uk** (store `rem-fit-uk.myshopify.com`), built on **Dawn**.

It replaces the old Booster 6.0.5 theme ([sanodzegg/REM-fit](https://github.com/sanodzegg/REM-fit), which stays live until cutover). The migration is tracked in [`migration/`](migration/README.md); start there.

| | |
|---|---|
| Base | Dawn v16.0.0 (record the exact upstream SHA in `migration/README.md`) |
| Status | Migration in progress: functional parity first, redesign after |
| Live theme | Booster (old repo) until cutover |
| Dev theme | _unpublished theme name + ID once pushed_ |

## Getting started

Requirements: [Shopify CLI](https://shopify.dev/docs/api/shopify-cli) 3.x and staff access to `rem-fit-uk`.

```sh
shopify theme dev --store rem-fit-uk                       # local preview against store data
shopify theme check                                        # lint (Theme Check)
shopify theme push --unpublished --store rem-fit-uk \
  --theme "REM-Fit Dawn (dev)"                             # first upload as an unpublished theme
shopify theme push --store rem-fit-uk --theme <dev-theme-id>   # later uploads
```

While `shopify theme dev` runs, every save uploads straight to the store. A change spread over several files can look broken in the theme editor until the last save syncs, so add a schema setting before (or together with) the Liquid that reads it.

## How this repo is organised

Standard Dawn layout (`assets/`, `config/`, `layout/`, `locales/`, `sections/`, `snippets/`, `templates/`) plus:

- **`rf-` files**: everything REM-Fit adds lives in new files with an `rf-` prefix: `snippets/rf-*.liquid`, `sections/rf-*.liquid`, `assets/rf-*.js|css`.
- **`migration/`**: decision record, inventory of custom functionality from the old theme, plan and QA checklist, helper script and Admin API queries. Shopify ignores this folder (not a theme directory).

## Conventions

- **Don't edit Dawn files beyond a hook line.** If a Dawn file has to change, add the smallest possible hook that renders an `rf-` snippet, mark it with `{%- comment -%} rf: <reason> {%- endcomment -%}`, and add it to [Touched Dawn files](#touched-dawn-files). That list is what makes upstream updates cheap.
- **Business logic reads product data, not names.** Use metafields/flags (e.g. `custom.product_family`), never template suffixes, handles, titles or hard-coded IDs. The old theme broke this rule everywhere; see `migration/02-custom-inventory.md` §9.
- **No jQuery.** Dawn is vanilla JS with custom elements and a small pub/sub (`subscribe`/`publish`, `PUB_SUB_EVENTS`). Hook into those events, and into Shopify's standard events (`window.StandardEvents`), instead of patching `fetch`.
- **Relative URLs only.** No `rem-fit-uk.myshopify.com` or `www.rem-fit.co.uk` links in code.
- **Optional features ship behind a theme setting that's off by default** until the stakeholder approves them.
- **Tracking stays exact.** GTM loads once; the `Add To Cart` dataLayer payload must match `migration/02-custom-inventory.md` §1.3, because GTM triggers depend on it.
- Line endings follow Dawn (LF). Run `shopify theme check` before pushing.

## Touched Dawn files

Every Dawn core file we changed, and why. Re-check each one on every upstream update.

| File | Hook | Why |
|---|---|---|
| _(none yet)_ | | |

## Updating Dawn

Dawn ships a few releases a year ([releases](https://github.com/Shopify/dawn/releases)). Keep a pristine copy on a branch, so updates are a normal git merge:

- **Repo created with `git clone`** (has Dawn's history):
  ```sh
  git remote add upstream https://github.com/Shopify/dawn.git   # once
  git fetch upstream --tags
  git checkout -b chore/dawn-<version> && git merge <tag>
  ```
- **Repo created from a downloaded zip** (no Dawn history): keep a `dawn-upstream` branch holding unmodified Dawn.
  1. Make the first commit on `dawn-upstream` the untouched download, then create `main` from it.
  2. For a new release, check out `dawn-upstream`, replace its files with the new release, commit as `Dawn vX.Y.Z`.
  3. Merge `dawn-upstream` into a `chore/dawn-<version>` branch off `main`.

Either way: resolve conflicts in the [touched files](#touched-dawn-files) first, test on the dev theme, then merge to `main`.

Pending upstream fix: Dawn #4004 ("Fix cart icon and drawer refresh after Standard Actions updates", `main` since 2026-10-22) matters for Rebuy Smart Cart. Merge it, or the 16.0.x release that contains it.

## Deploying

- The live theme will be connected to `main` through the Shopify GitHub integration, the same setup as the old repo.
- The theme editor commits its changes back (`Update from Shopify for theme …`), mostly to `templates/*.json` and `config/settings_data.json`. **`git pull` before editing those files.**
- Rollback: the Booster theme stays in the theme library, unpublished, until the new theme has been live and stable for a few weeks. Republishing it reverts the storefront.

## Working with the team

- **Laurie Goldsmith** (REM-Fit) sends the dev briefs, approves optional changes, and edits the live theme in the theme editor. Briefs get a reply per item: what changed (file/app/setting) plus evidence.
- **Product copy is not managed in the theme.** Descriptions, FAQs and page copy are edited via the Admin API, so don't hard-code copy into Liquid or edit `descriptionHtml` from the theme side. The same goes for metafield content.
- Theme-editor changes during development land on the dev theme, not `main`, until it's connected. Agree a content freeze on the live theme before cutover (`migration/03-migration-plan.md`, Phase 7).

## Licence

Dawn is © Shopify and distributed under its own licence. Keep Dawn's `LICENSE.md` in the repo.
