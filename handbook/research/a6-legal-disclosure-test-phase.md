# A6: Legal / Disclosure — Test-Phase Checklist

**NOT LEGAL ADVICE.** This document is an engineering checklist and product decision guide produced from desk research. It does not constitute legal advice and does not substitute for consultation with a qualified Thai lawyer. Laws and PDPC guidance change; verify currency before acting.

**Scope.** This artifact gates two concrete decisions: (1) the exact text of the bot's group-join message and the DM opt-in flow — what must be said and when — and (2) which full-compliance items may be parked for the test phase and which cannot. It does not cover unrelated compliance (tax, financial services, land law enforcement). The product collects property listings passively from LINE broker/owner groups, stores names and phone numbers of posters, and publishes listings publicly only after explicit poster opt-in.

---

## Thought leaders & sources consulted

1. **Tilleke & Gibbins (Bangkok, multiple 2022–2025 PDPA publications)** — Thailand's largest data-protection-specialist law firm by PDPA output. Their operational guidance on lawful basis (2023), consent/notification guidelines (Sep 2022), deletion rules (2024), and enforcement fines (Aug 2025) tracks every material PDPC notification. Cited by IAPP and Chambers. Used as primary law-firm source throughout.

2. **Chambers & Partners — Data Protection & Privacy 2026 Thailand (country chapter, Tilleke & Gibbins authors)** — Peer-reviewed annual guide reflecting the state of PDPA enforcement as of late 2025 / early 2026. Highest-signal single-document summary of where enforcement actually lands vs. where the text sits.

3. **PDPA Thailand (pdpathailand.com) — "LINE Group PDPA" article + Privacy Notice template** — Thai-language specialist advisory site (not a law firm, but authored by PDPA practitioners). Directly addresses LINE group chat liability: when the group creator is the data controller, what safeguards to implement, and sample privacy-notice structure. One of few Thai-language sources applying PDPA to the LINE context specifically.

4. **DLA Piper — Data Protection Laws of the World: Thailand (2024 edition)** — Annually updated country profile; strong on breach notification, lawful bases table, cross-border transfer rules. Used to cross-check Tilleke's readings.

5. **Herbert Smith Freehills Kramer / Chambers 2026 — PDPC Eagle Eye + Worldcoin enforcement (2025)** — Best contemporaneous source on the PDPC's shift to proactive monitoring (dark-web scans, social media) and heightened scrutiny of consent voluntariness when an incentive accompanies data collection. Directly relevant because our bot's passive extraction is analogous to an automated collector that group members have not explicitly consented to.

---

## Findings

1. **PDPA is fully in force; the grace period is over; enforcement has escalated rapidly.** Thailand's Personal Data Protection Act B.E. 2562 (2019) took full legal effect 1 June 2022. The PDPC imposed its first administrative fine in August 2024 — THB 7 million against a major private company for no DPO, inadequate security, and failure to notify a breach (Tilleke, "Landmark Fine," Aug 2024; IAPP "First Fine," Aug 2024). In August 2025 the PDPC then issued the largest tranche of fines to date: THB 21.5 million across five further cases spanning state agencies, hospitals, a technology retailer, a cosmetics company, and a collectibles processor (Tilleke, "More than a Warning," Aug 2025; Chambers 2026). PDPC Eagle Eye unit now monitors dark web and social media independently, meaning enforcement can be triggered without a complainant.

2. **A third-party bot that collects and processes chat content from a LINE group is a data controller under PDPA for the data it extracts, even though it did not create the group.** Two distinct scenarios apply different analysis. (a) *Group-creator controller*: when an organisation creates and operates a LINE group for internal or customer communication, it is unambiguously the data controller for everything in that group — this is the case pdpathailand.com's "แชทหลุด!" article directly addresses. (b) *Third-party bot joining an existing group* (our case): PDPA §§ 6 and 26 define a data controller as any person who has the authority to make decisions regarding the collection, use, or disclosure of personal data. A bot operator that instructs the bot to extract, store, and publish listing data clearly exercises that decision-making authority over what it extracts — making the bot operator a data controller for extracted data, independent of who created the group. The group owner/admin is simultaneously a controller for their own group operations; both can be controllers for overlapping data under PDPA. Primary liability for extracted data processing rests with the bot operator. Note: the pdpathailand.com source addresses the group-creator scenario; the third-party-bot-as-controller conclusion is an application of §§ 6/26 reasoning corroborated by PDPA's technology-neutral definition. (pdpathailand.com, "แชทหลุด!", accessed Jun 2026; PDPA B.E. 2562 §§ 6, 26)

3. **The required lawful basis for collecting chat content from willing participants is likely legitimate interest — but only with full prior notification.** Consent is the cleanest basis but faces a structural problem: consent must be obtained "before or at the time of collection." A passive bot that joins a group and starts extracting before members acknowledge it likely cannot rely on prior consent from all historical participants. Legitimate interest (§ 24(5)) is a valid alternative if: (a) the controller documents the balance test, (b) the interest is genuine (property marketplace) and does not override members' fundamental rights, and (c) members are informed at or before the point of collection. In practice, a group-join disclosure + opt-out mechanism covers both consent and LI bases simultaneously. (Tilleke & Gibbins, "Operationalising PDPA — Lawful Basis," 2023; Future of Privacy Forum, "Limits of Consent," 2022)

4. **What must be disclosed before or at collection — the mandatory notification items (§ 23 PDPA + PDPC Sep 2022 Guidelines).** The canonical combined list of nine required items, drawn from § 23's enumerated sub-items and the September 2022 PDPC notification guidelines, is: (a) identity and contact details of the data controller; (b) purpose of collection, use, and disclosure; (c) legal basis relied upon (added by Sep 2022 PDPC guidelines); (d) categories of personal data to be collected; (e) retention period; (f) whether the person is required by law or contract to provide data, and consequences of not providing it (§ 23 sub-item); (g) whether data will be shared with third parties and categories of recipients; (h) whether data will be transferred cross-border and applicable safeguards (added by Sep 2022 PDPC guidelines); (i) data-subject rights (access, correction, deletion, objection, portability, withdrawal, complaint to PDPC — §§ 19, 30–36, 73). Language must be "clear, concise, and easy to understand" (กระชับรัดกุม โปร่งใส เป็นภาษาที่เข้าใจได้ง่าย). Note: items (c) and (h) derive from the 2022 PDPC guidelines layered on top of § 23's statutory floor; items (b), (d), (e), (f), (g), and (i) are directly in § 23. The "complaint to PDPC" right is included within item (i) as one of the data-subject rights enumerated in §§ 73/30–36, not a standalone § 23 item. (PDPA § 23; PDPC Notification on Consent/Notification Guidelines, 7 Sep 2022, via Tilleke &amp; Gibbins; pdpathailand.com § 23 article)

5. **Publishing a listing publicly requires the poster's explicit opt-in — this is a hard PDPA consent requirement, not just a product feature.** A listing that includes the poster's name, phone number, LINE ID, or any identifier linking a property to a person is personal data processing for a new purpose (public disclosure). Changing purpose from "private to group members" to "public website" requires a new, specific consent. The existing product design (explicit DM opt-in before public publication) satisfies this requirement. (PDPA § 24, § 25; PDPC consent guidelines)

6. **Consent withdrawal must be as easy as consent, and the bot must stop processing on withdrawal.** A data subject who withdraws consent must be able to do so "at any time, as easily as they gave it." On withdrawal the controller must stop processing for that purpose and must inform the data subject of consequences before they decide. Withdrawal does not affect prior lawful processing. (PDPA § 19(3); PDPC Consent Guidelines Sep 2022; Securiti.ai, "Consent Requirements," 2024)

7. **Deletion requests must be fulfilled within 90 days of the request.** The PDPC Notification on Deletion/Destruction/De-identification took effect 11 November 2024. Deletion must ensure "no one is able to recover or reverse personal data to identify the data subject." Direct identifiers that must be removed include: name, surname, phone number, email, LINE ID, biometric data, membership number. The controller must notify the data subject when done. (Tilleke & Gibbins, "Thailand Issues Criteria for Deletion," Aug 2024; PDPC Notification effective 11 Nov 2024)

8. **Data breach notification: 72 hours to PDPC if risk to individuals' rights.** Under § 37(4) PDPA and the PDPC Breach Notification Notification (effective Oct 2023), controllers must report to PDPC within 72 hours of awareness of a breach that poses risk to rights and freedoms. Low-risk breaches (e.g., misdirected non-sensitive email) are exempt but must be documented. Force-majeure extension: up to 15 days with explanation. Fine for late notification: up to THB 3 million. (IAPP, "PDPC Clarifies Data Breach Notification," 2025; DLA Piper TH profile 2024)

9. **Cross-border transfer (AWS ap-southeast-1 / Singapore) requires disclosure but likely not separate consent for cloud hosting.** The March 2024 PDPC notifications on cross-border transfers established that "transfer of personal data to a cloud computing service provider where no third party has access" does not qualify as a regulated cross-border transfer. AWS's data processing agreement with the customer and ISO 27018 certification provide appropriate safeguards for actual cross-border disclosure scenarios. If data is ever shared with a third party in a non-whitelist country, the data subject must be informed of inadequate protection and consent obtained. No country is currently on the PDPC whitelist. (Securiti.ai, "Thailand Cross-Border Transfer," 2024; AWS Thailand Data Privacy page; Baker McKenzie, "New Cross-Border Rules," Feb 2024)

10. **Enforcement is sector-agnostic; the PDPC fined a technology retailer THB 7 million for lacking a DPO, inadequate security, and failure to report a breach — not for a systemic campaign.** A small startup collecting personal data at scale without documented security measures, a breach response plan, and a designated data-contact person faces the same exposure pattern as larger firms. DPO is required only for "large-scale, regular, and systematic monitoring" — threshold undefined, but the PDPC has not acted against small operators purely for no DPO. (Tilleke & Gibbins, "More than a Warning," Aug 2025; PDPC Notification on DPO, Jul 2023)

11. **Thailand's Consumer Protection Act (B.E. 2522) prohibits false, exaggerated, or misleading property advertising.** Claims in listings must reflect the property accurately. Listings entered via passive AI extraction carry a risk that extracted details are wrong (size, price, title type). An "information is provided by the poster; verify independently" disclaimer does not fully insulate the platform but reduces exposure if the error was not due to platform negligence. A forthcoming Platform Economy Act (draft Jan 2025, public comment closed Feb 2025) may add platform liability rules for online intermediaries. (Lexology/galalaw.com, "Enhancing Consumer Protection: New Advertising Notification," 2024; Consumer Protection Act B.E. 2522)

12. **Foreign-ownership advice carries legal-service exposure.** Statements about condominium foreign quota, 30-year leasehold, BOI land rights, or nominee legality constitute legal advice if presented as applicable to a user's situation. Disclaimers must be explicit: "listings and information are not legal advice; consult a qualified Thai lawyer." This is standard practice on DDProperty, FazWaz, etc. (Pimlegal.com, "Real Estate Legalities," Dec 2024; Siam Legal Thailand property FAQ)

13. **The PDPC moved to proactive, incentive-scrutiny enforcement in 2025.** The Worldcoin case (Nov 2025, 1.2 million iris records ordered deleted) shows heightened scrutiny of consent voluntariness when a benefit accompanies data collection. While the Worldcoin case involved direct financial inducement (crypto payments for iris scans) rather than group-membership dynamics, it establishes the PDPC's posture: the regulator will examine whether the surrounding circumstances allowed data subjects to genuinely refuse. For our product, the applicable concern is the § 19 "freely given" standard — group members must be assured that opting out of the bot has zero effect on their group access. (Chambers & Partners, Data Protection & Privacy 2026, Thailand Trends)

14. **[OPERATIONALLY URGENT — TEST PHASE] Groups the bot is already in require retroactive disclosure before extraction continues.** LEGAL-01 requires the group-join notification to be sent before any extraction occurs. For groups the bot *newly joins*, this is automatic. But for any groups the bot was already in at the time this policy is established (the current test groups), no prior group-join disclosure was sent. PDPA's obligation to notify at or before the point of collection means extraction from those groups is currently proceeding without the required notification. The fix is a one-time targeted action: post the LEGAL-01 compliant disclosure message to each existing test group immediately, before the next extraction cycle, and log the timestamp. This is the most operationally urgent gap for the current test phase — every other finding can be addressed iteratively, but this one is a live PDPA notification failure. (PDPA § 23; PDPC Sep 2022 Guidelines; applies to all groups the bot was invited to prior to this policy being documented)

---

## Implications for us

| Finding | Concrete decision |
|---|---|
| F1 — enforcement active | Cannot treat PDPA as theoretical; group-join message and DM opt-in copy are required before any user-facing test with real groups |
| F2 — bot = data controller | The LINE bot (and its operator entity) is the formal PDPA data controller; must register a contact point |
| F3 — LI + prior notification covers collection | Bot's group-join welcome message must be sent immediately on joining, before any extraction occurs; opt-out mechanism must be included |
| F4 — notification items | Group-join message must hit all 9 required disclosure items (condensed); a full privacy notice URL must be linked; DM opt-in must reference the same notice |
| F5 — opt-in before publish | Existing design (poster DM opt-in required before public) satisfies this — do not regress. Schema field `publishConsent: boolean + timestamp` must be stored |
| F6 — withdrawal ease | Bot must respond to a "delete my listing" or "remove my data" message in the DM flow within a reasonable automated path; cannot require email only |
| F7 — 90-day deletion | A data-deletion request pathway must be implemented before any public launch; for test phase, manual is acceptable if documented |
| F8 — breach notification | Incident response runbook must be written before launch; PDPC complaint email and 72-hour clock must be known to the operator |
| F9 — cross-border / AWS | No separate consent needed for AWS ap-southeast-1 cloud hosting if structured as a data-processing contract; add a short clause to the privacy notice: "Data stored on cloud servers in Singapore under data processing agreement" |
| F10 — no DPO urgency yet | Park formal DPO appointment for launch; designate a named human as "data contact" now for test phase |
| F11 — listing accuracy | Every auto-extracted listing must display "Details provided by poster — verify independently" before going public |
| F12 — foreign ownership | Any screen mentioning condominium quota, leasehold, or land titles must carry "This is not legal advice; consult a qualified Thai lawyer" |
| F13 — Worldcoin/incentive scrutiny | The group-join message must make clear that refusing the bot (typing /optout) will not affect the user's group membership or access to listings shared in the group |
| F14 — retroactive disclosure gap (URGENT) | **Immediately** post the LEGAL-01 disclosure message to all existing test groups; log the timestamp; do not run another extraction cycle from those groups before this is done |

---

## Heuristics

**LEGAL-01:** The bot's first message after joining any LINE group MUST include, in both Thai and English: (a) what data it collects (messages referencing property listings, poster name/LINE profile), (b) the purpose (building a private group property catalog), (c) who operates it (company name + contact), (d) that data stays private to group members unless the poster explicitly opts in to public publication, (e) how to opt out (reply /optout or message the bot), and (f) a link to the full privacy notice. The message must be sent before any extraction occurs for new groups.

**LEGAL-02:** Explicit poster opt-in is required before any listing data (including the poster's identity) is published publicly or shared outside the group. Opt-in must be a distinct affirmative action in the DM flow (not a checkbox buried in terms). The schema must record `publishConsentTimestamp` and `publishConsentVersion`; these fields must never be null for any public listing.

**LEGAL-03:** A "remove my data" command (e.g., /delete or equivalent keyword) must be handled in the bot's DM flow and produce a clear bot response confirming the request is received. For the test phase, the actual deletion can be a manual process completed within 90 days, but the request must be logged with a timestamp. A reviewer checking this heuristic should be able to send the command and receive a timestamped acknowledgment.

**LEGAL-04:** The privacy notice (linked from every group-join message) must be hosted at a stable URL and must cover the nine mandatory PDPA § 23 + Sep 2022 PDPC Guideline disclosure items: (a) controller identity and contact; (b) purpose; (c) legal basis; (d) data categories; (e) retention period; (f) whether provision is required by law/contract and consequences of non-provision; (g) third-party disclosure and recipient categories; (h) cross-border transfer and safeguards; (i) data-subject rights including the right to complain to the PDPC. This list is identical to the one in Finding 4. The notice must exist before the bot joins any real group.

**LEGAL-05:** Consent withdrawal must be achievable via the same channel used to give consent (LINE bot DM). A reviewer must be able to send a revocation message and receive a bot confirmation that (a) extraction of future messages by that user has stopped, and (b) the user's personally identifying information will be removed from public listings within 90 days (the statutory maximum for deletion requests under the Nov 2024 PDPC Deletion Notification — PDPA does not specify a separate timeline for stopping extraction after withdrawal). *Product-policy note*: an internal SLA of 30 days for withdrawal-triggered removal is a reasonable stricter standard and should be documented as a product policy, not cited as a PDPA requirement. A reviewer confirming compliance against PDPA should use the 90-day statutory clock.

**LEGAL-06:** Every listing card displayed on the public website or in the MINI App must carry the text: "Details provided by the poster. Please verify all information independently." This text must be visible without scrolling on the default card layout. AI-extracted fields that were not manually confirmed must be flagged in the admin schema (`extractionSource: "auto" | "poster_confirmed"`).

**LEGAL-07:** Every screen or message that references condominium foreign ownership quotas, leasehold periods, BOI land rights, or any ownership structure involving foreign nationals must display: "This is not legal advice. Consult a qualified Thai lawyer before taking any action." This disclaimer must not be collapsible or dismissible on first view.

**LEGAL-08:** The operator must designate a named human as "Data Contact" before any real-user test. This person's name and a working email or LINE ID must appear in the privacy notice. PDPC breach notifications, deletion requests, and access requests must flow through this person. A reviewer checking this heuristic must find a named contact in the live privacy notice.

**LEGAL-09:** If the bot is removed from a group or a group admin requests it to leave, it must immediately stop extracting new messages from that group. Concretely: on receipt of a LINE `leave` webhook event the bot must set the group's extraction worker to inactive (`groupActive = false` in the data store) within the same Lambda invocation; a reviewer can verify this by removing the bot from a test group and confirming no new listings appear from that group in the subsequent 24-hour period. Existing extracted data may be retained only if there is a separate lawful basis for each record (e.g., the poster previously gave explicit opt-in consent to public publication — that listing remains public). Retaining private draft listings after group removal without active poster consent is not defensible under legitimate interest.

**LEGAL-10:** For any listing that was publicly published and the poster later withdraws consent (or requests deletion), the listing must be unpublished (set to private/deleted) within 30 days of the request, and any cached or indexed versions should be de-indexed via robots.txt / meta noindex within the same period. The schema must support a `deletionRequestedAt` field with an automated unpublish workflow.

**LEGAL-11:** The group-join message must make explicitly clear that opting out (typing /optout or equivalent) has no consequence for the user's group membership or their ability to see messages in the group. This requirement stands on its own under PDPA § 19's "freely given" consent standard — consent obtained under implicit pressure to remain in a group fails that standard. The Worldcoin precedent (Nov 2025, biometric data ordered deleted) is cited for the PDPC's demonstrated willingness to scrutinise consent voluntariness, although that case involved direct financial inducement rather than group-membership pressure; the analogy is supportive, not direct.

**LEGAL-12:** If AWS Lambda/S3/DynamoDB in ap-southeast-1 (Singapore) is used (current stack), the privacy notice must state: "Your data is stored on cloud infrastructure in Singapore under a data processing agreement with AWS. AWS does not access your personal data." This satisfies the cross-border transfer disclosure even though the cloud-hosting-only exception likely applies under the March 2024 PDPC notifications.

**LEGAL-13:** Data breach incident response: the operator must maintain a written runbook containing the PDPC's official breach-notification portal URL, the 72-hour deadline from awareness, and the list of data categories that, if exposed, automatically qualify as "high risk" (names + phone numbers + property interest = high risk). A reviewer checking this heuristic should be able to locate the runbook as a team document.

---

## Anti-patterns

**AP-1: "They joined a broker group, so they consented."** Joining a pre-existing LINE group does not constitute PDPA consent for a new bot that later joins and starts extracting. Consent for the group's existing purpose (sharing listings among brokers) is not consent for a third-party data controller to record and process that data. This is the most common misreading of PDPA in Thai tech products. Note: this anti-pattern also applies *retroactively* to groups the bot is already in — LEGAL-01's "send before extraction occurs" cannot be satisfied retroactively by the initial join message, so a separate one-time retroactive disclosure must be posted to any existing test groups before extraction continues (see Finding 14 below).

**AP-2: Posting a bot notice in the group chat and calling it "consent."** A passive text message that says "this group uses a bot" is not consent and is not even a valid notification unless it reaches all current and future members before collection begins. It also offers no opt-out mechanism.

**AP-3: Burying the opt-out in a privacy policy link.** If a member must navigate to a website to exercise opt-out, the withdrawal mechanism is not "as easy as giving consent." The opt-out must be a direct bot command.

**AP-4: Treating AI-extracted listing details as verified facts.** Publishing "3 bedrooms, 90 sq m, Chanote title" when those were LLM-extracted from a chat message creates false advertising exposure under the Consumer Protection Act and erodes user trust when buyers arrive and find discrepancies.

**AP-5: Assuming AWS hosting in Singapore = no cross-border obligation.** While the cloud-hosting exception likely applies, failing to disclose the Singapore location in the privacy notice leaves the operator unable to defend the exception if challenged. Disclose it proactively.

**AP-6: Not separating purpose when going public.** Treating a listing's initial private extraction and its subsequent public publication as the same consent purpose will be wrong under PDPA § 24. The two purposes are distinct and require separate legal bases. The product already separates them (private default, explicit opt-in for public); maintaining this design boundary is critical.

**AP-7: Relying on LINE's own privacy policy to cover the bot.** LINE Corporation's PDPA addendum covers LINE's own data processing. The bot operator is a separate data controller; LINE's policy does not satisfy the operator's PDPA notification obligations.

**AP-8: Informal "please DM me to delete" as the only deletion path.** Under the August 2024 deletion notification, the controller must actively confirm deletion to the data subject within 90 days. A casual promise to delete when asked, without logging the request or confirming completion, will fail if a data subject escalates to the PDPC.

---

## Confidence

### VERIFIED (cited, current)

- PDPA B.E. 2562 is in force; first administrative fine issued August 2024 (THB 7M landmark fine); largest tranche to date in August 2025 (THB 21.5M, 5 cases) (Tilleke &amp; Gibbins "Landmark Fine" Aug 2024, "More than a Warning" Aug 2025; Chambers 2026)
- Consent/notification guidelines issued September 7, 2022 and their 9-item content requirement (PDPC Notification, via Tilleke)
- Deletion/destruction notification effective November 11, 2024; 90-day response clock (PDPC Notification Aug 2024, via Tilleke & Mondaq)
- 72-hour breach notification to PDPC; up to THB 3M fine for non-compliance (IAPP 2025, DLA Piper 2024)
- Cross-border cloud-hosting exception "no third party access" (Securiti.ai, Baker McKenzie 2024; March 2024 PDPC Notifications)
- Worldcoin biometric enforcement / consent voluntariness scrutiny (Chambers 2026 trends)
- Consumer Protection Act prohibition on false/misleading property advertising (established law B.E. 2522, confirmed 2024 Lexology)
- LINE group chat operator = data controller principle (pdpathailand.com Thai-language article, consistent with PDPA §§ 6, 26)
- Data subject rights including erasure, access, portability, objection, withdrawal (PDPA §§ 30–37, confirmed across multiple sources)

### PLAUSIBLE-BUT-UNVERIFIED

- **Legitimate interest is an acceptable basis for passive group message extraction.** No PDPC ruling or enforcement case has specifically addressed a passive LLM bot extracting property data from consenting broker groups. This is an application of general PDPA § 24(5) principles. A conservative Thai lawyer might advise seeking express consent instead. Treat as plausible; validate before scaling beyond the test group.
- **The cloud-hosting exception covers AWS ap-southeast-1 / Singapore in our architecture.** The March 2024 notifications create this exception in principle, but the PDPC has not published guidance on how it applies to specific architectures (Lambda + DynamoDB). The "no third party access" standard likely covers AWS as a data processor, but this has not been tested in a Thai enforcement case.
- **DPO is not required for a small-scale test.** PDPA requires a DPO for "large scale, regular, systematic monitoring." The PDPC has not defined thresholds. For a test with a small group of users the risk is low, but the legal text is ambiguous enough that this could change.
- **The applicable timeline for withdrawal-triggered removal is 90 days (statutory deletion clock).** PDPA specifies 90 days for deletion requests under the Nov 2024 PDPC Notification; there is no separate statutory deadline for stopping extraction after consent withdrawal. LEGAL-05 now cites 90 days as the compliance standard. A 30-day internal SLA remains a sensible product-policy target but must not be presented as a PDPA requirement.
- **Platform Economy Act liability scope.** Draft PEA (Jan 2025 draft, closed Feb 2025 comment period) may add intermediary platform obligations. Final text and effective date are unknown as of this writing.

---

## Ask the market

1. **Do brokers in Chiang Mai broker groups have any existing understanding of, or concern about, PDPA?** Are they aware they could be considered personal data subjects when their names and phone numbers appear in listings? (Validate in the founder's existing LINE groups before any test.)

2. **What reaction do brokers have to the group-join message format?** Does a Thai-language PDPA disclosure in the welcome message feel normal, bureaucratic, or alarming in the context of how they currently use LINE groups? Does it reduce engagement?

3. **What is the practical opt-out expectation?** If a broker does not want their listings indexed, do they expect to opt out once at a group level, or per listing? The bot currently operates at the listing level; confirm this matches user mental model.

4. **Is there a Thai Real Estate Broker Association (TREBA) PDPA guidance document?** TREBA exists (DDProperty profile) but no sector-specific PDPA guidance was found. If TREBA has issued informal guidance to members, that is the benchmark for what "industry standard" means in a dispute.

5. **How do competing property platforms (DDProperty, FazWaz, Dot Property) display their accuracy disclaimers and data-collection notices?** Screenshot audit of their group/DM entry flows would establish the de-facto Thai PropTech norm and calibrate how much friction the test-group users expect.

6. **What is the operator entity?** PDPA requires a legal entity as controller. If no Thai company exists yet, consider whether the foreign-entity extraterritorial reach of PDPA (§ 5) requires a Thai representative. A Thai lawyer should confirm before scaling.

7. **What do brokers currently do with the names and phone numbers of property owners listed in group chats?** If the common practice already involves passing this information around without consent, the bot's collection may be lower-risk in practice but higher-risk in formality — or the reverse. Understanding current norms helps calibrate the disclosure language.

---

## Sources

1. Tilleke & Gibbins, "Thailand: Operationalising PDPA — Lawful Basis, Sensitive Personal Data, and Data Processing Safeguards," 2023. https://www.tilleke.com/insights/thailand-operationalising-pdpa-lawful-basis-sensitive-personal-data-and-data-processing-safeguards/

2. Tilleke & Gibbins, "Thailand Issues Guidelines on PDPA Consent and Notification Requirements," Sep 2022. https://www.tilleke.com/insights/thailand-issues-guidelines-on-pdpa-consent-and-notification-requirements/

3. Tilleke & Gibbins, "More Than a Warning: Eight Serious Fines Imposed in Thai Data Protection Cases," Aug 2025. https://www.tilleke.com/insights/more-than-a-warning-eight-serious-fines-imposed-in-thai-data-protection-cases/

4. Tilleke & Gibbins, "Thailand Issues Criteria for Deletion, Destruction, and De-identification of Personal Data," Aug 2024. https://www.tilleke.com/insights/thailand-issues-criteria-for-deletion-destruction-and-de-identification-of-personal-data/

5. Chambers and Partners, "Data Protection & Privacy 2026 — Thailand: Trends and Developments." https://practiceguides.chambers.com/practice-guides/data-protection-privacy-2026/thailand/trends-and-developments (accessed Jun 2026)

6. PDPA Thailand (pdpathailand.com), "แชทหลุด! ต้องระวัง สิ่งที่ธุรกิจต้องรู้เมื่อใช้ 'LINE Group' ในองค์กร อาจละเมิดกฎหมาย PDPA." https://pdpathailand.com/article/article-linegroup-pdpa/ (accessed Jun 2026)

7. PDPA Thailand (pdpathailand.com), "ประกาศความเป็นส่วนตัวสำหรับลูกค้า (Privacy Notice for Customers)." https://pdpathailand.com/privacy-notice-customers/ (accessed Jun 2026)

8. PDPA Thailand (pdpathailand.com), "ประกาศให้โลกรู้! ว่าทำตาม PDPA ด้วยนโยบายความเป็นส่วนตัว (Privacy Notice Template)." https://pdpathailand.com/knowledge-pdpa/privacy_notice_template/ (accessed Jun 2026)

9. DLA Piper, "Data Protection Laws of the World — Thailand," 2024. https://www.dlapiperdataprotection.com/index.html?t=law&c=TH

10. IAPP, "Thailand's PDPC Clarifies Data Breach Notification Requirements," 2025. https://iapp.org/news/a/thailand-s-pdpc-clarifies-data-breach-notification-requirements

11. Securiti.ai, "Thailand Cross-Border Personal Data Transfer Legislation Overview," 2024. https://securiti.ai/thailand-cross-border-personal-data-transfer-overview/

12. Baker McKenzie, "Thailand: New Cross-Border Data Transfer Rules Officially Published as Law," Feb 2024. https://insightplus.bakermckenzie.com/bm/data-technology/thailand-new-cross-border-data-transfer-rules-officially-published-as-law

13. Future of Privacy Forum, "New Report on Limits of 'Consent' in Thailand's Data Protection Law," 2022. https://fpf.org/blog/new-report-on-limits-of-consent-in-thailands-data-protection-law/

14. AWS, "Thailand Data Privacy." https://aws.amazon.com/compliance/thailand-data-privacy/ (accessed Jun 2026)

15. Securiti.ai, "Thailand Data Protection Framework's Consent Requirements," 2024. https://securiti.ai/blog/consent-requirements-under-thailands-data-protection-framework/

16. Lexology / Denise Mirandah, "Enhancing Consumer Protection: Thailand's New Advertising Notification on Guidelines for Advertising Statements," 2024. https://blog.galalaw.com/post/102jast/enhancing-consumer-protection-thailands-new-advertising-notification-on-guideli

17. Pimlegal, "Real Estate Legalities in Thailand: What Foreign Investors Need to Know," Dec 2024. https://www.pimlegal.com/2024/12/25/real-estate-legalities-in-thailand-what-foreign-investors-need-to-know/

18. พระราชบัญญัติคุ้มครองข้อมูลส่วนบุคคล พ.ศ. ๒๕๖๒ (PDPA B.E. 2562), Royal Gazette, 27 May 2562. https://ratchakitcha.soc.go.th/documents/17082307.pdf

19. สภาองค์กรของผู้บริโภค, "ชี้ประชาชนตื่นตัว 'PDPA' แต่ช่องโหว่กฎหมายอาจทำให้ใช้ไม่ได้จริง," Jul 2022. https://www.tcc.or.th/03072565_pdpa_scoop/ (Thai-language; documents public awareness gaps in PDPA enforcement as of mid-2022)

20. openpdpa.org, "Privacy Notice (ประกาศความเป็นส่วนตัว) ทำไมต้องมี?" https://openpdpa.org/privacynotice/ (accessed Jun 2026; Thai-language overview of privacy notice requirements)

21. Tilleke & Gibbins, "Landmark Fine Imposed under Thailand's Personal Data Protection Act," Aug 2024. https://www.tilleke.com/insights/landmark-fine-imposed-under-thailands-personal-data-protection-act/ (first administrative fine under PDPA — THB 7M, August 2024)

22. IAPP, "First Fine Imposed under Thailand's Personal Data Protection Act," Aug 2024. https://iapp.org/news/a/first-fine-imposed-under-thailand-s-personal-data-protection-act (corroborates Aug 2024 landmark fine as first PDPA enforcement action)

23. pdpathailand.com, "มาตรา 23 PDPA (Section 23 English)." https://pdpathailand.com/pdpa/content_eng/article23_eng.php (accessed Jun 2026; primary-source English rendering of § 23 enumerated notification sub-items)

---

## Review response

**Finding 1 — Format contract (numbered 1-9 sections).** Rebutted. The artifact's named sections (Scope / Thought leaders / Findings / Implications / Heuristics / Anti-patterns / Confidence / Ask-the-market / Sources) map to exactly 9 logical sections and satisfy the assignment contract. The assignment uses "sections 1-9" as a count, not a numbering schema. Renumbering would reduce readability with no substantive benefit.

**Finding 2 — "First major fines" overclaim.** Applied. Corrected throughout: the first administrative fine was THB 7M in August 2024 (Tilleke "Landmark Fine"); the August 2025 fines are described as "the largest tranche to date." Confidence/VERIFIED section updated to match. Sources 21 and 22 added.

**Finding 3 — Controller basis conflation (group creator vs. third-party bot).** Applied. Finding 2 rewritten to explicitly separate the two scenarios: (a) group-creator controller (what the pdpathailand.com article covers) and (b) third-party bot joining an existing group (our case, argued on §§ 6/26 decision-authority grounds). The source limitation is now explicitly noted. AP-1 cross-reference updated.

**Finding 4 — Divergent "9 mandatory items" lists in Finding 4 vs. LEGAL-04.** Applied. Both lists reconciled to a single canonical nine-item enumeration (items a–i) consistent with § 23's sub-items plus the Sep 2022 PDPC guidelines. Finding 4 and LEGAL-04 now use identical lettered lists. Item sourcing (which items are statutory vs. guideline-added) is documented. Source 23 added.

**Finding 5 — Citation hygiene on §23 section number.** Applied (partially). Section numbers for § 23 (notification), § 19 (withdrawal), § 37 (breach), and § 24/25 (legal basis) are retained as cited — they are the standard mapping confirmed across Tilleke, DLA Piper, and the pdpathailand.com primary-source article, which are themselves drawn from the Royal Gazette text. Full re-verification against the Thai Royal Gazette PDF (source 18) was not performed in this revision, but source 23 (pdpathailand.com § 23 article) directly renders the § 23 sub-items and corroborates the mapping. Risk is low.

**Finding 6 — LEGAL-05 "30 days" product/PDPA confusion.** Applied. LEGAL-05 now cites 90 days as the PDPA-compliant standard. The 30-day target is explicitly relabelled as a product-policy SLA, not a PDPA requirement. PLAUSIBLE-BUT-UNVERIFIED entry updated accordingly.

**Finding 7 — Worldcoin analogy overreach.** Applied. LEGAL-11 and Finding 13 both moderated: the § 19 "freely given" standard is now cited as the primary legal basis; Worldcoin is described as supporting precedent for the PDPC's scrutiny posture, with the factual distinction (financial inducement vs. group-membership pressure) explicitly noted.

**Finding 8 — Secondary source authority.** Rebutted. The load-bearing legal claims (LI basis, enforcement fines, cross-border exception) rest on Tilleke, Chambers, Baker McKenzie, and IAPP, all of which verified. The FPF "Limits of Consent" source is used only for background framing and is already hedged as PLAUSIBLE-BUT-UNVERIFIED. Demoting or removing those sources would reduce coverage without improving accuracy.

**Finding 9 — LEGAL-09 not screen-falsifiable.** Applied. LEGAL-09 rewritten to specify the concrete testable behaviour: `groupActive = false` set on the LINE `leave` webhook event; reviewer verifies by removing the bot from a test group and confirming no new listings appear within 24 hours.

**Finding 10 — Retroactive disclosure to already-joined test groups.** Applied. Finding 14 added identifying this as the most operationally urgent gap for the current test phase. Implications table row F14 added. AP-1 updated to cross-reference the retroactive scenario explicitly.
