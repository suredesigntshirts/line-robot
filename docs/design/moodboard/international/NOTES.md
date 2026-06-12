# International RE/Marketplace Benchmark — M2

**Captured:** 2026-06-12  
**Screenshots:** 37 files in this directory  
**Sites attempted:** Zillow, Rightmove, Idealista, Airbnb, Opendoor, Suumo  
**Blocked/partial:** Zillow (hard bot-block, Cloudflare "Press & Hold"), Idealista (IP-level block, all pages — "uso indebido / IP bloqueada")

**Coverage gap — 4 of 6 sites yielded usable evidence.** Zillow and Idealista are IP-blocked; both are listed as targets but produced zero design observations. Recommend residential-proxy or manual re-capture before those benchmarks are needed. Do not infer Zillow or Idealista patterns from this document.

**Unique-frame count:** 37 files contain 29 unique md5 hashes. Of those, 3 are bot-block/error pages (idealista-01, idealista-02, zillow-01-homepage) carrying no design signal. **Effective design evidence: ~26 unique frames across 4 usable sites** (Rightmove, Airbnb, Opendoor, Suumo). The duplicate filenames are noted in context below; they represent single captures that were saved under multiple names.

**Dark-mode evidence note:** None of the six sites offer a real dark mode UI. The files named `*-darkmode*.png` are **light-mode captures** — they are byte-identical to other light-mode screenshots from the same site (confirmed by md5 check 2026-06-12). They have been relabeled `*-darkmode-none.png` conceptually (filenames preserved for git history). The dark-mode recommendations in §2 and §10 are **reasoned extrapolations**, not observations from dark-mode captures — this distinction is called out explicitly in those sections.

---

## 1. Site-by-site analysis

### Rightmove (UK — rightmove.co.uk)
**Screenshots:** rightmove-01 through rightmove-08

**Homepage (rightmove-01-homepage.png)**  
- White/teal hero, minimal nav: Buy / Rent / House Prices / Mortgages / Find Agent / Commercial / Inspire / Overseas  
- Single centered search bar (location text input + Search button), no filters on homepage  
- Tagline: "believe in finding it — with the UK's largest choice of homes"  
- Trust signal via volume claim ("UK's largest"), not human faces  
- No dark mode — light-only

**Search results (rightmove-02, rightmove-03)**  
Card anatomy:
- Image ratio: ~16:9 hero thumbnail, fixed height, no aspect-ratio padding — can crop awkwardly
- Price: top-left of card, large bold, primary position (£675,000)
- Metadata order: address → price → 3-chip spec strip (Beds / Baths / sqft / Freehold) → agent name
- Badges: "FEATURED PROPERTY" orange ribbon top-left; "SSTC" (Sold Subject to Contract) label
- No human face on card — agent brand logo only in corner (CONV-03 PASS: thumbnail count badge visible "1/4")
- Gallery strip: small thumbnail row beneath hero (4 thumbnails + count "+3") — matches CONV-03
- Sort: "Highest Price" dropdown; Map view toggle top-right
- Filter bar: persistent top strip with Min Price / Max Price / Min Beds / Add Keyword / Filters

**Listing detail above fold (rightmove-07, rightmove-08)**  
- Hero image full-width, ~55% of viewport height; thumbnail strip of 5 immediately below hero (count badge "1/4" visible)
- Price: £675,000 — bold, large, immediate left — no "asking" label (problematic: CONV-09 violation for our context)
- Spec chips: Property type / Bedrooms / Bathrooms / Size (sqft) / Tenure — one horizontal row
- CTA: TWO green buttons in right panel — "Call agent" (primary) / "Request details" (secondary); agent logo and address visible; NO email form
- "Can you afford it?" mortgage calculator affordability link below price — useful progressive disclosure
- Gallery: clicking any thumbnail opens full-screen modal slideshow with arrow navigation + count
- Floor plan thumbnail included in strip

**Dark mode:** Not offered — site is light-only

**What translates to mobile-first Thai:**
- Thumbnail strip with count badge (CONV-03 exact match) — STEAL
- Two-CTA hierarchy (primary call / secondary details) maps well to LINE-first + phone secondary
- Spec chip row is compact and scannable
- Mortgage affordability link = progressive disclosure (P7)

**What does NOT translate:**
- No human face on cards (TH-03 violation)
- No asking-price framing — price shown as fact (CONV-09 violation)
- "Request details" = form-based enquiry — wrong primary CTA for Thai market (CONV-06 violation)
- Filter bar requires scrolling past listings on mobile — needs sticky filter on mobile
- Size in sqft — Thai market needs sqm + rai/ngan/wah (FIELD-01)

---

### Airbnb (search + detail — airbnb.com)
**Screenshots:** airbnb-01 through airbnb-07

**Homepage (airbnb-01-homepage.png)**  
- Minimal chrome: logo + 3 tabs (Homes / Experiences / Services) + hamburger menu
- Search: 3-slot pill (Where / When / Who) — horizontally composable, collapses on mobile
- No hero image — page scrolls directly to destination inspiration grid
- Clean white background, subtle shadows on search pill
- No dark mode offered (emulate dark → no response)

**Search results (airbnb-02, airbnb-07)**  
Card anatomy (Tokyo search):
- Image ratio: 4:3, square-ish, full-card width — feels generous
- Category scroll tabs above results: Homes / Air-conditioning / Self Check-in / Kitchens / TV / 1+ bathrooms / Guest favorite / Hot tub — icon + label chips, horizontally scrollable
- Price: bottom-left of card, prominent (¥8,127/night); per-night rate primary
- Metadata order: title → location area → host type → rating/reviews → price
- "Guest favorite" badge on select cards — social proof badge top-left of image
- Heart/save icon top-right of image
- No agent face — listing host avatar only in detail view
- Map split-view: left = card grid, right = price-labeled map pins (interactive)

**Listing detail (airbnb-03, airbnb-04, airbnb-05)**  
Above fold anatomy:
- Hero: 2-column photo mosaic (1 large left + 2 stacked right) — not a slider, static collage
- "Show all photos" button bottom-right of mosaic → opens full-screen gallery grid
- Title immediately below hero (no price above fold until you scroll)
- Quick stats: guests / bedrooms / beds / baths as inline text
- Rating + review count (4.74 · 62 reviews) as trust signal
- Superhost badge: "Hosted by [name], Superhost · 3 years hosting" — human face + credential
- Price sticky panel RIGHT side: £12,937 / 5 nights — dates + guests + refundable toggle
- Primary CTA: red "Reserve" button (full-width in sticky panel)
- No phone number, no email form — booking is fully in-app (CONV-06 analogy: no offline CTA)

**Filter UX (airbnb-07)**  
- Category chips in horizontal scroll strip: icon + text, single-select active state highlighted
- "Filters" pill opens full modal with all filter options
- Price range histogram slider
- Highly visual, touch-friendly — excellent mobile pattern

**Dark mode:** Not offered

**What translates:**
- Photo mosaic above fold is visually rich without carousel spinning — STEAL for hero treatment
- "Show all photos" button with count — clean gallery entry point (CONV-03)
- Sticky right-panel booking widget → maps to sticky "Chat on LINE" CTA (CONV-06)
- Horizontal scrollable category chips → our listing-type / property-type filter tabs
- Superhost badge → our verification badge (TH-04)
- Review/rating trust signal → matches TH-03 (human trust signal on every card)

**What does NOT translate:**
- Full in-app booking flow — Thai market needs LINE/phone fallback (CONV-06)
- Per-night pricing frame → Thai rentals need monthly rate (MKT-03)
- No asking-price language — reinforces finality (CONV-09)
- No land-area, deed type, Thai unit display — entirely different data model
- Email/form CTA absent is correct, but no LINE button equivalent

---

### Opendoor (seller-flow + buy side — opendoor.com)
**Screenshots:** opendoor-01 through opendoor-08

**Homepage (opendoor-01-homepage.png)**  
- Dark hero background (near-black with photo), white text — Graphik typeface, modern clean
- Tagline: "Make the easy move." — single address entry + search
- No clutter above fold — seller-first framing
- Black/white/red brand (primary action = blue "Buy this home" button on detail)
- Nav: Sell / Buy / Agents

**Seller flow (opendoor-02-seller-flow.png)**  
- Testimonial social proof: real customer faces + quotes (TH-03 pattern, circles with human photos)
- Clear value proposition framing: no showings, instant offer, free cancellation
- Trust anchored to human testimonials with city + name labels

**Buy side browse (opendoor-03)**  
Card anatomy:
- Image ratio: 3:2, moderate aspect ratio
- Price: large bold below image, left-aligned
- Metadata: beds / baths / sqft + $/month estimate + school district
- Save/heart icon: top-right of image
- Map + card split: left = full-width interactive map with price bubbles, right = card strip
- Sold-by-Opendoor badge on all cards (brand provenance)
- Minimal: no agent face, no verification badge concept

**Note on Opendoor browse screenshots:** `opendoor-03-homes-browse.png`, `opendoor-04-homes-map.png`, `opendoor-04-phoenix-search.png`, and `opendoor-05-phoenix-search.png` are byte-identical (md5 `8b14660…`) — one capture saved under four names. The "map view" and "separate browse states" are therefore not separately evidenced; the observations above reflect a single captured frame showing the map+card split in one view. A dedicated map-only vs. card-only state was not captured.

**Listing detail (opendoor-06, opendoor-07)**  
Above fold — extremely clean:
- Full-width hero photo, no mosaic
- Address + city/state below image
- Price ($326,000) — large, bold, immediate
- Quick specs: 3 bed / 2 bath / sqft / $/month estimate — single chip row
- **Unique: dual price block** — Market price ($326,000) vs "Buy with Opendoor" price ($322,740 = $3,000 below) + 3 badges (Early Move-in / 150-day Warranty / Free Cancellation) → value differentiation CTA
- Primary CTA: orange "Buy this home" button (full-width below dual price block)
- Secondary: "Tour with agent" text link
- Map embedded below photos (small, static-looking)

**Dark mode:** Not offered. `opendoor-08-darkmode.png` is byte-identical to `opendoor-06-listing-detail.png` and `opendoor-07-listing-cta.png` (md5 `f3a5933…`) — all three are the same light-mode listing at $326,000 on a white background. No dark UI was observable. The `t_light` CSS class on the root element suggests a theme system exists in code, but dark is not exposed to users.

**What translates:**
- Dual-price framing (market vs Opendoor price) → maps to our asking price vs Treasury appraisal vs negotiated price display (CONV-09 + MKT-06)
- Warranty/benefit badges below price (Early Move-in / Free Cancellation) → maps to deed-type / transfer-restriction warning badges (COPY-04)
- Testimonials with faces as trust pattern (TH-03) — STEAL
- Orange/warm primary CTA color stands out without being aggressive
- Extremely clean above-fold: hero + price + specs + ONE CTA (matches P7 / CONV-04)

**What does NOT translate:**
- No phone number or messaging CTA — Thai buyers need LINE (CONV-06)
- iBuyer instant-offer model doesn't map to Thai market structure
- School district as metadata — Thai buyers want location by district, transit
- $/month mortgage estimate assumes US financing — Thai mortgage rejection rate 70% sub-฿3M means this framing can mislead (per A2/A3 research)

---

### Suumo Japan (dense Asian portal — suumo.jp)
**Screenshots:** suumo-01 through suumo-07

**Homepage (suumo-01-homepage.png)**  
- Green + white brand, cartoon mascot characters, illustrated regional map of Japan
- Extremely navigation-heavy: 賃貸 / 新築 / 中古 / 注文住宅 / 土地 / リフォーム / 売却査定 / 講座/相談 / 暮らし — 9 top tabs
- Animated/gamified aesthetic — very unlike Western sites
- No hero image of a property — map illustration is the hero

**Search results — purchase (suumo-02, suumo-03)**  
Card anatomy:
- Very text-heavy layout: title as H2 link (blue, underlined), then data table inline
- Price: 4680万円 — large red text, prominent
- Metadata shown as labeled data table within the card: address, land area (登記), floor area, year built, station walk-time
- No hero card image by default in list view — thumbnail appears only when "写真あり" (has photos) filter active
- Highlighted info: 駅徒歩X分 (station walk minutes) — critical Japanese filter
- Action CTA: orange "資料請求する (無料)" = "Request materials (free)" button per card — NOT phone/chat primary
- Save/bookmark heart icon per card
- Side panel: faceted filter tree (area checkboxes by ward), result count

**Dense view observations:**
- 30 results per page, dense text rows
- Filter sidebar persists right (TH-09 violation pattern for mobile — needs full rethink on 390px)
- 3 view toggles: 通常表示 (full) / シンプル一覧表示 (simple list) / 地図で表示 (map)
- Result count prominent: "400件"
- Sort dropdown: 指定なし (default), price asc/desc, etc.

**Listing detail (suumo-03, suumo-04, suumo-05, suumo-06)**  
Above fold:
- Breadcrumb navigation at top (province > district > ward > station)
- Title = "神田神保町１（神保町駅）8280万円" — location + station + price in headline
- Price: 8280万円 — bold red, left-side
- Quick info: address, metro line, station name + walk minutes, update/next-update dates, agent company name
- Primary CTA: orange "資料請求する(無料)" + large phone number "TEL: 0800-2224109 [通話料無料]"
- Gallery: photo array (exterior + interior + floor plan), clickable to full-screen
- Station walk-time is the #1 location signal (more prominent than map)
- Sticky footer CTA: "資料請求する(無料)" repeats
- Spec table: tabbed (物件の特徴 / 周辺環境・地図 / 物件概要) — progressive disclosure via tabs
- Legal agent disclosure in body text: license number, office address, business hours
- Dense but organized — everything labeled with Japanese table rows

**Rental search (suumo-07)**
- 111,480件 — enormous result count
- Tabs: 建物ごとに表示 (by building) / 部屋ごとに表示 (by unit)
- No hero images in default view — text-only card rows
- CTA: "まとめて問い合わせる" (bulk inquiry) — multi-select checkboxes per listing
- Station + walk minutes is FIRST filter and FIRST metadata shown

**Dark mode:** Not offered

**What translates:**
- Phone number prominently displayed alongside info-request CTA → LINE + phone hierarchy (CONV-06)
- Tabs for property sections (特徴/地図/概要) → accordion pattern (CONV-05)
- Dense spec table with labeled rows → our property details section
- Station/transit walk-time → Thai equivalent = driving distance to central district (เวลาขับรถ)
- Update/freshness date prominently shown (26/6/11 updated, 26/6/19 next) → CONV-11

**What does NOT translate:**
- No photos in default list view — Thai buyers expect rich photos (CONV-01)
- "Request materials" CTA = email/PDF form model (CONV-06 violation — Thai buyers want instant chat)
- Bulk inquiry checkbox model adds cognitive load
- Density of text cards is unusable at 390px mobile without total redesign
- Cartoon mascot/illustrated aesthetic — won't fit the "clean, modern, approachable" founder taste brief
- 111,480 results with no smart defaults → overwhelming; Thai market is smaller so this is less urgent but default sort/filter matters

---

## 2. Dark mode listing UI — evidence status

**Finding: Zero of the six sites offer a real dark mode listing UI in 2026.**

- Rightmove: light-only confirmed by session observation. `rightmove-05-darkmode-check.png` is byte-identical (md5 `b1deb11…`) to `rightmove-03/04/06` — it is a light-mode listing capture, not a dark response.
- Airbnb: no `prefers-color-scheme: dark` response at all. `airbnb-06-darkmode.png` is a distinct file but is the standard light-mode Airbnb listing detail — confirmed visually. No dark UI was observable.
- Opendoor: `t_light` CSS class on root suggests theme capability but dark not exposed. `opendoor-08-darkmode.png` is byte-identical (md5 `f3a5933…`) to `opendoor-06-listing-detail.png` and `opendoor-07-listing-cta.png` — all three show the $326,000 Peoria listing on a white background.
- Suumo, Idealista (blocked), Zillow (blocked): light-only or unobservable.

**Evidence status:** No dark-mode captures exist in this screenshot set. The files named `*-darkmode*.png` are all light-mode frames. The recommendations below are **reasoned extrapolations from light-mode anatomy** — not benchmarks derived from observed dark UIs.

**Implication for our product:**  
We are building dark mode at launch with zero direct-market precedent from the competition — this is a genuine differentiator. The following observations extrapolate from light-mode structure:

1. **Photo-forward card anatomy** (Airbnb mosaic, Rightmove/Opendoor single-hero) demonstrates that property photos are always the brightest element on the page. On a dark surface (`zinc-900`), the photo acts as a natural light source; the surrounding chrome should recede in off-white. This is an extrapolation, not a directly observed dark pattern.

2. **Airbnb's photo mosaic and "Show all N photos" button** on white shows that photos carry the visual weight regardless of surface color — the mosaic approach translates to dark with an inverted pill treatment (near-white pill on dark surface).

3. **Suumo's dense text tables** demonstrate what NOT to do — Suumo's #FF6400 orange CTAs on white would be unreadable if naively inverted on dark. Our CTA hierarchy in dark should use a muted trust-blue primary, never saturated orange-red.

For our dark mode tokens (extrapolated, not benchmarked against observed dark UIs):
- Card surface: zinc-900 / neutral-900 (not pure black — avoids harsh contrast with property photos)
- Price text: white primary (#F5F5F5, ~16:1 on zinc-900 — passes WCAG AA), trust-green for positive indicators
- CTA button: trust-blue (lighter shade on dark surface vs. darker shade on light surface) — never orange
- Spec chips: zinc-700 background, zinc-100 text (~9.5:1 on zinc-700 — passes AA) — readable without competing with photos
- Agent/badge overlay on photos: semi-transparent dark pill (rgba(0,0,0,0.65)) works on both light and dark themes
- OKLCH color model with sRGB fallbacks per TECH-06 for older Thai Android WebViews

---

## 3. Top 10 STEAL patterns

| # | Pattern | Source | Heuristic fit |
|---|---------|---------|---------------|
| S1 | **Horizontal scrollable category/filter chips above results** — icon + label, one-tap, active state highlighted | Airbnb | TH-09 mobile-first; maps to property type, furnishing, deed type filter tabs |
| S2 | **Thumbnail strip with count badge immediately below hero** (4-5 thumbs + "+N more") | Rightmove | CONV-03 exact implementation — steal the layout |
| S3 | **Photo mosaic above fold** (1 large + 2 stacked right) + "Show all N photos" button | Airbnb | CONV-03/04: no auto-play spinner, user-initiated gallery, count visible |
| S4 | **Sticky right booking/CTA panel** with date picker and primary action button | Airbnb | CONV-04/06: above fold primary CTA stays in view on scroll; our version = "Chat on LINE" sticky |
| S5 | **Dual price block** (asking + secondary metric + 3 benefit badges below) | Opendoor | CONV-09 + COPY-04: show asking price, then add Trust badges (chanote type, transfer status, negotiable flag) |
| S6 | **Superhost / verification badge with human face + tenure** on listing detail | Airbnb | TH-03/TH-04: exact pattern — show owner/agent face + badge + "verified since [year]" |
| S7 | **Testimonial carousel with real faces + transaction city** | Opendoor | TH-03: human trust on every surface; use for broker/owner testimonials on landing |
| S8 | **Update + next-scheduled-update dates on listing** | Suumo | CONV-11: freshness stamp — show "อัปเดต 11 มิ.ย. / อัปเดตถัดไป 19 มิ.ย." |
| S9 | **Tabbed detail sections** (features / map / overview) for non-title-deed content | Suumo | CONV-05: tabs/accordions for secondary sections (features, map, overview); **chanote/title-deed block must be a persistent always-open panel outside any tab group** — CONV-05/P7 require it always visible, not hidden when another tab is selected |
| S10 | **Map with price-bubble pins + card-list split view** | Airbnb / Opendoor | CONV-08: list-first MVP but map pins are the right visual for the map fast-follow; price bubble over pin is the standard pattern |

---

## 4. Top 5 AVOID patterns

| # | Pattern | Source | Reason to avoid |
|---|---------|---------|-----------------|
| A1 | **Email/form enquiry as primary CTA** ("Request details", "資料請求する") | Rightmove, Suumo | CONV-06 canonical violation — Thai buyers will not fill a form; LINE is the primary channel. Every CTA must route to LINE or phone |
| A2 | **No asking-price framing** — price shown as definitive fact | Rightmove, Opendoor | CONV-09: Thai culture expects negotiation buffer ("เผื่อต่อ"); presenting price as final signals cultural tone-deafness and kills negotiation signal |
| A3 | **Dense text-only listing cards with no hero thumbnail** as default | Suumo | CONV-01/03: Thai buyers will scroll past text cards; visual card layout is the strong default. Per DF-6, photo-floor is enforced via warn-and-nudge until the gate is satisfied — not a hard block — but the absence of photos is a listing-quality deficiency to surface to the poster, not silently tolerate |
| A4 | **Station walk-time as #1 location signal** | Suumo | Thai Chiang Mai context is car-first (low BTS/MRT density); transit minutes are nearly meaningless. Driving-distance-to-landmark or amphoe/tambon is the correct location signal (MKT-04) |
| A5 | **Bulk inquiry with multi-select checkboxes** | Suumo | Adds cognitive load and delays the single-tap LINE/phone action. Thai brokers need instant 1:1 contact, not batched PDF requests |

---

## 5. Gallery UX summary

| Site | Gallery entry | Navigation | Count visible | Full-screen |
|------|--------------|------------|---------------|-------------|
| Rightmove | Thumbnail strip below hero (5 + count) | Arrow click in hero or strip tap | Yes ("+3" badge) | Modal slideshow *(observed in-session; `rightmove-06-gallery-strip.png` is the full listing page, not a gallery-modal crop — no gallery-modal screenshot exists)* |
| Airbnb | Photo mosaic (1+2 collage) + "Show all N photos" button | Mosaic is static; button opens grid view | Yes (on button) | Full-page grid, then individual arrow nav |
| Opendoor | Single full-width hero photo only | Click opens carousel | Not visible from above fold | Modal carousel *(observed in-session, not screenshotted)* |
| Suumo | Array of small thumbnails below data block | Click opens full-size | Implied by array count | New page/tab |

**Best pattern for our product (CONV-03):** Airbnb's mosaic entry + "Show all N photos" button is the gold standard for mobile. On 390px, the mosaic collapses to a single image with a "1 / N" pill counter in the corner and swipe navigation — this is exactly the pattern LINE MINI App renders natively. Rightmove's thumbnail strip below the hero is the correct secondary pattern for the web listing page.

---

## 6. Filter UX summary

| Site | Filter model | Mobile-readiness |
|------|-------------|-----------------|
| Rightmove | Persistent top bar (Min/Max price, Beds, Keywords, "+Filters") | Collapses to "+Filters" button on small screens — good |
| Airbnb | Category chips (horizontal scroll) + "Filters" modal | Excellent — chips are touch-native, modal has full filter set |
| Opendoor | Panel above card list (Location / Beds / Baths / Filters) | Usable but not as elegant as Airbnb chips |
| Suumo | Left sidebar faceted tree | Completely unusable at 390px — desktop-only pattern |

**Our filter UX recommendation:** Airbnb chip model for primary facets (type, beds, price range, area), then a "More filters" modal for secondary facets (deed type, furnishing, NPA, new/resale). Chips should be in a horizontally scrollable strip below the search bar. Aligns with TH-09 mobile-first + COMP-05/06.

---

## 7. CTA placement benchmark

| Site | Primary CTA | Secondary CTA | Position |
|------|------------|---------------|---------|
| Rightmove | "Call agent" (green) | "Request details" (green outline) | Right sticky panel |
| Airbnb | "Reserve" (red, full-width) | Refundable/non-refundable toggle | Right sticky panel |
| Opendoor | "Buy this home" (orange, full-width) | "Tour with agent" (text link) | Right sticky panel |
| Suumo | "資料請求する(無料)" (orange) | Phone number + FREE label | Top-right + sticky footer |

**Pattern:** All mature RE portals put the primary CTA in a **sticky right panel** on desktop and a **sticky bottom bar** on mobile. Our mobile layout: sticky bottom bar with "Chat on LINE" (primary) + phone number (secondary). Desktop: right sticky panel. This matches every benchmark and aligns CONV-06.

---

## 8. Above-fold inventory check vs CONV-04

CONV-04 rule: above fold = hero / price / specs / pin / CTA only

| Site | Hero | Price | Specs | Pin/location | CTA | Passes CONV-04? |
|------|------|-------|-------|--------------|-----|----------------|
| Rightmove | ✓ | ✓ (immediate) | ✓ (chip row) | Address text | ✓ (agent panel) | PASS |
| Airbnb | ✓ (mosaic) | ✓ (sticky panel) | ✓ (inline text) | City/area text | ✓ (Reserve btn) | PASS |
| Opendoor | ✓ (full-width) | ✓ (large) | ✓ (chip row) | Address | ✓ (Buy button) | PASS |
| Suumo | No hero image by default | ✓ (red price) | ✓ (inline table) | Station + walk | ✓ (orange btn) | PARTIAL — no hero |

All three Western/global leaders conform to CONV-04. Suumo's lack of above-fold hero image is the only deviation and it's a recognized weakness. Our product should follow the Rightmove/Airbnb/Opendoor model: hero first, price immediate, specs compact row, sticky CTA.

---

## 9. Accessibility and typography notes

- **Rightmove:** System UI stack (probably Helvetica/Arial), good contrast, 16px+ body text
- **Airbnb:** Circular / Cereal (proprietary), very clean spacing, 15-16px body — letter-spacing slightly negative, modern feel; no RTL/Thai support
- **Opendoor:** Graphik typeface (licensed), medium weight, clean hierarchy; no Thai support
- **Suumo:** System Japanese (Hiragino Kaku Gothic on macOS / Meiryo on Windows), 14px body — acceptable for Japanese but tight; icon usage heavy to overcome character density

**Thai implication:** None of these sites have dealt with Thai typography challenges. Our use of Sarabun (looped, TH-06) for body and LINE Seed TH (loopless) for headings has no international benchmark to validate against — we set the standard for this market. The 1.6 line-height rule (TH-07) is non-negotiable given these references all show comfortable line-height for Latin but Latin has shorter ascenders/descenders than Thai. +20% string-width budget (COPY-03) is validated by comparing our Thai equivalents of the short English labels in these UIs.

**Thai width risk for compact chip/label layouts:** The tight English chip labels in these UIs — Airbnb's category chips (15px, slightly negative letter-spacing), Rightmove's spec chips, Suumo's filter tabs — will not survive Thai translation at the same font-size and container width. Thai strings run approximately +20% wider than English equivalents (COPY-03), and loopless LINE Seed TH at small sizes (12–14px) needs verification that ascenders/vowel marks don't clip at tight line-heights. Any chip/badge/pill component ported from these references needs ~20% more horizontal padding or a font-size bump when rendering Thai — the compact density seen in these refs does not translate 1:1. This is the highest-risk unseen issue for a designer adapting these layouts without a Thai-font preview.

---

## 10. Dark mode — 3 extrapolated observations for our launch

*These are reasoned extrapolations from light-mode anatomy, not observations from dark captures — none exist in the benchmark set. See §2 for the full evidence note.*

**OBS-D1: Property photo is always the lightest element — design dark chrome around it, not competing with it.**  
Every site's listing hero is a real-world photo (bright exterior, lit interior). On a dark surface (`zinc-900`), the photo acts as a natural light source. The surrounding chrome (price text, spec chips, CTA button) should use off-white (#F5F5F5 equivalent) for text and a mid-saturation trust-blue for CTAs. Never put a white background card on a dark surface — that defeats the dark-mode experience. Our card component in dark mode: `bg-zinc-900` body, `bg-zinc-800` card surface, OKLCH trust-blue CTA.

**OBS-D2: Price and badge legibility is the hardest dark-mode problem in RE.**  
Suumo's red price text on white (8280万円) becomes unreadable if naively inverted on dark (dark red on dark = low contrast). Opendoor's $326,000 black-on-white also fails direct inversion. The correct pattern: price text = `text-white` (or `text-zinc-50`) on dark, with the color accent moved to a small prefix badge (e.g., a green "฿" pill or "asking" label). Our negotiable badge ("ต่อรองได้", COPY-11) should be an OKLCH-green pill that reads clearly on both light and dark card surfaces.

**OBS-D3: No competitor has done this — we can own the "dark-mode property portal" aesthetic.**  
The absence of dark mode across all six benchmarked sites means the first Thai property portal with a polished dark mode will be visually distinctive in app-store screenshots, in LINE MINI App previews, and in late-night browsing sessions (which analytics consistently show as peak browse time for property research).

Aesthetic target for **dark** contexts (listing/detail pages, MINI App): Airbnb's photo-forward airy card layout translated to zinc-900 surfaces + our trust-blue primary + Sarabun looped body. The **homepage/landing page** register follows the founder brief (Baania/DDProperty/LINE — clean, light, approachable) — TH-09/TH-12 explicitly flag "black never dominant surface" for the landing register; Opendoor's near-black homepage hero is a US-iBuyer luxury register and the wrong reference for our homepage. Dark zinc surfaces are appropriate for listing/detail and the MINI App shell, not the public homepage.

Contrast tokens must be validated against WCAG AA at minimum; OKLCH color model with sRGB fallbacks covers older Thai Android WebViews (TECH-06).

---

## Review response

Critique reviewed 2026-06-12. Each finding addressed below.

| Finding | ID | Disposition | Action taken |
|---------|-----|-------------|--------------|
| Dark-mode screenshots are mislabeled light-mode dupes | 1 | **Applied** | Header added a full evidence-integrity note explaining all `*-darkmode*.png` files are light-mode captures (md5-verified). §2 section retitled "evidence status," bullet-by-bullet provenance added, §10 header prefaced "extrapolated observations not benchmarks." |
| Four Opendoor browse screenshots are the same image | 2 | **Applied** | §1 Opendoor browse section collapsed to "opendoor-03" (single frame); note added explaining `opendoor-03/04/04-phoenix/05-phoenix` are all md5 `8b14660…`. Map-vs-browse claim softened to "single captured frame showing both in one view." |
| "36 files / 36 screenshots" count is inaccurate | 3 | **Applied** | Header updated to 37 total files, 29 unique hashes, ~26 effective design frames; block pages listed as non-evidence. |
| Zillow + Idealista coverage gap not surfaced prominently | 4 | **Applied** | Header now leads with "Coverage gap — 4 of 6 sites yielded usable evidence" and recommends residential-proxy or manual re-capture. |
| OBS-D3 anchors homepage aesthetic on Opendoor near-black hero (contradicts TH-09/TH-12) | 5 | **Applied** | OBS-D3 rewritten: dark zinc surfaces scoped to listing/detail and MINI App only; homepage/landing register explicitly anchored to founder brief (Baania/DDProperty/LINE, clean+light). Opendoor near-black hero named as wrong register for our homepage. |
| CONV-01 in AVOID table overstates DF-6 ruling as "non-negotiable block" | 6 | **Applied (partial)** | A3 wording corrected to "warn-and-nudge until gate satisfied" per DF-6. The CONV-01 photo-floor being in nudge mode (not hard block) is now explicit. IDs MKT-06, FIELD-01, CONV-09 etc. were already correct per the register; the A2/A3/A4/A5/B1 artifact-prefix citations are tolerated as-is since the critique acknowledges them as "loose but tolerable." |
| S9 tab pattern could put chanote inside a hidden tab | 7 | **Applied** | S9 STEAL row rewritten: tabs/accordions are for non-title-deed content only; chanote/title-deed block called out as a persistent always-open panel outside any tab group, per CONV-05/P7. |
| Thai chip/label width risk not noted in typography section | 8 | **Applied** | §9 "Thai implication" paragraph extended with an explicit "Thai width risk" note: compact English chips (Airbnb 15px, Rightmove spec row) need ~20% wider containers or size bumps for looped Thai; flagged as the highest-risk unseen adaptation issue. |
| `rightmove-06-gallery-strip.png` is the full detail page, not a gallery crop; §5 modal claim not screenshotted | 9 | **Applied** | §5 gallery table cells for Rightmove and Opendoor annotated with "(observed in-session, not screenshotted)" so the evidence status is honest. |
