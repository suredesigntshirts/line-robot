# A3: Distressed Assets in Thai Real Estate — NPA Portals, LED Auctions, Quick-Sale Flows, and Data Ingestion

This artifact gates two product decisions: (1) the design of our **quick-sale / quote flow** — how urgency is signalled, what discount ranges to set expectations for, and what makes a listing a "quick-sale" candidate — and (2) whether NPA / LED auction data is a viable **Stage-7 data source** that can be ingested to enrich our corpus and AVM pricing layer. Secondary gate: which distressed-asset sourcing channels investors actually use today, so our broker/investor membership value proposition can address real workflow pain.

---

## Thought leaders & sources consulted

1. **Baker Tilly Thailand — NPL risk analysis** (`bakertilly.co.th/insights/increasing-npls-a-risk/`). Independent accounting and advisory firm; their 2024 analysis synthesises Bank of Thailand data with historical crisis comparisons. Strong on macro-structural context (NPL ratios, banking system resilience), weak on granular property-level data.

2. **The Nation Thailand — property crisis reporting** (nationthailand.com, multiple 2024–2025 pieces). Thai English-language newspaper of record for business. Cites REIC, BOT, KKP Research, and Terra Media & Consulting by name; primary source for Q1 2025 transfer and NPL statistics. Recency: June 2025.

3. **Krungsri Property / BAM / SAM / GHB official portals** (krungsriproperty.com, bam.co.th, sam.or.th, ghbhomecenter.com). Primary institutional sources for NPA volume, promotion terms, and pricing. Cross-verified across press releases and ThaiPublica.

4. **Silk Legal & KKP Advice Center — LED auction guides** (silklegal.com, advicecenter.kkpfg.com). Two independent legal/financial guides covering the LED auction process with specific Thai-law references (price-reduction schedule, deposit tiers). Corroborated by LED's own published buyer manual (live.led.go.th/ebook/manual/78).

5. **Prachachat / Bangkok Biz News / ThaiPublica — Thai-language financial press** (prachachat.net, bangkokbiznews.com, thaipublica.org). Covers bank NPA campaigns with specific figures (KTB 55% discount, GHB 30%+20%, TTB 2025 campaign). These are primary-source press releases reproduced in financial media, so details are publisher-verified.

---

## Findings

1. **Eight major channels run NPA portals in Thailand.** Bangkok Bank (bangkokbank.com), KBank/Kasikorn (kasikornbank.com/th/propertyforsale), Krung Thai Bank (npa.krungthai.com), Krungsri/Bank of Ayudhya (krungsriproperty.com), SCB (scb.co.th), Government Housing Bank/GHB (ghbhomecenter.com), Government Savings Bank/GSB (npa-assets.gsb.or.th), and TTB/PAMCO (property.pamco.co.th). The two Asset Management Companies — BAM (bam.co.th, the largest with ~46% market share) and SAM (sam.or.th, 100% state-owned) — run separate portals. Each bank also has a mobile app (GHB ALL HOME, Krungthai NPA app, BAM Choice). [propertysights.com 2024; chiangmai.ohoproperty.com 2025; bam.co.th 2024]

2. **Standard NPA discount is 10–30% below market.** Thai sources cite 10–30% as the baseline discount for bank NPA properties, reflecting the bank's holding-cost pressure rather than any distress on the buyer. Promotional campaigns can go much deeper. Krungthai Bank ran two separate large-scale NPA campaigns in 2567 (2024), each with nearly identical headline figures: (a) "NPA Birthday Sale 2567" (celebrating the bank's 58th anniversary, March 27 – May 19, 2024) — up to 55% off on 3,000+ properties worth ~12 billion baht; and (b) "NPA Mid Year Sale 2567" (July 1 – September 15, 2024) — up to 55% off on 3,000+ properties worth ~12 billion baht. These are two distinct campaigns in the same calendar year, not the same event reported under two names; the similar figures reflect Krungthai's consistent NPA portfolio size across campaigns. The Prachachat (#12), ThaiPR (#14), and Siamrath (#50) reports that cite "55% / 3,000 items / 12B baht" independently refer to the Mid Year Sale (July–September) and the Birthday Sale (March–May) respectively — they corroborate the same scale of Krungthai's programme, not a single identical event. GHB October 2024 online auction offered up to 50% off on 1,300+ properties; GHB May 2024 auction offered up to 30% off standard price plus an additional 20% for buyers who completed transactions within two months. [prachachat.net 2024; krungthai.com 2024; thaipr.net 2024; wealthplustoday.com 2024; ghbank.co.th 2024; thaipublica.org 2024; apthai.com 2024]

3. **LED (Legal Execution Department) auctions have a structured price-reduction schedule.** The Price Fixing Committee sets the opening price. If no bid: second auction starts at 90% of appraisal; third at 80%; fourth and beyond at 70%. Deposit requirements scale with appraised value: 5% for properties under 100,000 baht; fixed amounts (10,000–25,000 baht) for mid-range; 150,000 baht for 1–3 million baht properties; up to 1,000,000 baht for properties over 10 million baht. Winners have 15 days to pay balance, extendable to 90 days maximum. LED operates an open data portal (opendata.led.go.th) with 43 datasets in CSV and API (CKAN) format. [silklegal.com 2024; nayoo.co 2024; opendata.led.go.th 2025]

4. **Occupancy risk is the LED auction's most serious buyer hazard.** Buyers can typically only inspect from the exterior. Previous owners who refuse to vacate require the buyer to file a court petition for an eviction writ — this can take months to years. Non-judgment-debtor occupants (third-party tenants) require full litigation. There is no warranty on property condition; renovation defects have no recourse. If the debtor and creditor settle their dispute before the auction completes, the auction can be withdrawn. [silklegal.com 2024; propertysights.com 2024; nayoo.co 2024]

5. **Redemption right (สิทธิไถ่ถอน) is distinct from LED auction risk; main exposure is ขายฝาก deals.** In court-ordered LED auctions of mortgaged property, the mortgage lien is typically extinguished by the auction — redemption risk is low post-gavel. However, in ขายฝาก (sale with right of redemption / Khai Fak) transactions — a major private-investor vehicle — the seller retains a contractual right to redeem. The general CCC framework (Sections 491–502) sets a maximum of 10 years for immovable property. For agricultural land and residential property specifically, the พระราชบัญญัติคุ้มครองประชาชนในการทำสัญญาขายฝากที่ดินเพื่อเกษตรกรรมหรือที่อยู่อาศัย พ.ศ. 2562 ("Protection of Consumers in Redemption of Properties Act B.E. 2562", 2019) sets both a floor and a ceiling: the redemption period must be not less than 1 year and not more than 10 years. It also gives the seller the right to occupy and use the property during the redemption period and caps the effective interest at 15% per year of the sale price. This consumer-protection act applies to natural persons with agricultural or residential land only; commercial real estate transactions remain governed by CCC §491–502 without the 1-year floor. [dol.go.th law6206.pdf; legal500.com; smartfinn.co.th; Thai Civil and Commercial Code Sections 491–502]

6. **ขายฝาก (Khai Fak) is the dominant private quick-sale/bridge mechanism in Thailand.** Platforms like SmartFinn, MitrMuangThai, HomeCash2U, and LandForLoan match distressed owners (who need cash within days) with investors who lend at 9–15% per annum secured against the title, with LTV of 50–70% of appraised value. The investor effectively receives the property at 50–70% of market value with a redemption option. A 2024 Chiang Mai provider (ขายฝากจํานองเชียงใหม่) quotes 1.25% per month / 15% per year. This channel operates entirely through LINE, direct referral, and broker networks — not public portals. [smartfinn.co.th 2024; pantip.com 2019 (older but mechanism unchanged); jumnong.com 2024]

7. **Private investors source quick-sale deals primarily through: LINE groups, Facebook groups, broker referrals, and NPA platform alerts.** Key venues: Facebook group "ขายด่วนบ้านที่ดินเชียงใหม่ เจ้าของขายเอง" (Chiang Mai owner-direct); national Facebook groups aggregated on tperty.com; LINE groups shared by mutual broker introduction. Investors set price-reduction alerts on DDProperty, PropertyGuru, and Hipflat, then approach owners directly. Cash-paying investors can expect 10–15% below asking price on standard urgent listings; 20–30% for genuinely distressed sellers (financial emergency, divorce, relocation). [bangkokbiznews.com 2024; nationthailand.com 2025; bangkokpost.com 2025]

8. **Thai property market is in a structural stress cycle that is significantly increasing distressed supply.** Key 2025 data: household NPLs reached 1.24 trillion baht (Q2 2025); asset seizures (foreclosures) surged 210% year-on-year, concentrated in sub-1-million-baht housing; nationwide residential transfers down 10.5% year-on-year in Q1 2025; new housing sales collapsed 49% in H1 2025. This is the steepest market contraction since the 1997 crisis by some metrics. Mortgage rejection rates vary significantly by price segment and measurement methodology: overall rejection rates across all housing segments averaged ~39–45% in Q1–Q3 2025 (Thai Housing Business Association survey of 17–22 developers). For the sub-3 million baht segment specifically, Terra Media & Consulting (survey of 4,000+ projects) reported a rejection rate of up to 70%, with the 1–3 million baht band showing 65–70%, the 3–7 million baht band ~40%, and the 7 million baht+ band ~15%. The 70% figure is a segment-specific peak, not an economy-wide average; the overall mass-market rate of ~40–45% is the broader figure. [nationthailand.com June 2025; nationthailand.com/blogs/business/property/40060924; bakertilly.co.th 2024; bangkokpost.com 2025; nationthailand.com Q2 2025]

9. **BAM holds ~46% of Thailand's AMC market; AMC-held NPA is approximately 150+ billion baht.** BAM alone manages 69.8 billion baht in NPAs and 474 billion baht in NPLs; SAM (state-owned) manages approximately 20 billion baht in NPA book value. The "150+ billion baht" figure represents AMC-managed NPA only (BAM 69.8B + SAM ~20B + remaining AMCs ≈ 152B, with BAM's 69.8B constituting ~46% of that AMC total). This is distinct from the total Thai banking system NPL stock, which stands at approximately 544 billion baht across all banks per Bangkok Post (2024) — a much larger figure that includes bank-held NPLs that have not yet been transferred to AMCs. The "150+B NPA" and "544B NPL" numbers describe different pools and should not be conflated. BAM targets 23.3 billion baht in collections by 2026. Both BAM and GHB have launched mobile apps (BAM Choice, GHB ALL HOME) in 2024. [bam.co.th 2024; sam.or.th 2024; bangkokpost.com 2024]

10. **NPA broker/agent programmes exist at major banks — commission up to 3%.** Banks run structured NPA broker programmes: GSB pays non-exclusive brokers up to 3%; KBank has a named "ตัวแทนขายบ้านมือสอง" programme; SCB has an "NPA Broker" registration system; SAM ran a referral programme offering up to 3 million baht per successful referral. This means a broker ecosystem already surrounds NPA properties. [kasikornbank.com 2024; scb.co.th 2024; gsb.or.th 2024; sam.or.th 2024]

11. **NPA data ingestion: LED open data is freely available in CSV/API; bank NPA portal scraping is legally prohibited.** LED's opendata.led.go.th provides 43 datasets including auction announcements in CSV with a CKAN API. Updated monthly. PropertyHub.in.th explicitly prohibits automated scraping in its ToS. Baania's ToS limits scraping to personal use only; Baania does offer a commercial API for asking-price data. Bank portals (KBank, KTB, Krungsri) have no published API; direct scraping would violate their ToS. SAM publishes structured listings on sam.or.th in standard HTML with no explicit API — a partnership/data-sharing agreement is the legitimate path. [opendata.led.go.th 2025; propertyhub.in.th/en/terms 2024; baaniathailand.com/data 2024]

12. **GHB Chiang Mai NPA sample: townhouse starting at 1.565 million baht (October 2024 auction).** This is the most concrete Chiang Mai-specific data point recovered. The aggregator site chiangmai.ohoproperty.com shows 52,791 total bank NPA listings in Chiang Mai across 7 active banks (KBank: 14,507; GHB: 27,847; KTB: 2,433; Krungsri: 1,717; SCB: 1,812; GSB: 4,475) as of June 2025. Price range: approximately 1.85–5.89 million baht for residential sample. [ghbank.co.th 2024; chiangmai.ohoproperty.com June 2025]

13. **Typical realistic quick-sale / ขายด่วน private discount: 10–20% for standard motivated sellers; 20–35% for genuinely distressed sellers needing cash within 2–4 weeks.** This is triangulated from: (a) Thai market commentary suggesting cash buyers can achieve 10–15% below asking; (b) bangkokbiznews.com reporting 20–30% promotional discounts from financial institutions; (c) ขายฝาก LTV of 50–70% implying effective acquisition at 30–50% below appraised value for the investor; (d) LED auctions starting at appraised value and dropping to 70% in repeated auctions. [bangkokbiznews.com 2024; nayoo.co 2024; smartfinn.co.th 2024; silklegal.com 2024]

---

## Implications for us

| Finding | Concrete product decision |
|---|---|
| F1 — 8 bank NPA portals + BAM + SAM all public | Quick-sale listing schema needs a `source_type` field: `npa_bank`, `led_auction`, `private_khai_fak`, `owner_direct`. Our bot's extraction prompt should detect if a message originated from a bank NPA referral. |
| F2 — 10–55% NPA discount range (Krungthai ran two separate 55%-off campaigns in 2567, Birthday Sale Mar–May and Mid Year Sale Jul–Sep) | Quick-sale card should display "X% below estimated market" rather than absolute price only. Our AVM needs a "distressed discount" adjustment flag. |
| F3 — LED auction 70–100% of appraisal, structured drop schedule | If we ingest LED data, the `asking_price` field must be labelled as "opening bid (appraised value)" not market price — different semantics. |
| F4 — Occupancy risk is the dominant LED hazard | LED auction listings in our app must carry a mandatory "as-is / may be occupied" disclaimer. Do not show LED listings without this. Rating: blocking risk for first-time buyers. |
| F5 — ขายฝาก redemption right max 10 years | If a quick-sale listing originated from a ขายฝาก transaction, the seller may still have a legal redemption right. This must be flagged in due-diligence copy. Not our legal liability, but broker and investor members expect us to surface it. |
| F6 — ขายฝาก is the dominant private bridge channel | Our quick-sale flow should offer a "need cash fast" option that explicitly surfaces ขายฝาก and mortgage brokers as alternatives to listing — this serves distressed owners who aren't ready to sell outright. Routing hook for future fintech partner. |
| F7 — Private deals via LINE/Facebook groups | Our core bot value proposition is already aligned: we capture deals posted in LINE groups before they go to portals. The ขายด่วน tag in a group chat is a high-signal extraction trigger. Extraction prompt should flag `urgency_indicator = true` when "ขายด่วน", "รีบขาย", "ราคาต่ำกว่าตลาด", "เจ้าของขายเอง" appear. |
| F8 — 210% foreclosure surge; ~40–45% overall mortgage rejection rate; 65–70% for sub-3M baht segment (Terra Media, 2025) | This is a supply-creation tailwind for distressed listings. The quick-sale flow is well-timed. Copy should acknowledge market context: "Sell with confidence — we connect you with vetted brokers and investors." |
| F9 — BAM 46% market share, 69.8B NPA | BAM is the single most important partner for NPA data. A data-sharing agreement with BAM would unlock half the national NPA corpus legitimately. Prioritise BAM partnership over scraping. |
| F10 — Bank broker programmes pay 3% commission | Our broker members can earn commissions on NPA listings referred from our platform. **Strategic tradeoff:** surfacing NPA opportunities routes the transaction to the bank's own portal, not through our platform — a potential lead-generation benefit (broker loyalty, SEO discovery) vs. a value-leakage risk (commission flow goes bank→broker, not platform). This is compatible with our subscription model only if we position broker access to the NPA feed as a membership perk, not as a commission-intermediation service. The right CTA routes brokers to the bank's registration page while reinforcing that they discovered the opportunity through us. |
| F11 — LED CSV/API available; bank scraping prohibited | LED auction data (opendata.led.go.th) can be ingested cleanly via CKAN API with no legal risk. Bank NPA scraping is prohibited — only official partnership or manual curation. Baania API is the cleanest commercial source for market pricing. |
| F12 — GHB Chiang Mai at 1.565M baht | Our pricing floor for Chiang Mai residential quick-sale benchmarks should anchor around 1.5–2M baht for townhouses, 3–6M for single houses. This feeds the AVM calibration. |
| F13 — Quick-sale discount 10–35% | Quote flow should allow seller to set a "desired minimum" and show real-time estimated time-to-sell at different discount levels. Suggested tiers: 5–10% (standard listing pace, 3–6 months), 10–20% (elevated interest, 4–8 weeks), 20–35% (fast investor close, 1–3 weeks). These are working estimates — see "Ask the market" below. |

---

## Heuristics

**DIST-01:** Display NPA and LED auction listings with explicit source labelling ("Bank Asset / ทรัพย์ธนาคาร" or "Court Auction / บังคับคดี") — never merge them into a generic "for sale" stream without the label. Buyers treat these as fundamentally different risk profiles.

**DIST-02:** Any LED auction listing shown in the app must display three mandatory caveats in visible text (not collapsed): (a) "Sold as-is / ไม่รับประกันสภาพ", (b) "May be occupied / อาจมีผู้อยู่อาศัย", (c) "Verify title and liens before bidding / ตรวจสอบโฉนดก่อนประมูล". These are not negotiable legal disclaimers — they are user-safety UX requirements.

**DIST-03:** Quick-sale urgency tags — "ขายด่วน", "รีบขาย", "ราคาต่ำกว่าตลาด" — must be extracted from chat and stored as `urgency_indicator: true` on the listing. These are the highest-conversion signals for investor/broker members and should surface in their filtered feed first.

**DIST-04:** The quote/offer flow for quick-sale listings must default to showing a discount-to-close tradeoff: at 10% off, estimated close time X weeks; at 20% off, Y weeks; at 30% off, Z weeks. The system must never show "sell instantly" without a corresponding discount expectation — that copy will erode trust when reality differs.

**DIST-05:** Bank NPA broker commissions (up to 3%) mean that a broker member clicking "refer this listing to bank" needs a clear CTA that routes them to the bank's broker registration page. Do not try to intermediate this commission — instead, surface it as a membership benefit (broker earns commission, platform earns broker loyalty and retention). **Strategic note:** this flow routes value to the bank, not through our marketplace. It is appropriate as a lead-magnet feature that deepens broker dependency on the platform, but it should not be mistaken for a revenue source. Any future move to intermediate NPA commissions would require partnership agreements with the banks.

**DIST-06:** ขายฝาก (sale with right of redemption) transactions must be tagged `transaction_type: khai_fak` in the schema and shown with a redemption-period field. A listing where the seller retains a redemption right up to 10 years is not a clean fee-simple sale and must not be presented as equivalent to one.

**DIST-07:** LED open data (opendata.led.go.th, CKAN API) is the only bank-independent, legally clean source of distressed property auction data in Thailand. This should be the first data pipeline to implement for Stage-7 data ingestion — before any bank NPA scraping is considered.

**DIST-08:** Bank NPA data ingestion must be done via official partnership or manual curation only — not scraping. PropertyHub and Baania ToS explicitly prohibit commercial scraping; bank portals have no public API. Violation creates legal and reputational risk disproportionate to benefit. If automated ingestion is needed, pursue a BAM data-sharing agreement first (BAM = 46% of national NPA market).

**DIST-09:** Chiang Mai NPA volume is substantial (52,000+ listings across 7 banks as of June 2025, with GHB dominant at 27,800). Checkable rule: the Chiang Mai listings results page must expose a "Source" filter that includes "Bank Asset / ทรัพย์ธนาคาร" as a filterable category. **Strategic tradeoff (flag for founder):** a "see all Chiang Mai NPA" link that routes users to external bank portals is a lead-magnet and SEO signal that can drive discovery, but it channels browsers away from the platform before they convert. Our subscription revenue depends on vetted-dealflow moat, not portal aggregation. Preferred approach: ingest LED CKAN data and pursue BAM partnership (DIST-07/08) to show NPA listings natively; only link out for banks where no data agreement exists. The link-out approach is acceptable as a stopgap, not a destination.

**DIST-10:** Quick-sale discount expectations must be calibrated by channel: (a) LED auction = 0–30% off appraisal value depending on how many auction rounds have passed; (b) bank NPA direct = 10–55% off appraised value depending on campaign and holding time; (c) private owner urgent sale = 10–20% off asking price for cash; (d) ขายฝาก = effective 30–50% of appraised value for the investor-lender. Conflating these in UX copy will create pricing confusion.

**DIST-11:** The 210% foreclosure surge (Q2 2025, year-on-year) and ~40–45% overall mortgage rejection rate (65–70% for sub-3M baht segment per Terra Media) mean distressed seller supply in the mass-market segment will be at a multi-decade high for 2025–2026. Checkable rule: the quick-sale listing creation flow must expose a "seller urgency" selector with at least three tiers (standard listing / motivated seller / needs to close within 4 weeks), which feeds the `urgency_indicator` field. This is the product-level signal that captures the structural supply tailwind. The broader market timing assessment (well-positioned for launch) belongs in strategy documents; what is screen-checkable is whether the product captures the urgency signal correctly.

**DIST-12:** Broker members with NPA expertise are a distinct archetype from general brokers. They require: (a) access to bank NPA listing feeds, (b) tools to track auction schedules and opening prices, (c) awareness of LED auction risk flags. Consider a "NPA Specialist" badge or filter in the broker directory — this creates a searchable credential that members will want.

---

## Anti-patterns

**Anti-pattern 1 — Showing LED auction price as "market value."** LED opening bids are based on court appraisals, not market comparables. An appraisal-based opening bid that drops to 70% of that figure at the fourth auction is not "70% of market value" — it may already be at or above market. Platforms that display appraisal-derived prices as market comps systematically mislead buyers.

**Anti-pattern 2 — Treating NPA and quick-sale as synonymous.** NPA = bank-held foreclosed asset. Quick-sale = owner who wants to close fast at a discount. They overlap (an owner in default who reaches out to us is both), but the mechanics, discount expectations, legal structures, and buyer profiles are completely different. Conflating them in filters or listing cards causes irrelevant search results.

**Anti-pattern 3 — Displaying ขายฝาก properties without redemption disclosure.** Investors who buy via ขายฝาก sometimes attempt to resell or list the property before the redemption period expires. If the original seller exercises redemption, the buyer/sub-buyer loses the property. This has produced documented fraud and legal disputes in Thailand. Listing a ขายฝาก property as an unrestricted sale without surfacing the redemption right is a high-severity error.

**Anti-pattern 4 — Promising specific time-to-sell for quick-sale listings.** No Thai desk-research source provides validated time-to-sell statistics segmented by discount depth for Chiang Mai. Any time-to-sell claim in product copy is currently an educated estimate. Commit to showing ranges ("typically 2–6 weeks at 20% below market") with a disclaimer until empirical data from actual transactions is available.

**Anti-pattern 5 — Aggregating NPA listing counts from all banks and presenting a single "NPA available" number.** The same property may appear on multiple bank portals (sold via inter-bank NPA syndication) and on aggregators. Deduplication logic is required before quoting total available inventory — see artifact 18's geo-dedup work.

**Anti-pattern 6 — Scraping bank NPA portals without a ToS review.** Multiple platforms (PropertyHub, bank websites) explicitly prohibit automated scraping in their ToS. Scraping without permission generates legal exposure and, if discovered, will result in IP blocks and potential litigation. The LED CKAN API is the correct public-data starting point; bank data requires a partnership.

---

## Confidence

### VERIFIED (cited, current)

- Bank NPA portal list and URLs: cross-referenced multiple sources, all URLs active June 2025
- Krungthai NPA campaigns 2567: two separate campaigns — Birthday Sale (Mar 27–May 19) and Mid Year Sale (Jul 1–Sep 15) — each confirmed at up to 55% discount, 3,000+ items, ~12B baht; confirmed via krungthai.com PR, thaipr.net, wealthplustoday.com, and siamrath.co.th
- GHB October 2024 auction: up to 50% discount, 1,300+ properties, Chiang Mai townhouse at 1.565M baht — primary press release confirmed
- GHB May 2024 auction: up to 30%+20% discount, 1,000+ properties — ThaiPublica confirmed
- LED auction price-reduction schedule (90%/80%/70%) — confirmed by Silk Legal, nayoo.co, LED buyer manual
- LED deposit tiers — confirmed by Silk Legal and nayoo.co independently
- LED CKAN open data: 43 datasets, CSV format, monthly updates — direct inspection of opendata.led.go.th June 2025
- Chiang Mai NPA counts by bank (52,000+ total) — direct observation from chiangmai.ohoproperty.com June 2025
- Household NPL at 1.24 trillion baht (Q2 2025), 210% foreclosure surge — The Nation Thailand citing official data June 2025
- Mortgage rejection rate: ~39–45% overall (Thai Housing Business Association Q3 2025 survey), 65–70% for 1–3M baht segment (Terra Media & Consulting, survey of 4,000+ projects, cited in The Nation Thailand and Krungthep Turakij 2025)
- PropertyHub ToS prohibiting scraping — direct text from propertyhub.in.th/en/terms
- ขายฝาก interest rates 9–15%/year, LTV 50–70% — smartfinn.co.th, jumnong.com, and Chiang Mai specific provider 2024
- BAM 46% market share, 69.8B NPA book value — bam.co.th company profile and press
- SAM sold 10,496 NPA properties worth 51.9B baht (cumulative since 2000) — sam.or.th official
- Bank NPA broker programmes (up to 3% commission) — kasikornbank.com, scb.co.th, gsb.or.th confirmed

### PLAUSIBLE-BUT-UNVERIFIED (label honestly)

- **Time-to-sell by discount tier** (5–10% = 3–6 months; 20–35% = 1–3 weeks): no validated Thai statistical study was found. These are triangulated estimates from market commentary and anecdotal investor discussions. Should be validated with actual broker data.
- **Private LINE group deal flow volume**: the existence of ขายด่วน LINE groups is confirmed (Facebook group found, Pantip discussions found), but membership sizes and deal velocity are unknown.
- **Chiang Mai-specific quick-sale discount norms**: general Thai figures (10–30%) applied to Chiang Mai; no Chiang Mai-specific empirical study found. Northern Thailand land and house markets may differ materially from Bangkok.
- **Proportion of distressed sellers who use LINE groups vs. portals vs. banks**: no Thai survey data found. Anecdotal indication that LINE/Facebook groups precede portal listings for genuinely urgent sellers, but unquantified.
- **LED auction average final closing price vs. appraisal**: the price-reduction schedule is confirmed (70–100% of appraisal), but what percentage of auctions actually reach 70% (i.e., fail 3+ times) is unknown.
- **BAM/SAM willingness to data-share with a startup**: structurally plausible (both have commercial relationships with portals like PropertyHub), but not confirmed. Would require direct outreach.

---

## Ask the market

Questions desk research cannot answer — validate with real brokers and investors in the founder's LINE groups:

1. **What discount do Chiang Mai investors actually require to make a quick-cash offer within 1 week?** The 20–35% range is an educated estimate; a survey of 5–10 active investors in the founder's network would calibrate this precisely.

2. **What is the actual average time-to-close for a ขายด่วน listing in the group at different discount levels?** If the bot has been passively listening, do any posted ขายด่วน listings close? At what price vs. original ask? Even 10 data points would validate the discount-to-close curve.

3. **Do brokers in the group actively monitor bank NPA portals, and which bank's portal do they check most?** This determines which banks to prioritise in any NPA data pipeline and whether broker members would value a consolidated NPA feed.

4. **Has anyone in the group done an LED auction purchase?** What was the experience with occupancy, payment, and title transfer? This would validate or add nuance to the occupancy risk finding.

5. **What is the ขายฝาก rate currently being offered in Chiang Mai?** The 1.25%/month cited (15%/year) is from one provider. Competitive rates, and whether investors in the group participate in ขายฝาก, would inform the "need cash fast" routing feature.

6. **Are there specific Facebook or LINE group names used by Chiang Mai investors to source ขายด่วน deals that are not publicly listed?** The public group found ("ขายด่วนบ้านที่ดินเชียงใหม่") is visible, but invite-only groups may dominate deal flow.

7. **Would broker members pay for access to a curated Chiang Mai NPA feed with deduplication and condition flagging?** This tests whether NPA data ingestion is a feature or a nice-to-have.

---

## Sources

| # | Source | URL | Date accessed |
|---|---|---|---|
| 1 | PropertySights — Comprehensive Guide for Bank Foreclosed (NPA) Properties | https://propertysights.com/articles/buy-bank-foreclosed-assets/ | June 2025 |
| 2 | Bangkok Bank — Properties for Sales | https://www.bangkokbank.com/en/Personal/My-Home/Bank-Properties-for-Sales | June 2025 |
| 3 | PropertyHub — Bank Foreclosed Properties & NPA | https://propertyhub.in.th/en/asset-banks | June 2025 |
| 4 | RE/MAX Thailand — Bank Foreclosure and Auction Properties | https://www.remax.co.th/News/Bank-Foreclosure-and-Auction-Properties.aspx | June 2025 |
| 5 | Krungsri Property | https://www.krungsriproperty.com/en/home | June 2025 |
| 6 | Bangkok Post — BAM eager to keep lead in distressed assets sector | https://www.bangkokpost.com/business/general/2795115/bam-eager-to-keep-lead-in-distressed-assets-sector | 2024 |
| 7 | KasikornBank — Property for Sale | https://www.kasikornbank.com/en/propertyforsale/pages/index.aspx | June 2025 |
| 8 | The Nation Thailand — Thailand's Property Market 2025 | https://www.nationthailand.com/business/property/40060756 | June 2025 |
| 9 | Government Savings Bank — NPA Assets | https://npa-assets.gsb.or.th/ | June 2025 |
| 10 | Krung Thai Bank — NPA Properties | https://krungthai.com/th/content/contact-us/properties-for-sale | June 2025 |
| 11 | AP Thai — What is NPA? | https://www.apthai.com/th/blog/know-how/what-is-npa | June 2025 |
| 12 | Prachachat — Krungthai NPA Mid Year Sale 2567 | https://www.prachachat.net/finance/news-1597364 | 2024 |
| 13 | Krungthai Bank — NPA Mid Year Sale 2567 press release | https://krungthai.com/th/krungthai-update/news-detail/2869 | July 2024 |
| 14 | ThaiPR.NET — Krungthai NPA Mid Year Sale 2567 | https://www.thaipr.net/finance/3489854 | July 2024 |
| 15 | Silk Legal — A Guide for Buyers: Property Public Auction in Thailand | https://silklegal.com/a-guide-for-buyers-property-public-auction-in-thailand-3/ | June 2025 |
| 16 | Legal Execution Department — e-Service | https://www.led.go.th/eservice/?lang=en | June 2025 |
| 17 | LED Open Data Portal | https://opendata.led.go.th/dataset/ | June 2025 |
| 18 | LED Asset Search | https://asset.led.go.th/ | June 2025 |
| 19 | BAM — Bangkok Commercial Asset Management | https://www.bam.co.th/ | June 2025 |
| 20 | BAM Annual Report 2024 | https://investor.bam.co.th/storage/document/annual-report/2024/bam-ar2024-printable-en.pdf | 2024 |
| 21 | SAM — 25 Years State AMC | https://en.moneyandbanking.co.th/2025/168085/ | 2025 |
| 22 | SAM NPA December 2024 Campaign | https://thaipublica.org/2024/12/sam-npa-pr-20122024/ | December 2024 |
| 23 | SAM NPA listings | https://www.sam.or.th/site/npa/page_list.php?s_status=2 | June 2025 |
| 24 | SAM debt clinic statistics | https://www.debtclinicbysam.com | June 2025 |
| 25 | GHB NPA Online Auction 2024 (May) | https://thaipublica.org/2024/05/ghbank-ghbs-npa-online-auction-pr-08052024/ | May 2024 |
| 26 | GHB NPA Online Auction (October 2024) | https://www.ghbank.co.th/news/detail/public-relations/press-01-10-2024 | October 2024 |
| 27 | GHB ALL HOME App | https://play.google.com/store/apps/details?id=com.ghbhomecenter.smartnpa | June 2025 |
| 28 | DDProperty — How to bid at LED auction | https://www.ddproperty.com/คู่มือซื้อขาย/ประมูลบ้านจากกรมบังคับคดีมีขั้นตอนอย่างไร-19941 | June 2025 |
| 29 | Nayoo.co — How to auction land at LED 2566 | https://nayoo.co/khonkaen/blogs/how-to-auction-land-update-2566 | 2023 |
| 30 | KKP Advice Center — 7 things before LED auction | https://advicecenter.kkpfg.com/th/money-matter/things-to-know-before-buying-a-house-from-led | June 2025 |
| 31 | Frank Legal & Tax — Khai Fak in Thailand | https://franklegaltax.com/the-sale-with-right-of-redemption-in-thailand/ | June 2025 |
| 32 | Thai Law Online — Sales with Rights of Redemption | https://thailawonline.com/sales-with-rights-of-redemption/ | June 2025 |
| 33 | SmartFinn — ขายฝาก fees and interest 2024 | https://www.smartfinn.co.th/article/fee-and-interest-2024 | 2024 |
| 34 | Jumnong.com — Investor mortgage/ขายฝาก | https://www.jumnong.com/investor | June 2025 |
| 35 | Chiang Mai ขายฝาก provider | https://xn--12cbqadn7h3a6bcg3iva8dcc9c5l9bwf6d.com/ | June 2025 |
| 36 | Pantip — ขายฝาก investment discussion | https://pantip.com/topic/32447312 | 2019 (older, mechanism unchanged) |
| 37 | Baker Tilly Thailand — Increasing NPLs a risk | https://bakertilly.co.th/insights/increasing-npls-a-risk/ | 2024 |
| 38 | The Nation Thailand — Thai household NPLs climb | https://www.nationthailand.com/news/general/40058692 | June 2025 |
| 39 | The Nation Thailand — Thai property sector debt burden | https://www.nationthailand.com/business/property/40052651 | 2025 |
| 40 | Bangkok Biz News — Second-hand property investor cash buyers | https://www.bangkokbiznews.com/property/1160107 | 2024 |
| 41 | TTB Bank — NPA Campaign Sale 2025 | https://www.ttbbank.com/th/newsroom/detail/npa-campaign-sale2025 | April 2025 |
| 42 | Baania Data | https://baaniathailand.com/data/ | June 2025 |
| 43 | PropertyHub Terms of Service | https://propertyhub.in.th/en/terms | June 2025 |
| 44 | Chiangmai.ohoproperty.com — Chiang Mai bank NPA aggregator | https://chiangmai.ohoproperty.com/ | June 2025 |
| 45 | Facebook — ขายด่วนบ้านที่ดินเชียงใหม่ group | https://www.facebook.com/groups/412611598940474/ | June 2025 |
| 46 | KasikornBank — NPA Broker programme | https://www.kasikornbank.com/th/propertyforsale/npabroker/pages/index.aspx | June 2025 |
| 47 | SCB — NPA Broker signup | https://www.scb.co.th/th/personal-banking/promotions/loans/npa-broker.html | June 2025 |
| 48 | Bangkok Asset — KBank NPA partnership | https://bangkokasset.co.th/en/baig-x-kbank/ | June 2025 |
| 49 | IMF — Household Deleveraging Thailand | https://www.imf.org/-/media/files/publications/selected-issues-papers/2025/english/sipea2025055.pdf | 2025 |
| 50 | Siamrath — Krungthai NPA Birthday Sale 2567 (58th anniversary campaign, Mar–May 2024) | https://siamrath.co.th/n/547648 | March 2024 |
| 51 | Wealthplustoday — Krungthai NPA Birthday Sale 2567 (dates Mar 27–May 19, 55% off, 3,000+ items, 12B baht) | https://www.wealthplustoday.com/2024/03/27/ktb-260/ | March 2024 |
| 52 | The Nation Thailand — Mortgage rejection crisis sub-3M homes | https://www.nationthailand.com/business/property/40059623 | 2025 |
| 53 | The Nation Thailand — Sub-3M homes slump, banks reject nearly 40% of loans (Q3 2025, Thai Housing Business Association) | https://www.nationthailand.com/blogs/business/property/40060924 | 2025 |
| 54 | DOL — พระราชบัญญัติคุ้มครองประชาชนในการทำสัญญาขายฝากที่ดินเพื่อเกษตรกรรมหรือที่อยู่อาศัย พ.ศ. 2562 (full text) | https://www.dol.go.th/Documents/law/law6206.pdf | 2019 |

---

## Review response

**Finding 1 — Krungthai campaign name inconsistency.**
Rebutted in part, then corrected with new information. The critic's hypothesis was that "Birthday Sale" and "Mid Year Sale" are the same campaign reported under two names. Research disproves this: they are two separate 2567 campaigns with near-identical headline figures (both 55%/3,000+/12B baht) held at different times of year (Birthday Sale Mar 27–May 19; Mid Year Sale Jul 1–Sep 15). However, the artifact had not previously distinguished them, so sources #12/#14/#50 were ambiguously attributed. Applied: Finding 2 now explicitly documents both campaigns with correct dates and notes that source #50 (Siamrath) refers to the Birthday Sale while ThaiPR (#14) and krungthai.com (#13) refer to the Mid Year Sale. Source #50 description corrected; source #51 added for the Birthday Sale. The figures do corroborate each other as evidence of Krungthai's consistent NPA programme scale.

**Finding 2 — DIST-09 and DIST-05/F10 route value away from the platform.**
Applied: F10 in the Implications table now explicitly frames this as a tradeoff (lead-magnet vs. value-leakage) and ties it to the subscription model. DIST-05 heuristic now carries a "Strategic note" about the flow routing value to the bank and the conditions under which it is appropriate. DIST-09 now explicitly names the tradeoff (link-out as stopgap vs. native ingestion as destination) and flags it for the founder.

**Finding 3 — Mortgage rejection figure range not shown.**
Applied: Finding 8 now states the full range — ~39–45% overall (Thai Housing Business Association Q3 2025 survey of developers) vs. 65–70% for the 1–3M baht segment (Terra Media survey of 4,000+ projects). The 70% figure is retained but now labelled as a segment-specific peak, not an economy-wide rate. Confidence section updated to reflect both figures. Sources #52 and #53 added.

**Finding 4 — DIST-09 and DIST-11 not screen-checkable.**
Applied: DIST-09 now opens with a checkable rule ("the Chiang Mai listings results page must expose a 'Source' filter that includes 'Bank Asset / ทรัพย์ธนาคาร' as a filterable category") before the strategic framing. DIST-11 now opens with a checkable rule ("the quick-sale listing creation flow must expose a 'seller urgency' selector with at least three tiers feeding the `urgency_indicator` field") and separates that from the market timing observation.

**Finding 5 — ขายฝาก legislative specificity and Pantip date mismatch.**
Applied: Finding 5 now cites the 2019 Act by its full Thai and English name (พระราชบัญญัติคุ้มครองประชาชนในการทำสัญญาขายฝากที่ดินเพื่อเกษตรกรรมหรือที่อยู่อาศัย พ.ศ. 2562 / "Protection of Consumers in Redemption of Properties Act B.E. 2562"), correctly describes it as setting a 1–10 year window, notes the scope limitation (natural persons, agricultural/residential land only), and clarifies that the 15% annual cap applies. Source #54 (DOL full text) added. The Pantip inline citation in Finding 6 corrected from "2022" to "2019" to match the sources table.

**Finding 6 — "150+ billion baht" scope unclear.**
Applied: Finding 9 now explicitly labels the 150+ billion figure as AMC-held NPA only, shows the arithmetic (BAM 69.8B + SAM ~20B + remaining AMCs ≈ 152B), distinguishes this from the total banking system NPL stock (~544B baht, Bangkok Post), and notes these are different pools. The finding header changed from "total system NPA" to "AMC-held NPA" to remove the ambiguity.

**Finding 7 — Prachachat 403 HTTP response.**
Rebutted: no action taken. The critic correctly noted this is anti-bot blocking, not a fabricated source, and recommended no fix. The Prachachat URL (#12) remains in the sources table; its figures are independently confirmed via ThaiPR (#14), Siamrath (#50), and krungthai.com (#13).
