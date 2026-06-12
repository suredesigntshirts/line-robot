# B2 — Real-Estate Browsing Psychology & Conversion

**Scope note.** This artifact gates four product surfaces: (1) the **listing detail page** layout on the public Astro site and the LIFF mini-app — photo treatment, what sits above the fold, progressive disclosure of the long tail of fields; (2) **search UX** — map vs. list, filters, result-card hero image; (3) **contact flows** — whether our LINE-first, chat-first contact model is validated or challenged by conversion evidence vs. lead forms; (4) **re-engagement** — saved-search/alert mechanics and the trust-killers (stale/fake/watermark-spam listings) that erode a marketplace's credibility. Findings are global unless explicitly tagged **[THAI]**. Where global evidence challenges our settled stack (LINE-first identity/contact, exclusivity windows, LLM spam/dup gate), I say so in *Implications*.

---

## Thought leaders & sources consulted

1. **Baymard Institute** — the highest-signal source for evidence-based e-commerce/listing UX. Large-scale moderated usability testing (50,000+ hours cumulative), 150,000+ documented UX issues, benchmark of US/EU sites; their findings are quantified and re-tested annually (Product List/Product Page UX 2025). They have a dedicated **Travel Accommodations / Vacation-Rental UX audit** (400+ weighted parameters) that is the closest rigorous analog to property-listing browsing. Credible because findings come from observed task failures, not opinion.
2. **Nielsen Norman Group (NN/g)** — Jakob Nielsen coined *progressive disclosure* (1995); NN/g's articles on progressive disclosure, accordions on desktop, homepage real-estate allocation, and form cognitive-load are the canonical, repeatedly-validated references for "what goes above the fold and what collapses." Decades-deep, method-transparent.
3. **Zillow Research** — operates at a scale (one of the largest listing datasets in the world) no Thai portal matches; their published correlations between photo count, saves/views/shares and sale speed/price are the most-cited quantitative listing-engagement data available. Caveat: US market, and these are *correlations* (good listings attract photographers AND buyers), not proven causation — I treat them as directional.
4. **Redfin / Clever / Axios housing-data desks (2025–26)** — current, primary-data sources for the **asking-vs-transaction gap** (sale-to-list ratios, share of homes selling below ask). Used for the price-anchoring section because they publish actual transaction data, not agent folklore.
5. **[THAI] Pantip threads + Thai property portals (DDproperty/PropertyGuru, LivingInsider, PropertyScout, DotProperty) + LINE Thailand "Now & Next" / chat-commerce data** — primary Thai-buyer voice on negotiation norms and scam patterns, plus the dominant local portals whose UX is the baseline Thai users compare us against. Vetted as *anecdotal-but-direct* (forum) vs. *vendor* (portal blogs) and labelled as such.

---

## Findings

1. **A photo-count floor exists and is steep.** Zillow found homes with **fewer than 9 photos were ~20% less likely to sell within 60 days** than comparable homes with 22–27 images; engagement plateaus above ~35 photos (padding hurts). (Zillow Research / aggregators, 2023–2026.) *[Global; correlational.]*
2. **The first photo is the search thumbnail, and it decides the click — make it a clean front-exterior. [directional/vendor]** The robust, multiply-corroborated claim: the first image is the search-result thumbnail and "the overwhelming majority of click-through decisions happen at the thumbnail stage, before the buyer reads price or address," and a **clean front-exterior** is "the single highest-leverage image in any listing… one [photo] more important than the other twenty-four combined." (Wire Associates; Lens Collective; corroborated across RE-photography write-ups, 2024–26.) **Caveat — the daytime-vs-twilight *direction* is contested, not settled:** Wire Associates' single low-n experiment found a *daytime* exterior beat a twilight one (8.5% vs 6.6% CTR), but other practitioner data reports the opposite (twilight thumbnails +30–76% clicks). So treat the **exact CTR percentages and the day/twilight winner as unverified folklore** — only the "exterior-hero + thumbnail-decides-the-click" direction is load-bearing for us, and CONV-02 needs only that. *[Global; single-property/low-n on the percentages; thumbnail-decides direction is well-supported.]*
3. **Thumbnails (not dots/arrows) are the correct gallery control.** Baymard: representing additional images with **visible thumbnails** produces the lowest rate of accidental taps and the best "information scent"; subtle dot indicators and text-only counters cause mobile usability failures. Imagery deserves above-the-fold space even when space is scarce. (Baymard, 2024–25.) *[Global.]*
4. **Interactive floor plans materially lift engagement.** Listings with interactive floor plans received **~79% more saves** than those without. (Zillow Research, cited 2024–26.) *[Global; correlational.]*
5. **Above the fold should carry price, key specs, primary CTA, and trust signals; everything else is progressive disclosure.** Baymard product-page research: price, availability, the primary action, and trust signals (ratings/guarantees) belong above the fold; a **sticky CTA** on mobile prevents scroll-loss. NN/g: collapsing secondary detail under **accordions** keeps all topics reachable above the fold without a long scroll — the canonical pattern for property pages with dozens of attributes. (Baymard 2025; NN/g progressive disclosure / accordions, 2024.) *[Global.]*
6. **Lead-form friction is severe; chat removes it. [directional/vendor]** Traditional web lead forms show **~81% abandonment**; every added field is an exit point. Conversational/chat entry "removes the barriers between interest and interaction… no redirect, no form fatigue." (JustCall / conversational-ads practitioner write-ups, 2025.) *[Global; vendor-leaning — the 81% figure is practitioner-repeated, not a primary study; directional, but consistent across independent sources.]*
7. **Speed-to-respond dominates contact conversion. [directional/vendor]** ~82% of buyers expect a response within ~10 minutes; responding within 5 minutes makes connection ~100× more likely; odds of qualifying a lead drop sharply after the first 5 minutes. (Agent lead-response statistics, 2025–26.) *[Global; the "100× / 5-minute" magnitude is vendor-folklore repeated across write-ups, no primary study located — directional.]* This is an argument *for* chat where a human/bot can reply instantly, not just for the channel itself.
8. **Map search is the differentiating discovery mode for location-sensitive buyers; list is the scanning mode.** Map view exposes price clusters, neighborhood boundaries and proximity (schools, transit) at a glance and keeps users engaged longer; list view is faster for spec-based scanning. Property search + filters is the single most-used feature on any portal. (Portal/maps-platform analyses, 2025–26 — vendor sources; no clean independent split-usage %.) *[Global; vendor-sourced — treat the *qualitative* split as solid, exact ratios as unverified.]*
9. **Saved-search alerts are a high-value, high-open re-engagement channel — when fast and criteria-matched.** ~83% of buyers rate agent alerts "very valuable/essential"; **price-reduction alerts ~52% open rate**; alerts sent within ~15 min of a listing going live make buyers **~3.6× more likely to request a showing**. Alerts also retain users on *your* surface instead of third-party portals. (Property-alert practitioner data, 2025–26 — vendor-leaning.) *[Global.]*
10. **The asking-vs-transaction gap is real and currently wide.** In the US 2025, **~62% of buyers paid below list**, with a typical **~7.9% discount** off original asking (largest gap since 2012); ~26% of below-ask buyers got 10%+ off. UK data shows asking-vs-sold gaps reported as high as ~30% in soft segments. Asking price is an *anchor the seller sets high*, not a transaction value. (Axios/Redfin/Clever 2025–26; Homeward Legal UK 2024.) *[Global.]*
11. **[THAI] Thai buyers expect to negotiate, and target double-digit discounts.** Thai how-to guides and Pantip threads treat negotiation as obligatory ("both new and second-hand should always be negotiated; sellers price *เผื่อต่อ* — padded for haggling"). A Pantip buyer's worked examples target **8.0M→6.0M (~25%)** and **7.5M→5.5M (~27%)** off asking on second-hand homes, while worrying it might look *น่าเกลียด* (rude) — i.e. large negotiations are normal but socially negotiated. (Pantip 38612444; PropertyScout/DotProperty/Gooroohome guides, 2024–25.) *[Thai-specific; forum + vendor — anecdotal but consistent.]*
12. **[THAI] Thailand is a chat-first commerce market by default.** LINE has ~54M Thai users (~77% of mobile-internet users), ~67 min/day; shopping is a top-4 LINE activity; LINE forecasts chat-commerce value rising from 462B baht (2023) to 1.14T baht (2028, ~19% CAGR). Thai consumers "prefer conversation-driven shopping… real-time interaction," and the loyalty mechanism is well-attested at the *chat-experience* level: **~67% of customers are likely to repeat-purchase through the same chat channel after a positive interaction** (the cleaner-sourced version of the often-floated "~80% repeat via LINE," which I could not independently attribute and have dropped). (LINE Thailand Now & Next / Bangkok Post / Statista, 2024–26.) *[Thai-specific.]* This directly validates a LINE-first contact model.
13. **Trust-killers are concrete and portal-fightable.** The recurring credibility threats are: **stale listings** (sold/rented but still live — "user frustration and inefficiency"); **duplicate/hijacked listings** (scammers copy a real listing, swap contact + price, demand payment before viewing); **fake/AI-altered photos** (now under regulatory scrutiny; California mandates labeling AI-edited listing images); **watermark mismatch** as a tell that a listing was commandeered. Portals fight back with data verification against official records, regular audits/expiry, AI dup-detection, and watermark/label standards. (Warren Group; Homes.com; Baltimore Mgmt; 2024–25.) *[Global.]*
14. **[THAI] Thai scam patterns are contact-flow specific.** Pantip warnings center on: fake "buyers/agents" using **borrowed profile photos** and multiple non-matching names; **cash-upfront, no-contract** demands; time-pressure/emotional manipulation; brokers listing property **without the owner's consent**. (Pantip 42030225, 42202705, 42542474, 2024–25.) *[Thai-specific; forum.]* These map onto our membership/opt-in gates as defenses, not just our public catalog.
15. **[THAI] Thai users' lived portal complaints are about responsiveness and freshness, not features.** App reviews/Pantip on DDproperty etc. cite **agents not answering / going silent** after contact and stale or unmaintained listings — the same trust-killers as global, surfaced as the top Thai pain. (AppDisqus DDproperty review; Pantip 37052982; 2023–25.) *[Thai-specific; vendor-review + forum.]*
16. **[THAI] The incumbent Thai-portal contact baseline still leads with a lead form — which is exactly the friction our model removes.** On **DDproperty** (No.1 portal, ~3.5M monthly visits), the listing's contact path offers "Phone Reveal, Line, or **Enquiry Form**," and the enquiry form is the prominent in-page pop-up capturing **name, email, phone, message** before the seeker reaches the agent. LINE is present but as one option beside the form, not the default rail. **LivingInsider** (~4M MAU, top Thai property site) is more LINE-native: it exposes a **Line ID per listing** plus a "**Living-Line-Assistant**" that pushes the agent an instant LINE notification when a buyer messages — i.e. the incumbent that Thai users rate highest has *already* converged on LINE-as-contact + instant-ack, validating CONV-06/CONV-07 against the local baseline rather than only against global theory. **PropertyScout** positions as a "concierge" with an on-site chatbox. (DDproperty agent help-centre / PropertyGuru; LivingInsider site + app listing; PropertyScout, 2024–26.) *[Thai-specific; vendor/portal — directional.]*
17. **[THAI] Incumbent portals already ship photo galleries, filters, and map/location search — so those are table stakes, not differentiators; our wedge is trust + LINE-native speed, not feature parity.** DDproperty ships a dedicated **Google-Map property search**, free-text + current-location search, and filters (price/beds/psm/floor/construction date) with "high-quality images"; LivingInsider ships per-listing photo galleries, project/price/location filters, and map. Neither's published differentiator is gallery-control quality or above-the-fold discipline (the Baymard/NN/g levers in F3/F5) — meaning CONV-03/CONV-05 are *parity-or-better* plays, while the genuine gap the incumbents leave open is freshness/responsiveness (F15) and anti-scam identity (F14). (DDproperty Maps search + app listing; LivingInsider app listing, 2024–26.) *[Thai-specific; vendor/portal — directional.]*

---

## Implications for us

- **F1, F2 → photo schema + ingest gate.** Apply a **minimum photo count** before a listing can be *published publicly* (target ≥9; ideal band 8–25 for our chat-sourced inventory). **Enforcement mode is deliberately conditional** (see CONV-01): default to **warn+nudge in the bot DM**, and only escalate to a **hard block** if Ask-the-market #1 confirms Chiang Mai inventory typically clears the floor — a hard block on day one would reject most chat-sourced listings if the local median is under 9. Store an explicit **`heroPhotoIndex`** and bias hero selection toward a clean **exterior/façade** shot; let the poster reorder. The LLM ingest can flag "interior-only / no exterior" listings for a better hero.
- **F3 → gallery component.** Detail page and LIFF gallery use **thumbnail strips**, not dot indicators, with a visible total count. Above-the-fold image must be tappable to full gallery.
- **F4 → schema field.** Add optional **`floorPlanImage` / `hasFloorPlan`**; surface a "Floor plan" chip when present. Cheap save-rate lever for the catalog.
- **F5 → detail-page layout contract.** Above the fold (both web and LIFF): **hero photo, price, type/beds/baths/area, location pin, primary CTA**. Everything else (full description, amenities, title-deed/chanote section, history) goes into **accordions / progressive disclosure**. (Note: our current build keeps Title-deed always expanded per commit `0a69f34` — that's deliberate for trust; keep it, but collapse the rest.)
- **F6, F7, F12, F16 → contact flow = LINE chat, validated against the local baseline, not just global theory.** Primary CTA is **"Chat on LINE"** (deep link into the bot/MINI App), *not* an email lead form. No multi-field form as the primary contact path. This beats the **incumbent baseline directly**: DDproperty (No.1 portal) still fronts a **name/email/phone enquiry form** (F16) — the exact ~81%-abandonment friction (F6) we remove — while LivingInsider already proves Thai users accept LINE-ID-per-listing + instant LINE notification, so we are matching the *best* local pattern and beating the *dominant* one. Because speed-to-respond dominates (F7), the bot should send an **instant acknowledgement** ("Saved — the lister will reply here") so the chat channel actually delivers the speed advantage. Phone is **secondary**; email form is **never primary**.
- **F8, F17 → search UX. [Evidence-thin / high-cost — sequence behind a list-first MVP.]** The map-vs-list split is the **weakest-evidenced finding in this artifact** (F8 is all vendor/maps-platform sourcing, no clean independent usage ratio) and map-first is a **significant build**: it requires geocoding every chat-sourced listing (`plans/18` only partially covers this), not just a UI toggle. Recommended sequencing: **ship list-first with prominent filters** (the universally most-used surface, and table-stakes since incumbents already have it — F17) as the MVP; add **map as a fast-follow** once **Ask-the-market #3** confirms Chiang Mai buyers actually reach for neighborhood/map thinking. Treat "map as a first-class mode" as a **validated bet, not a settled requirement**. Still requires `lat`/`lng` on listings (geo work — see `plans/18-geo-dedup-consolidation.md`), which the dedup gate needs anyway.
- **F9 → re-engagement.** Saved-search alerts delivered **via LINE push** (our native re-engagement channel) within minutes of a matching listing publishing; **price-reduction** events are the highest-value alert — emit a dedicated alert when a listing's price drops. This reinforces the LINE-first loop and keeps users off competitor portals.
- **F10, F11 → price anchoring + copy rules.** Display price as **asking price**, explicitly labelled (`ราคาเสนอขาย` / "Asking"), never as if it were a transaction value. Consider showing a **"negotiable" flag** and, where we have corpus data later (AVM), an estimated range — because Thai buyers assume 10–25%+ headroom and will distrust a portal that presents asking as fixed. Do **not** auto-publish absurd asking prices through the spam gate without flagging.
- **F13, F14, F15 → trust system (this is our moat vs. DDproperty/LivingInsider).** (a) **Stale-listing expiry**: every public listing carries an age/last-verified timestamp; auto-expire or down-rank after N days unless re-confirmed by the poster — directly counters the #1 Thai complaint. (b) **Anti-duplicate/anti-hijack**: the LLM dup gate + geo-dedup (`plans/18`) must catch the same property re-posted with a different contact — and contact identity is bound to an **authenticated LINE login + a membership/opt-in record** (our actual gate; note the MINI App channel is currently *unverified* at the LINE-platform level, and visitors are not admin-vetted — so this is *our* identity gate, not LINE platform "verification"). That structurally **deters** (not eliminates) the "borrowed photo / anonymous agent" pattern (F14): a public listing must trace to an authenticated account that opted in, so anonymous reposting has no path, though a determined actor with a real LINE account is still possible — which is why the dup/geo gate and owner-consent rule (below) are needed alongside it. (c) **Owner-consent / opt-in to publish** is not just a privacy feature — it is the defense against "broker listed my property without permission" (F14). Keep it mandatory. (d) **No watermark spam**: forbid third-party watermarks on photos in the publish gate; our own subtle provenance label is fine.
- **F12 → LINE-first is the right bet, not a constraint.** Global lead-form conversion data and Thai chat-commerce dominance point the same direction. Our LINE-first identity/contact is **validated**, not a compromise.

---

## Heuristics

- **CONV-01:** A listing's public-publish path enforces a **minimum photo count (default ≥9)** — but the *enforcement mode is conditional on Ask-the-market #1*: **hard-block ONLY if the Chiang Mai photo-median check confirms typical inventory meets the floor; otherwise warn + nudge** in the bot DM (a hard block would reject most local inventory if the real median is <9). Default to **warn+nudge until that check passes**. *Checkable: publish gate exists with a configurable block-vs-warn mode tied to the photo floor.*
- **CONV-02:** The **hero/first photo** is a stored, poster-reorderable field, defaulting to an **exterior/façade** shot; interior-only listings are flagged at ingest. *Checkable: schema has `heroPhotoIndex`; ingest flag exists.*
- **CONV-03:** Galleries use **visible thumbnail strips with a total count**, never dot-only or arrow-only indicators, on web and LIFF. *Checkable: inspect gallery component.*
- **CONV-04:** The **detail page above the fold** contains exactly: hero photo, asking price, property type + beds/baths/area, location pin, and the primary CTA — and nothing that requires scrolling to reach them on a mid-size phone. *Checkable: screenshot at 390×844.*
- **CONV-05:** Secondary detail (full description, amenities, history) is in **accordions/progressive disclosure**; the **Title-deed/chanote** section is the one deliberate exception and stays expanded for trust. *Checkable: DOM/section state.*
- **CONV-06:** The **primary contact CTA is "Chat on LINE"** (deep link); phone is secondary; an **email/lead form is never the primary contact**. *Checkable: detail-card CTA copy + link target.*
- **CONV-07:** On a contact-initiated chat, the bot sends an **automatic acknowledgement within seconds** ("Saved — the lister will reply here"). *Checkable: send a test contact, observe instant reply.*
- **CONV-08:** Search ships **list-first with prominent filters** (the table-stakes MVP); **map is added as a fast-follow** once Ask-the-market #3 validates Chiang Mai buyers think in neighborhoods (the map-vs-list evidence is vendor-thin and map is a high geocoding cost — not a day-one requirement). Every public listing still carries `lat`/`lng` (needed by the dedup gate regardless). *Checkable: list+filters search UI shipped; `lat`/`lng` on schema; map mode tracked as validated-bet fast-follow.*
- **CONV-09:** Price is always labelled **"Asking / ราคาเสนอขาย"** (never presented as a final/transaction price); a **negotiable** flag is available. *Checkable: listing-card + detail copy.*
- **CONV-10:** Saved-search **alerts fire via LINE push** for new matches, and a **dedicated price-reduction alert** exists. *Checkable: alert config + a price-drop test event.*
- **CONV-11:** Every public listing shows an **age / last-verified timestamp** and is **auto-expired or down-ranked** after N days without re-confirmation. *Checkable: listing has freshness timestamp; expiry job exists.*
- **CONV-12:** Public contact identity is bound to an **authenticated LINE login + a membership/opt-in record** (our gate — *not* LINE-platform channel verification, which is currently unverified); "borrowed photo / anonymous agent" listings are structurally **deterred** (no anonymous path to publish). *Checkable: publish requires an authenticated account id + opt-in record; no public listing traces to an anonymous source.*
- **CONV-13:** The publish gate **rejects third-party watermarks and AI-fakery markers** on photos; only our own provenance label is allowed. *Checkable: gate rule / sample rejection.*
- **CONV-14:** **Owner opt-in is mandatory** before any listing goes public (defends against non-consented broker reposting). *Checkable: no public listing without an opt-in record.*
- **CONV-15:** The dup/geo gate flags the **same property re-posted with a different contact or price** before public listing. *Checkable: feed a known duplicate, confirm it's caught.*

---

## Anti-patterns

- **AP-1: Email lead form as the primary CTA.** ~81% form abandonment; in a LINE-first Thai market it is double sabotage. *(F6, F12.)*
- **AP-2: Dot-only / arrow-only photo carousels** with no thumbnail strip — causes mobile mis-taps and hides how many photos exist. *(F3.)*
- **AP-3: Interior-only or <9-photo public listings** — depress click-through and saves; the missing exterior hero kills the thumbnail click. *(F1, F2.)*
- **AP-4: A wall of every property attribute above the fold** instead of accordions — buries price/CTA and adds cognitive load. *(F5.)*
- **AP-5: Presenting asking price as if final** with no "negotiable"/anchor framing — clashes with Thai 10–25% negotiation expectations and reads as naïve. *(F10, F11.)*
- **AP-6: Stale listings left live** after sold/rented — the single most-cited Thai portal complaint; erodes trust fast. *(F13, F15.)*
- **AP-7: Slow / no reply after contact** — the other top Thai complaint; squanders the chat-channel speed advantage if the bot doesn't auto-ack. *(F7, F15.)*
- **AP-8: Tolerating watermark spam, hijacked duplicates, and anonymous "agents"** — the exact attack surface Thai scam threads describe. *(F13, F14.)*

---

## Confidence

**VERIFIED (cited, current 2024–2026):**
- Photo-count floor (<9 photos → ~20% less likely to sell in 60 days) and ~35-photo plateau — Zillow (correlational). *(F1)*
- Thumbnail galleries > dot/arrow indicators; above-the-fold price/CTA/trust + sticky CTA; accordion progressive disclosure — Baymard / NN/g. *(F3, F5)*
- Asking-vs-transaction gap: ~62% of US homes sold below list in 2025, ~7.9% typical discount — Axios/Redfin/Clever. *(F10)*
- **[THAI]** LINE scale/chat-commerce dominance (54M users, top-4 activity, 462B→1.14T baht forecast) — LINE Thailand / Bangkok Post / Statista. *(F12)*
- **[THAI]** Negotiation is expected and double-digit discounts are targeted (25–27% worked examples) — Pantip + Thai guides. *(F11)*
- Trust-killers (stale/duplicate/AI-fake/watermark) and portal countermeasures, incl. California AI-photo labeling — Warren Group / Homes.com. *(F13)*
- **[THAI]** Incumbent-portal baseline: DDproperty fronts a name/email/phone enquiry form + Phone Reveal + Line; LivingInsider exposes Line-ID-per-listing + instant-notify assistant; both ship photo galleries, filters, map search — DDproperty agent help-centre / app pages, LivingInsider manual/app. *(F16, F17 — vendor/portal-sourced but directly observed in their own docs/app listings.)*

**PLAUSIBLE-BUT-UNVERIFIED (label honest — directional, often vendor-sourced or low-n):**
- Exterior-photo 8.5% vs 6.6% CTR — single $1.7M US property, low n; the magnitude is not generalizable, **and the day-vs-twilight winner is contested** (other vendor data reports twilight thumbnails *out*-clicking daytime by 30–76%). What *is* well-corroborated and all CONV-02 needs: the thumbnail decides the click, and a clean front-exterior is the highest-leverage photo. The Wire Associates page was **403/unfetchable** at access time; the thumbnail/exterior direction is corroborated by Lens Collective and other RE-photography write-ups. *(F2)*
- Floor plan "+79% saves," price-reduction "52% open," "3.6× more likely to show," lead-form "81% abandonment," "100× / 5-minute" response stats — repeated across practitioner/vendor write-ups but I found no independent primary study; treat as directional. *(F4, F6, F7, F9)*
- Map-vs-list **exact** usage split — qualitative pattern is solid, no clean independent quantitative ratio found; **F8 is the single weakest-evidenced finding** (all vendor/maps-platform) — hence map is sequenced as a validated fast-follow, not an MVP requirement (CONV-08). *(F8)*
- **[THAI]** "~80% of buyers repeat-purchase via LINE" — could **not** be independently attributed in spot-check; **dropped from F12** and replaced with the cleaner-sourced "~67% repeat through the same chat channel after a positive experience." The 462B→1.14T forecast, 54M users, 77% and 67-min/day figures remain VERIFIED. *(F12)*
- **[THAI]** Negotiation percentages come from forum anecdote + how-to guides, **not** a transaction-data study; Chiang Mai-specific norms unmeasured. *(F11)*
- All Zillow engagement figures are **correlational** (good listings attract both good photos and buyers) — not proven causal. *(F1, F4)*

---

## Ask the market (validate with real brokers/users in the LINE groups)

1. **Photo reality:** How many photos do brokers/owners *actually* attach in your Chiang Mai groups today? If the median is <9, CONV-01's hard block will reject most inventory — do we soften to a warning + nudge instead?
2. **Negotiation norm, Northern-specific:** Is the ~10–25%-off-asking expectation true for **Chiang Mai** land/houses, or is it a Bangkok-condo pattern? Do local sellers pad asking, or list near-firm? (Sets CONV-09 framing.)
3. **Map vs list:** Do your buyers think in *neighborhoods/landmarks* (map) or *specs/budget* (list)? Which would they reach for first?
4. **Contact expectation:** When a buyer is interested, do they expect to **chat in LINE**, call, or something else? How fast do they expect a reply — is the auto-ack enough, or do they need a human within minutes?
5. **Trust pain ranking:** Among stale listings, fake/borrowed-photo "agents," non-consented reposts, and unanswered contacts — which burns Thai users most? (Prioritizes which trust-killer we engineer against first.)
6. **Staleness tolerance:** How long before a listing is "old" to your users — 7 days (our exclusivity window), 30, 90? Sets CONV-11's expiry N.
7. **Watermark norm:** Do Chiang Mai brokers expect to keep their own watermark/branding on photos? If so, CONV-13's "no third-party watermark" rule needs a carve-out for the verified original lister.

---

## Sources

*(Access date for all: 2026-06-12.)*

**Global — UX / conversion authorities**
- Baymard Institute — Always Use Thumbnails to Represent Additional Product Images: https://baymard.com/blog/always-use-thumbnails-additional-images
- Baymard Institute — Hotel & Property Rental Website UX Audit: https://baymard.com/audits/travel-accommodations
- Baymard Institute — Product Page UX 2025 (15 pitfalls/best practices): https://www.linkedin.com/posts/baymard-institute_product-page-ux-2025-15-pitfalls-and-best-activity-7285002885770182656-N_YX
- Baymard Institute — Product Page article collection: https://baymard.com/blog/collections/product-page
- Nielsen Norman Group — Progressive Disclosure: https://www.nngroup.com/articles/progressive-disclosure/
- Nielsen Norman Group — Accordions on Desktop: https://www.nngroup.com/articles/accordions-on-desktop/
- Nielsen Norman Group — Homepage Real-Estate Allocation: https://www.nngroup.com/articles/homepage-real-estate-allocation/

**Global — listing engagement / photos**
- Zillow Research — Saves, Shares & Views vs price/speed: https://www.zillow.com/research/save-shares-views-35038/
- Lens Collective — How Many Photos? Optimizing Real Estate Listings: https://www.lens-collective.com/journal/photo-count-optimizing-real-estate-listings
- MLS Import — How Listing Photos Impact Buyer Engagement: https://mlsimport.com/how-listing-photos-influence-buyer-interest-and-home-sales/
- Wire Associates — One-Photo experiment (exterior vs twilight CTR): https://www.wireassociates.com/blog/how-to-sell-your-home-faster-i-ran-an-experiment-on-the-one-photo-decision-that-determines-whether-buyers-click-or-scroll/
- Roomagen — Real Estate Photo Statistics & Trends 2026: https://roomagen.com/blog/real-estate-photo-statistics-trends-2026

**Global — contact friction / alerts / map**
- JustCall — Real Estate Lead Conversion 2025 Guide: https://justcall.io/blog/lead-conversion-in-real-estate-guide.html
- Call Digital Fire — Conversational Messaging Ads for RE leads: https://www.calldigitalfire.com/post/why-conversational-messaging-ads-will-change-the-way-you-generate-real-estate-leads
- AgentZap — Real Estate Lead Response Statistics 2026: https://agentzap.ai/blog/real-estate-lead-statistics
- Contempo Themes — Property Alerts to keep buyers engaged: https://contempothemes.com/real-estate-agents-property-alerts-keep-buyers-engaged/
- AgentFire — How Real Estate Maps Transform Property Searching: https://agentfire.com/blog/how-real-estate-maps-transform-property-searching/
- Google Maps Platform — Solutions for Real Estate: https://mapsplatform.google.com/solutions/real-estate/

**Global — price anchoring / asking-vs-sale**
- Axios — Homebuyers score bigger discounts (2026): https://www.axios.com/2026/02/16/home-sale-discount-metro
- Real Estate News — Nearly two-thirds of buyers scored a discount in 2025: https://www.realestatenews.com/2026/02/03/nearly-two-thirds-of-homebuyers-scored-a-discount-in-2025
- HomeLight — Sale-to-List Ratio: https://www.homelight.com/blog/sale-to-list-ratio/
- Homeward Legal (UK) — Asking vs selling price gap 2024: https://www.homewardlegal.co.uk/news/post/uk-property-price-gap-2024-asking-vs-selling-prices

**Global — trust killers**
- The Warren Group — 5 Common Property Listing Pitfalls: https://www.thewarrengroup.com/blog/5-common-property-listing-pitfalls-and-how-to-fix-them/
- Homes.com — AI-altered listing photos spark new scrutiny: https://www.homes.com/news/ai-altered-listing-photos-spark-new-scrutiny-in-real-estate/965875319/
- Bay Mgmt Group — Protect Your Listings from Scams: https://www.baymgmtgroup.com/blog/protect-your-property-listings-from-being-used-in-scams/
- Fox News — How Legit Is That Listing? Five Signs It's a Fake: https://www.foxnews.com/real-estate/how-legit-is-that-listing-five-signs-its-a-fake

**[THAI] — chat commerce / LINE**
- Bangkok Post — Chat commerce set to surge: https://www.bangkokpost.com/business/general/2724639/chat-commerce-set-to-surge
- Content Shifu — LINE Thailand NOW & NEXT 2024: https://contentshifu.com/en/news/line-thailand-now-next-thriving-through-the-economic-instability-2024/
- Statista — Social commerce in Thailand (facts): https://www.statista.com/topics/9711/social-commerce-in-thailand/
- Nation Thailand — Messaging soars in Thailand: https://www.nationthailand.com/blogs/news/general/40048811

**[THAI] — negotiation norms**
- Pantip 38612444 — How much to negotiate on a second-hand house: https://pantip.com/topic/38612444
- Pantip 42369409 — How buyers negotiate (new & second-hand): https://pantip.com/topic/42369409
- PropertyScout — Negotiating second-hand house/condo price: https://propertyscout.co.th/แนะนำ/ต่อรองราคาบ้าน-และคอนโด/
- DotProperty — Techniques for negotiating house/condo price: https://www.dotproperty.co.th/blog/เปิดเทคนิคต่อรองราคาบ้านและคอนโด
- DDproperty — Appraisal price vs actual sale price: https://www.ddproperty.com/คู่มือซื้อขาย/ราคาประเมิน-vs-ราคาขายจริง-8573

**[THAI] — scams / portal trust complaints**
- Pantip 42030225 — Scam warning for property investors: https://pantip.com/topic/42030225
- Pantip 42202705 — Broker scam (lost everything): https://pantip.com/topic/42202705
- Pantip 42542474 — Fake-buyer / borrowed-photo warning: https://pantip.com/topic/42542474
- Pantip 37052982 — Can't reach DDproperty/9NAR agents: https://pantip.com/topic/37052982
- AppDisqus — DDproperty app review: https://www.appdisqus.com/review-ddproperty/
- LivingInsider (dominant Thai listing portal, UX baseline): https://www.livinginsider.com/

**[THAI] — incumbent portal UX baseline (F16, F17)**
- DDproperty — Managing Your Messages on AgentNet (Phone Reveal / Line / Enquiry Form contact channels): https://www.agentofferings.ddproperty.com/help-centre/managing-your-messages-on-agentnet/
- DDproperty — Google Map property & real-estate search: https://www.ddproperty.com/en/commercial-map-search
- DDproperty — Thailand property apps (filters, current-location search, high-quality images): https://www.ddproperty.com/en/mobile
- LivingInsider — Manual / FAQ (Premium adjustable contact: phone + Line ID per listing; Living-Line-Assistant instant LINE notification): https://www.livinginsider.com/en/manual.php
- LivingInsider — Thai #1 Property app (galleries, filters, ~4M MAU): https://play.google.com/store/apps/details?id=com.livingstock
- PropertyScout — listing & concierge/chatbox contact model: https://propertyscout.co.th/en/
- Online Marketplaces — Visual Guide to Real Estate Portals in Thailand: https://www.onlinemarketplaces.com/articles/visual-guide-to-real-estate-portals-in-thailand/

---

## Review response

- **Finding 1 (ALIGNMENT — no finding inspects incumbent Thai-portal UX): Applied.** Re-researched the three named portals (DDproperty/LivingInsider/PropertyScout) and added two findings. **F16:** DDproperty (No.1, ~3.5M visits) still fronts a **name/email/phone enquiry form** (+ Phone Reveal, Line) — the exact lead-form friction we remove — while LivingInsider (~4M MAU) is LINE-native (Line-ID-per-listing + "Living-Line-Assistant" instant LINE notify), so CONV-06/CONV-07 are now grounded as "match the best local pattern, beat the dominant one," not just Baymard theory. **F17:** incumbents already ship galleries/filters/map search, so CONV-03/CONV-05/CONV-08 are reframed as parity-or-better plays and the real wedge is trust + LINE-speed. Wired into the F6/F7/F12 and F8 Implications and Confidence; added 7 portal-baseline sources.
- **Finding 2 (EVIDENCE — "~80% repeat via LINE" unsourced): Applied.** Could not independently attribute the 80% figure on re-search; the cleanly-sourced version is "~67% repeat through the same chat channel after a positive experience." **Dropped the 80% claim from F12** and replaced with the 67% stat (clearly labelled), kept the VERIFIED 462B→1.14T / 54M / 77% / 67-min figures, and noted the swap in Confidence.
- **Finding 3 (CONTRADICTION — CONV-12 overclaims "verified LINE member" / "structurally impossible"): Applied.** Reworded CONV-12 and the F13/F14 implication to "authenticated LINE login + membership/opt-in record" (our actual gate), explicitly noting the MINI App channel is currently *unverified* at the LINE-platform level and visitors aren't admin-vetted; softened "structurally impossible" to "structurally deterred (no anonymous publish path)." This is the one place the research had promised more than the settled stack delivers — now corrected and flagged.
- **Finding 4 (ACTIONABILITY — CONV-01 block vs warn inconsistent across 3 locations): Applied.** Made CONV-01 explicitly **conditional**: warn+nudge by default, hard-block **only if** Ask-the-market #1's Chiang Mai photo-median check supports it. Aligned the F1/F2 Implication to match; the heuristic, implication, and Ask-the-market #1 now agree.
- **Finding 5 (EVIDENCE — F2 Wire Associates 403): Applied (beyond the suggested fix).** Re-research surfaced that the day-vs-twilight *direction itself is contested* (other vendor data shows twilight thumbnails out-clicking daytime +30–76%), so I did **not** adopt the critic's "exterior beats twilight" framing — instead I kept only the well-corroborated load-bearing claim (thumbnail decides the click; clean front-exterior is the highest-leverage photo), demoted the percentages and the day/twilight winner to explicitly-flagged folklore, tagged F2 "[directional/vendor]" inline, and noted the 403 + Lens Collective corroboration in Confidence.
- **Finding 6 (ALIGNMENT — F8/CONV-08 understates map build cost, leans on vendor evidence): Applied.** Flagged F8 in the Implication as the **weakest-evidenced finding and a high-cost geocoding bet**; resequenced to **list-first MVP + map as a validated fast-follow** pending Ask-the-market #3; softened CONV-08 from "map a first-class mode" to that sequencing; noted in Confidence.
- **Finding 7 (CONTRADICTION — F6/F7 headline numbers demoted to PLAUSIBLE only in Confidence): Applied.** Added inline "[directional/vendor]" tags to F6 ("81% abandonment") and F7 ("100× / 5-minute") in the Findings section so the hedge travels with the claim, matching how F2/F8 are tagged in place.
