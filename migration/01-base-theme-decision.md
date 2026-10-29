# Base theme decision: Dawn

**Decision (2026-10-29): build the new theme on Dawn**, forked from `Shopify/dawn` v16.0.0 and kept in sync with upstream.

The Horizon comparison stays below as the record of what was weighed. This doc covers what we measured, what we gain, what we give up, and how the plan absorbs it.

---

## 1. What we're leaving

- **Booster 6.0.5**, a paid third-party theme. It's licence-bound (it preconnects to `boostertheme.com`) and we don't track its upstream.
- 105 sections, 183 snippets, 26 product templates, a 2,780-line `booster.js` runtime that monkey-patches `fetch`/XHR, jQuery loaded up to 4 times on the PDP, and a 338 KB `rem-fit.css`.
- Most business logic sits in snippets keyed on template names and in inline scripts in `layout/theme.liquid`. Full list: [02-custom-inventory.md](02-custom-inventory.md).

Nothing of Booster's structure carries over to Dawn or Horizon, so either way this is a rebuild.

## 2. Why Dawn

- **Least theme code on the page.** Dawn ships about a third of Horizon's theme JS and less CSS (measurements in §3). For a store that already carries GTM, Rebuy, Klaviyo, Gorgias, DivideBuy, Klarna, Hotjar and more, the theme should be the lightest layer.
- **Rebuy Smart Cart's most common pairing.** Dawn is the theme most often seen with Smart Cart, and Rebuy's setup docs are written around Dawn-style cart settings (§4).
- **Simpler to maintain.** Custom elements, a small pub/sub and no build step. Most community answers and app docs assume Dawn.
- **Stable upstream.** A few releases a year, mostly platform features, so merging upstream into a customised fork stays cheap.
- **Current platform features are already there.** 15.5 added Shopify standard storefront events/actions; 16.0 moved to new customer accounts.

## 3. Performance: what was actually measured

Shopify's own demo stores, one product page each, measured 2026-10-29 in Chrome. Mobile viewport, 4× CPU slowdown, Slow 4G, cold cache. The demos run older versions (**Horizon 3.2.0, Dawn 15.0.0**) and different products and images, so treat timings as indicative. The weights are reliable.

| Product page | Horizon 3.2 | Dawn 15.0 |
|---|---|---|
| Theme JS (decoded) | **239 KB in 58 module files** | **82 KB in 18 files** |
| Theme CSS (decoded) | 384 KB in 3 files + 50 KB inline | 180 KB in 27 files + 14 KB inline |
| Main-thread time spent in theme scripts during load | ~31 ms | ~0 ms (not measurable) |
| Main-thread time in Shopify platform scripts | ~250 ms | ~220 ms |
| First Contentful Paint (single run) | 2.9 s | 1.6 s |
| Largest Contentful Paint (single run) | 3.3 s | 3.6 s |
| CLS | 0 | 0 |
| DOM nodes | 1,050 | 1,489 |

What this means:

- **Dawn's advantage is download/parse weight and earlier first paint**, not runtime. Horizon's JS barely costs main-thread time once loaded, and LCP was image-bound on both (the image download was most of it).
- In "page" cart mode, every Horizon product form refetches `/cart.json` on cart events that don't carry line items. That's a known Horizon behaviour (staff-confirmed in Oct 2025, partly mitigated since); Dawn doesn't do this.
- **The theme is not REM-Fit's bottleneck.** The live PDP loads GTM twice, 4 copies of jQuery, two Swiper versions, Rebuy, Klaviyo, Gorgias, Hotjar, Wisepops and more (inventory §1, §11). Cleaning those up will matter more than the Dawn/Horizon gap. Record the baseline in Phase 0 and measure our Dawn build against it.

## 4. Rebuy Smart Cart on Dawn: what has to be configured

Rebuy publishes no theme-specific guide for Dawn or Horizon. Based on Rebuy's setup and conflict docs, checked against Dawn 16 source:

| Point | Dawn 16 behaviour | What we do |
|---|---|---|
| Cart type | Setting `cart_type`: `drawer` / `page` / `notification` (default). In `page` mode Dawn **redirects to `/cart` after add**, and Smart Cart doesn't render on `/cart`. | Set `drawer`. Don't use Rebuy's "stay on current page" workaround (Rebuy warns it can add twice). |
| Two carts | Dawn's `<cart-drawer>` binds the `#cart-icon-bubble` click and opens itself; Rebuy also binds any `a[href*="/cart"]`. | Rebuy Custom CSS: `.smart-cart--enabled cart-drawer { display: none !important; }`. Rebuy hide callback closes Dawn's drawer and clears its scroll lock. |
| Add-to-cart detection | Dawn posts to `/cart/add` (XHR, no `.js`) with `sections`; Rebuy watches standard add requests. Dawn is Rebuy's most common pairing. | Verify in the spike that Smart Cart opens on PDP add, quick add and the finance-calculator add. |
| Header count | The bubble is a section (`cart-icon-bubble`), and isn't rendered at all when the cart is empty. Rebuy's default count selector `.cart-count` doesn't exist in Dawn. | On `rebuy:cart.change`, re-render `cart-icon-bubble` via the Section Rendering API (`/?sections=cart-icon-bubble`). Small script in `assets/rf-rebuy-bridge.js`. |
| `Shopify.actions.openCart` | Dawn's `standard-actions-override.js` opens Dawn's drawer/notification, falling back to `/cart`. | Re-point it at `Rebuy.SmartCart.show()` in the bridge script, so apps and agents open the right cart. |
| Upstream fix | Dawn `main` has #4004 (2026-10-22, "Fix cart icon and drawer refresh after Standard Actions updates"), not yet in a release. | Fork from v16.0.0, then merge the next 16.0.x release (or cherry-pick #4004). |
| Rebuy widgets in content | `main-product` accepts `@app` blocks, but collapsible tabs can't contain app blocks. | Rebuy app blocks as siblings of the tabs, or keep the hard-coded `data-rebuy-id` divs inside our own accordion snippet (as today). |
| App embed | Embeds are saved per theme. | Enable the Rebuy Connector on the new theme before publishing. |

## 5. What we give up versus Horizon, and how the plan absorbs it

| Horizon strength | Dawn reality | Plan |
|---|---|---|
| Reusable theme blocks (`blocks/`), nested blocks | Section-scoped blocks only, no nesting; `main-product` has a fixed block list | Add a small set of `rf_*` block types to `main-product`'s schema, each rendering one `snippets/rf-*.liquid`. Accordion groups become one `rf_accordion_group` block, with its rows in a metaobject or block settings. |
| Laurie composes PDPs freely in the editor | Less flexible: blocks can't nest, and custom blocks only exist where we add them | Keep the block set small and well-named; drive content from metafields/metaobjects so templates rarely need editing. |
| The 4 existing AI-generated theme blocks (`blocks/ai_gen_block_*`) | Dawn sections don't render theme blocks | Rebuild them as `rf-` sections (they're simple: collapsible description, side-by-side banner, description toggle, glow heading). |
| Shopify's newest theme features land in Horizon first | Dawn gets platform features more slowly | Accept it. Re-evaluate at the redesign if a Horizon-only feature becomes essential. |

## 5b. Why not Shopify's Skeleton theme

[`Shopify/skeleton-theme`](https://github.com/Shopify/skeleton-theme) was also considered (checked 2026-10-29). It's a starting kit for fully bespoke themes, not a store-ready base:

- **No editor composition.** `main` (the `rc-v2.0.0` port, 2026-10-01) has no `sections/`, no JSON templates and no block `presets`: pages are Liquid templates calling `{% block %}` in code. Merchants can edit settings on blocks that are already there, but can't add, remove or reorder anything. Laurie edits layouts in the theme editor today, so every layout change would become a developer task.
- **No place for app blocks.** None of its blocks accept `@app`. Rebuy (14 app blocks), DivideBuy (7) and Trustpilot would all have to be hard-coded, and apps' "add to theme" links wouldn't work. App embeds still work.
- **Almost nothing is built.** 5 blocks, ~6 KB of CSS, no theme JS for commerce. The product page is a plain `<select>` with a full-page form post, and the cart is a static table. We'd write the variant picker, AJAX add-to-cart (Rebuy can't detect full-page posts), cart drawer, cart page updates, facets/sort/pagination, predictive search, media gallery/zoom, localization and structured data ourselves, then own them forever. Dawn already has all of these and they're tested.
- **Not released.** The only tag is v1.0.0 (May 2025). v2 is a release candidate whose block syntax changed in its latest commit, and its partial-rendering tag only works on shops with a feature flag (`agentic_editor_enabled`, otherwise the storefront raises `Unknown tag 'partial'`).
- **Performance gain is small for us.** It is the lightest possible base, but §3 shows theme code isn't REM-Fit's bottleneck; third-party scripts are. Dawn's theme JS already costs near-zero main-thread time.

Skeleton fits a developer-owned storefront where nobody edits in the theme editor and the team wants to own all commerce UI code. That isn't this store. Worth a look again only if, at the redesign, the plan becomes a fully custom build with editor changes going through developers.

## 6. Prerequisite: customer accounts

Dawn 16.0 **removed** the legacy customer account templates. The current theme still ships `templates/customers/*.liquid`. Check **Settings → Customer accounts**; if the store is on legacy accounts, upgrade to new customer accounts before the Dawn theme goes live. This affects login links, order history and any app that adds account-page content.

## 7. Spike before full build (1–2 days, unpublished theme)

1. Fork Dawn v16.0.0 and push it as an unpublished theme (see [03-migration-plan.md](03-migration-plan.md)).
2. Enable the app embeds: Rebuy Connector, EasyGift, Discounty, Klaviyo, Gorgias, ShipZip, Clarity. Set `cart_type` to `drawer`.
3. Add `assets/rf-rebuy-bridge.js` (hide Dawn drawer, bubble re-render, `openCart` → Smart Cart) and the `Add To Cart` dataLayer push.
4. On one mattress PDP, test:
   - Smart Cart opens once; no Dawn drawer flash.
   - Header count updates after Smart Cart quantity changes and removals.
   - Free gift auto-adds.
   - Line item shows `Note`.
   - GTM preview shows `Add To Cart` firing once.
5. Lighthouse mobile on that PDP vs the live site; record LCP/INP/CLS/TBT.

---

### Sources

- Dawn releases (v16.0.0: legacy customer accounts removed; v15.5.0: standard storefront events): https://github.com/Shopify/dawn/releases
- Dawn #4004, cart icon/drawer refresh after Standard Actions (main, 2026-10-22): https://github.com/Shopify/dawn/commits/main
- Horizon repo (v4.3.0, 2026-10-13): https://github.com/Shopify/horizon
- Rebuy: Smart Cart set-up and publish: https://help.rebuyengine.com/en/articles/6120492-smart-cart-set-up-and-publish-your-cart
- Rebuy: fix conflicts between the Smart Cart and your theme: https://help.rebuyengine.com/en/articles/6120662-smart-cart-fix-conflicts-between-the-smart-cart-and-your-shopify-theme
- Rebuy app blocks in OS 2.0 themes: https://help.rebuyengine.com/en/articles/6120596-installing-rebuy-widgets-via-app-blocks-in-2-0-themes
- Rebuy Smart Cart review (theme usage share, Dawn most common): https://shopthemedetector.com/blog/rebuy-smart-cart-shopify-app-review/
- Horizon `/cart` request flood report (staff reply 2025-10-31): https://community.shopify.dev/t/new-horizon-theme-making-absurd-amount-of-cart-requests/24707
- Horizon repo archived by mistake (May 2026): https://community.shopify.dev/t/horizon-github-repo-archived-how-should-developers-track-updates/34454
- Demo stores measured: https://theme-dawn-demo.myshopify.com, https://theme-horizon-demo.myshopify.com
