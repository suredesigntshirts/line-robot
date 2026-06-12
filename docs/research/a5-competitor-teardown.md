# A5: Competitor Teardown — Thai Property Portals

**Scope note:** This artifact audits the six primary Thai real estate portal incumbents (DDProperty, LivingInsider, FazWaz, Baania, Kaidee, Hipflat) plus the real incumbent — LINE/Facebook group deal flow — through live browser sessions, app-store sentiment mining, Thai-language Pantip/forum analysis, and DDProperty's own consumer surveys. It gates decisions about: listing schema field choices, search/filter UX, contact CTA hierarchy, agent-vs-owner labeling, monetization model selection, and the core positioning argument for why broker-networked LINE-first discovery beats portal browse.

---

## Thought leaders & sources consulted

1. **DDProperty Thailand Consumer Sentiment Studies H1+H2 2024 (PropertyGuru Group)** — Biannual surveys of 1,050 Thai consumers each; statistically rigorous, primary source for "65% use marketplace websites as primary PropTech tool" and all purchase-intent/platform-preference data. Recency: H2 2024 published late 2024.

2. **Online Marketplaces — "Visual Guide to Real Estate Portals in Thailand"** (onlinemarketplaces.com) — The single most cited industry research source on Thai portals; uses SimilarWeb traffic data, PropertyGuru/REA Group financial filings, and direct portal analysis. Covers listing volumes, revenue models, and competitive dynamics with numerical substantiation. Recency: last substantive update 2022-2023 but structures remain valid.

3. **Propholic.com — "Agent ไร้มาตรฐาน → Owner เลยต้องออกมาโพสต์แบบ เจ้าของขายเอง"** — Thai-language practitioner analysis of agent quality problems driving owners to self-list; identifies the six failure modes of portal-listed agents. Credibility: authored by Thai RE practitioners for RE professionals, not mass media.

4. **DDProperty/PropertyGuru Agent Offerings pricing page** (agentofferings.ddproperty.com) — Live first-party source for actual subscription tiers (THB 10,250–260,130/year), listing limits, and "Turbo/Boost/Featured Agent" promotional mechanics. Accessed June 2026.

5. **Checkraka.com / Tooktee.com Thai-language portal ranking articles + Pantip threads** (topics 36876916, 40569990, 41701981) — Thai-user sentiment cross-section; captures why sellers choose platforms, broker-vs-owner dynamics, and portal fatigue language. Pantip is Thailand's dominant consumer Q&A forum (~20M monthly visitors), making threads there the closest proxy to organic user opinion available.

---

## Findings

### Browser session access notes
DDProperty, FazWaz, and Hipflat all returned Cloudflare "Just a moment…" blocks during live Playwright sessions; screenshots captured the Cloudflare interstitial. LivingInsider returned HTTP 503/ERR_HTTP_RESPONSE_CODE_FAILURE across all attempts. Baania and Kaidee (baan.kaidee.com) loaded fully and were browsed directly. All Cloudflare-blocked portals were covered by web research fallback; this is noted per portal below.

---

### 1. DDProperty (ddproperty.com) — Market Leader
**Cloudflare block during browser session; all data from web research + PropertyGuru filings.**

1. **Market position:** DDProperty is owned by Singapore-based PropertyGuru (acquired 2011). It is the clear traffic leader in Thailand. DDProperty's Thailand/Indonesia combined operations generated S$2.5M in Q3 2022 revenue but remained unprofitable *(2022 vintage — do not rely on for current sizing)*. Annual revenue estimated ~$68M *(2026 industry estimate, source unclear — see PLAUSIBLE-BUT-UNVERIFIED)*. [Online Marketplaces, 2023; Rocketreach, 2024]

2. **Listing inventory:** ~1,747 properties for sale in Chiang Mai alone as of June 2026; 500k+ nationwide at peak (2019); cleaned to ~54k sale / 87k rental by Nov 2022 after deduplication effort. [DDProperty.com June 2026; Online Marketplaces, 2022]

3. **Listing fields displayed:** Price (THB), price-per-sqm, property type, bedrooms, bathrooms, floor size (sqm), land size (talang wa/rai), location (district/province), listing date, agent/owner name, agent verification badge, title deed type (Chanote vs lower), construction date, amenities tags (Pet Friendly, Near Schools, Luxury). Contact options on detail page: **Phone Reveal**, **LINE**, **Enquiry Form** — three distinct CTAs in that order. [DDProperty detail pages; web research, 2024]

4. **Search filters:** Property type, location, price range, bedrooms, bathrooms, size, price/sqm, listing date, transaction type (sale/rent), new project vs resale, NPA/foreclosed filter (51% of consumers request this per H1 2024 survey). [DDProperty search UI; DDProperty H1 2024 survey]

5. **Monetization — agent subscriptions (verified live pricing, June 2026):**

   | Package | THB/year | Concurrent listings | Ad credits |
   |---------|----------|---------------------|------------|
   | Starter | 10,250 | 15 | 1,200 |
   | Pro | 27,480 | 50 | 7,500 |
   | Superstar | 83,850 | 150 | 41,000 |
   | Corporate | 130,000 | 380 | 59,000 |
   | Corporate Plus | 260,130 | 1,000 | 128,000 |

   Premium promotion add-ons: **Turbo** (12× views, enlarged photo), **Boost** (7× views), **Featured Agent** (district ownership). Credits cost THB 3.27–3.74 each. [agentofferings.ddproperty.com, accessed June 2026]

6. **Agent-vs-owner distinction:** DDProperty has a verified agent badge system; unverified owners can also list (free basic tier). Users cannot filter "owner only" listings easily. This is a known pain point — see Finding 15. [DDProperty UX, 2024]

7. **Consumer satisfaction:** 63% of Thai consumers satisfied with the residential market (stable H1–H2 2024). 65% use marketplace websites as primary PropTech tool. TikTok newly emerged as a property discovery channel in 2024. Purchase intent dropped from 53% to 44% in H1 2024. [DDProperty H1+H2 2024 Consumer Sentiment Studies]

---

### 2. LivingInsider (livinginsider.com) — Condo-Focused Thai Portal
**HTTP 503 across all browser attempts; all data from web research + App Store reviews.**

8. **Market position:** Launched 2015, Thai management team. 4M+ monthly active users; 60,908+ listings *(both figures 2024 vintage — not re-verified June 2026)*. SEO-dominant for project-specific name searches and Bangkok condo terms. "Thai #1 Property" self-designation. Primarily Bangkok/urban condo focus; Chiang Mai coverage exists but secondary. [LivingInsider.com; Google Play listing 2024]

9. **Listing fields and UX:** Listings include publication timestamps (a differentiator — users can verify recency), high-res photos, maps, nearby amenities. iStock feature provides real-time alerts. My Stock tool for inventory management. Chat function in TH/EN/CN. [LivingInsider.com description; checkraka.com ranking article 2024]

10. **Monetization:** Credit-purchasing system where agents buy slots; designed specifically to combat stale/clickbait listings. Monthly fees for professional agents. Free listing with limits for individuals. [LivingInsider agent onboarding description]

11. **App Store sentiment (Apple App Store Thailand, 4.8★ from 12,000+ reviews):** Core praise: comprehensive condo listings, easy filtering. Key complaints:
    - "Agents disguise themselves as owners" — users want clear owner vs agent labeling
    - App crashes when switching between apps
    - Excessive advertisements
    - Forced updates blocking access
    - Images disappear after certain app versions
    [Apple App Store TH, accessed June 2026]

---

### 3. FazWaz (fazwaz.com) — Commission Model, International Focus
**Cloudflare block during browser session; all data from web research + Trustpilot.**

12. **Market position:** Founded 2015 Phuket, acquired by Japan's Lifull in Feb 2023. 117,000+ listings nationwide; offices in all 6 Thai regions including Chiang Mai. Commission-based (3–5% of sale price); in-house agents (~80 as of 2022 vintage — not re-verified). Agent count and transactions doubled 2020–2022. Revenue ~¥300M JPY (~$2.7M) FY2021 at positive EBITDA *(2021 vintage)*. [FazWaz Wikipedia; Online Marketplaces, 2023]

13. **Key features:** Virtual tours on ~15% of sale listings (2022, highest of Thai portals); multilingual support (6 languages targeting expats); FazWaz Premium = dedicated account manager + real-time seller dashboard vs comparables; PopDeal tech pre-screens leads for agents. Offers rent-to-own and seller financing arrangements. [Online Marketplaces, 2022; FazWaz.com 2024]

14. **Contact flow:** Property seekers connect via in-platform message, WhatsApp, or phone; LINE contact not prominently featured unlike Thai-domestic portals. Caters more to foreign buyer flow (expat/investor). [FazWaz.com; Trustpilot reviews]

15. **Trustpilot user complaints (mixed reviews, exact rating not obtained):**
    - "Platform takes no responsibility for listings" — no agent reporting mechanism
    - Listings not vetted: "bait listings" reported (available property listed, gone when contacted)
    - One property owner reported zero inquiries over 3 years despite paying 5% commission
    - Some users allege FazWaz removes negative Trustpilot reviews as "defamatory"
    - Positive reviews: individual agents praised for professionalism, multilingual support
    [Trustpilot.com/review/fazwaz.com, 2023–2025]

---

### 4. Baania (baania.com) — Data & AVM Focus, Chiang Mai HQ
**Fully browsed via Playwright. Screenshots: baania-homepage.png, baania-search-results.png, baania-listing-detail.png** *(Note: baania-chiangmai.png also present in assets but is a duplicate of a search-results capture; no four-screenshot-per-portal contact-flow shot was obtainable for the three Cloudflare-blocked portals — Cloudflare interstitial was the only capturable frame for DDProperty, FazWaz, and Hipflat.)*

16. **Market position:** Founded 2016, HQ in Chiang Mai (offices also Bangkok + Nakhon Ratchasima). Thailand's first online AVM (Bestimate©). Database of 1M+ homes. Strong SEO across multiple Thai-language keywords. [Baania.com; Nation Thailand profile]

17. **Observed listing fields (from live snapshot, June 2026):**
    - Price (THB) displayed prominently
    - Transaction type label: ขาย (sale)
    - Developer name (e.g., "บริษัท ฮิโนกิ คอนโด เชียงใหม่ จำกัด")
    - "Resale" label for secondary market
    - Location: Sub-district, district, province
    - Bedrooms (จำนวนห้องนอน), bathrooms (จำนวนห้องน้ำ), area (พื้นที่, sqm)
    - Favorite/save icon per listing
    1,280 projects found for Chiang Mai search

18. **Navigation structure (live, June 2026):** Categories: บ้านมือสอง (secondhand homes), โครงการใหม่ (new projects), เช่า (rent), บ้านหลุดจำนอง (NPA/foreclosed), loan calculator. Ad banner links to LINE OA (lin.ee/RET79MZ). Map toggle on search results. Sort: "เกี่ยวข้องกับคำค้นหามากที่สุด" (most relevant). Free listing CTA in nav: "ลงประกาศฟรี". [Live Playwright session, June 2026]

19. **Search filters available:** Province/location, project type (new/secondhand), property type, price range, "ค้นหาเพิ่มเติม" (more filters) button. [Live Playwright session, June 2026]

20. **Unique differentiator:** Bestimate© AVM — price history and automated valuation per project. Lifestyle-based search. 360° aerial clips. [Baania.com; Nation Thailand, 2023]

---

### 5. Kaidee Property (baan.kaidee.com) — Classifieds-Derived
**Fully browsed via Playwright. Screenshots: kaidee-property-homepage.png, kaidee-chiangmai.png, kaidee-chiangmai-homes.png**

21. **Market position:** Kaidee is Thailand's leading classifieds platform; Kaidee Property (baan.kaidee.com) is the dedicated real estate section launched ~2018. Per-listing charges for professionals; escrow (Kaidee Pay) and lending (Kaidee Money) added. Chiang Mai homes search returns active listings. [Nation Thailand; Kaidee Help Center]

22. **Observed listing fields (from live snapshot, June 2026):**
    - Price (฿ format)
    - Location/district  
    - Land size (ตารางวา, sqm, rai)
    - Bedrooms/bathrooms
    - Transaction type (ขาย/ให้เช่า)
    - Property title/description
    - **Verification labels:** "เจ้าของขายเอง" (owner selling), "ขายโดยเจ้าของที่ยืนยันตัวตนแล้ว" (verified owner), "ผู้ขายที่ยืนยันตัวตนแล้ว" (verified seller)
    - **Listing quality badges:** HOT, PREMIUM, โครงการใหม่ (new project)

23. **Navigation categories:** โครงการใหม่ (new projects), ทรัพย์ NPA (NPA assets), ทรัพย์ทั่วไป (general). Developer brands: AP Thailand, Land and Houses, Supalai. Popular Chiang Mai districts: Mueang, San Sai, Hang Dong, San Kamphaeng, Saraphi. [Live Playwright session, June 2026]

24. **Contact mechanism:** In-platform chat icon; login required to contact. No direct LINE button visible at search-results level. [Live Playwright session, June 2026]

25. **Kaidee's LINE contact:** LINE @kaideeproperty (lin.ee/3emGkqC) for sales; LINE @kaideesupport for support. [Kaidee Help Center, 2024]

---

### 6. Hipflat (hipflat.co.th / hipflat.com) — Investment Data Focus
**Cloudflare block during browser session; all data from web research.**

26. **Market position:** Founded 2013; 200,000+ listings nationwide; 9,640 listings in Chiang Mai alone *(listing counts from search results metadata, June 2026 — Cloudflare blocked live browse; count may reflect stale/duplicate listings)*. Daily listing updates. Languages: TH/EN/JA/RU. Condo-centric with strong investment data. [Hipflat.com; freshbangkok.com portal review]

27. **Key features:** Historical asking-price graphs per project; average rental yield per project (~6.28% gross nationwide average as of June 2024); BTS/MRT station distance displayed; map-based search; grid-form listing comparison. Investment-grade data: ROI percentages displayed on listings (e.g., 4.97% ROI shown on specific properties). [Hipflat.com; globalpropertyguide.com June 2024]

28. **Contact flow:** Contact agent/owner via inquiry form; some listings show LINE ID directly in listing body. No unified LINE CTA button observed (data from text analysis of listing pages). [homefinderbangkok.com portal review; web research]

---

### 7. Facebook/LINE Groups — The Real Incumbent

29. **Facebook group scale in Chiang Mai property:** Multiple active groups with 5,000–50,000+ members each. Key groups identified:
    - "บ้านเช่าเชียงใหม่" (Chiang Mai home rentals) — active
    - "บ้านเช่าเชียงใหม่ ขาย เช่า เซ้ง เชียงใหม่"
    - "บ้านเช่า คอนโด หอพัก ห้องว่าง เชียงใหม่"
    - "Chiang Mai Real Estate" (cnxre) — English-language expat group
    A single third-party service offers to post listings to "80–100 Facebook groups" simultaneously as a paid service, indicating dense group ecosystem. [Facebook group search, June 2026; property2share.com, 2024]

30. **Why brokers prefer LINE/Facebook over portals:** From Pantip thread analysis and Thai practitioner sources:
    - **Zero cost** to post in groups vs THB 10,250–260,130/year portal subscriptions
    - **Real-time** — message delivers to member feeds immediately; no SEO lag
    - **Trust-based network** — members are pre-qualified community members, not anonymous browsers
    - **No fake-listing spam** — group admins moderate more tightly than portals
    - **Direct LINE contact** — transaction negotiation stays entirely in LINE, no lead-form leakage
    - Pantip users: "เงียบกริบเลย" (complete silence) from portal listings; switched to broker who used Facebook and sold within 1 month
    [Pantip topic 40569990; propholic.com; shinyu-residence.com, 2024]

31. **LINE penetration context:** 54M monthly active LINE users in Thailand (85.4% of internet users, Jan 2024); 80% of customers made repeat purchases via LINE *(broad commerce statistic, not property-specific — see PLAUSIBLE-BUT-UNVERIFIED; do not cite as evidence of property conversion)*; LINE ranks 2nd only to Facebook in social media usage but is #1 messaging platform by large margin. [digitalmarketingforasia.com; businessofapps.com LINE stats, 2024]

32. **Local Chiang Mai broker LINE-first workflow (observed):** ChiangMai Living (chiangmailiving.co) uses LINE OA (@chiangmailiving.co) as primary contact, lists across 10+ portals (ddproperty, baanfinder, thaihometown, dotproperty, baania) but uses LINE as the conversation-and-close channel. 3% commission on sale, 1 month's rent for annual lease. [ChiangMai Living website, June 2026]

33. **Chiang Mai rental market dynamics (2026):** ~60-day average days-on-market for condos; 3–7% below-ask typical; peak demand November–February; furnished condos dominate; Nimman, Old City, Hang Dong top sub-markets; student/digital-nomad/expat demographic segments active. 698 properties transferred to foreign buyers Q1–Q3 2024. [BambooRoutes.com, June 2026; realtytimes.com, 2024]

---

## Implications for us

| Finding | Decision for our product |
|---------|--------------------------|
| 65% of Thai consumers use marketplace websites as primary PropTech tool (F7) | We must have a public-facing catalog; a LINE-only experience loses this browsing segment |
| LINE button is the primary contact CTA on Thai portals; phone reveal secondary; inquiry form tertiary (F3) | Our listing detail page must have LINE deep-link as first CTA; bot DM as second; phone (if owner consents) third |
| Kaidee shows "เจ้าของขายเอง" / "ยืนยันตัวตนแล้ว" verified labels (F22) | Our schema needs an `ownerType` field (OWNER / AGENT / DEVELOPER) + a `verified` boolean; display prominently on cards |
| Baania's primary sort is developer-project-centric; Kaidee is individual-listing-centric (F17, F22) | For Northern Thailand resale + individual owner listings, Kaidee's model fits better than Baania's project hierarchy |
| DDProperty subscription costs THB 10,250–260,130/year; per-listing charges on Kaidee (F5, F21) | Broker pain: costs are real. Our zero-cost passive ingestion from group chats is a genuine differentiation argument — brokers keep their LINE workflow, we add catalog exposure for free |
| Agents disguise as owners on LivingInsider (F11 App Store complaints) | Our bot ingestion labels every listing with source group + poster metadata; owner vs broker is structurally known at ingest time; expose it as a trust signal |
| LivingInsider uses credit system specifically to combat stale listings (F10) | Our group-chat ingestion model creates freshness naturally (listings reflect real chat activity); add "last seen in group" timestamp to listing detail page |
| Baania shows LINE OA ad banner inline with search results (F18) | LINE OA is expected as a contact option even on the website; ensure our catalog web page has a "Contact via LINE" button on every listing |
| FazWaz Trustpilot: zero inquiries for 3 years despite 5% commission (F15) | Pitch to Chiang Mai brokers: "We don't charge you to list; you get a public catalog URL to share" — positions as additive, not competitive |
| TikTok emerged as new property discovery channel in H1 2024 (F7) | Future consideration for video tours; not in scope now but schema should support video URL field |
| Pet-friendly filter requested by 53% of consumers (F13 DDProperty survey) | Add `petFriendly: boolean` to listing schema — not yet in a4-listing-field-canon.md and should be added there; distinct from `pets_allowed` (rental-specific field in a4 F-09) which covers rental compliance; this field is needed on sale listings too |
| NPA/foreclosed filter requested by 51% of consumers (F13) | NPA listing type should be a distinct `listingCategory` value; surfaced as filter on search |
| New project vs resale filter critical — 80% of consumers want this distinction (F13) | `condition` field must distinguish NEW / RESALE / OFF_PLAN; treat as first-class filter not just a tag |
| Chiang Mai rental market: furnished condos dominate; peak demand Nov–Feb; digital nomads (F33) | Furnishing already canon'd in a4 (F-12): `furnishing_status` enum `fully_furnished \| partly_furnished \| unfurnished` + `furnishing_notes` free text — do NOT regress to `furnished: boolean`. Add `availableFrom: date` and `targetTenant` (EXPAT / THAI / STUDENT / NOMAD) hints to listing schema if not yet in a4 |
| DDProperty Boost/Turbo credits model; LivingInsider credit slots (F5, F10) | When we launch paid features, "boost" credit model is market-norm for Thai sellers; subscription-per-agent is the B2B norm at the broker tier |

---

## Heuristics

**COMP-01:** The contact CTA hierarchy on any Thai property listing is: (1) LINE button/deep-link as primary, (2) phone reveal as secondary, (3) enquiry form as last resort. Reversing this order or making form the only contact option will crater conversion. *(Directly observed on Kaidee; DDProperty's Phone/LINE/Form order inferred from web research and field descriptions — not observed live due to Cloudflare block; confirmed directionally by LINE 85% penetration data)*

**COMP-02:** Owner-vs-agent labeling is a first-class trust signal in Thailand, not a nice-to-have. Thai buyers explicitly seek "เจ้าของขายเอง" listings to avoid agent intermediary costs and unprofessional behavior. Any portal without this label loses owner-seller trust. *(Verified: Kaidee labels; LivingInsider App Store complaints; propholic.com Thai RE analysis)*

**COMP-03:** Listing freshness must be explicit and machine-verifiable. Thai portal users check timestamps to detect stale listings; LivingInsider built its entire credit system specifically to combat this. Display a "last active" date prominently; never show a listing without a visible date. *(Verified: LivingInsider architecture; checkraka.com portal ranking article)*

**COMP-04:** A public SEO-indexed listing URL is the minimum viable portal primitive. Brokers need a shareable link to prove a listing exists; without it they will not participate. The URL must resolve without login for anonymous browsing. *(Verified: ChiangMai Living cross-posts to 10+ portals; Pantip discussion of multi-platform posting)*

**COMP-05:** NPA (bank-foreclosed) and pet-friendly are two filters that must exist on any Thai property search — demanded by 51% and 53% of buyers respectively in DDProperty's H1 2024 survey of 1,050 consumers. Missing either of these will feel incomplete to Thai-native users. *(Verified: DDProperty H1 2024 Consumer Sentiment Study)*

**COMP-06:** The new-project vs resale distinction is the most-requested search filter (80% of consumers) and must be a first-class indexed field, not a tag. Search results without this filter feel broken to Thai users who need to budget differently for each. *(Verified: DDProperty H1 2024 Consumer Sentiment Study)*

**COMP-07:** Duplicate and stale listings are the single biggest UX failure mode across all Thai portals. DDProperty cleaned from 500k to ~54k sale listings (2019→2022). Any marketplace that does not have an active deduplication and expiry mechanism will degrade into spam within 6–12 months. *(Verified: Online Marketplaces portal analysis 2022-2023)*

**COMP-08:** Thai broker networks operate primarily in LINE/Facebook groups; portal listings are secondary marketing, not primary deal flow. A product that captures the primary channel (group chat) and surfaces it to the secondary channel (portal browse) is structurally different from — and more defensible than — a portal that asks brokers to change their workflow. *(Verified: Pantip thread 40569990; Thai broker service advertising 80-100 FB group posting; ChiangMai Living LINE-first workflow)*

**COMP-09:** DDProperty agent subscriptions cost THB 10,250–260,130/year. Free or near-free listing is a genuine and sustainable competitive advantage with Chiang Mai brokers who are volume-limited (<50 listings/month) and cost-sensitive. Lead with "free to list, you keep your LINE workflow." *(Verified: agentofferings.ddproperty.com pricing, accessed June 2026)*

**COMP-10:** Baania's AVM (Bestimate©) and Hipflat's rental-yield-per-project data represent the data-product moat that pure listing aggregators lack. Any Northern Thailand portal must eventually show comparable sales data and yield estimates to retain investor users. This is a 12–24 month buildout, not launch scope. *(Verified: Baania.com; Hipflat.com; globalpropertyguide.com yield data)*

**COMP-11:** The Chiang Mai rental market is dual-audience: Thai locals (price-sensitive, search in Thai, prefer LINE contact) and foreign long-stay renters/expats (English-first, use FazWaz/Hipflat, expect virtual tours and English descriptions). A bilingual listing with furnished status, pet-friendly flag, and availability date caters to both. *(Verified: BambooRoutes.com Chiang Mai market analysis 2026; FazWaz Wikipedia; DDProperty search UX)*

**COMP-12:** Agent identity must be verified before any listing becomes public. Unverified agents masquerading as owners is LivingInsider's #1 App Store complaint category and DDProperty's known quality problem. At minimum, show the source group and poster LINE ID as provenance; do not strip source metadata. *(Verified: LivingInsider App Store reviews, June 2026; propholic.com)*

**COMP-13:** Monetization for Thai portals bifurcates cleanly: (a) subscription/credits charged to agents per listing slot (DDProperty, LivingInsider model); (b) transaction commission charged on sale (FazWaz, PropertyScout model). These are incompatible signals — agents resist commission models; commissions are unenforceable on secondary listings. For a marketplace that ingests from group chats, a credit-per-boost model (not a listing fee) is the path of least resistance to broker adoption. *(Verified: DDProperty pricing; FazWaz revenue model; Online Marketplaces 2023)*

**COMP-14:** Mobile-first is non-negotiable. 97% of Thais own smartphones; 54M access internet via mobile (2024); LINE is the dominant UX paradigm. Any detail page that requires desktop-style multi-column layout will fail. *(Verified: Statista Thailand mobile data 2023; DataReportal Digital 2024 Thailand)*

**COMP-15:** The privacy-by-default + opt-in publish mechanic we are building has no direct analog in the Thai market today. Our model: listings extracted from a LINE group are private to that group's mirror by default; the poster can explicitly opt in to public publication; a ~7-day window enforces group-first access before any public release. Portals treat all listings as immediately publicly available with no group-privacy layer. This is a structural differentiator — not merely a broker-relationship-protection feature (which is a downstream benefit, not the mechanic itself). *(Inferred from market analysis; no competitor equivalent found)*

---

## Anti-patterns

**AP-01: Fake/bait listings.** DDProperty and FazWaz both have documented complaints of listings shown as available that are sold or fictional. Root cause: non-exclusive listing model lets agents list the same property multiple times; no removal obligation when sold. Our bot tracks the source chat — if the poster stops responding in the group, the listing can be auto-flagged for review.

**AP-02: Agent pretending to be owner.** LivingInsider's #1 App Store complaint. Creates trust damage and inflated commissions. Mitigation: our schema has source-group provenance; we know if the poster is a known broker account vs an unknown individual.

**AP-03: Perpetual stale listings.** Portals with annual subscription fees have no financial incentive to remove listings when properties sell — listings "pad" the inventory count. Mitigation: time-to-live on listings derived from group chat activity (if no re-posts or reactions, listing auto-expires).

**AP-04: Subscription-only agent model barriers.** DDProperty's THB 10,250+ annual entry ticket excludes small individual brokers and owner-listers. This leaves the most active Chiang Mai community deal-flow (low-volume local brokers) with no affordable portal option. This is our opening.

**AP-05: English-only international portals missing Thai-native UX.** FazWaz and Hipflat are optimized for foreign buyers (English-first, WhatsApp contact, international currency display). They miss the Thai broker and Thai buyer who thinks in THB, communicates in LINE, and searches in Thai. Our bot-first, LINE-native approach is structurally aligned with this majority.

**AP-06: Per-listing fee disincentivizes volume.** Kaidee's per-listing charge model means active brokers pay linearly with inventory. For brokers with 20–50 active listings, annual DDProperty subscription is better value — but the subscription is priced for professional agents, not individual owners. The gap between "too expensive for individual" and "per-listing gets expensive fast" is exactly where free ingestion wins.

**AP-07: No deal-flow capture.** All portals are browse-and-contact only; none captures the deal inquiry, viewings calendar, offer negotiation, or closing pipeline. The broker keeps this in LINE manually. Our product (with deep-chat integration via plan 17) starts to address this but portals have no equivalent.

---

## Confidence

### VERIFIED (cited, current)
- DDProperty subscription pricing tiers (live page, June 2026)
- Baania listing fields and navigation (live Playwright session, June 2026)
- Kaidee listing fields, verification labels, district navigation (live Playwright session, June 2026)
- LivingInsider App Store rating (4.8★, 12,000+ reviews) and complaint themes (App Store, June 2026)
- LINE Thailand MAU 54M / 85.4% internet user penetration (DataReporter, Jan 2024; BusinessOfApps, 2024)
- DDProperty H1+H2 2024 consumer survey findings (1,050 respondents each, quoted in MarketingOops, EverydayMarketing, LINE Today)
- Thai consumer property search: 65% use marketplace websites as primary tool (DDProperty H1 2024)
- New project vs resale filter: 80% consumer demand (DDProperty H1 2024)
- Pet-friendly filter: 53% demand; NPA filter: 51% demand (DDProperty H1 2024)
- FazWaz business model, acquisition by Lifull 2023, revenue ~$2.7M FY2021 (Wikipedia; Online Marketplaces)
- Chiang Mai Facebook property groups exist and are active (Facebook search, June 2026)
- ChiangMai Living LINE-first broker workflow (company website, June 2026)
- Agent quality problem driving "เจ้าของขายเอง" labeling (propholic.com; LivingInsider App Store)
- DDProperty cleaned listing database from 500k to ~54k sale listings 2019→2022 (Online Marketplaces, 2022-2023)
- Baania HQ Chiang Mai; launched 2016; Bestimate© AVM (Baania.com; Nation Thailand)
- FazWaz Trustpilot complaints (zero inquiries, bait listings, data mining) (Trustpilot.com reviews)

### PLAUSIBLE-BUT-UNVERIFIED
- LINE group deal flow is numerically larger than portal-originated deal flow in Chiang Mai (consistent with all behavioral evidence but no statistical study found)
- DDProperty annual revenue ~$68M (2026 industry estimate cited, source unclear)
- LivingInsider is truly down vs. temporarily blocking automated browser access — its status during research was ERR_HTTP_RESPONSE_CODE_FAILURE; platform may be healthy for normal users
- Hipflat LINE contact presence — text-analysis of listing pages suggested some listings show LINE IDs, but no live session confirmed this directly (Cloudflare blocked)
- FazWaz listing page LINE CTA mechanics — not directly observed; FazWaz appears to de-emphasize LINE in favor of WhatsApp, suggesting expat-first design
- Facebook group moderators filter listings more tightly than portals — stated by Thai practitioners but not independently measured
- 80% of LINE customers made repeat purchases via LINE (broad commerce statistic; property-specific equivalent unknown)
- Kaidee Property escrow (Kaidee Pay) and lending (Kaidee Money) are actively used for property transactions — announced but no usage data found

---

## Ask the market

1. **What percentage of your (broker's) actual closings came from portal leads vs LINE group leads in the past 12 months?** This is the key metric to validate COMP-08's claim that group chat is primary deal flow, not secondary.

2. **Do you currently pay for a DDProperty or LivingInsider subscription? If so, at which tier? What is your ROI experience?** This validates whether the THB 10,250+ barrier is genuinely excluding small Chiang Mai brokers or whether most are already subscribed.

3. **When a lead contacts you via portal inquiry form (vs LINE), how does the quality compare?** Validates COMP-01's CTA hierarchy claim with local practitioner data.

4. **Do buyers in your experience want to know if a listing is from the owner directly vs an agent?** Validates the "เจ้าของขายเอง" label importance (COMP-02) in the Chiang Mai context specifically.

5. **Have you encountered the 7-day exclusivity window concept? Would you withhold a listing from public portals for 7 days if your group got first access?** Direct validation of our core exclusivity mechanic (COMP-15 gap).

6. **For rental listings: what percentage of your Chiang Mai rental inquiries come from foreign renters (expats/nomads) vs Thai renters?** Informs how bilingual and international-facing our listing fields need to be at launch vs later.

7. **How do you currently handle listing expiry? Do you manually delete sold/rented listings from portals?** Validates the stale listing anti-pattern (AP-03) severity in local broker behavior.

8. **Are there active LINE groups (not Facebook) where Chiang Mai brokers share deals with each other?** We know the Facebook groups exist; we need evidence of broker-to-broker LINE deal-sharing networks specifically.

---

## Sources

| # | Source | URL | Access date |
|---|--------|-----|-------------|
| 1 | DDProperty.com — Chiang Mai listings | https://www.ddproperty.com/en/property-for-sale/in-chiang-mai-th50 | June 2026 |
| 2 | DDProperty Agent Offerings — Pricing | https://www.agentofferings.ddproperty.com/upgrade/?lang=en | June 2026 |
| 3 | Online Marketplaces — Visual Guide to Thai RE Portals | https://www.onlinemarketplaces.com/articles/visual-guide-to-real-estate-portals-in-thailand/ | Accessed June 2026 (article ~2022-2023) |
| 4 | Baania.com — Live browse Chiang Mai search | https://www.baania.com/s/เชียงใหม่/project?propertyType=1,2,3 | June 2026 |
| 5 | Kaidee Property — Live browse Chiang Mai homes | https://baan.kaidee.com/c15p1-realestate-home/chiangmai | June 2026 |
| 6 | LivingInsider App Store — Apple (TH) | https://apps.apple.com/th/app/livinginsider-thai-1-property/id1402425901 | June 2026 |
| 7 | FazWaz — Wikipedia | https://en.wikipedia.org/wiki/FazWaz | June 2026 |
| 8 | FazWaz Reviews — Trustpilot | https://www.trustpilot.com/review/www.fazwaz.com | June 2026 |
| 9 | Propholic.com — Agent ไร้มาตรฐาน article | https://propholic.com/prop-talk/ก็-agent-ไร้มาตรฐาน-owner-เลยต้องออก/ | June 2026 |
| 10 | DDProperty H1 2024 Consumer Sentiment Study (summary) | https://www.marketingoops.com/reports/industry-insight/property-consumer-sentiment-study/ | June 2026 |
| 11 | EverydayMarketing — 7 Real Estate Trends 2024 from DDProperty | https://everydaymarketing.co/pr/7-real-estate-trends-2024/ | June 2026 |
| 12 | Checkraka.com — 10 Thai property listing websites ranked | https://www.checkraka.com/house/article/116438/ | June 2026 |
| 13 | Tooktee.com — Top 10 property listing websites | https://www.tooktee.com/blog/detail/3366/ | June 2026 |
| 14 | Digital Marketing for Asia — LINE in Thailand | https://www.digitalmarketingforasia.com/line-in-thailand/ | June 2026 |
| 15 | DataReportal — Digital 2024 Thailand | https://datareportal.com/reports/digital-2024-thailand | June 2026 |
| 16 | Pantip topic 40569990 — Where to list property for sale | https://pantip.com/topic/40569990 | June 2026 |
| 17 | ChiangMai Living — Broker website | https://chiangmailiving.co/ | June 2026 |
| 18 | BambooRoutes.com — Chiang Mai real estate market analysis 2026 | https://bambooroutes.com/blogs/news/chiang-mai-real-estate-market | June 2026 |
| 19 | Reproperty.co.th — Top Thailand property platforms | https://reproperty.co.th/en/magazine/thailand-property-platforms/ | June 2026 |
| 20 | Hipflat — Properties for sale Chiang Mai | https://www.hipflat.com/property-for-sale/chiang-mai | June 2026 (Cloudflare blocked; listing count from search results metadata) |
| 21 | Lifull acquires FazWaz | https://www.onlinemarketplaces.com/articles/lifull-announces-acquisition-of-thai-brokerage-fazwaz/ | June 2026 |
| 22 | Facebook groups — Chiang Mai property rental search | https://www.facebook.com/groups/homerentcm/ and related | June 2026 |
| 23 | Property2Share — 120 Facebook groups for Thai property | https://www.property2share.com/บทความ/68/ | June 2026 |
| 24 | Global Property Guide — Thailand rental yields | https://www.globalpropertyguide.com/asia/thailand/price-history | June 2026 |
| 25 | BusinessOfApps — LINE statistics | https://www.businessofapps.com/data/line-statistics/ | June 2026 |

---

## Review response

**Finding 1 — Applied (MAJOR).** The "Implications for us" table rows on `furnished` and `petFriendly` are corrected. The `furnished: boolean` row now explicitly defers to a4's existing three-tier `furnishing_status` enum (`fully_furnished | partly_furnished | unfurnished`) plus `furnishing_notes`, with a clear "do NOT regress to boolean" directive. The `petFriendly` row is corrected: it was wrong to claim absence was "confirmed against a4" — a4 F-09 has `pets_allowed` for rental compliance but not a sale-listing pet-friendly field; the row now correctly scopes the gap and avoids asserting what a4 does or doesn't have beyond what was actually checked.

**Finding 2 — Applied (MINOR).** Duplicate `baania-search.png` (byte-identical to `baania-chiangmai.png`) deleted from assets/a5/. The section 4 screenshot declaration line now notes the duplicate situation and honestly states that contact-flow screenshots were unobtainable for the three Cloudflare-blocked portals (DDProperty, FazWaz, Hipflat) — the interstitial was the only capturable frame.

**Finding 3 — Applied (MINOR).** COMP-01 softened: DDProperty's Phone/LINE/Form CTA order is now correctly attributed to web research / field descriptions (not directly observed), with Kaidee as the only directly-observed confirmation. The LINE 85% penetration data is retained as directional support but not as a substitute for direct observation.

**Finding 4 — Applied (MINOR).** Added inline vintage flags to the stale revenue/traffic stats: S$2.5M Q3 2022 (DDProperty), ~$2.7M FY2021 (FazWaz), 4M+ MAU / 60,908 listings (LivingInsider — 2024, not re-verified), 9,640 Chiang Mai listings (Hipflat — from blocked-session metadata). The $68M figure already had a PLAUSIBLE-BUT-UNVERIFIED label; it now cross-references that section explicitly in-line.

**Finding 5 — Applied (MINOR).** COMP-15 rewritten to match the product's actual mechanic: private-by-default mirror of the source LINE group + explicit poster opt-in to public publication + ~7-day group-first window. The previous "broker-relationship-protection" framing was a marketing gloss; the actual mechanic is group-privacy-by-default, which is what makes this structurally novel.

**Finding 6 — Applied (MINOR).** Finding 31 (LINE commerce stat) now carries an inline flag: "broad commerce statistic, not property-specific — do not cite as evidence of property conversion." This prevents the PLAUSIBLE-BUT-UNVERIFIED 80% figure from being used to prop up COMP-01's conversion argument where property-specific evidence is what matters.

## Addendum 2026-06-12 — first-hand DDProperty capture (founder-assisted headed session)

The Cloudflare gap is closed: with the founder clearing the challenge in a headed persistent session, the DDProperty mobile listing detail was observed directly (screenshots: docs/design/moodboard/manual-retry/ddproperty-manual-0[1-8]*.png).

- **COMP-01 correction for DDProperty specifically:** the market leader does NOT lead with a LINE button on mobile listing detail. The pattern is: sticky enquiry card (บันทึกประกาศ save / แชร์ share / contact), "ติดต่อเอเจนต์" funnel, mortgage calculator section, section tab-nav (รูปภาพ/ภาพรวม/ทำเลที่ตั้ง/สิ่งอำนวยความสะดวก/สินเชื่อ). This CONFIRMS B2 F16/F17 (DDproperty fronts an enquiry funnel) — our LINE-first CTA is user-behavior-driven differentiation, not portal imitation. Kaidee remains the observed LINE-first portal.
- **TH-04 validation:** DDProperty shows a "ยืนยันตัวตนแล้ว" (identity verified) badge on the agent block — the market leader trains users to expect verification badges.
- Thai-language URL routes confirmed throughout (/รวมประกาศขาย/ในเชียงใหม่-th50, /property/<slug>-ขาย-<id>) — supports TH-10.
- Idealista (founder cleared DataDome): mobile detail CTAs ordered "Contact via chat" → "View phone" → form — a chat-first European reference (screenshots idealista-manual-0[1-4]*.png).
