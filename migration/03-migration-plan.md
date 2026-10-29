# Migration plan: Booster → Dawn

Goal: a Dawn-based theme with **functional parity** for everything in [02-custom-inventory.md](02-custom-inventory.md), on Dawn's neutral styling. The visual redesign follows on top of it. "Parity" here means behaviour, data and tracking, not Booster's look.

---

## Phase 0: Decide and prepare

- [x] Base theme decided: **Dawn** (2026-10-29), see [01-base-theme-decision.md](01-base-theme-decision.md).
- [ ] Run the spike in the decision doc §7 (Rebuy Smart Cart, `Add To Cart` push, one mattress PDP).
- [ ] Check **Settings → Customer accounts**; upgrade to new customer accounts if still legacy (Dawn 16 has no legacy templates).
- [ ] Get answers to the open questions in [README.md](README.md#open-questions).
- [ ] Run `queries/template-assignments.graphql` and save the output as `migration/data/template-assignments.json`.
- [ ] Record a baseline before anything changes: Lighthouse mobile for home / collection / mattress PDP / pillow PDP / cart; GA4 + Ads conversion counts for the last 28 days; a full crawl export (titles, meta, canonicals, schema).
- [ ] Optional quick wins on the **live** Booster theme, independent of the migration: remove the duplicate GTM load, remove the stale Klarna hack, fix the `header-alt` reference (inventory §11).

## Phase 1: Foundation

Repo setup: a separate repo for the new theme (this one), so the live Booster repo and its Shopify GitHub connection stay untouched until cutover.

- [ ] Dawn v16.0.0 in place: either `git clone` + `git checkout v16.0.0` (keeps Dawn history), or a downloaded zip committed untouched as the first commit on a `dawn-upstream` branch, with `main` created from it. The [repo README](../README.md#updating-dawn) explains how each path takes upstream updates later.
- [ ] Dawn's `README.md` replaced by the REM-Fit README (from `migration/REPO-README.md`); Dawn's `LICENSE.md` kept. Dawn's `release-notes.md` and `.github/` workflows can go.
- [ ] Upstream #4004 ("Fix cart icon and drawer refresh after Standard Actions updates", on Dawn `main` since 2026-10-22) merged or cherry-picked, until it ships in a 16.0.x release.
- [ ] Pushed as an unpublished theme: `shopify theme push --unpublished --theme "REM-Fit Dawn (dev)" --store rem-fit-uk`. Theme ID recorded in `migration/README.md`.

Conventions are in the [repo README](../README.md#conventions). Dawn has no theme blocks, so some core files must change; each change stays a **hook line** rendering an `rf-` snippet and goes on the README's touched-files list. Expected hooks:

- `layout/theme.liquid`: `rf-head` (tracking, consent, schema) and `rf-body-end` (bridges, small globals).
- `sections/main-product.liquid`: extra `rf_*` block types in the schema + one `{%- when 'rf_…' -%}` branch per type, each a one-line `render 'rf-pdp-<type>'`.
- `snippets/buy-buttons.liquid`: one render of `rf-line-item-properties` inside the product form; ATC subtext.
- `snippets/card-product.liquid`: badges, total value, Klarna line.
- `sections/header.liquid`: mega-menu extras.
- `sections/main-cart-items.liquid` / `main-cart-footer.liquid`: cart extras.

Foundation tasks:

- [ ] Theme settings: logo, favicon, colours/typography placeholders, social links; `cart_type` = **drawer** (required for Rebuy, see decision doc §4); dynamic checkout buttons **off** (they bypass Smart Cart).
- [ ] Header and footer section groups, menus, announcement bar.
- [ ] App embeds re-enabled: Rebuy Connector, EasyGift, Discounty, Klaviyo, Gorgias, ShipZip, Clarity, Hulk Form Builder, BM Country Blocker.
- [ ] `templates/cart.sbz_proxy.liquid` copied over unchanged (ShipZip needs it).
- [ ] **Tracking layer:** `snippets/rf-tracking.liquid` + `assets/rf-tracking.js`:
  - GTM `GTM-NFT2J24` loaded **once**, with one `<noscript>`.
  - Google Ads `AW-864944454` with enhanced conversions (or moved to GTM / the Google & YouTube app).
  - Decide what stays theme-side versus Customer Events pixels (Hyros, Webgains).
  - Keep the delayed-until-interaction loading only if marketing accepts missing bounce sessions.
  - Gate on `Shopify.customerPrivacy` consent.
- [ ] **`Add To Cart` dataLayer push** in `rf-tracking.js`: `subscribe(PUB_SUB_EVENTS.cartUpdate, …)`, filtered to `source === 'product-form'`. Map `cartData` (the `/cart/add` response) to `{ id, name: title, brand: vendor, price: price / 100, variant: variant_title }` exactly as in inventory §1.3. Card quick-add uses the same product form; check it pushes once.
- [ ] **Rebuy bridge** `assets/rf-rebuy-bridge.js` (decision doc §4):
  - Hide Dawn's `cart-drawer` under `.smart-cart--enabled` and close it from Rebuy's hide callback.
  - Re-render the `cart-icon-bubble` section on `rebuy:cart.change`.
  - Point `Shopify.actions.openCart` at `Rebuy.SmartCart.show()`.
- [ ] Global UI: Gorgias launcher tweaks, sticky header (Dawn setting), mobile bottom nav (relative URLs), read-more toggles, policy-table CSS from the old `bodyCSS` setting.
- [ ] SEO base: title pattern, canonical, blog `noindex, follow` rule, `layout/no-index` + `page.no-index`, Organization/WebSite/Breadcrumb JSON-LD. Dawn already outputs Product and Article JSON-LD, so decide one source per entity.

## Phase 2: Commerce core (highest risk)

- [ ] Smart Cart is the only cart UI: Dawn drawer hidden, `/cart` page still works for direct visits, Rebuy "Use Cart Page" setting decided.
- [ ] `rf-line-item-properties` (inside Dawn's product form): one rule for `properties[Note]` (selected variant's `varia.delayed_delivery`, fallback product `delayed.delivery` when sold out) and `properties[Trial]` (`sleep.trial`). Updated on `PUB_SUB_EVENTS.variantChange`, not by reading the URL. Variant data comes from a JSON script tag rendered in Liquid.
- [ ] Cart attribute `delayed-delivery` when a line is out of stock (cart page + Smart Cart: check whether Rebuy needs a cart attribute script).
- [ ] Free gift (`rf-pdp-free-gift`) + EasyGift auto-add + Rebuy `196540`.
- [ ] Quantity bundles (`rf-pdp-quantity-bundles`): radio cards that drive Dawn's `quantity` input, showing the same numbers the discount applies.
- [ ] Discount code widget behind a setting (off by default); relative `/discount/CODE` call.
- [ ] Cart page extras (`main-cart-items` hook): mattress "right choice" bar, Rebuy `81245`/`60607`, Klarna, payment/awards images, Gorgias link (explicit, not by block ID).
- [ ] Rebuy protector upsell Vue template re-targeted at Dawn's variant input (`product-form input[name="id"]`) via `variantChange`.

## Phase 3: Product page

Map Booster blocks to Dawn's `main-product` blocks or new `rf_*` block types (one `snippets/rf-pdp-*.liquid` each):

| Booster block / piece | Dawn |
|---|---|
| `productPageTitle`, `productPageTitledefault` | `title` (native) |
| `sleeptrail` | `rf_sleep_trial` |
| `productPagePrice` + Klarna + instalment maths + "p/m" styling | `price` + `rf_finance_message` (instalments from variant JSON) + Klarna/DivideBuy `@app` blocks |
| `productPageSwatch` (dropdown) | `variant_picker` (picker type: dropdown) |
| `productPageATC` | `buy_buttons` (dynamic checkout off) + ATC subtext via the buy-buttons hook |
| Delivery cutoff countdown | `rf_delivery_cutoff` (JS, client-side clock) |
| Almost-sold / new-stock bars | `rf_stock_progress` |
| GoCertify "extra 8% off" link + `<gocertify-placement>` | `rf_gocertify` (or `custom_liquid`) |
| "Help me choose" (Typeform) | `rf_help_me_choose` |
| Quantity bundles (pillows/protectors) | `quantity_selector` (hidden) + `rf_quantity_bundles` |
| `productPageAccordion` | `collapsible_tab` (native; one block per row) |
| `accordionGroupStart/End` (grouped accordions, one open at a time) | `rf_accordion_group`: one block rendering its rows from a metaobject list or block settings, so no fake nesting |
| Spec tables (`custom.specs`) | `rf_spec_table` (or inside a `collapsible_tab` via `custom_liquid`) |
| Rebuy accordions (`rebuy-accordians`) | Rebuy `@app` blocks as siblings, or `data-rebuy-id` rows inside `rf_accordion_group` |
| `productPagebadges` / awards strip | `rf_awards_strip` |
| `productPageUpgrades` | `rf_upgrade_card` |
| `freegiftbundle` | `rf_free_gift` |
| `productPageDelivery`, `productPageLDelivery`, `productPageDeliveryNote` | `rf_delivery_note` (static text or date range) |
| `productPageImageNote`, `productPageAssurances`, `productPageCustomHtml`, `productPageDiscount` | `rf_image_note`, `rf_assurances`, `custom_liquid`, `rf_discount` |
| `trustpilotwidget` + mobile strip | Trustpilot `@app` block, or `rf_trustpilot` reading a metaobject (not theme settings) |
| Countdown (Booster + `remfit(t).customcountdown`) | `rf_countdown` from one metafield |
| Gallery `verticalDouble` + lightbox | `main-product` media layout (stacked or thumbnails) + image zoom lightbox (native) |
| Gallery video blocks + mobile carousel placement | Product media videos (native); extra placement rules only if still wanted, in `rf-pdp-media.js` |
| Bed-frame / divan selector | `rf_sibling_selector` from a product-reference list metafield |
| Quick navigation bar | `sections/rf-pdp-anchor-nav` |
| `product.reworked` custom sections | `sections/rf-*` (this is the PDP direction to follow) |
| Section Store `ss-*` sections | Reinstall via Section Store, or rebuild as `rf-` sections |
| AI-generated theme blocks (`blocks/ai_gen_block_*`) | Rebuild as `rf-` sections (Dawn doesn't render theme blocks) |

Product templates: start from the assignment query. Proposed target set (final names depend on what's assigned):

| Target | Replaces | Notes |
|---|---|---|
| `product.json` (mattress) | default, `reworked`, `eco-mattresses`, `natural-mattress`, `rejuvenated-mattress`, `remy-plus`, `hukd-special`, `info-prioritized`, `changed-delivery-terms`, `mattress-bundle`, `grid-layout-mobile` | Differences become block settings/metafields |
| `product.pillow` | `pillows-template`, `500-cool-pillow-template`, `snow-pillow-with-video`, `free-gift-pillow` | Quantity bundles |
| `product.protector` | `protectors`, `pillow-protector` | |
| `product.bed` | `bed-frame`, `divan-bed` | Sibling selector |
| `product.topper`, `product.bedding` | `topper`; `bedding`, `sleep-pod`, `tech` | |
| `product.clearance` | `clearance-product` | |
| `product.landing` | `landing-no-header`, `landing-alt-header` | Layout without the header |

**Cutover rule:** a resource assigned to a template suffix that doesn't exist in the published theme silently falls back to the default template. Either keep every assigned suffix name for launch (simplest: duplicate JSON files with the same sections), or bulk-reassign with `productUpdate(input: {id, templateSuffix})` **in the same window as publishing**. Coordinate with Laurie, who owns product data.

## Phase 4: Collections, navigation, search

- [ ] Mega menu (Dawn header `menu_type_desktop: mega`): product cards, promo text per category (from a metaobject), free-gift badges, GoCertify item, Typeform link.
- [ ] Mobile category icon strip (menu-driven, not hard-coded).
- [ ] Collection banner product slider (collection metafields `slider.*`, `mobile.*`); consider a product-list metafield instead of 8 handle fields.
- [ ] Dawn facets/sort/pagination. Dawn paginates by default; infinite scroll or "load more" needs an `rf-` addition: decide.
- [ ] Product card (`card-product` hook): free-gift badge, total-value tooltip, Klarna message, review stars, "Save X%".
- [ ] `collection.rem-fit` sections ported as `rf-` sections.
- [ ] Predictive search (native).

## Phase 5: Content pages, blog, SEO

- [ ] Page templates (19 today): FAQ, financing (calculator + repayments with **confirmed** APR table), contact (Hulk forms?), delivery guide, 100-night trial, awards, about, reviews, klarna, spin-and-win, video, compare products, delivery notification, landing variants, mattress finder (if shipping).
- [ ] Blog + `blog.booster` custom layout; article schema + FAQ parsing.
- [ ] Page/FAQ JSON-LD (`schema-page`, `schema-faq` logic ported).
- [ ] Homepage: custom hero, SEO content, Section Store sections, rebuilt AI blocks.

## Phase 6: Data

- [ ] Re-bind every dynamic source (metafields) in the new templates; inventory §8 lists them.
- [ ] Agree metaobject restructure with Laurie (awards, why-choose, USPs, layers, upgrade checklist, guarantees, Trustpilot rating, promo texts, accordion-group rows). Migrate via the Admin API **after** launch if it would delay cutover.
- [ ] Add `custom.product_family` (+ boolean flags) and backfill via the Admin API.
- [ ] Re-enter theme-setting content (promo texts, free-gift texts, discount widget, etc.).

## Phase 7: QA parity and cutover

### Parity checklist (run on the unpublished theme preview)

**Tracking**
- [ ] GTM container loads once (Network: one `gtm.js?id=GTM-NFT2J24`).
- [ ] `Add To Cart` dataLayer payload identical to inventory §1.3; GTM preview shows the trigger firing once (PDP add and card quick add).
- [ ] Google Ads conversion + enhanced conversions fire on purchase (Customer Events / Ads diagnostics).
- [ ] Clarity, Hotjar, Bing, Meta, Floodlight, Webgains each fire once.
- [ ] Consent: declining in the privacy banner stops the non-essential tags.

**Cart and orders** (place real test orders with a 100% discount code or a test gateway)
- [ ] Smart Cart opens on every add path; Dawn's drawer never shows; header count right after Smart Cart edits and after removing the last item.
- [ ] Line item `Note` shows the selected variant's value; `Trial` appears when out of stock.
- [ ] `delayed-delivery` cart attribute, `Shipping Delivery Date` (ShipZip) on the order.
- [ ] Free gift auto-added (EasyGift) for an eligible mattress + size.
- [ ] Pillow bundle 2/3/4 → discounted totals match the PDP numbers.
- [ ] Rebuy widgets render on PDP, cart and Smart Cart; protector upsell size sync.
- [ ] DivideBuy, Klarna and GoCertify widgets work; finance calculator ATC works.

**Content and SEO**
- [ ] Every assigned template suffix renders the intended layout (spot-check one resource per suffix).
- [ ] Crawl diff vs the baseline: titles, meta, canonicals, H1, robots, structured data (Rich Results Test on PDP, FAQ page, article).
- [ ] No duplicate Product/Article JSON-LD.

**Quality**
- [ ] Lighthouse mobile ≥ baseline on all 5 pages; no layout shift from the header or app widgets.
- [ ] Keyboard and screen-reader pass on PDP and cart (Dawn is a good base, so check our `rf-` pieces).
- [ ] Real devices: iOS Safari, Android Chrome; theme editor works for Laurie (`rf_*` blocks addable, no Liquid errors).

### Cutover

1. Announce a theme-editor **content freeze** on the live theme (Laurie edits it directly).
2. Final template-suffix check / bulk reassign (Phase 3 cutover rule).
3. Publish the Dawn theme during low traffic. Keep the Booster theme unpublished in the library as the **rollback**: republishing it reverts in a minute.
4. Connect the new repo to the live theme via the Shopify GitHub integration; leave the old repo read-only.
5. Watch for 72 h: GA4/Ads conversions vs baseline (daily), Shopify orders with `Note` properties, Search Console coverage/404s, Rebuy/Klaviyo dashboards, Clarity rage clicks.

## After parity: redesign

The redesign starts from this Dawn base: design tokens in theme settings/colour schemes, `rf-` snippets restyled, templates recomposed in the editor. Because logic lives in metafield-driven `rf-` snippets behind small hooks, the redesign should be mostly CSS and composition, not logic rewrites.
