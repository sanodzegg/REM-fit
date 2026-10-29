# Custom functionality inventory

Everything in the current theme (Booster 6.0.5, heavily customised) that is **not** stock theme behaviour and must be consciously ported, replaced or dropped. Treat this file as the functional spec for the new theme.

Audited 2026-10-29 from the old Booster repo [sanodzegg/REM-fit](https://github.com/sanodzegg/REM-fit) at `master` `42abd2b`. **All file paths in this document refer to that repo**, not to the Dawn theme. The audit also included a live check of a PDP on www.rem-fit.co.uk (network requests, globals, one test add-to-cart in an isolated browser profile; the test cart was cleared).

**Action tags:** `PORT` rebuild in the new theme · `REPLACE` use native Dawn or app functionality · `APP` lives in an app and only needs re-enabling/re-placing · `VERIFY` needs a decision or a check first · `DROP` don't migrate.

Tick the box when the item works in the new theme, or when it's been dropped on purpose.

---

## 1. Tracking and analytics

The theme loads trackers in four different ways: inline in `layout/theme.liquid`, through a delayed loader (`snippets/inject-js-after-scroll-or-click.liquid`, which injects scripts on first scroll/click), through app embeds, and through GTM. Several tags load more than once.

### 1.1 Tags hard-coded in the theme

- [ ] **GTM `GTM-NFT2J24`** — `PORT` (load once). Loaded **twice** by the delayed loader (`GTM-2` src entry + `GTM-settings-2` inline snippet) → every GTM tag fires twice (verified live, see 1.2). The `<noscript>` iframe is also output twice (`layout/theme.liquid` body + theme setting `bodyHTML`).
- [ ] **Google Ads gtag `AW-864944454`** with `allow_enhanced_conversions: true` — `PORT` or move to the Google & YouTube app / GTM. Currently in the delayed loader.
- [ ] **Hyros universal script** (`211074.t.hyros.com`, `ph=2c888a2d…`) — `VERIFY`. First script in `<head>`, eager. Hyros also runs as a custom web pixel (seen live), so the theme copy is probably redundant; confirm with whoever owns Hyros before dropping it.
- [ ] **Microsoft Clarity `xbg1rj5w2u`** — `REPLACE` with the app embed only. Inline in `<head>` **and** loaded by the Clarity app embed (`?ref=shopify`). A second Clarity project `qnqjpu9idi` loads from GTM: ask which project is canonical.
- [ ] **Webgains** (`clk.min.js`, `ITCLKQ('click')`) — `REPLACE`. In the delayed loader **and** the Webgains app injects `wbgspapp.webgains.com/landing.js?programId=267505`. Confirm with Webgains that the app alone covers click tracking; a commented-out copy also sits in `sections/footer.liquid`.
- [ ] **Trustpilot bootstrap** (`tp.widget.bootstrap.min.js`) — `PORT`/`APP`. Delayed loader. Widgets come from product metafield `prod.trustpilotreviewscript` (36 template references) and hard-coded rating numbers in theme settings (see 3.6).
- [ ] **Klarna on-site messaging** — `REPLACE` with the Klarna app embed/block. Today `layout/theme.liquid` strips a hard-coded Klarna URL out of `content_for_header` (`| remove:`) and the delayed loader re-adds it. Klarna has since changed the URL (live now loads `…/9b281ea…/rem-fit-uk.myshopify.com-1790877302532.js`), so the strip no longer matches and Klarna loads eagerly anyway. The delayed load requests the **old** file, which fails (`ERR_BLOCKED_BY_ORB`). Don't string-strip `content_for_header` in the new theme.
- [ ] **ShipZip / csShipping** (`sbz.cirkleinc.com/…/csShippingApp.js`) — `APP` + `VERIFY`. App embed is on **and** the delayed loader loads the script again. The app also needs `templates/cart.sbz_proxy.liquid` (alternate cart template returning JSON with cart collections/tags), which **must be copied** to the new theme. Ask the vendor what else the app needs.
- [ ] **Convert Experiences** — `VERIFY` → probably `DROP`. `layout/theme.liquid` sets `_conv_*` globals (page type, SKU, price, cart count…); `snippets/convert.liquid` (revenue goal `100425955`, writes cart attributes `__cid/__pid/__vid/__goals/…`) isn't rendered anywhere, and no Convert script loaded live.

### 1.2 Tags inside GTM (not theme code, but they depend on GTM loading once)

Seen on the live PDP, each request made **twice** because of the double GTM load:

- GA4 `G-0P9E6KL56S` and Google tag `GT-K4C58G5` (`VERIFY` source: GTM, the Google & YouTube app, or a pixel)
- Meta pixel `1838839276330647`
- Bing UET `5663882` (+ Clarity UET insights)
- Hotjar `1598719`
- Floodlight `DC-9028773`
- Xandr/AppNexus `px?id=1104779`, `seg?add=17657805`
- Clarity `qnqjpu9idi`
- GoCertify script (`assets.gocertify.me/assets/gocertify.js`)
- Wisepops `292zDHGTeu` (also injected by its app)
- Square marketplace script
- **Dead:** Universal Analytics `analytics.js` (UA stopped processing in July 2024) and `dist.chatservice.co/latest/customerService.js` (DNS fails). Clean these up in GTM.

### 1.3 dataLayer contract (GTM triggers depend on these, so keep them byte-compatible)

- [ ] **`Add To Cart`** — `PORT`. Pushed by `assets/booster.js` (`BstrCart.processQueue`, after `/cart/add.js` responds). Verified live:
  ```js
  { event: 'Add To Cart',
    items: [{ id: <variant id>, name: '<product title> - <variant title>',
              brand: '<vendor>', price: <pounds, number>, variant: '<variant title>' }] }
  ```
  A gtag `add_to_cart` event follows it; GTM generates that one. In Dawn, `subscribe(PUB_SUB_EVENTS.cartUpdate, …)` for `source === 'product-form'`: its `cartData` is the `/cart/add` response, which has exactly these fields (`id`, `title`, `vendor`, `price`, `variant_title`). Grep GTM for triggers on `Add To Cart` before changing anything.
- [ ] **`rf_quiz_*`** events + Klaviyo `identify`/`track` from `assets/mattress-finder.js`. Only relevant if the mattress finder ships (see 4.5).

### 1.4 Consent

- [ ] `VERIFY`. Shopify's privacy banner is live (`privacy-banner.js`, `consent-tracking-api.js`), but the tags the theme loads itself (Hyros, inline Clarity, GTM/Ads/Webgains through the delayed loader) are not gated on `Shopify.customerPrivacy`. `consent` entries do appear in the dataLayer, so GTM may handle consent mode internally; confirm. New theme: load third-party tags through Customer Events pixels or gate them on the Customer Privacy API.

### 1.5 Outside the theme (no theme work; re-check after cutover)

- Web pixels (Customer Events): at least 8 load live, including app pixels and a custom pixel that loads Hyros.
- ScriptTag/app-proxy scripts that load regardless of theme: Mulwi feed (`feed.mulwi.com`), Webgains landing, Wisepops, `content.9gtb.com` (`VERIFY` which app this is), Klarna.

---

## 2. Cart, add to cart and order data (highest risk)

### 2.1 Cart engine

- [ ] **Booster cart (`assets/booster.js`, class `BstrCart`)** — `DROP`, replace with Dawn's cart plumbing + Rebuy Smart Cart. It monkey-patches `window.fetch` and `XMLHttpRequest.prototype.open` to detect any `/cart/*` call, then re-renders the minicart from the JSON section `sections/api__minicart.liquid` via `?section_id=`. That section and `api__recently-bought` look unused but are fetched by JS; they go away with Booster.
- [ ] **Rebuy Smart Cart V2 is the real cart drawer** — `VERIFY`. Live `body` has `smart-cart--enabled` and `SmartCartV2.js` loads; the theme's own ATC action is `message` (toast). Keep Smart Cart as the only cart UI: Dawn `cart_type` = `drawer` (page mode redirects to `/cart`, where Smart Cart doesn't render), Dawn's drawer hidden, header bubble re-rendered on `rebuy:cart.change`, `Shopify.actions.openCart` → Smart Cart. Details: decision doc §4.
- [ ] **Cart page** `sections/cart-page.liquid` — `PORT` the custom bits:
  - "You made the right choice" mattress bar (shown when a cart line's handle contains `mattress` and isn't a protector; product image set by JS).
  - Per-line "-X%" sale tag computed in JS from compare-at price.
  - Delayed-delivery and sleep-trial notes (see 2.2).
  - Rebuy widgets `81245`, `60607`.
  - Klarna message, payment logos and awards image (CDN URLs).
  - Gorgias chat link: jQuery binds `#column--57752646-338a-4232-98bd-34dcde34f4cb a` to `GorgiasChat.open()`, which breaks if the block ID changes.

### 2.2 Line-item properties and cart attributes (these end up on orders, and CS/fulfilment may rely on them)

- [ ] **`properties[Note]`** — `PORT`. Value = variant metafield `varia.delayed_delivery`. `snippets/block__product-page--atc.liquid` renders a hidden input (initial value = **first** variant's value, not the selected one) plus a hidden `<li id="{variant.id}">` list. A jQuery handler in `layout/theme.liquid` updates the input 250 ms after `select#size_dropdown` changes, by reading the variant from the URL. Live value seen: `✔ Sleep Trial ✔ 15-Year Guarantee`.
- [ ] **Second `properties[Note]` + `properties[Trial]`** when the product is fully out of stock (`snippets/block__product-page--price.liquid`): `delayed.delivery` and `sleep.trial` product metafields. This duplicates the `Note` field name inside the same form, so which value wins is ambiguous. Define one rule in the new theme.
- [ ] **Cart attribute `attributes[delayed-delivery]`** — `PORT`. Set on the cart page when a line's variant inventory ≤ 0.
- [ ] **Hidden `discount=pillows`** input on the cart form when `rem-fit-500-cool-gel-pillow` has quantity 2 — `VERIFY` whether discount code `pillows` still exists.
- [ ] `{{ item.properties['save-10'] }}` printed raw on the cart page — `DROP` (leftover).
- [ ] **Checkout attribute `Shipping Delivery Date`** (ShipZip) — `APP`. The theme only touched it in dead `checkout.liquid`; confirm the app sets it in Checkout Extensibility.
- Gorgias writes `gorgias.guest_id` / `gorgias.session_id` cart attributes (app, no action).

### 2.3 ATC button (`snippets/add-to-cart-button.liquid`)

- [ ] **Delivery cutoff countdown** ("Order in Xh Ymin for FREE* delivery from as soon as Mon, Nov 03 – Wed, Nov 05") — `PORT` as JS. It's computed in **Liquid at render time** (12:00 cutoff, a per-weekday start/end-day table), so cached pages show stale times. Rebuild client-side with the same weekday table and confirm the rules with ops.
- [ ] ATC sub-text from metafields `custom.atc_button_text_for_desktop` / `_mobile` — `PORT`.
- [ ] Hidden ATC when the product title contains "free gift" — `REPLACE` with a flag metafield.
- [ ] Sticky mobile ATC (`product-page__product` + block setting `stickyATC`: scroll/always) — `PORT` (Dawn has no sticky ATC bar).

### 2.4 Quantity bundles: pillows and protectors

Templates `pillows-template`, `500-cool-pillow-template`, `protectors`, `snow-pillow-with-video`:

- [ ] Quantity radio cards 1–4 with images from `custom.pillow_quantity_1..4`, labels "Save 10% / 15% / 20%", "Most Popular" / "Best Value" tags, and "Extra discount will be auto-applied at the cart" — `PORT`.
- [ ] Client-side price recalculation of `.product__price--sale` and `.dicoprice` per selected quantity — `PORT`, and **make it read the same numbers as the discount**, not hard-coded percentages.
- [ ] "Buy 2, Save Extra 10%, 3 – 15%, 4 – 20%" checkbox `#save-10` that increments the quantity — `VERIFY`/`DROP` (overlaps the radios).
- [ ] The discount itself is applied outside the theme (Discounty app or a Shopify automatic discount): `VERIFY` which, so the PDP numbers stay correct.
- Theme setting `qty-option-product = rem-fit-500-cool-gel-pillow`.

### 2.5 Discounts

- [ ] **Discount code widget** (setting `enable_discount_widget`, currently **off**; code `STILLINIT10`, 10%) — `PORT` behind a setting. On click, jQuery does a GET to the absolute `https://www.rem-fit.co.uk/discount/STILLINIT10` to apply the code to the session; `.cdp-price` spans show the discounted price. Only on default/natural-mattress templates. In the new theme, use a relative `/discount/CODE` or the cart `discount` update.
- [ ] `productPageDiscount` block (`snippets/product-page__discount.liquid`, reworked template): exposes `data-discount-code`, no behaviour yet — `PORT`.
- [ ] Savings widget (setting `enable_savings_widget`, off) — `VERIFY`/`DROP`.

### 2.6 Free gift bundle

- [ ] **`snippets/free-gift-section.liquid`** (setting `enable_freegift_widget` **on**) — `PORT`. Reads `custom.free_gift_products` (product refs) and `custom.free_gift_quantities` (per-size tiers); shows rows per size and totals, kept in sync with the variant input via `MutationObserver`. Shown when `custom.free_gift_bundle_section_enable_disable` is true. Hidden for product ID `15990166520188` and for titles containing "clearance". Embeds Rebuy widget `196540` (pillow protector).
- [ ] The gift is actually added by **EasyGift** (`eg-auto-add-to-cart` app embed, `cdn.506.io`) — `APP`.
- [ ] Free-gift badges in product cards and menus (`free-gift-bundle-badge*`, `header-free-gift-bundle-badge`, `free-gift-pdp-coll`; settings `text_freegift_*`, `enable_freegift_banner_*`) and settings `gift_bundle_*` (titles, prices, images) — `PORT`.

### 2.7 Rebuy (hard-coded widget IDs)

- [ ] PDP accordions `snippets/rebuy-accordians.liquid` (default and `rejuvenated-mattress` templates only, rendered right before the swatch block): `190564`, `188112` (twice), `220969`, `190572`, `190621`.
- [ ] Free gift: `196540`. Cart page: `81245`, `60607`.
- [ ] **Custom Vue widget template** `snippets/rebuy-protector-upsell.liquid` (widget "pup"): reads `custom.rebuy_product_subtitle` and keeps the protector size in sync with the selected mattress size via `MutationObserver` on `input[data-bstr-variant-input]`. Must be re-targeted at Dawn's variant input (`product-form input[name="id"]`, `PUB_SUB_EVENTS.variantChange`).
- [ ] 14 Rebuy app blocks across product templates — `APP` (re-place).
- `snippets/smart-cart-template.liquid`, `rebuy-smartcart-extensions.liquid`, `assets/rebuy.css` are unused/commented — `VERIFY` that Rebuy admin doesn't reference them, then `DROP`.

### 2.8 Booster upsells

- [ ] `sections/api__upsell--inline.liquid` (in 25 product templates; "add these too" checkboxes → `BstrCart.addToCartIU`) and `sections/api__upsell.liquid` (home, via `layout__template--specific`) — `VERIFY` whether they're visible live; probably superseded by Rebuy → `DROP`.
- `snippets/frequently-buy-together.liquid` (commented out) — `DROP`.

---

## 3. Pricing, finance and BNPL

- [ ] **DivideBuy** app block (7 templates; extension now named `zopa-reskin`) — `APP`.
- [ ] **Klarna** snippet `snippets/klarna.liquid` on PDP price, product cards and cart — `REPLACE` with the Klarna app block where possible.
- [ ] **Instalment calculators in `layout/theme.liquid`** — `PORT` as one small module:
  - On size change: `.dicoprice` = price ÷ 3, `.clearpay-price` = price ÷ 4.
  - On PDP: divisor tiers < £50 → 3, < £250 → 6, < £450 → 9, else 12 months → `.divideByPrice`, `.installmentMonths`; also writes `.cdp-price` (discount widget).
  - They parse the price out of `#prod-price` text, so they break as soon as the markup changes. In the new theme, read the price from variant JSON.
- [ ] **"£xx p/m" highlighter** in `sections/product-page__product.liquid`: wraps prices in `.custom-price` with a `MutationObserver` over the **entire body** (perf hit) and also restyles `#dividebuy-lowest`. `PORT` as scoped CSS/markup.
- [ ] **Financing page** (`page.financing`): sections `financing`, `finance-calculator` (form posting to `/cart/add`), `finance-repayments` (hard-coded APR table: 3/6/12 months 0%, 18/24/36/48 months 9.9%; 9.9% terms hidden under £400). `PORT`, but **confirm rates with the finance provider** first.
- [ ] Clearpay modal markup in `block__product-page--price.liquid` (largely commented) — `VERIFY`/`DROP`.
- [ ] "Total value" tooltip on product cards (`assets/pdp-and-plp.js`, `block__product-page--totalvalue`, metafield `custom.total_value_pricing`) — `PORT`; the JS logs to the console on every body click, so remove that.
- [ ] Category promo banners on PDP and mega menu (settings `*promo_enable`, `*promo`, `*promotext`; only pillows enabled now), keyed on template suffix — `PORT` keyed on product family (see 9).
- [ ] "Save X%" sale tags computed in Liquid (PDP mobile title, cards) — `REPLACE` with Dawn's sale badge + an `rf-` percentage label.

---

## 4. Product page

The current PDP is `sections/product-page__product.liquid` (~2,000 lines) with blocks routed through `snippets/get-block.liquid`. In Dawn these become `rf_*` block types added to `main-product`, each rendering one `snippets/rf-pdp-*.liquid` (mapping in the plan, Phase 3).

### 4.1 Blocks with custom logic

- [ ] `sleeptrail`: flashing-dot trial text (default and `remy-plus` templates).
- [ ] `productPageSwatch`: dropdown `select#size_dropdown` labelled "Pick your size". **Other custom JS hooks this ID**, so keep the hook or rewrite the dependants.
- [ ] Accordions + `accordionGroupStart` / `accordionGroupEnd`: fake nesting through ordered sibling blocks, one group open at a time. → `PORT` as one `rf_accordion_group` block (rows from a metaobject list or block settings); Dawn blocks can't nest.
- [ ] Spec tables `specification-table`, `spec-table-pdpaccordion` (metafield `custom.specs`).
- [ ] `productPagebadges` → `rf-awards-strip` (award metafields, 5 slots).
- [ ] `productPageUpgrades`: upgrade card (`custom.upgrade_*`, display flag `upgrade_display_hide`).
- [ ] `productPagequestions` ("Got questions?").
- [ ] `goCertify`: `<gocertify-placement id="p-28c9953f" data-locale="en-GB">` + "Qualify for an EXTRA 8% off?" link calling `gocertify.popup()` (also in the header nav and mobile bottom nav). The GoCertify script loads from GTM, so the new theme must keep GTM loading or add the script directly.
- [ ] `productPageDelivery` / `productPageLDelivery`: Booster estimated delivery with `%start%`/`%end%` date tokens.
- [ ] `productPageDeliveryNote`, `productPageImageNote`, `productPageAssurances`, `productPageCustomHtml` (2026 additions, styles in `rem-fit.css`).
- [ ] `trustpilotwidget` + the hard-coded mobile Trustpilot strip (summary, stars image, rating, review count from theme settings; reworked template uses a different format).
- [ ] Countdowns: Booster countdown block plus a custom countdown from metafield `remfit.customcountdown` **and** the typo namespace `remfitt.customcountdown`, gated by setting `CustomCountdown` (off). `VERIFY` which namespace holds data.
- [ ] Almost-sold / new-stock progress bars (`custom.almost_sold_display_hide1`, `almost_sold_percentage_sold`, `almost_new_stock_percentage_`, `almost_sold_date_of_shipment`), animated after 2 s.
- [ ] `freegiftbundle` (see 2.6), `@app` blocks (Rebuy, DivideBuy).
- [ ] Line `custom.delivery_for_product` under the title on mobile.

### 4.2 Gallery and media

- [ ] Gallery style `verticalDouble`: first image full width, then a 2-column grid; countdown slot after the first image; `fslightbox.js` lightbox with thumbnails.
- [ ] Gallery **video blocks** (2026 work): top/bottom position, per-breakpoint max heights, optional "include in mobile carousel", and JS that relocates videos on mobile (top group → start of product info, rest → above the first accordion group). Desktop-only product video injection with `data-video-src`, filled in by `assets/video-lazy-load.js` after first interaction or 9 s.
- [ ] First product image `<link rel="preload" fetchpriority="high">` in `<head>` — `REPLACE` (Dawn loads the first product image eagerly with `fetchpriority=high`; check).

### 4.3 Other PDP behaviour

- [ ] Bed frame / divan selector (`snippets/bed-frame-selector.liquid`): hard-coded product URLs and CDN images for Essence/Luxe/Signature frames and 3 divans. → `PORT` driven by a product-reference metafield or a combined listing.
- [ ] "Not sure? Help me choose my mattress" → Typeform `ABP9gLq0` (default and natural-mattress templates). jQuery hijacks `.helptochoose`, the last main nav link, and specific Booster button IDs (`#button--1656513682948fd975-2`, `#button--1656507533ce968947-2`, `#button--1650989771f9d89dc4-2`, `.navmob-Help a`) to open it. → Use explicit links.
- [ ] Quick navigation sticky bar (`snippets/quick-navigation.liquid` + jQuery smooth scroll and "select size" jump in `layout/theme.liquid`).
- [ ] `.discount-section a` → scroll to `#nightsleeptrial` and open that accordion.
- [ ] Product navigation next/prev (section setting).

### 4.4 Templates and sections specific to the PDP

- [ ] **`product.reworked`** (Aug 2026) = newest PDP direction: `custom-page-navigation`, `custom-why`, `custom-why-this-one`, `custom-construction`, `custom-awards`, `custom-reviews`, `custom-bases`, `custom-ethics`, `custom-accordion`, `custom-xsell` + `assets/pdp-reworked.css`. **Use this as the reference for the new PDP.**
- [ ] `product.grid-layout-mobile`: a whole alternate PDP (`sections/grid-layout-mobile.liquid`, ~1,300 lines). `VERIFY` usage.
- [ ] Section Store sections (`ss-*`): comparison table 12, featured collection 7/17, hotspots 4, multicolumns video, product ingredients 6, product videos 4, testimonial 8 (plus unused comparison table 6, delivery timer, hero 30, simple FAQ). `APP` (re-install through Section Store, licence permitting) or rebuild as blocks. `ss-featured-collection-17` has 26 metafield references; `ss-product-videos-4` exposes `window.initProductVideos4`, which `video-lazy-load.js` calls.
- [ ] `section__columns_eco_mattress` (eco/clearance/remy-plus templates).

### 4.5 Mattress finder quiz

- [ ] `VERIFY`. Built 2026-08-19 (`sections/mattress-finder.liquid`, `assets/mattress-finder.{js,css}`; dataLayer `rf_quiz_*`, Klaviyo identify/track), but **no template uses it**: `page.mattress-finder.json` renders the generic `page` section. Decide whether it ships in the new theme.

---

## 5. Header, footer and global UI

- [ ] Mega menu with product cards (`product-card-no-button`; icon chosen by words in the product title), per-category promo text from settings, free-gift badges, Typeform links, GoCertify nav item (`#gocertify-popup-link`).
- [ ] Mobile category icon strip (hard-coded collection URLs + CDN images; the Topper link includes a `variant=` ID).
- [ ] Sticky header JS with CLS fix (reserves `min-height` before going fixed).
- [ ] Template-specific nav tweaks for `rejuvenated` and `remy-plus`.
- [ ] Landing layouts: suffixes `no-header`, `landing-no-header`, `landing-alt-header` (**the last one is broken**, see 11).
- [ ] Top and bottom info bars (marquee); `top-infobar-mobile` unused.
- [ ] **Mobile bottom navigation** (`snippets/mobile-bottom-navigation.liquid`, rendered by the footer): hard-coded links, some to `rem-fit-uk.myshopify.com`; GoCertify and Gorgias triggers.
- [ ] Gorgias chat customisation: scales the launcher iframe to 0.75 by injecting CSS into its head, and hides the launcher on mobile (polls for 30 s after 2 s). The linklist item titled "Live chat" opens Gorgias.
- [ ] Read-more toggles: collection descriptions (`.read-more-toggle` / `.collection-expandable`, Laurie's snippet) and homepage SEO text (`#read_more_button`).
- [ ] Mobile menu accordion exclusivity (`.mobile-menu` checkboxes).
- [ ] Footer tooltips; `info-badges` section.
- [ ] **Booster built-ins switched on**, each needing a replacement or a deliberate drop: cart timer (`cartTimer`), countdown (`countdown`), dynamic tab title on leave ("Award-winning mattresses" / "Wait! Come back"), infinite-scroll collections (`pagination: infinite`), predictive search, Amazon-style swatch logic, lazy loading. Switched off: recently bought, GDPR notice, Messenger, floating contact, quick buy, currency converter/geolocation.
- [ ] Theme setting `bodyCSS` holds `.thpolicy/.tdpolicy/.tablepolicy` table styles used inside **page content** (policy tables). Carry them over or those pages lose their styling.
- [ ] AI-generated theme blocks in `blocks/` (Collapsible description, Side-by-side banner, Description toggle, Glow heading), used on the homepage through `_blocks` sections. Dawn sections don't render theme blocks → rebuild as `rf-` sections (they're small).

---

## 6. Collections and search

- [ ] Collection banner product slider from **collection metafields** `slider.product-name|handle|image 1–8` and `mobile.* 1–7` (`sections/banner--collection.liquid`).
- [ ] `banner--collection__desc`, Booster AJAX filters (`product-list__filters`, on top of Shopify filtering), `sort`, infinite scroll → `REPLACE` with Dawn facets (infinite scroll needs an `rf-` addition).
- [ ] `collection.rem-fit` custom sections: header, stats, range, info, awards (2026, settings-driven, no metafields).
- [ ] Product card (`product-card-default`): image gallery, review stars, free-gift badge + `free-gift-pdp-coll`, total value tooltip, Klarna, single-variant ATC (`addToCartJSON`). → `card-product` hook rendering `rf-` snippets.
- [ ] Search: `templates/search.liquid` + Booster predictive search (products, articles, pages) → `REPLACE` with Dawn predictive search.
- [ ] Custom blog template `blog.booster` (`sections/custom-blog.liquid`).

---

## 7. SEO (must not regress)

- [ ] Title pattern: page title + `tagged "…"` + `Page n` + `– shop name` unless already included. Meta description, canonical.
- [ ] Blog listings filtered by tag or paginated → `noindex, follow` (page 1 stays indexable).
- [ ] `page.no-index` template using `layout/no-index.liquid` (`noindex`).
- [ ] JSON-LD (`snippets/schema-*.liquid`):
  - `Organization` + `WebSite` on every page; `BreadcrumbList` on every page.
  - `WebPage` + `FAQPage` on pages (FAQ **parsed out of page content**), using page metafields `custom.date_modified`, `custom.schema_image`.
  - `Product` + `AggregateOffer` + `Brand` on PDP (also in `grid-layout-mobile`).
  - Article schema + FAQ parsed from article content (`sections/article.liquid`); `section__faq` emits FAQ schema too.
  - `schema-text` helper (strip tags + decode entities).
  - **Dawn outputs its own product/article structured data.** Pick one source per entity to avoid duplicates, then validate in Rich Results Test.
- [ ] Breadcrumbs section on 31 templates.
- [ ] `custom--seo--content` homepage SEO block.
- [ ] Before cutover: crawl the current site (Screaming Frog or similar) and diff titles, meta, canonicals, H1s and schema against the new theme on preview.

---

## 8. Content model (metafields)

Store definitions: 213 product, 45 collection, 13 variant, 2 page, 3 shop (`.shopify/metafields.json`). Product copy and metafield content are owned by Laurie via the Admin API, so **agree any restructure with Laurie first**.

| Namespace | Used for | Notes |
|---|---|---|
| `custom.*` (product) | awards 1–5, upgrade card, almost-sold bars, free gift, pillow quantity images, layers, bed-frame USPs, accordion headings, specs, ATC subtext, guarantees `pp_guarantee_1..3`, delivery line, Rebuy subtitle | Many are bound as **dynamic sources inside template JSON**, which won't carry over; re-bind in the new templates |
| `my_fields.*` (product) | `product_page_color` (76 template refs), awards, why-choose (mattress/pillow/600 lux), protectors features, temperature, details, FAQ firmness | Legacy namespace, heavy template use |
| `prod.trustpilotreviewscript` | Trustpilot widget HTML per product (36 refs) | Consider the Trustpilot app block instead |
| `prod.frequentyBuyTogetherDesc` | unused feature | `DROP` |
| `remfit.customcountdown` / `remfitt.customcountdown` | countdown end date | Typo duplicate namespace: consolidate |
| `sleep.trial`, `delayed.delivery` (product), `varia.delayed_delivery` (variant) | line-item properties / cart attribute | Order data, see 2.2 |
| `loox.*`, `spr.reviews`, `shop.review_collector.review_code` | legacy review apps | `VERIFY` apps are gone → `DROP` |
| `slider.*`, `mobile.*` (collection) | collection banner product slider | |
| `custom.date_modified`, `custom.schema_image` (page) | page schema | |
| `mm-google-shopping.*`, `custom.google_shopping_image` (variant), `mm_google_shopping_extension.*` (shop) | Google Shopping feed app | Not theme |
| `checkoutblocks.*` (shop) | Checkout Blocks app | Checkout customisations live here, not in the theme |

Recommendation for the redesign: move repeated numbered sets (awards ×5, why-choose ×3–4, USPs ×3, layers ×4, upgrade checklist ×3, guarantees ×3) into **metaobject lists**, so `rf-` snippets can loop over them instead of binding 15 dynamic sources per template.

Theme **settings** that hold content (they don't migrate automatically; re-enter or move to metaobjects): Trustpilot rating (`Excellent`, `4.2/5`, `2745`; static, so it drifts), promo texts, free-gift texts, `gift_bundle_*`, discount code/percent, `bodyCSS` (policy tables), `ship1–5` (dead checkout).

---

## 9. Templates and logic keyed on names

Current templates: 26 product, 8 collection, 19 page, plus `blog.booster`, `cart.sbz_proxy`, `customers/*` (legacy accounts, 7 files), `gift_card`, `search`, `404`, `list-collections`.

Business logic keys off **template suffix**, so renaming or merging templates silently changes behaviour:

- Price block promos and the Klarna variant (`bed-frame`, `topper`, `divan-bed`, `pillows-template`, `500-cool-pillow-template`, `snow-pillow-with-video`, `protectors`, `pillow-protector`, `eco-mattresses`, `natural-mattress`, default).
- Quantity bundles, sleep-trial line, Rebuy accordions, Typeform link, almost-sold bars, discount widget, `pdp-reworked.css`, header tweaks (`rejuvenated`, `remy-plus`).

Logic keyed on **handle, title or ID**:

- Cart bar: handle contains `mattress` / `protector`.
- `rem-fit-500-cool-gel-pillow` qty 2 → `discount=pillows`.
- Title contains `clearance` (hide free gift) or `free gift` (hide ATC).
- Product `15990166520188` excluded from free gift.
- Menu card icon chosen by title words (`Mattress`, `Bed`, `Divan`, `Protector`, `Pillow`).

**New theme:** drive these from a product metafield (e.g. `custom.product_family`: mattress / pillow / protector / bed-frame / divan / topper / bedding) plus explicit boolean flags. Template names then only control layout. Run `queries/template-assignments.graphql` to see which products and pages actually use each template before consolidating.

---

## 10. Apps footprint

| App | Theme touchpoints today | Follows the theme automatically? | Action |
|---|---|---|---|
| Rebuy (+ Smart Cart V2) | global embed, 14 app blocks, 8 hard-coded widget divs, custom Vue template | embed/blocks: **no** (re-enable/re-place); divs: port | Re-place; Dawn bridge (decision doc §4) |
| DivideBuy (`zopa-reskin`) | app block in 7 templates | no | Re-place |
| EasyGift | app embed | no | Re-enable |
| Klaviyo | app embed | no | Re-enable |
| Gorgias | app embed + theme customisation JS | no | Re-enable + port tweaks |
| Microsoft Clarity | app embed (+ inline dup) | no | Re-enable embed only |
| Hulk Form Builder | app embed | no | Re-enable; check forms on pages |
| ShipZip (Sbz/cirkleinc) | app embed + `cart.sbz_proxy` template + script | no | Re-enable + copy template |
| BM Country Blocker | app embed | no | Re-enable |
| Discounty | app embed (SDK) | no | Re-enable; check PDP/cart widgets |
| Section Store | `ss-*` sections copied into the theme | no | Reinstall or rebuild |
| Klarna OSM | script injected into `content_for_header` | yes | Remove theme hacks |
| Webgains, Wisepops, Mulwi, `9gtb.com` | ScriptTag/app-proxy scripts | yes | Re-check only |
| Trustpilot, GoCertify, Typeform, Hyros | theme code / GTM | n/a | Port or move to GTM/pixel |
| Checkout Blocks, Google Shopping feed | checkout / feeds | n/a | None |

---

## 11. Bugs and debt found during the audit

Fix these on the live theme now if they hurt today; otherwise just don't port them.

1. **GTM loads twice** → every GTM tag (Ads remarketing, Bing, Floodlight, Xandr, Hotjar, Clarity, Wisepops…) fires twice. Verified on the live PDP. Quick win on the current theme: delete the `GTM-2` entry in `snippets/inject-js-after-scroll-or-click.liquid`.
2. **Klarna hack is stale**: the `content_for_header | remove:` target URL no longer matches, and the delayed loader requests a dead URL (`ERR_BLOCKED_BY_ORB`).
3. **`landing-alt-header` templates are broken**: `layout/theme.liquid` calls `{% section 'header-alt' %}`, but no such section exists (`page.landing-alt-header.json`, `product.landing-alt-header.liquid`).
4. **Duplicate trackers**: Clarity ×2 in theme + a 2nd project in GTM; Webgains in theme + app; ShipZip script in theme + app embed; GTM noscript ×2.
5. **4 copies of jQuery on the PDP** (3.5.1 + 3.6.0 ×3 from `code.jquery.com`/`ajax.googleapis.com`), plus Rebuy's own; Swiper 8.4.7 **and** Swiper 11 both load.
6. **Duplicate `properties[Note]`** inputs in the product form when the product is out of stock (see 2.2).
7. **`template_suffix == 'bed-frames'`** in `block__product-page--atc.liquid` never matches (the template is `bed-frame`), so the almost-sold bar never shows on bed frames.
8. **Delivery cutoff countdown is computed at render time** in Liquid → stale under caching.
9. `properties[Note]` initial value is the **first** variant's metafield, not the selected variant's.
10. Body-wide `MutationObserver` rewriting `innerHTML` for "p/m" prices (perf + risk of breaking app widgets).
11. Dead GTM tags: Universal Analytics, `dist.chatservice.co`.
12. Hard-coded absolute links to `rem-fit-uk.myshopify.com` and `www.rem-fit.co.uk` in nav, PDP and the discount call.
13. `pdp-and-plp.js` logs to the console on every click.
14. `layout/checkout.liquid` is dead (Shopify no longer renders checkout.liquid). `VERIFY` its features exist in Checkout Extensibility: shipping-method descriptions (`ship1–5`), Shipping Delivery Date picker (ShipZip), postcode lookup (`shopify_crafty_clicks.js`), mattress upsell bar.

---

## 12. Do not migrate

- Booster runtime: `assets/booster.js`, `snippets/layout__bstr--constants.liquid`, Booster preconnects (`static.boostertheme.co`, `theme.boostertheme.com`), `api__minicart`, `api__recently-bought`, Booster settings schema.
- Unused sections (no template, layout or JS reference): `banner--contact`, `mattress-finder` (see 4.5), `notifications`, `placeholder_section`, `product-page__recently-viewed`, `section__auto-grid`, `section__featured-collection-list|tabs|tiles`, `section__featured-product`, `section__grid`, `section__instagram`, `section__lookbook`, `section__lookbook-text`, `section__map`, `section__models`, `section__slider`, `section__slider--responsive`, `section__split-image`, `section__testimonials`, `ss-comparison-table-6`, `ss-delivery-timer`, `ss-hero-30`, `ss-simple-faq`, `top-infobar-mobile`.
- Unreferenced snippets: `SbzShippingAppCode`, `add-to-cart-button-backUp`, `block__testimonials--author-below`, `bottom-info-bar` (the section is used, the snippet isn't), `buy-now-button`, `category-thumbnail`, `convert`, `init-block`, `product__selector`, `review__text`, `smart-cart-template`.
- Unreferenced assets: `Klarna.svg`, `Mini_Logo.svg`, `Product-level-banner.png`, `closebtn.png`, `convert_checkout.js`, `discount-tagv2.webp`, `discounts-icon.png`, `dividebuybottom.png`, `loader.gif`, `site.webmanifest.liquid`; `csShippingApp.js` and `sbz_*` (only used by unused snippets).
- `layout/checkout.liquid` and its assets, once section 11 item 14 is verified.
- Commented-out leftovers: LiveChat `LC_API`, Facebook Messenger, frequently-bought-together, Klaviyo inline, Clearpay modal (after VERIFY).

To refresh the usage lists, run `python3 -I migration/scripts/audit-usage.py <path to the Booster checkout>` from this repo's root.
