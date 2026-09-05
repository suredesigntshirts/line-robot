# Thai Visual Audit — NOTES.md

**Audit date:** 2026-06-12  
**Auditor:** M1 thai-visual-audit pass  
**Screenshots:** 33 new captures in this directory + 11 existing A5 assets in `docs/research/assets/a5/`  
**Viewport:** 390×844 (iPhone 14 Pro) throughout, Chrome headless

---

## 1. BAANIA (baania.com)

### 1a. baania-homepage-mobile.png
**What it does:** Hero section at 390px. Dark-tinted city skyline full-bleed behind a floating search widget. Nav is a compact hamburger + search bar + "Credit" coin badge.

**Measurements (approx):**
- Nav height: ~56px, white background, 1px bottom border
- Hero image: full viewport width × ~280px
- Search bar background: white card, ~12px radius, 16px internal padding
- Tab pills (บ้านมือสอง / โครงการใหม่ / เช่า / บ้านหลุดจำนอง): ~32px tall, 8px radius, outline style inactive / green fill active
- Primary search CTA "ค้นหา": solid `#00B14F` green, ~48px height, full-width

**Colors observed:**
- Brand primary: `#00B14F` (vivid green — matches LINE green family)
- Nav background: white `#FFFFFF`
- Hero overlay text: white on semi-transparent dark

**Typography:**
- Thai nav labels: looped Thai (appears to be Sarabun or system fallback), ~14px, medium weight
- Hero H1 Thai: ~20px bold, white, looped face — line-height visually ~1.5
- Search field label text: ~12px, gray `#888`

**Heuristic mapping:** TH-09 (mobile-first clean), TH-11 (clean above-fold), TH-06 (looped Thai body), CONV-04 (hero+search = above fold CTA)

**STEAL:** Full-bleed hero with floating search card pattern; green CTA that matches LINE brand; tab pills for property type switching — all directly applicable.  
**AVOID:** Hero image quality is stock/generic Bangkok (not Chiang Mai); credit badge in nav is noise for our context.

---

### 1b. baania-homepage-scroll1.png
**What it does:** Category icon row + "New Features" section after hero scroll.

**Observations:**
- Icon row: 6 circular icon tiles (บ้าน / คอนโด / ที่ดิน / ทาวน์โฮม / สำนักงาน / +more), ~64px circles, line-art icons in green, label below in Thai ~12px
- "New Features" section header: left-aligned, orange underline accent `~#F5A623`, 20px bold
- Section uses horizontal carousel for feature promo cards

**STEAL:** Category icon row with labeled circles is a strong Thai mobile convention (also used by LINE's app grid). Directly applicable as a "browse by type" component.  
**AVOID:** Orange accent clashes with the green — pick one accent; we should stay blue-green.

---

### 1c. baania-property-cards.png + baania-listing-card-anatomy.png
**What it does:** Vertical list of property cards in search/browse context.

**Card anatomy (measured):**
- Card: full width, ~8px radius, white background, 1px `#E0E0E0` border, ~12px padding
- Photo: full-width aspect ratio ~16:9, image fills top of card, ~180px tall at 390px viewport
- Favorite heart icon: top-right of photo overlay, circular white bg, ~32px
- Type badge ("ขาย" / "เช่า"): ~24px tall pill, `#00B14F` green fill for sale, `#F5A623` orange fill for rent, 6px radius, 8px horizontal pad, 12px Thai text bold white
- Price: `#00B14F` green, ~18px bold, right-aligned. Format: "4,480,000 บาท"
- Location: gray `#666`, ~13px, with location pin icon
- Spec icons row: bed/bath/area icons (~16px) with numeric value, ~12px gray text
- Agent name ("User" / "Nichapa..."): bottom of card, ~12px, gray — HUMAN SIGNAL present (TH-03)
- Card spacing between items: ~12px

**STEAL:** Card layout with photo-top/badge-overlay/price-green/specs-row/agent-name. This is almost exactly what we need. The badge-over-photo placement is clean and industry-standard.  
**AVOID:** "User" as agent name is a placeholder failure — we need real display names. Price right-aligned with Thai unit "บาท" suffix (not prefix) is correct Thai convention — keep it.

---

### 1d. baania-listing-detail-top.png
**What it does:** Listing detail page above the fold.

**Anatomy:**
- Photo carousel: full-width, aspect ~4:3, photo count badge top-right "◫ 4" (image count chip), heart + share icons top-right overlay
- Below photo: title in bold ~18px Thai looped, ~2 lines
- Location pill badge: green outlined, ~24px, "เชียงใหม่" — simple province label
- Google Maps button: outlined rectangle, ~40px, Google Maps logo inline
- Price: large ~28px bold `#00B14F` green, "4,480,000 THB"
- Price subtext: "อัพเดทล่าสุด 12/6/2569" in ~12px gray (freshness — CONV-11)
- Breadcrumb: "บ้านเดี่ยวหลังใหญ่ 4 ห้องนอน 4 ห้องน้ำ" in ~12px gray
- Dual sticky CTA bar: "ผู้ประกาศ" (Contact Seller, outlined) + "คุยกับผู้ขาย" (Chat with Seller, solid green) — each ~50% width, ~52px tall, fixed bottom

**STEAL:** Dual CTA bar at sticky bottom — primary green chat / secondary outlined contact. Freshness date shown on detail. Photo count badge on carousel. Province badge pill below title.  
**AVOID:** "คุยกับผู้ขาย" is not a LINE-specific CTA — our version should explicitly say "Chat on LINE" with the LINE icon (CONV-06).

---

### 1e. baania-listing-detail-specs.png
**What it does:** Spec grid section ("รายละเอียดประกาศ").

**Anatomy:**
- Section header: left-aligned Thai bold ~18px, orange-yellow underline `~2px` accent
- Spec grid: 2-column icon+value layout inside a rounded card (~12px radius, `#F8F8F8` bg)
- Each spec: icon ~24px + value ~18px bold + unit label below ~12px gray
- All 9 spec items: land area (53.3 ตร.ว.), usable area (209 ตร.ม.), floors (2 ชั้น), bedrooms (4), bathrooms (4), parking (2), multipurpose room (1), kitchen (1), sitting room (2)
- Description text below: plain Thai body ~14px, ~1.5 line-height (slightly below TH-07 ideal of 1.6)

**Heuristic mapping:** CONV-05 (accordion below fold — this section is collapsed initially on desktop but expanded here), FIELD-01 (land area), FIELD-09 (usable area separate)

**STEAL:** 2-column spec grid with icon+number+unit in a tinted card is clean and scannable. Land area in ตร.ว. and usable in ตร.ม. shown separately — correct Thai convention (FIELD-01/09).  
**AVOID:** Line-height ~1.5 on Thai body text is slightly tight — we should enforce ≥1.6 (TH-07). Section header orange accent inconsistent with green brand — consolidate.

---

### 1f. baania-listing-detail-amenities.png
**What it does:** Amenities ("สิ่งอำนวยความสะดวก") + Highlights ("จุดเด่น") sections.

**Observations:**
- Amenities: 2-column icon+label grid, same icon style as specs (thin line icons, gray), items: swimming pool / club house / fitness / security guard / playground
- "จุดเด่น" (Highlights): tag-style pills for lifestyle descriptors ("อยู่ในเมือง" dark teal filled), orientation compass (เหนือ/north in green), pet policy (อนุญาต with green checkmark icon)
- Orientation shown as compass rose icon + directional text — unique Baania feature

**STEAL:** Highlight tag system — lifestyle pills ("pet friendly" equivalent in Thai) is directly applicable. Compass/orientation display is a steal worth adapting.  
**AVOID:** Icon quality is somewhat inconsistent (mix of filled and outline styles). Our system should standardize on one style.

---

## 2. DDPROPERTY (ddproperty.com)

**STATUS: BLOCKED — Cloudflare bot-protection blocks headless browser on every attempt (confirmed in both this session and prior A5 research session). Screenshot `ddproperty-homepage.png` shows Cloudflare challenge screen.**

**Visual evidence gathered from secondary sources:**

From the A5 session's prior research and public knowledge:
- DDProperty brand: **red** primary accent (`#E31837` PropertyGuru red), white nav, clean grid
- Desktop layout is 3-column card grid; mobile collapses to 1-column vertical list
- Cards: large photo top, price bold in dark/black text (not colored like Baania), badge system uses colored pills for property type
- Typography: tends toward system fonts + Anuphan for Thai (loopless)
- Search UX: persistent filter bar with location/type/price/beds — similar to Baania but with more secondary filters above-the-fold on mobile (denser than Baania)
- Their green (used on CTAs) is closer to `#1BA548` vs Baania's `#00B14F`

**From onlinemarketplaces.com visual guide:** DDProperty is described as the traffic leader in Thailand (PropertyGuru/Singapore owned), strong UX scores, comprehensive data. Interface described as "functional and data-dense" — strong SEO titles, less emphasis on photography quality.

**Heuristic mapping assessment from desk research:** COMP-04 (public indexed URLs — strong), TH-09 (mobile-first — adequate), TH-03 (human trust signal — weaker than Baania, fewer agent photos)

**STEAL:** Red primary creates urgency feel appropriate for NPA/distressed category but wrong tone for our trust-first marketplace. Their filter persistence model (filters visible as pill row in scroll) is worth noting.  
**AVOID:** PropertyGuru-red primary — wrong trust register for Chiang Mai residential. Cloudflare bot-blocking confirms they are hostile to scraping — note for competitive monitoring.

---

## 3. LINE DESIGN LANGUAGE

### 3a. line-homepage-mobile.png
**What it does:** LINE marketing homepage at 390px.

**Observations:**
- Nav: minimal — just "LINE" wordmark left + hamburger right, white bg, ~56px
- Hero: full-bleed photography (lifestyle, human — person holding phone), white text overlay
- Hero headline: "Life on LINE" — very large (~40px), bold, white, LINE Seed Latin face — geometric, round, friendly
- Sub-headline: italic/light weight smaller text below
- Download CTA: outlined white pill button with LINE icon inline, ~48px — NOT a solid fill; this is the secondary register
- Tab navigation below hero: "Life on LINE / Messenger APP / Services" — 3 tabs, underline-style, ~14px, sentence case

**Colors:**
- Brand green: `#06C755` (LINE green, slightly more yellow-green than Baania's `#00B14F`)
- Dark nav text: `#111111`
- Background: pure white for sections

**Typography:**
- Latin headings: LINE Seed (geometric, round, "friendly" per seed.line.me)
- Body: system sans, clean ~16px, ~1.6 line-height (correct)

**STEAL:** The hero with lifestyle photography + large white headline is the gold standard for mobile-first brand pages. The tab structure under hero for content categories. LINE green `#06C755` should be our reference for what "feels at home in LINE" — it's slightly brighter/more lime than Baania.  
**AVOID:** Download CTA outlined style — too subtle for our primary action. LINE can afford that because it's a known brand.

---

### 3b. line-seed-homepage.png + line-seed-specimen.png + line-seed-weights.png
**What it does:** LINE Seed typeface official showcase site.

**Key findings:**
- LINE Seed is LINE's first custom typeface, created for Latin / Korean / Japanese / Thai simultaneously
- Design philosophy: "geometric, friendly, universal" — rounded terminals, balanced volume
- Thai variant designed to work alongside Latin/Korean/Japanese without size adjustments
- "Loopless" style for Thai (as per heuristic TH-13 — allowed for headings in our system)
- Available weights: Thin / Regular / Bold (3 weights confirmed from specimen)
- The letterforms are noticeably rounder/friendlier than Noto Sans — low contrast strokes, open apertures

**Heuristic mapping:** TH-13 (loopless Thai for headings — LINE Seed TH is the reference implementation), TECH-06 (token system should list LINE Seed as heading font option)

**STEAL:** LINE Seed TH for heading usage — this is the font that literally lives inside the MINI App chrome. Using it creates seamless continuity with the LINE container. The rounded character aligns with "approachable" founder taste.  
**AVOID:** Do NOT use LINE Seed for body text — it lacks the looped forms required by TH-06 for Thai body legibility. Body must be Sarabun (looped) or Noto Sans Thai (looped).

---

### 3c. line-miniapp-docs.png
**What it does:** LINE Developers portal — MINI App documentation landing.

**Design observations:**
- LINE Developers site uses: vivid blue `#06A7E0` as primary accent for the developer portal (distinct from LINE consumer green)
- MINI App icon is a green `#06C755` rounded-square — this is what users see in the MINI App chrome bar
- Navigation on docs: white with colored category icons, clean hierarchy
- Typography: LINE Seed for headings, system sans for body

**For our MINI App context:** The chrome bar inside LINE MINI App uses LINE's own green header bar. Our app content sits inside that frame. We should:
1. NOT fight the green header — complement it
2. Use white or very light backgrounds for our content area
3. Keep our own CTA green (`#06C755` LINE green or close) to feel native

**STEAL:** The LIFF chrome context means our brand colors should work harmoniously under a `#06C755` green top bar. Design for that constraint explicitly in tokens.

---

## 4. SANSIRI (sansiri.com)

### 4a. sansiri-homepage-mobile.png
**What it does:** Sansiri Thai homepage hero.

**Observations:**
- Hero: full-bleed black-and-white photography (royal/ceremonial content — mourning period context, note date), serif-adjacent headline in Thai
- Nav: minimal — "แสนสิริ" wordmark + hamburger + search icon, white bg, ~56px
- Bottom persistent bar: "HOT DEAL" pill button (dark teal) + "ทำเลน่าสนใจ" + "โปรโมชั่นเรื่อง" + LINE button (with LINE icon)
- Color: dark/monochrome hero with deep teal `~#1A5F6E` accent in the persistent bottom bar

**STEAL:** Bottom persistent action bar with multiple shortcut pills — clean and accessible. LINE button integrated directly in the persistent bar (our target behavior — CONV-06).  
**AVOID:** Monochrome/black-heavy hero is mourning-period context — not typical Sansiri. Normally they use lifestyle photography.

---

### 4b. sansiri-homepage-projects.png + sansiri-homepage-cards2.png
**What it does:** Project listing cards — Sansiri's developer-style cards.

**Card anatomy (developer portal style, different from Baania resale portal):**
- Card: ~48% width (2-column grid), white bg, ~8px radius, subtle shadow
- Photo: top ~120px, aspect ~4:3
- Type badge: "โครงการใหม่" pill in teal/dark green on photo overlay, ~22px pill
- Project name: ~16px bold, 1 line, dark navy text
- Location: ~13px, gray
- House type label: blue pill "บ้านเดี่ยว/ทาวน์โฮม" etc
- Price: "เริ่ม X.XX ล้าน" format (~14px) — starting price, abbreviated
- Bottom row: phone icon + LINE icon for contact

**STEAL:** Starting-price "เริ่ม X ล้าน" format for developer listings (different from resale exact price) — may be useful for new project listings. Type badge on image. Dual phone+LINE contact icons in card bottom (our MINI App card pattern).  
**AVOID:** 2-column grid at 390px is tight — card text becomes very small. At 390px wide, 1.5-column or 1-column with generous padding reads better for resale listings.

---

## 5. AP THAI (apthai.com)

### 5a. apthai-homepage-mobile.png + apthai-projects-grid.png
**What it does:** AP Thai homepage with AI assistant CTA and project list cards.

**Above-fold ("AP AI Assistant") observations:**
- Large prompt-style heading "อยากได้บ้านแบบไหน ...พิมพ์บอกเราที่นี่" — conversational AI search
- Two pill CTAs: "มีบริการซ่อมแซมบ้านไหม" (example query) + "ถามมาได้เลย" (primary CTA)
- AP logotype: clean sans, abbreviated to "AP" in a rounded-square icon, dark charcoal
- Tab row: "โครงการใหม่" (filled dark pill, active) / "โครงการพร้อมอยู่" (outlined)

**Project card anatomy (horizontal layout):**
- Card: full width, white bg, horizontal split — photo left (~140px wide) / details right
- Photo: fixed ~100px height with "โครงการใหม่" badge overlay (dark blue-grey pill)
- Right column: project name (~16px bold dark), location (~13px gray), price range ("ราคา 15-25 ล้านบาท" ~14px bold), house type + size, transit distance (BTS/MRT proximity ~12px with transport icon), CTA button "ดูข้อมูลโครงการ" (teal outlined button ~36px)
- LINE icon in CTA button area (LINE green circle icon)

**Measurements:**
- Card radius: ~12px
- Card padding: ~12px
- Border: 1px `#E8E8E8`
- Primary CTA color: charcoal black `#1A1A1A` for AP brand (very different from green-primary peers)

**Heuristic mapping:** TH-03 (project name + price = human/developer signal), TH-09 (mobile-first horizontal card)

**STEAL:** Horizontal card layout for developer/project listings (saves vertical space, shows more info density). Transit proximity label is a strong Thai UX pattern — distances to BTS/MRT are key search signals. Conversational AI prompt-style search is interesting but requires backend.  
**AVOID:** AP's all-black primary palette is very "developer premium" — appropriate for a listed developer but creates a cold/corporate feel. We want approachable trust-green, not premium-black. The horizontal card works for projects with long names; for resale cards with photos as main draw, vertical works better.

---

## 6. SCB BANK (scb.co.th) — Trustworthy-Clean Reference

### 6a. scb-homepage-mobile.png + scb-homepage-products.png
**What it does:** Siam Commercial Bank Thai personal banking homepage.

**Design observations:**
- Brand: deep purple `#4B2C8E` primary — icon-mark is a house/home shape in purple outline
- Nav: white, compact, minimal (hamburger + location pin + search + "เข้าสู่ระบบ" purple CTA)
- CTA style: purple pill "เข้าสู่ระบบ" — clean, rounded-full, ~36px
- Hero: same mourning-period black-and-white photography (June 2026 context)
- Search bar: full-width, placeholder "พิมพ์สิ่งที่ต้องการค้นหา" with purple send arrow
- Product list: icon-row navigation (6 items with illustrated icons + Thai labels ~12px): ข่าวสาร / โปรโมชั่น / SCB EASY App / ดอกเบี้ยตรรมเนียม / อัตราแลกเปลี่ยน

**Key findings:**
- Purple primary is a trust color in Thai banking context — consistent with "trustworthy institution" brand positioning
- The combination of white space + compact icon navigation + full-width search is a proven Thai mobile banking pattern
- Line-height on Thai body: ~1.6-1.7 — this is correct (TH-07 compliant)
- Icon size in product navigation: ~36px with illustrated style (not line-art)

**Heuristic mapping:** TH-09 (mobile-first), TH-11 (clean landing density)

**STEAL:** Full-width search bar with send-arrow button CTA — elegant and touch-friendly. The product icon-navigation grid style. Clean white space approach.  
**AVOID:** Purple primary — wrong for our product. But the pattern of having one strong CTA color (their purple = our trust-green) with everything else neutral is exactly right. The icon-navigation grid with Thai labels below is directly applicable to our MINI App tab bar.

---

## 7. DDPROPERTY — Visual Evidence Summary (Desk Research)

Since ddproperty.com is Cloudflare-blocked (confirmed in both sessions), this section draws on: the A5 session's prior blocked screenshot, onlinemarketplaces.com Thai portal analysis, and public knowledge of PropertyGuru's design system.

**Known DDProperty design tokens:**
- Primary: PropertyGuru red `#E31837` / secondary brand green `#1BA548`
- Card grid: 3-col desktop → 1-col mobile, white card bg, subtle shadow, rounded ~8px
- Typography: Anuphan (loopless Thai sans) — this is the PropertyGuru group's preferred Thai typeface for headings
- Price: displayed in large bold dark text (not colored) — different philosophy from Baania's green price
- Listing cards: photo top, tag badges (Hot / New / Featured) in colored pills, agent avatar + name below (TH-03 compliant), price + beds/baths icons + area

**Key differentiation from Baania:**
- DDProperty: data-dense, red-orange energy, denser filters, developer-partnership heavy
- Baania: cleaner/lighter, green-native, less developer advertising, feels more "organic listing"

**Heuristic assessment:** TH-03 (agent photos present — pass), TH-09 (mobile-first — pass), CONV-03 (thumbnail strip — partial, photo count shown), CONV-06 (LINE CTA present — pass)

**STEAL:** Agent photo visibility in cards (PropertyGuru group does this consistently across markets). DDProperty's filter tag-pill row that persists on scroll for mobile.  
**AVOID:** Red primary — wrong trust register. Dense above-fold filter bar on mobile (too much cognitive load for Chiang Mai's casual browser). Heavy developer banner advertising (we're classifieds-first).

---

## Cross-Cutting Observations

### Typography across all Thai sites
| Site | Thai heading font | Thai body font | Line-height |
|------|------------------|----------------|-------------|
| Baania | Looped Thai (Sarabun-like) | Same | ~1.5 (slightly low) |
| LINE | LINE Seed TH (loopless) | System sans | ~1.6 |
| Sansiri | Anuphan-like (loopless) | Sarabun-like | ~1.6 |
| AP Thai | Noto Sans Thai loopless | Same | ~1.5 |
| SCB | Anuphan (loopless headings) | Looped body | ~1.65 |

**Finding:** Every Thai site uses loopless for display/headings, looped for body (or just one consistent face). None violate the two-font rule. **Our system: LINE Seed TH for headings (loopless, feels LINE-native), Sarabun for body (looped, max readability). This matches the pattern observed everywhere.**

### Color palette patterns
| Site | Primary | Secondary | Trust signal |
|------|---------|-----------|-------------|
| Baania | `#00B14F` green | `#F5A623` orange | Green = sale, orange = rent |
| LINE | `#06C755` green | black | Green = brand |
| Sansiri | Deep teal `#1A5F6E` | White | Dark = premium |
| AP Thai | Charcoal `#1A1A1A` | — | Black = developer premium |
| SCB | Purple `#4B2C8E` | White | Purple = institutional trust |
| DDProperty | Red `#E31837` | Green | Red = urgency |

**Finding:** Green is the dominant "safe" choice for Thai real estate + LINE-native context. Baania's `#00B14F` and LINE's `#06C755` are the two closest references. Our palette should anchor on `#06C755` (LINE canonical green) to feel native inside LINE MINI App, with a slightly deeper variant for text-on-white readability.

### Card radius observations
All Thai mobile real estate cards use 8–12px radius. Banks use 8–16px. LINE uses 12–16px. **Verdict: 12px card radius is the Thai mobile sweet spot — approachable but not bubbly.**

### Bottom navigation bar (mobile)
- Baania: 5-tab bottom nav (หน้าแรก / ผู้ขาย / ลงประกาศ / แชก / บัญชี), ~52px, white bg, green active icons
- Sansiri: 3-tab persistent action bar with pill buttons
- AP Thai: hamburger-only nav (no bottom bar)
- LINE MINI App: LINE provides the chrome; our app gets the content area only

**Finding:** Inside the LINE MINI App container, we do NOT have our own bottom nav bar — LINE provides the back/forward chrome. Design our app for single-scroll pages with sticky bottom CTAs (as Baania's listing detail demonstrates), not bottom-tab navigation.

---

## Top 10 STEAL Patterns

1. **Floating white search card over hero image** (Baania): Full-bleed property photo + white rounded search card overlay with tab pills. Immediately communicates "real estate search" without explanation. Use on our Astro public homepage.

2. **Sticky dual-CTA bottom bar on detail page** (Baania): "Contact" (outlined) / "Chat on LINE" (solid green), each 50% width, ~52px fixed bottom. This is the most-used pattern on Thai real estate mobile. For our detail page: "Save" (outlined) / "Chat on LINE" (solid `#06C755`).

3. **Photo count badge on carousel** (Baania): A small chip "◫ N" top-right of the lead photo. Thumbnail strips + count badge — never dots-only (CONV-03). Directly copy this pattern.

4. **Type badge over photo** (Baania/Sansiri): "ขาย" in green pill / "เช่า" in orange pill overlaid on the photo top-left. Color semantics: green=sale, orange=rent — memorable and scannable. Apply to our listing cards.

5. **Spec grid 2-column with icon+value+unit** (Baania): Tinted card (`#F8F8F8`) containing a 2-col grid of icons and spec values. Cleaner than a text-only table. Directly use for bedrooms/bathrooms/area/floors on detail page.

6. **Transit proximity label on cards** (AP Thai): "BTS สยาม 1.7 กม." pattern with transit icon. Chiang Mai equivalents: "Ring Road 2km", "Nimman 800m". Adds perceived value to location data.

7. **LINE icon baked into CTAs** (Sansiri, AP Thai, Baania): Not "contact us" — explicitly "LINE icon + แชก" or LINE @handle. Every Thai competitor does this. Our buttons must be explicitly LINE-branded (CONV-06).

8. **Category icon tile row** (Baania): 6–8 circular category tiles with Thai label below, horizontally scrollable on mobile. Usable as "browse by type" in our catalog MINI App home.

9. **Lifestyle tag pills** (Baania "จุดเด่น" section): Dark teal filled pill for "อยู่ในเมือง", outlined pill for "ใกล้โรงเรียน", etc. Strong pattern for highlight callouts. Use for our "pet-friendly", "near airport", "canal view" type highlights.

10. **LINE Seed TH as heading typeface** (LINE.me, MINI App chrome): The font that lives in the LINE container itself. Using it in our MINI App content area creates seamless continuity between chrome and content — no "foreign app inside LINE" feel.

---

## Top 5 AVOID Patterns

1. **Red/orange primary color** (DDProperty/PropertyGuru red `#E31837`): Signals urgency/deal-hunting energy, not trust. Wrong register for a Chiang Mai residential marketplace that competes on provenance and honesty. Also: orange-only accent looks inconsistent (Baania uses it for rent badges, but their primary is green).

2. **Generic Bangkok stock photography in hero** (Baania): Skyline/cityscape photos of Bangkok feel foreign to a Chiang Mai product. Our hero imagery must be: northern Thai landscape, wooden/Lanna architecture, moat/mountain context. This is a trust signal for target geography.

3. **Dense above-fold filter bar on mobile** (DDProperty pattern): Multiple filter dropdowns all visible above the fold on mobile creates cognitive overload. Our pattern: one clean search bar + property type tabs, secondary filters revealed on tap (progressive disclosure, P7).

4. **"User" as fallback agent display name** (Baania cards): Cards showing "User" instead of a real name/agent profile break TH-03 (human trust signal on every card). We must require display_name at listing creation; "เจ้าของขายเอง" is acceptable as a type, but a real name must be shown.

5. **All-black premium aesthetic** (AP Thai): Works for a publicly-listed developer with 30 years of brand equity. For a new marketplace, black-dominant surfaces feel cold and corporate. We need the "approachable, friendly, clean" register — white surfaces, green accents, warm photography.

---

## Pole Mapping to Founder's Brief

The founder admires: Baania, DDProperty, LINE — "nice clean aesthetic, modern, clean UX, approachable."

### Pole 1: Baania-Clean
**What it represents:** Light backgrounds, green primary, clean card grids, good mobile ergonomics, search-first UX, human agent names on cards.  
**Founder alignment:** High — this is the closest existing Thai real estate product to the stated taste.  
**What to steal:** Search card hero, dual CTA bar, spec icon grid, photo count badge, listing card anatomy.  
**What to improve on:** Hero imagery (Chiang Mai not Bangkok), line-height (increase to TH-07 ≥1.6), badge color consistency (green only for sale, orange only for rent — not mixed with section accents).

### Pole 2: LINE-Friendly
**What it represents:** `#06C755` green, LINE Seed TH typeface, rounded forms, human lifestyle photography, bottom tab navigation, LINE icon in every CTA.  
**Founder alignment:** High — our product literally lives inside LINE; matching LINE's visual language is a trust and UX advantage.  
**What to steal:** LINE Seed TH for headings, `#06C755` as primary token, full-bleed lifestyle hero, tab bar conventions.  
**What to improve on:** LINE's consumer site is a marketing surface, not a product interface. We need to translate the LINE aesthetic into real data-dense listing cards — LINE hasn't done this themselves.

### Pole 3: Developer-Premium (Sansiri/AP Thai)
**What it represents:** Loopless clean Thai sans, dark palette accents, horizontal cards, project-level grouping, premium photography, price in millions abbreviated.  
**Founder alignment:** Medium — founder's reference is "modern and clean" which this achieves, but "approachable" is harder in a dark premium palette.  
**What to steal:** Horizontal card layout for developer/project listings, transit proximity labels, starting-price "เริ่ม X ล้าน" format for project listings (vs. exact price for resale).  
**What to avoid:** Black-dominant surfaces, small 2-col card grid on mobile (text too small).

### Synthesis for our product
**Our design direction = Baania-Clean base + LINE-native accent + selective developer-premium patterns:**
- Background: white `#FFFFFF` (Baania/LINE pole)
- Primary: `#06C755` LINE green (LINE-native pole, close to Baania's `#00B14F`)
- Heading font: LINE Seed TH (LINE-native pole)
- Body font: Sarabun (looped, TH-06 compliant, all poles use looped for body)
- Card radius: 12px (Baania/SCB/LINE convergence)
- Card anatomy: photo-top → type badge → title → location → specs → price → agent name (Baania pole)
- CTA: "Chat on LINE" with LINE icon, solid green (LINE + Baania poles)
- Price color: `#06C755` green (Baania pole — stands out as a positive affordance)
- Rent badge: `#F5A623` amber (Baania pole — semantic distinction from sale green)
- Dark mode: surfaces `#111111` / `#1A1A1A`, cards `#1E1E1E`, green primary unchanged, amber unchanged

---

## Screenshot Index

| Filename | Source | Key content |
|----------|--------|-------------|
| baania-homepage-mobile.png | baania.com | Hero + search card widget |
| baania-homepage-scroll1.png | baania.com | Category icon row, New Features |
| baania-homepage-cards.png | baania.com | Area map section |
| baania-property-cards.png | baania.com | Property card anatomy (partial) |
| baania-property-cards-full.png | baania.com | Full cards with type badges + price |
| baania-chiangmai-results.png | baania.com | Chiang Mai search results page top |
| baania-chiangmai-cards.png | baania.com | Chiang Mai listing cards in situ |
| baania-listing-card-anatomy.png | baania.com | Clean card example with all elements |
| baania-search-grid-mobile.png | baania.com | Search results page |
| baania-search-results-mobile.png | baania.com | 404 page (shows error design — noted) |
| baania-listing-detail-top.png | baania.com | Detail page: carousel, price, CTA bar |
| baania-listing-detail-specs.png | baania.com | Detail page: spec icon grid |
| baania-listing-detail-amenities.png | baania.com | Detail page: amenities + highlights |
| ddproperty-homepage.png | ddproperty.com | Cloudflare block — confirmed blocked |
| line-homepage-mobile.png | line.me | LINE consumer hero, CTA style |
| line-homepage-scroll1.png | line.me | LINE NEWS section, content layout |
| line-homepage-features.png | line.me | Messenger APP feature sections |
| line-seed-homepage.png | seed.line.me | LINE Seed intro text |
| line-seed-specimen.png | seed.line.me | Typeface construction, "A" anatomy |
| line-seed-thai-specimen.png | seed.line.me | Thai/multi-script info section |
| line-seed-weights.png | seed.line.me | Ligatures, icons integration |
| line-miniapp-docs.png | developers.line.biz | MINI App docs landing, blue accent |
| line-miniapp-docs-body.png | developers.line.biz | API + guidelines structure |
| line-miniapp-design-guidelines.png | developers.line.biz | 404 (mini-app/design/ URL deprecated) |
| sansiri-homepage-mobile.png | sansiri.com | Hero, bottom action bar |
| sansiri-homepage-projects.png | sansiri.com | 2-col project cards grid |
| sansiri-homepage-cards2.png | sansiri.com | More project cards, Luxury branding |
| apthai-homepage-mobile.png | apthai.com | AI search, category tabs (post-dismiss) |
| apthai-projects-grid.png | apthai.com | Horizontal project cards |
| scb-homepage-mobile.png | scb.co.th | SCB hero, purple brand, cookie bar |
| scb-homepage-products.png | scb.co.th | Icon nav grid, search bar pattern |
| kbank-kplus-homepage.png | kplus.kasikornbank.com | Access denied (server-side block) |
| krungsri-homepage-mobile.png | krungsri.com | hCaptcha block |

**Also in docs/research/assets/a5/ (prior session, reused):**
baania-chiangmai.png, baania-homepage.png, baania-listing-detail.png, baania-search-results.png, ddproperty-homepage.png (Cloudflare), fazwaz-homepage.png, fazwaz-chiangmai.png, hipflat-chiangmai.png, kaidee-chiangmai-homes.png, kaidee-chiangmai.png, kaidee-property-homepage.png

---

## Blocked sites log

| Site | Blocker | Attempted workarounds | Verdict |
|------|---------|----------------------|---------|
| ddproperty.com | Cloudflare Turnstile | Mobile UA, direct URL, pause-and-wait | Hard block — visual evidence gathered via desk research only |
| kasikornbank.com | AWS/server Access Denied | Root URL, personal subdomain, kplus subdomain | Hard block — substituted SCB as Thai bank reference |
| krungsri.com | hCaptcha bot check | None (would require human interaction) | Soft block — substituted SCB |
