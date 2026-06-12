# A4: Thai Listing Field Canon — Definitive Property Field Matrix

**Scope note.** This artifact defines the canonical set of data fields our platform must store, extract, display, and validate for Thai property listings. It directly gates: database schema design (DynamoDB attribute names and types), LLM extraction prompt structure (what fields the bot attempts to pull from broker chat), listing card UI (what to render and in what order), search/filter facets, and the quality-gate rules that score whether an extracted listing is publishable. Every decision about "what data do we collect?" flows from this document. Northern Thailand (Chiang Mai region) is the primary market; Bangkok conventions are noted where they differ materially.

---

## Thought Leaders & Sources Consulted

1. **DDproperty (PropertyGuru Group, Thailand)** — Thailand's highest-traffic portal (~3.5 M monthly visits as of 2026), part of the SGX-listed PropertyGuru Group which operates across five SE Asian markets. Their public listing corpus, agent guide-centre, and Thai-language buyer guides are the largest single signal on what fields Thai buyers/sellers actually fill in. Credibility: market-leader data volume, recency (2024–2026 guides), institutionally maintained. URL: ddproperty.com.

2. **FazWaz Thailand** — Strong on structured data: every project page shows CAM fee per sqm, sinking fund per sqm, foreign-quota percentage, ownership type (freehold/leasehold), total floors and units, completion year, and price-per-sqm for comparables. Also publishes a public Data Centre with market indices. Credibility: highest schema completeness of any Thai portal observed; 117k+ live listings as of 2026. URL: fazwaz.com.

3. **Hipflat Thailand** — Condo-focused portal with the most explicit disclosure of per-unit fields (floor number, building letter, foreign-quota status per unit, CAM fee, sinking fund). Particularly strong on the foreign-quota and ownership-type distinction that other portals bury. Credibility: specialist condo data, verified field-level disclosure observed in search results. URL: hipflat.com / hipflat.co.th.

4. **SamuiForSale.com — Thai Land Title Deeds reference** — Long-running legal-practitioner resource with the most comprehensive English-language matrix of all Thai land document types (NS4J, NS3G, NS3K, NS3, NS2, SK1, SPK, STG, PBT5, etc.), transaction permissions, and buyer-risk levels. Credibility: cited by multiple law firms; practical not theoretical; covers geographic variation. Accessed 2026-06-12.

5. **Pantip.com (Thai consumer forums)** — Primary Thai-language consumer voice on what buyers actually want to know. Threads on condo buying checklists (topic 41679191, 39965620, 43617076) surface the gap between what portals show and what buyers ask. Credibility: organic Thai-language demand signal; 2024–2025 threads. URL: pantip.com.

---

## Findings

**F-01. Area unit system: dual-unit is mandatory for land; sqm-only acceptable for built space.**
Land area is recorded and legally transacted in Thai units (ไร่/งาน/ตารางวา): 1 rai = 4 ngan = 400 tarang-wah = 1,600 sqm. Deed documents and land-office records always use rai/ngan/tarang-wah. Portals display both: e.g. "3 ไร่ 2 งาน 50 ตารางวา (5,800 sqm)." Floor/usable area is always in sqm (ตารางเมตร). Price-per-sqm is the standard comparison metric for built property; price-per-tarang-wah or price-per-rai is standard for land. (Sources: DDproperty buyer guide; Pantip topic 40730592; LH.co.th land unit guide, accessed 2026-06-12.)

**F-02. Title deed types are the highest-risk field: six primary Land Department types plus three non-Land-Department documents in circulation in rural North Thailand.**
The hierarchy from most to least secure for the six main types:
- **โฉนดที่ดิน / NS4J (Nor Sor 4 Jor / Chanote)** — Full ownership, GPS-surveyed boundaries, immediate transfer. Gold standard.
- **น.ส.3ก / NS3G** — Confirmed possession, aerial-survey boundaries, can sell/mortgage; near-equivalent to Chanote in practice.
- **น.ส.3ข / NS3K** — Confirmed possession, similar to NS3G but older survey method.
- **น.ส.3 / NS3** — Right of possession; boundary disputes common; 30-day public notice required before transfer. Moderate risk.
- **ส.ป.ก. 4-01 / SPK** — Agricultural reform land; **cannot be sold** (inheritance only). Highest risk if mistakenly listed as saleable.
- **ภบท.5 / PBT5** — Tax receipt only; gives no ownership rights at all.
Three additional non-Land-Department documents appear in broker chats, especially in rural and highland Chiang Mai:
- **น.ส.2 / NS2** — Temporary occupation permit; must be put to use within 3 years. **Cannot be sold**, inheritance only. Similar risk profile to SPK.
- **ส.ท.ก. / STG** — Forest-zone residence right issued by the Forest Department. **Cannot be sold**, passes by inheritance only. Common in hillside/mountain plots near Doi Suthep.
- **ส.ค.1 / SK1** — Possession notification only; no new ones issued since 1972. Cannot be upgraded without court approval. No transaction rights.
(Source: SamuiForSale.com land title deeds reference, 2026-06-12; ThailandLawOnline.com deed types; DDproperty Thai guides; TheThaiger.com condo guide.)

**F-03. Foreign quota is a binary per-unit field for condos, not a project-level field.**
Under the Condominium Act B.E. 2522, foreigners may own up to 49% of a condo's total saleable floor area. At the unit level, each unit is either "Foreign Quota" (freehold, foreign-ownable) or "Thai Quota" (Thai national only, or leasehold for foreigners). When a project's foreign quota is full, a foreign buyer must use a 30-year leasehold structure instead — a fundamentally different purchase. This distinction is rarely prominent in Thai-language listings but is critical for our international user segment. (Sources: FazWaz project pages; Hipflat per-unit fields; Terms.Law Thailand condo quota guide; LexBangkok.com 2025 update.)

**F-04. CAM fee and sinking fund are mandatory disclosure fields for condos; rates vary widely.**
Common Area Maintenance (CAM / ค่าส่วนกลาง) is charged monthly per sqm of unit size. Bangkok ranges: ฿20–30/sqm budget, ฿35–50/sqm mid-range, ฿60–90+/sqm luxury (CondoDee.com, 2025). Chiang Mai rates are lower, typically ฿20–50/sqm. Sinking fund (กองทุนสำรอง) is a one-off payment at transfer, typically ฿500–800/sqm in Phuket/Bangkok; Chiang Mai typically ฿300–600/sqm. Both are published on FazWaz and Hipflat as per-sqm figures. Neither is standardised by law at a specific rate — each juristic person sets its own. (Sources: CondoDee.com 2025; SiamRealEstate.com CAM guide; CentralCityProperty.com sinking fund guide; FazWaz project data.)

**F-05. Transfer fee/tax split convention: 50/50 is market standard but negotiable.**
The four transfer costs are: (1) 2% Transfer Fee (typically 50/50 buyer–seller), (2) 3.3% Specific Business Tax (seller, if owned <5 years) or 0.5% Stamp Duty (seller, if owned ≥5 years), (3) Withholding Tax ~1.8–2.5% (seller). Total buyer exposure: typically 1–2.5% of assessed value. 2025 Government stimulus reduced transfer fee to 0.01% for Thai nationals only (properties under ฿3M condo / ฿5M land), effective April 2025–June 2026 — foreign buyers excluded. (Sources: ForbesAndPartners.com Thailand transfer fees 2025; SamuiForSale.com transfer tax guide; Nishimura & Asahi publication April 2025.)

**F-06. Chiang Mai has no mass-transit network; location references are road-and-landmark-based.**
Unlike Bangkok (BTS/MRT station proximity as primary location anchor), Chiang Mai property is referenced by: (a) named districts/sub-districts (Nimman, Old City moat area, Hang Dong, San Sai, San Kamphaeng, Saraphi, Doi Saket, Mae Rim); (b) key roads (Nimmanhaemin/Soi numbering, Ring Roads 1–3, Superhighway/Chiang Mai–Lampang, Chiang Mai–Hang Dong); (c) landmark anchors — MAYA Lifestyle Mall, Central Festival Chiang Mai, Chiang Mai University/CMU back gate (มช.), Chiang Mai International Airport, Maejo University, Bangkok Hospital, Suthep Road/Doi Suthep. Distance is expressed in minutes-by-car or km. (Sources: search results from Nimman area listings; Hipflat Chiang Mai filter pages; RochaliaAsia.com best areas guide; Pantip Chiang Mai housing discussions.)

**F-07. Flood history is a buyer priority after October 2024, but no disclosure requirement exists in Thai law.**
The October 2024 Chiang Mai floods (Ping River overflowed, Chang Klan/Night Bazaar/riverside zones inundated) brought flood risk into active buyer concern. Flood-prone zones: Chang Klan, Kad Luang Market, Ban Pa Phrao Nok, Charoen Prathet Road, historic riverside. Flood-safe zones (elevated): San Sai near Ring Road 3/Ruamchok, San Kamphaeng, Second Ring Road Payap–Mae Khao area, Hang Dong (improved drainage). No Thai law mandates flood history disclosure in property listings. Major portals (DDproperty, FazWaz) do not have a flood-history field. (Sources: Nestopa.com and Fujipress.jp 2025 preliminary disaster analysis for the October 2024 event specifically; Belmont-Thailand.com for zone-level safe/prone classification — note: Belmont names the same zones but does not reference the October 2024 event by date; ThailandSimple.com flooding guide.)

**F-08. Orientation/direction (ทิศ) is an expected listing field driven by feng-shui (ฮวงจุ้ย) beliefs.**
Thai buyers — especially Thai-Chinese — consider facing direction (ทิศหน้าบ้าน) important for feng-shui and practical reasons (sun exposure, wind). Preferred: North or East-facing for coolness and auspiciousness. Least preferred: West-facing (afternoon heat). Sansiri, AP Thailand, Areeya Property all publish guides explaining direction significance. Condo listings on some portals already include unit orientation. For houses and land, the direction the front entrance faces is expected. (Sources: Sansiri.com direction guide; APThai.com feng-shui direction guide; Areeya.co.th direction guides; Tararom Estate feng-shui guide — all Thai-language, accessed 2026.)

**F-09. Rental-specific fields are now partially regulated: deposit cap, utility rates at-cost.**
Effective 4 September 2025, OCPB regulations apply to any lessor leasing ≥3 residential units (down from the previous ≥5 threshold). Key rules: (1) security deposits and advance rent combined must not exceed **3 months' rent** for short-term or monthly long-term leases, or **1 year's rent** for annually-paid long-term leases — any contract term exceeding these limits is unenforceable; (2) electricity/water billed at official government tariff rates (PEA/PWA/MWA) — no mark-ups permitted; (3) written invoices 3+ days before due date; (4) lease contracts in Thai with explicit utility-rate calculation basis. *Market convention* (separate from the legal cap): 1–2 months deposit + 1 month advance rent — i.e., most standard leases operate well within the 3-month legal ceiling. Minimum lease term is typically 1 year; 6-month and 2-year terms also common. Pet policy must be stated in writing. (Sources: FOSRLAW.com 2025 leasing regulations; LexNovaPartners.com residential lease 2025; ThailandWithMonchai.com 2025–2026 rental guide; Bangkok Post utility rate ruling.)

**F-10. Land shape (รูปร่างแปลง) and road access (ทางเข้า) are key value-drivers for land listings.**
Rectangular land plots with direct public road access command the highest values. Irregular/L-shaped/"duck foot" (ตีนเป็ด) plots are discounted. Landlocked plots (no road frontage) lose significant value unless a legal right-of-way (easement) is registered. Road width is important: plots with ≥4m wide road access can obtain building permits under Thai building regulations; plots with <4m access face construction restrictions. Thai government's LandsMaps system (landsmaps.dol.go.th) shows parcel shape, deed number, coordinates, and treasury valuation. (Sources: SiamLegal.com easements guide; search results on land listing conventions; LandsMaps system documentation; feasyonline.com zoning check guide.)

**F-11. Zoning color (ผังเมือง / สีโซน) determines what can be built — critical for land listings.**
Two Chiang Mai plan versions are in active reference: (a) the **old city plan** (ผังเมืองชั้นใน) divided the inner urban area into 12 color zones covering 7 districts across ~429 km²; (b) the **current provincial comprehensive plan** (ผังเมืองรวมจังหวัดเชียงใหม่) covers all 25 districts of Chiang Mai Province with approximately 11 distinct zone colors. Our platform should reference the current provincial plan for all listings. Key zones under the current plan: Yellow (low-density residential / ที่อยู่อาศัยหนาแน่นน้อย), Orange (medium-density residential), Red (commercial/high-density), Green (agricultural/rural), Yellow-striped (conservation residential), Light Brown (cultural heritage/near temples), Light Green (recreational/environmental conservation), plus Olive Green, Light Purple, Light Grey, and Blue. Zone determines: permitted uses, FAR (floor area ratio), OSR (open space ratio), and maximum building height. For land listings, the zoning color directly affects development potential and price. FAR and height details require cross-referencing the Department of Public Works' digital plan. (Sources: Kaipoob.com Chiang Mai zoning guide — both old city plan and current provincial plan described; feasyonline.com FAR/OSR checker; Trebs.ac.th zoning guide — all Thai-language.)

**F-12. Furnishing terminology is not standardised across portals; three tiers are in use.**
The market uses three furnishing levels: (1) Fully Furnished / เฟอร์นิเจอร์ครบ — all furniture + appliances including kitchen; (2) Partly/Semi Furnished / เฟอร์นิเจอร์บางส่วน — major furniture present, not all appliances; (3) Unfurnished / ไม่มีเฟอร์นิเจอร์ — built-in structures only (fitted cabinets, A/C units). A critical ambiguity: "fully fitted" (kitchen fixtures, sink, cabinets but no furniture) is sometimes called "unfurnished" and sometimes "partly furnished." This is the single largest source of listing-quality complaints (TheThaiger.com; Pantip threads). DDproperty uses "Fully Furnished / Partly Furnished / Unfurnished" as the standard three-way filter.

**F-13. Location granularity is province → amphoe → tambon, with a project/development name layer above.**
Thai administrative geography: จังหวัด (Province) → อำเภอ/เขต (Amphoe/Khet — district) → ตำบล/แขวง (Tambon/Khwaeng — sub-district). Property addresses go to tambon level. Portal search filters operate at amphoe level. Land deeds record province/amphoe/tambon + deed number + parcel survey number (ระวาง). New-build condos/housing estates have a project name (ชื่อโครงการ) that serves as a search facet on DDproperty, FazWaz, and Baania. For resale, project name enables comparables lookup. (Sources: LandsMaps system; DDproperty search structure; Thai land law address conventions.)

**F-14. Amenities are a free-form multi-value field; no Thai standard taxonomy exists.**
Common amenities disclosed: swimming pool (สระว่ายน้ำ), fitness centre (ฟิตเนส), parking (ที่จอดรถ), 24-hour security (รปภ.24ชม.), CCTV, keycard access, playground, co-working space, rooftop, clubhouse, garden. For houses: private pool, garden, servant quarters (ห้องแม่บ้าน), covered parking. No official Thai enum; every portal has its own checkbox list. (Sources: DDproperty property descriptions; FazWaz project amenity lists; Pantip condo buyer checklists.)

**F-15. "Negotiable" (ต่อรองได้) is a binary listing signal, not a price bracket.**
Thai listings use the phrase "ต่อรองได้" or "ราคาต่อรอง" to signal the seller is open to offers below the asking price. This is separate from a price reduction (ราคาลด) which implies a prior listed price was lowered. Quick-sale listings use "ขายด่วน" (urgent sale). These are distinct semantic signals that affect buyer intent and platform filtering. (Sources: MarketplaceThailand classified listings; Horizonhomes-Samui.com negotiation guide; Thailand-Property.com negotiation article.)

---

## Implications for Us

| Finding | Decision for our product |
|---|---|
| F-01 Dual area units | Store land area as three separate integer/decimal fields: `land_rai`, `land_ngan`, `land_tarang_wah` PLUS a computed `land_sqm`. Display both formats; LLM extractor must parse Thai unit notation. |
| F-02 Title deed types | `title_deed_type` is an enum: `chanote` \| `ns3g` \| `ns3k` \| `ns3` \| `spk` \| `pbt5` \| `ns2` \| `stg` \| `sk1` \| `other` \| `unknown`. NS2, STG, and SK1 join SPK and PBT5 as **cannot-be-sold** types that trigger a quality-gate block on sale listings. Map to buyer-risk tier in UI (green/yellow/red badge). |
| F-03 Foreign quota | For condos, two separate axes: `tenure` (enum: `freehold` \| `leasehold_30yr`) and `quota_bucket` (enum: `foreign_quota` \| `thai_quota`). A Thai-quota unit is freehold for a Thai buyer but requires leasehold for a foreigner — the two axes must be independent. Also store `foreign_quota_available` (boolean) and project-level `project_foreign_quota_pct` (number 0–100). Affects which buyers can see/act on the listing. |
| F-04 CAM + sinking fund | `cam_fee_per_sqm_month` (number, THB) and `sinking_fund_per_sqm` (number, THB, one-time). Both optional for non-condo, required for condo to pass quality gate. |
| F-05 Transfer fees | Show a "Total Transfer Cost Estimate" calculator on listing page; do not store transfer fee split as a listing field (it's negotiated per deal). |
| F-06 No BTS in Chiang Mai | Location UX must be landmark/road-based, not transit-based. LLM extractor should recognise Chiang Mai landmark names (MAYA, CMU, Central Festival, Nimman Soi numbers, Ring Road 1/2/3) as valid proximity anchors. |
| F-07 Flood risk | Add `flood_history` boolean + `flood_risk_zone` free-text (optional, seller-disclosed). Prominently label as "Seller-disclosed" not verified. Show a map layer of Chiang Mai's known flood zones (Ping River corridor) on listing detail page. This differentiates us from portals that omit it. |
| F-08 Direction/orientation | `facing_direction` enum: `N` \| `NE` \| `E` \| `SE` \| `S` \| `SW` \| `W` \| `NW`. Optional but surfaces prominently for house/land listings. LLM extractor should parse Thai direction words (ทิศเหนือ, ทิศตะวันออก, etc.). |
| F-09 Rental terms | For rent listings: `deposit_months` (integer), `min_lease_months` (integer), `pets_allowed` (boolean \| null), `utility_rate_type` (enum: `government` \| `landlord_rate` \| `included` \| `unknown`). Utility rate type is now legally significant since Sep 2025 OCPB regs. Legal ceiling: `deposit_months` ≤ 3 for monthly leases; flag listings claiming > 3 months deposit as potentially non-compliant. |
| F-10 Land shape + road access | `road_access_m` (number, public road frontage width in metres), `road_type` (enum: `public` \| `private_easement` \| `none`). `land_shape` free text (e.g., rectangular / irregular / L-shape). Listings with `road_type = none` get a warning badge. |
| F-11 Zoning | `city_plan_zone_color` (free text: yellow/orange/red/green/etc.) and `city_plan_far` (number, optional). This is discoverable from coordinates if we integrate with the DOL LandsMaps API. |
| F-12 Furnishing | `furnishing_status` enum: `fully_furnished` \| `partly_furnished` \| `unfurnished`. Plus a free-text `furnishing_notes` for ambiguous cases. Quality gate: if listing type is rent, furnishing status is required. |
| F-13 Location hierarchy | Store: `province`, `amphoe`, `tambon` (all required), `project_name` (optional), `address_detail` (free text), `lat`/`lng` (float). Location granularity to tambon is minimum for search; coordinates enable map display and proximity filters. |
| F-14 Amenities | `amenities` as a string array using a canonical Thai+English enum (pool, gym, parking, security_24hr, cctv, keycard, playground, coworking, rooftop, clubhouse, garden, private_pool, servant_quarters, covered_parking). Free-text overflow field `amenities_notes`. |
| F-15 Negotiable signal | `price_negotiable` (boolean), `listing_urgency` (enum: `normal` \| `quick_sale` \| `price_reduced`). These are separate from price itself and affect search ranking. |

---

## Heuristics

**FIELD-01: Every land listing must store area in both Thai-unit triple (rai/ngan/tarang-wah) and computed sqm; displaying only sqm for land is a disqualifying omission.**
Checkable: inspect any land listing record — if `land_rai`, `land_ngan`, `land_tarang_wah` are all absent, the record fails.

**FIELD-02: Title deed type must be a validated enum on every listing; an extracted listing without a deed type must default to `unknown` and be blocked from public publication until resolved.**
Checkable: SQL/scan of published listings — zero records with `title_deed_type = null` allowed; `unknown` is permitted but triggers a "Deed type unconfirmed" warning badge.

**FIELD-03: SPK, PBT5, NS2, STG, and SK1 deed types must trigger an automatic quality-gate BLOCK on sale listings with a clear explanation to the poster: "This deed type cannot be legally sold."**
Five deed types share the no-transfer-by-sale constraint: SPK (ส.ป.ก. agricultural reform), PBT5 (ภบท.5 tax receipt only), NS2 (น.ส.2 temporary occupation permit), STG (ส.ท.ก. forest-zone residence right), and SK1 (ส.ค.1 possession notification). All pass by inheritance only. Checkable: submit a listing with any of these five `title_deed_type` values and `listing_type = sale` — the system must reject it or hold it for admin review, never auto-publish.

**FIELD-04: For condo listings, CAM fee and sinking fund are required fields to reach "complete" listing quality score; a condo listing published without both is incomplete.**
Checkable: inspect any published condo — `cam_fee_per_sqm_month` and `sinking_fund_per_sqm` must both be non-null.

**FIELD-05: Foreign-quota status must be a per-unit field (not project-level only) and must be displayed on the listing card for condos; omitting it from the card is a failure for any international-facing view.**
Checkable: render a condo listing card in "English / international" view — `ownership_type` must be visible without clicking through to detail.

**FIELD-06: Chiang Mai location fields must include at least one named landmark or soi reference in addition to province/amphoe/tambon; tambon-only location is insufficient for buyer orientation in Northern Thailand.**
Checkable: any Chiang Mai listing with tambon = "Su Thep" but no landmark reference (e.g., "near CMU back gate", "Nimman Soi 9") fails the location quality check.

**FIELD-07: Flood risk disclosure, if present, must be labelled "Seller-disclosed, unverified" — never displayed as a factual platform assertion; absence of the field must not be rendered as "not flood-prone."**
Checkable: inspect flood risk UI copy — it must include an explicit "seller-disclosed" qualifier and must show no text/badge when the field is null (not a green "safe" indicator).

**FIELD-08: Rental listings must display `utility_rate_type` to comply with 2025 OCPB regulations; listings stating "government rate" (PEA/PWA) must be auditable by the poster — this is a legally significant claim as of September 2025.**
Checkable: any rental listing published after September 2025 must have `utility_rate_type` set; `null` triggers a "Utility rate not specified" badge.

**FIELD-09: Area measurements for built space (condo, house, shophouse) must use sqm only; never rai/ngan/tarang-wah for usable floor area. Mixing units in the same field is a data-quality error.**
Checkable: any record where `floor_area_sqm` > 0 AND any `land_*` field is non-zero must represent separate land-area + built-area fields, not conflated.

**FIELD-10: Price-per-area must be auto-computed (never manually entered) and must use the correct area basis for the listing type.**
For built-space listings (condo, house, shophouse, apartment): `price_per_sqm = price / floor_area_sqm` — any stored value deviating from this by more than 1% is a data integrity error. For land listings: price-per-tarang-wah and price-per-rai are the correct metrics (see AP-06); `price_per_sqm` must not be the sole computed figure for raw land. Checkable: (a) any built-space listing where stored `price_per_sqm` differs from `price / floor_area_sqm` by > 1% fails; (b) any land listing that exposes only `price_per_sqm` with no `price_per_tarang_wah` fails.

**FIELD-11: `facing_direction` and `land_shape` fields, when extracted from broker chat, must be mapped to canonical enum/value without re-judging the seller's assertion; the platform must not substitute its own interpretation for what the seller stated.**
The LLM extractor translates Thai language to canonical values (e.g., ทิศตะวันออก → `E`, ที่ดินรูปสี่เหลี่ยม → `"rectangular"`) but must not override the seller's stated direction or shape with an independently computed value. Checkable: test with "หน้าบ้านหันทิศตะวันออก, ที่ดินรูปสี่เหลี่ยม" — extracted values must be `facing_direction = E`, `land_shape = "rectangular"`; the system must not substitute a different orientation derived from coordinates.

**FIELD-12: The three-tier furnishing enum (fully_furnished / partly_furnished / unfurnished) must be accompanied by a `furnishing_notes` free-text field to handle the ambiguous middle tier; the enum alone cannot capture "fitted kitchen but no furniture."**
Checkable: listing submission form must show a text input when `furnishing_status = partly_furnished` is selected.

**FIELD-13: Location hierarchy must always store province + amphoe + tambon as separate fields (never as a concatenated string); search, filtering, and LLM extraction all depend on these being independently queryable.**
Checkable: DynamoDB schema review — `location.province`, `location.amphoe`, `location.tambon` must be separate string attributes on every listing record.

---

## Anti-Patterns

**AP-01: Showing "Not flood-prone" when flood history is unknown.** Several broker-group participants will not know the flood history of older properties. Displaying a green "safe" badge when `flood_history = null` would actively mislead buyers in post-2024 Chiang Mai where this is now a major concern.

**AP-02: Storing land area only in sqm and losing rai/ngan/tarang-wah precision.** Thai land deeds record area in Thai units with fractional tarang-wah accuracy. Rounding to sqm and back introduces errors. Always store the original Thai-unit triple as the canonical value.

**AP-03: Publishing SPK/ส.ป.ก. land as saleable property.** This happens regularly in informal broker chats where sellers mis-state their deed type. Our extraction pipeline must flag this as a hard block — SPK land cannot legally change ownership by sale.

**AP-04: Omitting CAM fee and sinking fund from condo listings, calling them "contact agent."** This is the single largest source of buyer dissatisfaction in Thai condo transactions (per Pantip and TheThaiger). FazWaz and Hipflat have won market share partly by disclosing these upfront.

**AP-05: Conflating foreign-quota with "foreigners can buy."** A unit listed under Thai Quota can still be acquired by a foreigner via a 30-year leasehold structure — but this is a fundamentally different transaction. Labelling it simply "for sale" without specifying ownership type misleads both parties.

**AP-06: Using sqm as the price-per-area unit for land.** Thai land prices are quoted per tarang-wah or per rai. "฿2,000/sqm" is legitimate for built space; for raw land, Thai buyers expect "฿8,000/tarang-wah" or "฿3.2M/rai". Displaying land price-per-sqm to Thai users signals the platform doesn't understand the market.

**AP-07: Furnishing status left as free-text in the LLM extractor.** Chat messages say things like "ฟูลฟิต มีทุกอย่าง" or "เข้าอยู่ได้เลย" or "เฟอร์ครบ" — all meaning fully furnished. Without an extraction rule that maps these to the enum, the field ends up with unqueryable free-text strings.

**AP-08: Treating Bangkok BTS-proximity logic as applicable to Chiang Mai.** No mass transit exists in Chiang Mai as of 2026. Any location field or search filter that assumes transit-based proximity will be irrelevant for the Northern Thailand market.

**AP-09: Displaying price as negotiable when the signal is actually "quick sale / urgent."** "ขายด่วน" (quick sale) implies below-market pricing driven by time pressure, which is a different buyer signal than "ต่อรองได้" (negotiable at a fair price). Conflating them loses the urgency signal our platform's quick-sale flow depends on.

**AP-10: Recording road access width as "has road access: yes/no" without the width.** Thai building regulations require specific minimum road frontage for building permits. A plot may have technical road access but not enough (e.g., 2m private access vs. 4m public road needed for construction permit). Boolean is insufficient; store width in metres.

---

## Confidence

### VERIFIED (cited, current sources accessed 2026-06-12)

- Thai land area units (rai/ngan/tarang-wah/sqm conversions) — multiple Thai sources, government land authority.
- All title deed types and their transaction permissions — SamuiForSale.com comprehensive matrix, cross-confirmed with DDproperty Thai guides and JusticeChannel.org.
- Foreign quota 49% rule, per-unit nature, leasehold alternative — multiple law firm sources, Condominium Act B.E. 2522 cited.
- CAM fee rate ranges Bangkok 2025 — CondoDee.com 2025 guide (specific numbers).
- Transfer fee structure and 2025 stimulus (0.01% for Thai nationals, April 2025–June 2026) — Nishimura & Asahi publication April 2025; ForbesAndPartners.com breakdown.
- OCPB September 2025 rental regulations (deposit cap, utility rate law) — Multiple law firm sources (FOSRLAW, LexNovaPartners, ThailandLawOnline).
- Chiang Mai flood-prone zones (Chang Klan, Charoen Prathet, Kad Luang) and safe zones (Ruamchok/Ring Road 3, San Sai, San Kamphaeng) — zone list corroborated by Belmont-Thailand.com; October 2024 event anchor sourced from Nestopa.com and Fujipress.jp 2025 disaster analysis.
- Chiang Mai zoning colour scheme — Kaipoob.com Thai-language guide (old city plan: 12 zones/7 districts; current provincial plan: ~11 zones/25 districts); product decisions reference current provincial plan.
- No mass-transit (BTS/MRT) in Chiang Mai — confirmed by multiple sources, consistent with all Chiang Mai property listing conventions.
- Pantip buyer checklist priorities (Pantip topics 41679191, 39965620) — Thai-language, 2024–2025 threads.
- Furnishing terminology ambiguity (no standardisation) — TheThaiger.com; iProperty.com.my; DDproperty filter labels.
- Kaidee Baan property types: home, townhouse, condo, apartment, commercial building, land, office — observed directly via WebFetch.
- DDproperty scraper field schema (pricing, location, property type, floor area, tenure, bedrooms, bathrooms) — Apify API documentation.

### PLAUSIBLE BUT UNVERIFIED (reasoned inference or indirect evidence; label accordingly in product decisions)

- **CAM fee rates for Chiang Mai specifically:** Bangkok ranges are well-cited; Chiang Mai rates inferred as "lower" from market commentary but no direct Chiang Mai-specific source with a numeric range was accessed. **Ask a local broker for 5 recent projects' CAM fee disclosures before using as a schema validation range.**
- **Sinking fund rates for Chiang Mai:** Phuket/Bangkok rates are cited (฿500–800/sqm); Chiang Mai estimated as ฿300–600/sqm based on general lower-cost market positioning — not directly cited.
- **SPK land prevalence in Chiang Mai outskirts:** SPK agricultural reform land is common in Northern Thailand rural areas surrounding Chiang Mai according to practitioner knowledge. Direct quantification of prevalence in our target listing corpus is not verified.
- **Feng-shui / facing direction being commonly asked in broker chats:** The belief in orientation importance is verified (multiple Thai developer sources); whether brokers in LINE groups routinely state facing direction in their listing descriptions is unverified and may need a prompt-engineering test.
- **LandsMaps API suitability for real-time zoning lookups:** The system exists (landsmaps.dol.go.th) and is accessible publicly, but whether it has a stable enough API for programmatic querying at listing-ingestion time has not been tested.
- **"ขายด่วน" signal frequency in broker chats:** The term is observed in listing portals, but how often brokers use it in LINE group messages (vs. other urgency phrases) needs validation against our real chat corpus.

---

## Ask the Market

**AM-01.** What CAM fee per sqm are Chiang Mai condo projects charging in 2025–2026, and what is the typical sinking fund rate? (Ask 3–5 Chiang Mai-based broker contacts for actual project numbers — this gates our listing completeness validation rule.)

**AM-02.** How often do brokers/owners in LINE group chats spontaneously state title deed type? Do they say "โฉนด" routinely, or only when asked? This determines whether deed type should be a required extracted field or a "request-for-clarification" prompt in the bot.

**AM-03.** What fraction of Chiang Mai land listings (especially in rural/mountain areas) are SPK land being informally traded? Understanding this prevalence helps decide how prominently to display the SPK warning vs. how often our quality gate will fire.

**AM-04.** After the October 2024 floods, are brokers now routinely disclosing flood history in their chat descriptions, or is it still omitted? This determines whether our LLM extractor needs aggressive flood-signal detection or whether the field will remain mostly null.

**AM-05.** Do brokers in LINE groups state facing direction (ทิศ) for houses and land in their descriptions? Is it asked by buyers in response messages? This validates the priority of the `facing_direction` field in extraction.

**AM-06.** What is the market expectation on utility rate disclosure for rental listings now that OCPB Sep 2025 regulations are in effect? Are landlords in LINE groups starting to state "PEA rate" in their rental posts, or is this still agent-only knowledge?

**AM-07.** For the quick-sale flow we're building: what language/signals do owners use in LINE groups when they want a fast distressed sale vs. a normal sale with some flexibility? Is "ขายด่วน" used, or are there other local conventions?

**AM-08.** Is "project name" (ชื่อโครงการ) a field that brokers in group chats reliably mention for condo resales, or do they skip it and describe by location/features only? This affects whether project-name extraction is worth investing in for the LLM pipeline.

---

## Sources

1. DDproperty Thailand — https://www.ddproperty.com/en — accessed 2026-06-12
2. DDproperty Thai guides (โฉนดที่ดิน 6 ประเภท) — https://www.ddproperty.com/คู่มือซื้อขาย/รู้จักเอกสารสิทธิที่ดิน-4305 — accessed 2026-06-12
3. DDproperty land unit guide (1 ไร่มีกี่ตารางวา) — https://www.ddproperty.com/คู่มือซื้อขาย/หน่วยวัดและการคำนวณพื้นที่บ้าน-ที่ดิน-14675 — accessed 2026-06-12
4. FazWaz Thailand — https://www.fazwaz.com/ — accessed 2026-06-12
5. FazWaz "List with us" — https://www.fazwaz.com/list-with-us — accessed 2026-06-12
6. FazWaz S Condo Chiang Mai project — https://www.fazwaz.com/projects/thailand/chiang-mai/mueang-chiang-mai/suthep/s-condo-chiang-mai — accessed 2026-06-12
7. Hipflat Thailand — https://www.hipflat.com/ — accessed 2026-06-12
8. SamuiForSale.com — Thai Land Title Deeds — https://www.samuiforsale.com/knowledge/thailand-land-title-deeds.html — accessed 2026-06-12
9. SamuiForSale.com — Transfer fees and taxes — https://www.samuiforsale.com/real-estate/transfer-fees-and-taxes-for-a-condo-in-thailand.html — accessed 2026-06-12
10. ForbesAndPartners.com — Thailand Property Transfer Fees 2025/2026 — https://www.forbesandpartners.com/thailand-property-transfer-cost-tax-breakdown/ — accessed 2026-06-12
11. Nishimura & Asahi — Reduced Transfer and Mortgage Fees 2025 — https://www.nishimura.com/en/knowledge/publications/20250421-112251 — accessed 2026-06-12
12. JusticeChannel.org — Land document types — https://justicechannel.org/read/land-law — accessed 2026-06-12
13. Terms.Law — Thailand Condo Foreign Quota — https://terms.law/Thai/property/condo-foreign-quota.html — accessed 2026-06-12
14. CondoDee.com — Bangkok Condo Maintenance Fees 2025 — https://condodee.com/condo-maintenance-fee-bangkok-2025/ — accessed 2026-06-12
15. CentralCityProperty.com — Condo fees and sinking funds — https://centralcityproperty.com/condo-fees-and-sinking-funds-in-thailand/ — accessed 2026-06-12
16. RestProperty.com — CAM fees, sinking funds, maintenance fees — https://restproperty.com/article-en/stati-tayland/comprehending-sinking-funds-common-area-fees-and-maintenance-fees-in-thailand-en/ — accessed 2026-06-12
17. FOSRLAW.com — Thailand Residential Leasing Regulations 2025 — https://fosrlaw.com/2025/thailand-residential-leasing-regulations-2025/ — accessed 2026-06-12
18. LexNovaPartners.com — Residential Lease Thailand 2025 — https://lexnovapartners.com/residential-lease-contracts/ — accessed 2026-06-12
19. Kahouze.com — Rental Deposits Thailand — https://kahouze.com/locations-post-type/rental-deposits-in-hua-hin-thailand/ — accessed 2026-06-12
20. Bangkok Post — Law calls halt to landlords cranking up bills — https://www.bangkokpost.com/thailand/general/1456153/law-calls-halt-to-landlords-cranking-up-bills — accessed 2026-06-12
21. Belmont-Thailand.com — Which Areas in Chiang Mai Are Safe from Flooding — https://www.belmont-thailand.com/post/chiang-mai-flood-safe-areas — accessed 2026-06-12
22. ThailandSimple.com — Flooding in Chiang Mai, 2024–2025 — https://thailandsimple.com/flooding-in-chiang-mai-causes-history-2024-2025-events-and-preparedness/ — accessed 2026-06-12
23. Fujipress.jp — 2024 Northern Thailand Floods Preliminary Disaster Analysis — https://www.fujipress.jp/jdr/dr/dsstr0020sc20250319/ — accessed 2026-06-12
24. Kaipoob.com — Chiang Mai Zoning Colors — https://kaipoob.com/zoningcolorchingmai/ — accessed 2026-06-12
25. feasyonline.com — City Plan Zone Color Check (FAR, OSR) — https://www.feasyonline.com/content/detail/1207/ — accessed 2026-06-12
26. Trebs.ac.th — Zoning color impact on land — https://www.trebs.ac.th/th/news_detail.php?nid=71 — accessed 2026-06-12
27. Sansiri.com — House direction feng-shui guide — https://www.sansiri.com/content/view/เตรียมตัวก่อนซื้อ-ทิศบ้าน-ซื้อบ้านใหม่หันหน้าทิศไหนดี/th — accessed 2026-06-12
28. APThai.com — House facing direction feng-shui — https://www.apthai.com/th/blog/know-how/house-facing-direction-feng-shui — accessed 2026-06-12
29. Areeya.co.th — ซื้อบ้านทิศไหนดี — https://areeya.co.th/en/blog/content-hub/living-tips/ซื้อบ้านทิศไหนดี-อยู่แล้วปัง/ — accessed 2026-06-12
30. Pantip.com — 10 Condo Buying Checklist (topic 41679191) — https://pantip.com/topic/41679191 — accessed 2026-06-12
31. Pantip.com — Questions to ask before buying condo (topic 39965620) — https://pantip.com/topic/39965620 — accessed 2026-06-12
32. Pantip.com — Land unit measurement (topic 40730592) — https://pantip.com/topic/40730592 — accessed 2026-06-12
33. Pantip.com — New condo investor 2025 (topic 43617076) — https://pantip.com/topic/43617076 — accessed 2026-06-12
34. TheThaiger.com — 23 things to look out for viewing Thai property — https://thethaiger.com/thai-life/property/buy-property-thailand-bangkok-condo-listings — accessed 2026-06-12
35. LandsMaps DOL Thailand — https://landsmaps.dol.go.th/ — accessed 2026-06-12
36. LH.co.th — Land unit calculation — https://www.lh.co.th/en/blogs/living-tips/land-unit-calculation — accessed 2026-06-12
37. RochaliaAsia.com — Best areas to buy house Chiang Mai — https://rochalia-asia.com/best-areas-to-buy-house-chiang-mai/ — accessed 2026-06-12
38. Baan.Kaidee.com — Property listing categories — https://baan.kaidee.com/en/c2-realestate — accessed 2026-06-12
39. DDproperty Apify scraper field schema — https://apify.com/fatihtahta/ddproperty-scraper/api — accessed 2026-06-12
40. SiamLegal.com — Thai Property Easements — https://www.siam-legal.com/thailand-law/thai-property-easements-servitudes-or-right-of-ways/ — accessed 2026-06-12
41. ThailandWithMonchai.com — How to Rent in Thailand 2025–2026 — https://www.thailandwithmonchai.com/blogs/-how-to-rent-a-condo-or-long-term-home-in-thailand-complete-2025-2026-guide-for-foreigners — accessed 2026-06-12
42. M-property.co.th — Land types and adverse possession 2026 — https://m-property.co.th/2026/03/02/land-types-and-adverse-possession/ — accessed 2026-06-12
43. Bamboo Routes — Average price per sqm Chiang Mai Sept 2025 — https://bambooroutes.com/blogs/news/average-price-per-sqm-chiang-mai — accessed 2026-06-12
44. Nestopa.com — Chiang Mai floods October 2024 real estate implications — https://nestopa.com/th-en/articles/chiang-mai-floods-in-october-2024-implications-for-thailands-real-estate-market — accessed 2026-06-12
45. ThailandLawOnline.com — Land Title Deeds (NS2, STG, SK1 descriptions) — https://www.thailandlawonline.com/article-older-archive/land-title-deeds-land-documents-in-thailand — accessed 2026-06-12

---

## Review response

**Finding 1 — Applied.** BLOCKER corrected. F-09 now states the legal deposit ceiling as 3 months' rent (monthly leases) or 1 year's rent (annually-paid leases), matching the FOSRLAW source directly (re-fetched and confirmed). The ≥3-unit applicability threshold is now stated separately from the cap. The "1 month" figure was the market convention, which is now clearly labelled as such and distinguished from the legal maximum. The Implications table (F-09 row) now includes a compliance flag rule for deposit_months > 3.

**Finding 2 — Applied.** MAJOR resolved. F-02 narrative now lists all three non-Land-Department types (NS2, STG, SK1) with descriptions and sale-transfer status. The Implications enum is updated to `chanote | ns3g | ns3k | ns3 | spk | pbt5 | ns2 | stg | sk1 | other | unknown` — consistent with SamuiForSale's matrix. FIELD-03 now names all five no-sale deed types. SK1 is included in the enum despite no new issues since 1972, because existing SK1 land continues to circulate in informal broker chats and needs to be recognisable (not silently mapped to `other`).

**Finding 3 — Applied.** MINOR corrected. F-11 now explicitly distinguishes the old city plan (12 zones, 7 districts — superseded) from the current provincial plan (~11 zones, 25 districts). The product decision is clearly anchored to the current provincial plan. The Confidence entry is updated accordingly.

**Finding 4 — Applied.** MINOR corrected. F-07 attribution now separates the October 2024 event anchor (Nestopa + Fujipress) from the zone-level corroboration (Belmont). The Confidence section removes the "post-flood analysis" label from Belmont.

**Finding 5 — Applied.** MINOR corrected. FIELD-10 now scopes price-per-sqm consistency to built-space listings and separately requires price-per-tarang-wah for land listings, consistent with AP-06.

**Finding 6 — Applied.** MINOR corrected. FIELD-11 wording replaced: "pass through without normalisation changes / verbatim" replaced with "map to canonical enum/value without re-judging the seller's assertion." The check examples are retained as the correct mapping behaviour.

**Finding 7 — Rebutted.** The AP- prefix for Anti-Patterns is a deliberate structural separation from the FIELD- heuristics. Anti-Patterns describe failure modes to avoid (design/implementation guidance), while FIELD- heuristics are falsifiable system invariants. The format contract requires heuristics prefixed FIELD- and anti-patterns as a separate named section — both requirements are satisfied. No change made.

**Finding 8 — Applied.** MINOR resolved. The F-03 Implications row now uses two independent fields: `tenure` (freehold/leasehold_30yr) and `quota_bucket` (foreign_quota/thai_quota), replacing the conflated single `ownership_type` enum. This correctly models that a Thai-quota unit can be sold freehold to a Thai national while requiring leasehold for a foreign buyer — the previous enum made that ambiguous.
