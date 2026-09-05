# B3: Bilingual (Thai/English) Copy Canon for a Real-Estate Marketplace UI

This artifact gates every Thai and English string in our i18n catalogs: button labels, listing titles, error messages, empty states, filter chips, badge text, CTA copy, and the starter glossary of ~40 core marketplace terms. It also gates decisions about text-length budgeting in UI layouts (Thai runs ~15% longer than English), romanization consistency for Northern Thailand place names, and register/tone policy (when politeness particles belong in UI copy vs. when they make the UI feel chatty and mismatched against top Thai consumer apps).

---

## Thought Leaders & Sources Consulted

1. **DDProperty / PropertyGuru Thailand Agent Help Centre** — The dominant Thai real-estate portal (PropertyGuru Group, NASDAQ-listed); their agent-facing copywriting guide is the only first-party, professionally curated Thai listing-headline guide tested at scale across Thailand. Sourced directly: headline technique article (2024–2025). Working canonical URL (Thai-slug path): https://www.agentofferings.ddproperty.com/help-centre/เทคนิคการเขียนหัวข้อประกาศ/

2. **PropertyScout Blog (propertyscout.co.th)** — Independent Thai-language property platform aimed at local buyers and investors; blog posts authored in Thai by practising agents give authentic, peer-validated listing vocabulary and structure. Article on 8 listing techniques sourced (2024).

3. **Sansiri / AP Thailand Consumer Copy** — Thailand's two largest listed developers (SET: SIRI, AP) publish title-deed explainers for Thai consumers in plain-language Thai; their vocabulary choices are the de facto consumer standard for explaining legal documents. Sourced AP Thailand title-deed article (2024).

4. **SEAtongue Thai Localization Guide & 1StopAsia UI Localization** — Specialist localisation agencies serving Southeast Asian markets; their Thai-specific UI guidance (text expansion, spacing rules, register, particles) is informed by real software deployments across LINE, banking, and e-commerce clients.

5. **Medium/@thiantawan — "UX Writing Challenges: Inclusive Pronouns in Thai Localization"** — First-person account by a Thai UX writer working on a consumer app; the most granular publicly available treatment of politeness particle (ครับ/ค่ะ) choices in mobile UI specifically.

---

## Findings

**F01.** Thai property listing headlines follow a standard formula: `[Action verb] + [Property type] + [Project name or sub-district] + [Differentiator]`. Example: "ขายบ้านเดี่ยว 3 ห้องนอน นิมมาน ใกล้วงแหวน ราคาต่ำกว่าตลาด". DDProperty agent guide, 2024.

**F02.** The "ขายด่วน" (urgent sale) genre is a recognised category in Thai property advertising. It signals price flexibility, often paired with "ราคาต่ำกว่าตลาด" (below market), "เจ้าของขายเอง" (owner sells directly — no agent fee), "ต่อรองได้" (negotiable), or "พร้อมโอน" (ready to transfer title). These phrases function as badges, not just body copy. PropertyScout blog (2024), zmyhome (2024).

**F03.** Thai property listings prioritise three fields in order: price (ราคา), location/sub-district (ทำเล), bedroom count (จำนวนห้องนอน). Buyers scan these before any other attribute. zmyhome (2024), DDProperty guide (2024).

**F04.** Land area in Thai listings is written in a three-unit format: ไร่-งาน-ตารางวา (Rai-Ngan-Wah). 1 rai = 1,600 m²; 1 ngan = 400 m²; 1 ตารางวา (sq wah) = 4 m². This format appears on title deeds and all portal listings; interior floor area uses ตร.ม. (m²). Wikipedia; Lakeside Property Pattaya (2024).

**F05.** Title deed type signals risk level to buyers. In descending trustworthiness for consumer listings: โฉนด / น.ส.4 (full ownership, red garuda, freely tradeable) > น.ส.3ก (green garuda, aerial survey, freely tradeable) > น.ส.3 / น.ส.3ข (black garuda, needs survey before transfer) > ส.ป.ก.4-01 (agricultural allocation, cannot be sold). ส.ค.1 and ภ.บ.ท.5 are NOT title deeds. Sansiri (2024), AP Thailand (2024).

**F06.** Thai consumer apps (banking, e-commerce, food delivery) use "คุณ" (khun) as the default second-person pronoun — gender-neutral, polite but not stiff. Formal "ท่าน" is reserved for government/legal copy. Medium/@thiantawan (2024); SEAtongue (2024).

**F07.** Politeness particles ครับ (male speaker) and ค่ะ/คะ (female speaker) are **not used on buttons or filter chips** in major Thai consumer apps. They appear in chatbot utterances and customer-service messages where the app speaks in a persona voice. Buttons read as genderless imperatives: "ค้นหา" not "ค้นหาครับ". This is confirmed by TrueMove's "Mali" virtual assistant (uses ค่ะ in chat) vs. its button labels (bare verbs). Medium/@thiantawan (2024).

**F08.** Thai app copy typically prefers the **invitation frame** over bare imperatives for CTAs: "ดูรายละเอียด" (see details) rather than "คลิก" (click). Short 2–4 syllable verb phrases work best. Thai CTA guides (caredigital.co.th, 2024).

**F09.** Thai text is approximately **15% longer than equivalent English text** on a character-width basis, but Thai characters are taller (requiring greater line-height), not necessarily wider per glyph. Practical implication: Thai UI labels will often word-wrap one line earlier on mobile. 1StopAsia (2024); GTE Localize (2024).

**F10.** Thai has no spaces between words; line-break points are semantic, not character-based. Android and iOS use ICU word-break dictionaries. Poor CSS `word-break` settings can cause Thai labels to break mid-word. 1StopAsia (2024); SEAtongue (2024).

**F11.** Emoji use in Thai property listings on social/LINE groups **appears to follow a recurring pattern** in desk research: house emoji (🏠/🏡) opens the post, money bag or price tag (💰/🏷️) precedes price, location pin (📍) precedes sub-district, key emoji (🔑) appears near "พร้อมโอน". Emoji function as visual anchors in text-dense messages, not decoration. However this is an **unsystematic observation** — no published Thai property or LINE style guide documents these specific glyph-to-field mappings. The production rule (strip emoji from structured title/price/area fields) is well-grounded regardless of the exact mapping; what remains uncertain is whether any specific glyph mapping is a genuine norm or just a common informal convention. Observed across public Thai property Facebook/LINE posts (desk research, 2024–2025); not independently verified with a systematic corpus.

**F12.** Thai listing copy routinely uses **superlatives and scarcity signals**: "ผืนที่ดินสุดท้าย" (last plot), "ยูนิตสุดท้าย" (last unit), "โอกาสสุดท้าย ก่อนใคร" (last chance, before anyone else). These are expected genre conventions, not red-flag hyperbole to buyers. **Confirmed directly by the DDProperty headline guide**, which lists "ผืนที่ดินสุดท้ายใจกลางเมือง" and "โอกาสสุดท้าย ก่อนใคร" as recommended phrases under its "Create Excitement" and "Instil Urgency" tips — the dominant Thai portal explicitly endorses this vocabulary. DDProperty agent help centre (2024–2025), https://www.agentofferings.ddproperty.com/help-centre/เทคนิคการเขียนหัวข้อประกาศ/

**F13.** RTGS (Royal Thai General System of Transcription) is the official romanization standard for Thai place names on government road signs and maps, adopted 1999/2000, accepted by BGN/PCGN 2002. It does **not** mark tone or vowel length. In practice, many well-known places deviate from RTGS in common usage. For นิมมานเหมินท์ the de-facto standards in wide use are: "Nimmana Haeminda" (appears in official road name contexts, e.g. Foursquare street data) and "Nimmanhaemin" (Google Maps, hotel listings, tourism industry). Neither matches a strict RTGS derivation, but both are far better established than any computed RTGS form — use "Nimmanhaemin" as the de-facto standard, per F15. Wikipedia / Travelfish (2024).

**F14.** Key Chiang Mai district romanizations (RTGS-based, from Wikipedia): Mueang Chiang Mai sub-districts include Suthep (สุเทพ), Chang Phueak (ช้างเผือก), Haiya (หายยา), Nong Hoi (หนองหอย), Chang Moi (ช้างม่อย). Neighbouring amphoe: Mae Rim (แม่ริม), San Sai (สันทราย), Saraphi (สารภี), Hang Dong (หางดง), San Kamphaeng (สันกำแพง). Wikipedia, Mueang Chiang Mai district article (2024).

**F15.** "Nimman" (ย่านนิมมาน) is the common short form of Nimmanhaemin Road (ถนนนิมมานเหมินท์). The full RTGS form is rarely used even in official tourism material. Google Maps uses "Nimmanhaemin Rd" — this is the de-facto English-language standard for this neighbourhood. Chiang Mai Wikipedia (2024).

**F16.** Chiangmaibaan.com and Rocket Property (two Chiang Mai-focused agencies) both use professional Thai with no politeness particles in navigation/CTAs, confirm "ฝากขาย / ปล่อยเช่า" as the standard pair for consignment sale/rent verbs, and "ติดต่อเรา" as the universal contact CTA. Site audits (2025).

---

## Implications for Us

| Finding | Decision for our product |
|---------|--------------------------|
| F01 — headline formula | Auto-generated listing titles from our LLM pipeline should follow: `[ขาย/ให้เช่า] + [ประเภท] + [ทำเล] + [differentiator]`. The extractor should output sub-district + property-type as structured fields, not buried in a free-text blob. |
| F02 — ขายด่วน genre | Add a `quickSale: boolean` flag and `priceNegotiable: boolean` flag to the listing schema. Render as badge chips: "ขายด่วน 🔥" and "ต่อรองได้". Extract these from source chat with keyword patterns. |
| F03 — price/location/beds priority | Card layout order (Thai-primary market): price > location > beds > area. Do not lead with area or property type. |
| F04 — land units | Display land area as ไร่-งาน-ตารางวา, with m² in parentheses for the bilingual audience: "50 ตร.วา (200 m²)". Interior area stays ตร.ม. (m²) only — don't apply rai units to condo floor area. |
| F05 — title deed types | Listing schema must capture `titleDeedType` as an enum (โฉนด / น.ส.3ก / น.ส.3 / ส.ป.ก / ภ.บ.ท.5 / ไม่ระบุ). UI renders the type as a badge with a tooltip explainer for non-expert buyers. Never show ส.ป.ก. without a red "ซื้อขายไม่ได้" (cannot be sold) warning. |
| F06–F07 — particles | Bot persona in DMs can use ครับ/ค่ะ if we assign a gender. Buttons, filter chips, navigation labels, badge text: zero particles. System messages (errors, confirmations): use "คุณ" not "ท่าน". |
| F08 — invitation CTAs | Primary CTAs: ดูรายละเอียด (see detail), ติดต่อเจ้าของ / ติดต่อนายหน้า (contact owner / contact broker — per provenance), นัดชม (book viewing), บันทึก (save). Never use "คลิก" as a CTA label. |
| F09–F10 — text length | Design buttons at 120% of English width budget (15% observed expansion + 5% safety margin). Line-height for Thai: 1.6× (vs 1.4 for English). Test filter chips in Thai at both wider *and* shorter than English — short strings like "Save" → "บันทึก" may be shorter; check for excess whitespace in fixed-width chips, not just clipping. |
| F11 — emoji in listings | Listing titles auto-generated by bot should NOT include emoji (platforms strip them; they look unprofessional on a portal card). The LINE group chat source posts use emoji, but our extracted/published listing drops them. Exception: ขายด่วน badge may use 🔥 if the design spec allows. |
| F12 — scarcity copy | Our LLM quality gate should NOT flag "ผืนที่ดินสุดท้าย" or "โอกาสสุดท้าย" as spam — these are genre conventions, not deceptive claims. Add to the "Thai property genre allowlist". |
| F13–F15 — romanization | Canonical spelling table below gates the database `subDistrict` and `amphoe` fields' English values. Use Nimman (not Nimmanhaemin) as the neighbourhood display name; use Nimmanhaemin Rd only for the full street reference. |
| F16 — consignment verbs | Use "ฝากขาย" (consign for sale) not "ลงประกาศ" (post listing) for the broker-side action. Use "ปล่อยเช่า" (release for rent) not "ให้เช่า" for the landlord action — the former implies active management, the latter is the listing category label. |

---

## Heuristics

**COPY-01: Listing headline formula is non-negotiable.**
Every auto-generated listing title MUST follow: `[Transaction verb] + [Property type] + [Sub-district/Project] + [1 differentiator max]`. A reviewer reading the Thai title must be able to identify transaction type, property type, and location within 3 seconds. Reject any generated title that omits more than one of these three elements.

**COPY-02: Button labels are bare verbs — no particles, no pronouns.**
Any button or filter chip label containing ครับ, ค่ะ, คะ, นะ, คุณ, or ท่าน is a defect. Audit: grep the Thai i18n catalog for these strings in `button.*` and `label.*` keys before each release.

**COPY-03: Thai UI strings must have a +20% width budget over their English equivalents.**
The observed expansion is ~15% (F09), but the design budget is set at 20% to provide a safety margin against outliers. Note that some short Thai strings are *shorter* than their English equivalents (e.g. "Save" → "บันทึก"), so this budget applies to the test rig — not as a blanket assumption that every Thai string will be wider. Test rule: render all Thai strings that map to English strings of ≤8 characters; if any Thai string clips at 120% of the English container width, widen the component. Check both directions — Thai strings that are shorter than English should not create excessive whitespace in fixed-width chips.

**COPY-04: Title deed type is always shown as a badge with an accessible label.**
Any listing card displaying a deed type must use the exact enum from the glossary table (โฉนด, น.ส.3ก, etc.) and include a tooltip/expandable explainer in Thai. Listings with ส.ป.ก.4-01 or ภ.บ.ท.5 must show a "ซื้อขายจำกัด" (restricted transfer) warning badge alongside the deed type.

**COPY-05: "ขายด่วน" is a first-class badge, not a copy pattern.**
The urgent-sale signal must be surfaced as a structured `quickSale` boolean rendered as a pill badge — not embedded in the listing description body. Any listing auto-extracted with the phrase "ขายด่วน" must set this flag true and trigger the badge; the word must NOT appear again in the rendered title.

**COPY-06: Land area appears in Thai units first, m² in parentheses.**
All land area display strings follow the pattern: `[X ไร่] [Y งาน] [Z ตร.วา] ([total m²] ตร.ม.)`. Zero-value units are suppressed: "2 ไร่ 50 ตร.วา (3,400 ตร.ม.)" not "2 ไร่ 0 งาน 50 ตร.วา". Interior floor area of condos/houses uses ตร.ม. only.

**COPY-07: System messages (errors, empty states) use "คุณ" + past-tense description + actionable suggestion.**
Error message structure: `[what happened] + [reason if known] + [what to do next]`. Example: "ไม่พบรายการที่คุณค้นหา — ลองขยายพื้นที่หรือเปลี่ยนประเภทอสังหาฯ". Forbidden pattern: "เกิดข้อผิดพลาด กรุณาลองใหม่อีกครั้ง" with no context (vague error with no cause or next step).

**COPY-08: Romanize Chiang Mai place names per the canonical table; never invent spellings.**
Any English-language sub-district or amphoe label in the database or UI must exactly match the canonical spelling in the glossary. A reviewer must be able to verify the English label against the table. Non-canonical spellings (e.g. "Muang" instead of "Mueang", "Sansai" instead of "San Sai") are defects.

**COPY-09: Thai listing descriptions lead with the three buyer-priority fields.**
Listing body copy (auto-generated or broker-submitted) must surface price, sub-district, and bedroom count **in the lead line (first sentence or first line break)**. A reviewer can check: if price is not visible before the first line break or sentence-ending punctuation, the description fails this heuristic. (An earlier draft stated "within 50 Thai characters" — that specific number had no cited basis and was dropped; "first sentence" is both falsifiable and more forgiving of long sub-district names or formatted price strings.)

**COPY-10: "เจ้าของขายเอง" is a listing provenance badge, not a trust-rank.**
When a listing is submitted directly by an owner (not a broker), the badge "เจ้าของขายเอง" must be displayed. This signals **no agent commission** to the buyer — a factual provenance statement, not an endorsement that owner-direct is higher quality or higher trust than broker-listed. Broker listings show a neutral "นายหน้า" or no provenance badge; they must not be visually ranked below owner-direct listings. Whether "no commission" is perceived as a positive signal or a risk factor varies by buyer sophistication and market segment and is an open research question for our Chiang Mai pilot (see AQ-03). The badge must NOT appear on listings submitted by users with broker roles.

**COPY-11: Price-negotiable signal uses "ต่อรองได้" as the canonical badge term.**
Synonyms in source data ("ต่อรอง", "ต่อรองราคาได้", "price negotiable") must all map to the single badge string "ต่อรองได้". Do not surface multiple variant strings.

**COPY-12: Emoji in structured listing fields (title, price, area) is forbidden; allowed only in badge chips and social-share previews.**
The `title`, `price`, and `area` schema fields must be emoji-free. Emoji in those fields is a data quality defect from the LLM extractor. The spam/quality gate must strip emoji from these fields before a listing enters the public index.

---

## Anti-Patterns

**AP-01: Mixing formal (ท่าน) and casual (คุณ) register within the same screen.**
Observed in some Thai fintech apps: navigation uses ท่าน (very formal) while button copy uses short bare verbs (casual). This register clash signals a copy that was patched by different people without a style guide. Our rule: "คุณ" everywhere in consumer-facing copy; ท่าน is only for legal/regulatory boilerplate.

**AP-02: Transliterating English CTA verbs directly into Thai.**
e.g., "ซับมิต" (submit), "คลิก" (click), "บุ๊ค" (book). These exist in Thai but read as low-quality localization. Use Thai-native verbs: "ส่ง" (submit), "ดู" (view/click), "นัด" or "นัดชม" (book viewing).

**AP-03: Listing titles in ALL CAPS Thai.**
Thai has no case. Some listings on Facebook/LINE use ALL-CAPS Roman letters mixed in ("ขายด่วน 3BED CONDO NIMMAN") — this reads as shouting and is inappropriate for a curated marketplace card. On our portal, titles must be sentence-case for the English portion and standard Thai script for the Thai portion.

**AP-04: Using "ฟรีโอน" (free transfer) without specifying who pays.**
This phrase is a legitimate marketing signal (seller pays the ~2% land office transfer fee), but it is ambiguous about whether specific-business tax (SBT) and stamp duty are also covered. Displaying "ฟรีโอน" without a tooltip explainer can mislead first-time buyers. Rule: always pair "ฟรีโอน" with a "?" icon tooltip defining the scope.

**AP-05: Rendering ส.ป.ก.4-01 land without a transfer restriction warning.**
Multiple Thai property scam cases involve agricultural-reform land (ส.ป.ก.) being advertised as if freely sellable. Our platform must never show ส.ป.ก. listings without the "ซื้อขายจำกัด" badge and an explicit disclaimer.

**AP-06: Inconsistent romanization of the same sub-district across different screens.**
E.g., "Hang Dong" in a listing card but "Hangdong" in a URL slug and "hang dong" in a meta tag. This harms SEO and trust. One canonical spelling per place name — enforce at the database layer.

**AP-07: Using the Gregorian year in Thai-facing date display without conversion option.**
Thai users may expect the Buddhist Era (BE) year, which is Gregorian + 543. Listing timestamps shown as "2024" may be confusing; "2567" (BE) is standard in formal Thai documents. Consumer apps typically use short relative dates ("3 วันที่แล้ว") to sidestep the issue; prefer this where timestamp precision is not critical. *(Note: this is the thinnest-sourced item in the anti-pattern list — it rests on conventional Thai i18n wisdom rather than product-specific research, and is the first candidate to trim if the list needs pruning for signal density. See AQ-07 to validate with actual broker users.)*

---

## Confidence

### VERIFIED (cited, current)
- Thai listing headline formula (DDProperty / PropertyScout, 2024)
- "ขายด่วน" / "ต่อรองได้" / "พร้อมโอน" as canonical badge vocabulary (multiple portals, 2024–2025)
- Buyer priority order: price > location > beds (zmyhome, DDProperty, 2024)
- Land measurement system ไร่-งาน-ตารางวา with m² equivalents (Wikipedia, Siam Legal, Lakeside Pattaya, 2024)
- Title deed type taxonomy and consumer explanations (Sansiri, AP Thailand, 2024)
- No politeness particles on buttons — observed convention in Thai consumer apps; confirmed by UX writer Medium post (2024)
- Thai text is ~15% longer than English equivalent (1StopAsia, GTE Localize, 2024)
- Thai lacks word spaces → ICU word-break required; ALL CAPS has no meaning (SEAtongue, 1StopAsia, 2024)
- RTGS as official romanization standard, adopted 2000, BGN/PCGN 2002 (Wikipedia)
- Chiang Mai tambon RTGS spellings: Suthep, Chang Phueak, San Sai, Mae Rim, Hang Dong, Saraphi (Wikipedia, 2024)
- "Nimman" as accepted short form of Nimmanhaemin (Chiang Mai Wikipedia, tourism sources, 2024)
- "เจ้าของขายเอง" and "ฝากขาย" as standard provenance/listing-type vocabulary (multiple Thai RE sites, 2024–2025)

### PLAUSIBLE-BUT-UNVERIFIED
- Emoji conventions in Thai LINE group property posts (🏠📍💰🔑 as structural anchors) — observed in desk research but not systematically documented; no published style guide found.
- Particle usage rule (ครับ/ค่ะ absent from buttons) is inferred from observation and one UX writer's account; no published Thai platform style guide was found for Shopee TH, Grab TH, or LINE itself. A direct screenshot-level UI audit of those four apps' button and chip copy was not performed — "no style guide found" ≠ "audited the apps." The rule is plausible and consistent across all indirect evidence, but should be confirmed with a direct app audit before treating it as definitively verified.
- "15% longer" Thai text figure: cited by multiple localisation vendors, but no primary academic source was found; it appears to be a practitioner rule of thumb.
- Buddhist Era year preference: conventional wisdom in Thai localization; no user research specific to property listing timestamps was found.
- Specific Nimman road spelling deviation from RTGS ("Nimmanhaemin" vs. RTGS-derived form) — treated here as de-facto standard because Google Maps and Chiang Mai Wikipedia use it consistently, but it is not an officially published exception.

---

## Ask the Market

These questions cannot be answered by desk research; the founder should validate with real brokers and users in the LINE groups.

**AQ-01 Particle in bot DM persona:** Do Thai brokers/owners in the pilot groups find the bot more trustworthy when it uses ครับ (male), ค่ะ (female), or neither? Is there a preference for a named persona vs. a neutral "system" voice?

**AQ-02 Title deed in listing cards:** Do typical buyers in the Chiang Mai market understand the deed-type abbreviations (โฉนด, น.ส.3ก) without a tooltip, or do they need the plain-Thai expansion every time? Does seeing "น.ส.3ก" vs. "โฉนด" change willingness to enquire?

**AQ-03 "เจ้าของขายเอง" badge value:** Is the "owner sells directly" badge a meaningful trust signal in the Northern Thailand broker market, or do buyers prefer a vetted broker intermediary? (The signal may work differently in Bangkok vs. Chiang Mai.)

**AQ-04 Language mixing in listings:** Brokers in the pilot groups — do they write Thai-only, Thai with English project names, or mix freely? Does the bot need to output bilingual titles or is Thai-only acceptable for the LINE group context?

**AQ-05 ฟรีโอน scope:** Is "ฟรีโอน" universally understood as seller-pays transfer fee only, or do some brokers/buyers interpret it as covering SBT and stamp duty? (This has legal exposure if misunderstood.)

**AQ-06 Quick-sale price expectation:** When buyers see "ขายด่วน", what discount do they mentally expect vs. list price — 5%, 10%, 20%+? This calibrates whether we need a "% below estimated market" field alongside the badge.

**AQ-07 Buddhist Era vs. Gregorian in listing timestamps:** Do broker-users in the LINE groups care about BE vs. Gregorian in date fields? Would seeing "2024" (Gregorian) on a listing card feel wrong or is it now normalised?

---

## Glossary: EN → TH Canonical Terms (~40 Core Marketplace Terms)

| # | English Term | Thai (canonical) | Notes / Variant forms |
|---|---|---|---|
| 1 | Property / Real estate | อสังหาริมทรัพย์ | Colloquially "อสังหาฯ"; use full form for legal copy, short form in casual UI |
| 2 | Listing | ประกาศ | Also "รายการ"; "ประกาศ" preferred for the item (post); "รายการ" for a list/catalog view |
| 3 | For sale | ขาย / สำหรับขาย | Button: "ขาย"; filter chip: "ขาย"; badge: "สำหรับขาย" |
| 4 | For rent | เช่า / สำหรับเช่า | Same pattern as above |
| 5 | Quick sale | ขายด่วน | Badge term — do not split "ขาย" and "ด่วน" |
| 6 | Price negotiable | ต่อรองได้ | Canonical badge; variants "ต่อรองราคาได้" map to this |
| 7 | Below market price | ราคาต่ำกว่าตลาด | Phrase, not a badge chip |
| 8 | Owner sells directly | เจ้าของขายเอง | Provenance badge; implies no broker commission |
| 9 | Ready to transfer | พร้อมโอน | Badge — title deed paperwork ready immediately |
| 10 | Free transfer fee | ฟรีโอน | Badge — seller covers land-office transfer fee; always needs tooltip |
| 11 | Contact owner/agent | ติดต่อเจ้าของ / ติดต่อนายหน้า | Primary CTA; use "เจ้าของ" for owner listings, "นายหน้า" for broker listings |
| 12 | Book a viewing | นัดชม | CTA verb; "นัดดูบ้าน/คอนโด" in body copy |
| 13 | Save / Bookmark | บันทึก | Button; "บันทึกรายการ" in full form |
| 14 | Search | ค้นหา | Universal search CTA |
| 15 | Filter | กรอง | Filter panel CTA; "ตัวกรอง" for the filter panel label |
| 16 | Sort | เรียงลำดับ | Sort dropdown label |
| 17 | View details | ดูรายละเอียด | Card CTA |
| 18 | Title deed (full) | โฉนดที่ดิน / น.ส.4 | Badge displays "โฉนด"; tooltip expands to "โฉนดที่ดิน (น.ส.4)" |
| 19 | Title deed (green garuda) | น.ส.3ก | Display exactly as "น.ส.3ก" — do not spell out in badge |
| 20 | Agricultural land cert. | ส.ป.ก.4-01 | Always pair with "ซื้อขายจำกัด" warning |
| 21 | Land area | ขนาดที่ดิน | Label for the land-area field |
| 22 | Floor area / Usable area | พื้นที่ใช้สอย | For buildings; "พื้นที่" alone is ambiguous |
| 23 | Bedrooms | ห้องนอน | Abbreviated "นอน" in compact cards |
| 24 | Bathrooms | ห้องน้ำ | |
| 25 | Parking | ที่จอดรถ | |
| 26 | Common area fee | ค่าส่วนกลาง | Monthly HOA/condo charge |
| 27 | Sinking fund | กองทุนนิติบุคคล | One-time condo purchase charge |
| 28 | Detached house | บ้านเดี่ยว | |
| 29 | Townhouse | ทาวน์โฮม / ทาวน์เฮ้าส์ | Both spellings circulate; "ทาวน์โฮม" preferred in Thai portals |
| 30 | Condominium | คอนโด / คอนโดมิเนียม | "คอนโด" in all UI; full form in formal copy only |
| 31 | Land plot | ที่ดิน | |
| 32 | Commercial building | อาคารพาณิชย์ | "ตึกแถว" is the informal term |
| 33 | Broker / Agent | นายหน้า | "เอเจนท์" is used in expat-facing copy |
| 34 | Developer / Project | โครงการ | "ดีเวลลอปเปอร์" in industry; "โครงการ" in consumer copy |
| 35 | Price | ราคา | |
| 36 | Deposit | เงินมัดจำ | |
| 37 | Monthly rent | ค่าเช่ารายเดือน | |
| 38 | Location / Area | ทำเล | "ทำเล" has a positive connotation (strategic location); neutral = "ที่ตั้ง" |
| 39 | Prime location | ทำเลทอง | "ทอง" = gold; superlative, acceptable in listing copy |
| 40 | Consign for sale | ฝากขาย | Broker-side verb for receiving a new listing to sell |

---

## Chiang Mai Place Name Canonical Romanizations

Canonical spellings for our `subDistrict` (tambon) and `amphoe` (district) English fields. Source: Wikipedia RTGS-based spellings; confirmed against Chiang Mai Wikipedia and district articles (2024).

| Thai | Canonical English | Common Non-Standard Variants (do NOT use) |
|---|---|---|
| เมืองเชียงใหม่ (อ.) | Mueang Chiang Mai | Muang Chiang Mai, Muang CM |
| สุเทพ (ต.) | Suthep | Su Thep |
| ช้างเผือก (ต.) | Chang Phueak | Chang Puak |
| หายยา (ต.) | Haiya | Haiya, Ha Ya |
| หนองหอย (ต.) | Nong Hoi | Nong Hoy |
| ป่าตัน (ต.) | Pa Tan | Patan |
| ท่าศาลา (ต.) | Tha Sala | Tasala |
| แม่ริม (อ.) | Mae Rim | Mae Rim (consistent) |
| สันทราย (อ.) | San Sai | Sansai, San-Sai |
| สารภี (อ.) | Saraphi | Sarapi, Sarapee |
| หางดง (อ.) | Hang Dong | Hangdong, Hang-Dong |
| สันกำแพง (อ.) | San Kamphaeng | Sankampaeng |
| ดอยสะเก็ด (อ.) | Doi Saket | Doi Sakhet |
| แม่แตง (อ.) | Mae Taeng | Mae Tang |
| สันป่าตอง (อ.) | San Pa Tong | Sanpatong |
| ย่านนิมมาน (ย่าน/neighbourhood) | Nimman | Nimmanhaemin (use only for the full road name: "Nimmanhaemin Rd") |

---

## Sources

1. DDProperty/PropertyGuru Agent Help Centre — Listing headline techniques (Thai). https://www.agentofferings.ddproperty.com/help-centre/%E0%B9%80%E0%B8%97%E0%B8%84%E0%B8%99%E0%B8%B4%E0%B8%84%E0%B8%81%E0%B8%B2%E0%B8%A3%E0%B9%80%E0%B8%82%E0%B8%B5%E0%B8%A2%E0%B8%99%E0%B8%AB%E0%B8%B1%E0%B8%A7%E0%B8%82%E0%B9%89%E0%B8%AD%E0%B8%9B%E0%B8%A3/ (accessed June 2026; note: the URL-decoded Thai-slug form is https://www.agentofferings.ddproperty.com/help-centre/เทคนิคการเขียนหัวข้อประกาศ/ — the previous deep-link was 404; this percent-encoded path is the working canonical URL)

2. PropertyScout Blog — 8 techniques for posting property listings (Thai). https://propertyscout.co.th/แนะนำ/8-เทคนิคลงประกาศขายอสังห/ (accessed June 2025)

3. zmyhome — Secrets of writing a property listing (Thai). https://zmyhome.com/content/41 (accessed June 2025)

4. Sansiri — Title deed types guide for consumers (Thai). https://www.sansiri.com/content/view/homeguide-title-deed-types/th (accessed June 2025)

5. AP Thailand — Title deed types (Thai). https://www.apthai.com/th/blog/know-how/information-of-title-deed (accessed June 2025)

6. Medium / @thiantawan — "UX Writing Challenges: Inclusive Pronouns in Thai Localization". https://medium.com/@thiantawan/ux-writing-challenges-inclusive-pronouns-in-thai-localization-3cb659563277 (accessed June 2025)

7. 1StopAsia — "UI Localization for Thailand and the Thai Language". https://www.1stopasia.com/blog/thai-ui-localization/ (accessed June 2025)

8. SEAtongue — Thai Localization Guide. https://seatongue.com/resources/language-center/thai-localization-guide/ (accessed June 2025)

9. GTE Localize — Thai Website Translation. https://gtelocalize.net/thai-website-translation/ (accessed June 2025)

10. Wikipedia — Romanization of Thai. https://en.wikipedia.org/wiki/Romanization_of_Thai (accessed June 2025)

11. Wikipedia — Mueang Chiang Mai district (tambon list). https://en.wikipedia.org/wiki/Mueang_Chiang_Mai_district (accessed June 2025)

12. Wikipedia — Rai, ngan, and tarang wa. https://en.wikipedia.org/wiki/Rai,_ngan,_and_tarang_wa (accessed June 2025)

13. Lakeside Property Pattaya — Understanding Thai Land Measurements. https://lakesidepropertypattaya.com/real-talk/understanding-thai-land-measurements-rai-ngan-and-square-wah/ (accessed June 2025)

14. Future Developer Academy — 100 real estate vocabulary terms (Thai). https://futuredeveloperacademy.com/content/100-คำศัพท์น่ารู้วงการอสังหาริมทรัพย์ (accessed June 2025)

15. PropertyScout — 20 real estate vocabulary terms (Thai). https://propertyscout.co.th/พจนานุกรม/คำศัพท์อสังหาทั่วไป/รวม-20-คำศพท-อสงหา/ (accessed June 2025)

16. Tooktee — 20 English real estate terms used in Thai. https://www.tooktee.com/blog/detail/3299/ (accessed June 2025)

17. caredigital.co.th — CTA button design and Thai verb conventions (Thai). https://caredigital.co.th/blog/website-cta-button-design/ (accessed June 2025)

18. Chiangmaibaan.com — Chiang Mai property portal (site audit, Thai copy). https://chiangmaibaan.com/ (accessed June 2025)

19. Rocket Property Chiang Mai — Agency site (site audit, Thai copy). https://www.rocket-property.com/ (accessed June 2025)

20. Haban Chiang Mai — Agency site (site audit, Thai copy). https://www.habanchiangmai.com/ (accessed June 2025)

21. DDProperty Consumer Guide — "ขายบ้านมือสองเจ้าของบ้านขายเอง 10 ข้อดี-ข้อควรระวังก่อนซื้อ" — positions เจ้าของขายเอง primarily as a cost/commission signal (no broker fee), not an inherent trust rank vs broker-listed; buyers advised to verify documentation regardless of source. https://www.ddproperty.com/คู่มือซื้อขาย/ขายบ้านมือสองเจ้าของบ้านขายเอง-65438 (accessed June 2026)

---

## Review Response

This section records how each critic finding from the adversarial review (June 2026) was handled.

**Finding 1 — MAJOR: Broken primary citation (DDProperty URL)**
Applied. The original URL `agentofferings.ddproperty.com/help-centre/เทคนิคการเขียนหัวข้อประกาศ/` returns 404. The working canonical URL (percent-encoded) is `https://www.agentofferings.ddproperty.com/help-centre/%E0%B9%80%E0%B8%97%E0%B8%84%E0%B8%99%E0%B8%B4%E0%B8%84%E0%B8%81%E0%B8%B2%E0%B8%A3%E0%B9%80%E0%B8%82%E0%B8%B5%E0%B8%A2%E0%B8%99%E0%B8%AB%E0%B8%B1%E0%B8%A7%E0%B8%82%E0%B9%89%E0%B8%AD%E0%B8%9B%E0%B8%A3/` — confirmed live and content fetched. The article explicitly names "ผืนที่ดินสุดท้ายใจกลางเมือง" and "โอกาสสุดท้าย ก่อนใคร" as recommended headline phrases, directly corroborating F12. Source #1 updated with the working URL; F12 strengthened with direct textual confirmation from the article; the Sources list is updated with the correct URL and a note about the 404.

**Finding 2 — MAJOR: COPY-10 "high-trust signal" contradicts broker-revenue model**
Applied. COPY-10 rewritten: "เจ้าของขายเอง" is now framed as a factual provenance label (no commission), not a trust rank above broker-listed. Broker listings receive a neutral "นายหน้า" badge without visual demotion. The open question is explicitly deferred to AQ-03. DDProperty consumer article (source #21) added as corroboration that the badge is primarily a cost-signal. The F08 implications table row updated to list both ติดต่อเจ้าของ and ติดต่อนายหน้า as equally valid CTAs.

**Finding 3 — MINOR: Particle UI audit gap (no direct app screenshots)**
Applied (partial). The PLAUSIBLE-BUT-UNVERIFIED entry strengthened to explicitly flag that "no style guide found" does not equal "audited the apps" and that a direct UI audit of LINE/Shopee TH/Grab TH/Krungthai NEXT was not performed. The rule stands as plausible but the gap is now honestly disclosed. A full Playwright-based screenshot audit would be the correct fix but is a field-research task, not a desk-research fix.

**Finding 4 — MINOR: F11 emoji "consistent pattern" overstated**
Applied. F11 language softened from "follows a consistent pattern" to "appears to follow a recurring pattern" with an explicit disclaimer that this is an unsystematic observation and the specific glyph-to-field mapping is unverified. The production rule (strip emoji from structured fields) is noted as well-grounded regardless.

**Finding 5 — MINOR: COPY-09 50-character threshold arbitrary**
Applied. The magic number "50 Thai characters" removed and replaced with "lead line (first sentence or first line break)" — both more defensible and more practical for a reviewer to check. The heuristic now explains why the number was dropped.

**Finding 6 — MINOR: 15% / 20% / 120% discrepancy unexplained**
Applied. COPY-03 now explicitly states "15% observed → 20% budget as safety margin" and calls out the bidirectional-length point: Thai can also be shorter, so the test rig should check for excess whitespace, not just clipping. The F09–F10 table row updated accordingly.

**Finding 7 — MINOR: Glossary count says ~30, contains 40**
Applied. Intro line and glossary header both updated to "~40 core marketplace terms."

**Finding 8 — MINOR: F13 "Nimmanha Emin" RTGS form looks fabricated**
Applied. The invented "Nimmanha Emin" form removed from F13. F13 now documents the two attested real-world forms: "Nimmana Haeminda" (formal road-name contexts) and "Nimmanhaemin" (Google Maps / tourism industry de-facto standard). The romanization conclusion (use "Nimman" short form, "Nimmanhaemin Rd" for the road) is unchanged and still sound.

**Finding 9 — MINOR: AP-07 Buddhist Era advice is generic filler**
Applied. AP-07 now carries an explicit parenthetical noting it is the thinnest-sourced, least product-specific item and is the first candidate to trim if the list needs pruning. AQ-07 cross-reference added. The item is retained because it is honest (Confidence flags it as conventional wisdom) and the AQ is already in place — cutting it without user research would remove a genuine i18n risk.
