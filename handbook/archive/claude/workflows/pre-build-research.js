export const meta = {
  name: 'pre-build-research',
  description: 'Research 10 Thai-market/UX/tech artifacts, critique each with Opus, revise',
  phases: [
    { title: 'Research', detail: 'one researcher per artifact — thought-leader-first, Thai sources required' },
    { title: 'Critique', detail: 'Opus critic per artifact — alignment, evidence, actionability, contradictions', model: 'opus' },
    { title: 'Revise', detail: 'researcher-tier agent applies valid findings, rebuts invalid ones' },
  ],
}

const CONTEXT = `PRODUCT CONTEXT (for a real-estate marketplace being built; today is June 2026):
We are building a Thai real-estate marketplace centered on Northern Thailand (Chiang Mai), launching Thai+English. Core mechanics:
- A LINE bot passively listens in broker/owner LINE group chats and auto-extracts property listings (sale + rent) with an LLM pipeline. Listings are PRIVATE to a mirror of that group by default.
- The poster must explicitly OPT IN (via bot DM) to publish a listing publicly. Each listing gets a time-based exclusivity window in its group (~7 days); when it lapses, the poster can release it publicly or to other groups.
- Public website: Astro 6 SSR + React islands + Tailwind + shadcn, anonymous browsing, SEO-driven. LINE Login is the primary identity; website also email/Google. A LINE mini-app (LIFF) mirrors the catalog for members.
- Roles: broker / investor / owner / visitor. Broker + investor are ADMIN-APPROVED (vetted). Future revenue: broker/investor subscriptions for private dealflow; public listings free.
- Quick-sale flow: owners submit discounted properties; matched vetted brokers/investors get a LINE push and submit structured quotes in-app.
- Later: price estimates (AVM) from own corpus + LLM comparable analysis + public land-office sales data.
- Listings enter via passive chat collection, a bot DM chat flow, or a structured web form. An LLM quality/spam/duplicate gate screens public listings.
Currently TESTING with a small group of users. Stack and flows above are settled decisions — research that contradicts them should SAY SO explicitly (it will be surfaced to the founder), not silently assume them away.`

const FORMAT = `ARTIFACT FORMAT CONTRACT (follow exactly, in this order):
1. "# <title>" + one-paragraph scope note (what decisions this artifact gates).
2. "## Thought leaders & sources consulted" — the 3-5 highest-signal voices/sources you identified, each with 1-2 lines justifying credibility (track record, depth, recency — NOT popularity). You must search for and vet these FIRST, then distill their thinking.
3. "## Findings" — numbered, factual, each with inline citation (source + date). Prioritize 2024-2026 sources; mark anything older.
4. "## Implications for us" — each finding mapped to a concrete decision in our product (schema field, flow, design choice, copy rule).
5. "## Heuristics" — the core deliverable: numbered falsifiable rules with IDs (prefix given per artifact), e.g. "TH-04: Primary contact CTA is always LINE chat; phone secondary; never an email form as primary." Each heuristic must be checkable by a reviewer looking at a screen/schema/copy — no vague advice ("be user friendly" is rejected). Aim for 6-15 high-quality heuristics.
6. "## Anti-patterns" — concrete failure modes observed in the market.
7. "## Confidence" — two lists: VERIFIED (cited, current) vs PLAUSIBLE-BUT-UNVERIFIED (label honestly; do not launder guesses into facts).
8. "## Ask the market" — questions desk research cannot answer that the founder should validate with real brokers/users in his LINE groups.
9. "## Sources" — full list with URLs and access dates.

RULES: Use WebSearch/WebFetch extensively. THAI-LANGUAGE sources are REQUIRED where marked (search in Thai: Pantip, Thai app-store reviews, Thai UX/marketing/RE writing) — English-only sourcing on Thai-user questions will be rejected by review. Write the artifact file with the Write tool. Your final reply must be ONLY a short summary: file path, heuristic count, top 5 findings (one line each), and your 2 weakest/least-confident areas. Do NOT paste the artifact into your reply.`

const ARTIFACTS = [
  { id: 'A1', model: 'opus', prefix: 'DEAL', file: 'a1-transaction-mechanics-broker-culture.md', thai: true,
    brief: `Thai real-estate TRANSACTION MECHANICS & BROKER CULTURE. Questions: How do residential/land sales actually close in Thailand (offer → deposit/reservation → Land Office transfer day; typical timelines; who pays which fees/taxes and the customary splits)? Commission norms and co-agent splits; how brokers cooperate and protect listings in a no-MLS market ("farming", open vs exclusive mandates). CRITICAL: how LINE groups are used for broker dealflow TODAY — what gets shared, etiquette, co-agency offers, poaching norms, any informal exclusivity conventions (our product digitizes exactly this). Owner-direct sale culture (signs, Facebook, Kaidee). Rental transaction norms (deposits, 1-year contracts, agent month). Northern-Thailand specifics where they differ from Bangkok. Gates: our group/exclusivity mechanics, quick-sale flow, trust design.` },
  { id: 'A2', model: 'sonnet', prefix: 'MKT', file: 'a2-market-landscape-north.md', thai: true,
    brief: `Thai RE MARKET LANDSCAPE with a Northern/Chiang Mai lens. Supply/demand by segment 2024-2026 (CNX condo stock and absorption, houses, land, rental market), price levels and trends, buyer segments (Thai families, Thai investors, Chinese buyers, retirees, digital nomads — relative importance and what each searches for), where price/transaction data actually lives in Thailand (Treasury Dept appraisals, REIC, AREA, bank research, portal indices) and how accessible each source is for a future automated valuation model. Gates: AVM expectations, search facets, launch content strategy.` },
  { id: 'A3', model: 'sonnet', prefix: 'DIST', file: 'a3-distressed-assets.md', thai: true,
    brief: `DISTRESSED ASSETS in Thai real estate. Bank NPA sales: which banks run NPA portals (e.g. Bangkok Bank, Krungsri, KBank, GHB, SAM, BAM), how purchases work, typical discounts to market. Legal Execution Department (LED) auctions: process, deposits, risks (occupancy, redemption rights, condition). How private investors source discounted/urgent deals today (LINE/Facebook groups, agents specializing in "ขายด่วน"). Typical discount ranges for quick sales and realistic time-to-sell at various discounts. Whether NPA/auction data could be INGESTED as a data source (formats, terms). Gates: our quick-sale/quote product design and Stage-7 data sources.` },
  { id: 'A4', model: 'sonnet', prefix: 'FIELD', file: 'a4-listing-field-canon.md', thai: true,
    brief: `THAI LISTING FIELD CANON — the definitive field matrix for Thai property listings. Survey what fields DDproperty, LivingInsider, FazWaz, Baania, Hipflat, Kaidee Property and land-office records use. Cover: area units (rai/ngan/tarang-wah + sqm conventions), title deed types (โฉนด, น.ส.3ก, ส.ป.ก. etc.) and what buyers expect to see, condo specifics (foreign quota, CAM fee, sinking fund, floor, building), house/land specifics (land shape, road access width, utilities, zoning/city-plan colors), FLOOD HISTORY (how sites surface it), orientation/direction beliefs, rental-specific fields (deposit, minimum term, pets), price fields (asking vs negotiable signals), location granularity conventions (province/amphoe/tambon + landmarks/roads in the North vs BTS in Bangkok). DELIVERABLE beyond findings: a recommended canonical field schema — required vs optional per property type (condo/house/townhouse/land/commercial) and per listing type (sale/rent). This artifact feeds our database schema DIRECTLY; precision matters more than prose.` },
  { id: 'A5', model: 'sonnet', prefix: 'COMP', file: 'a5-competitor-teardown.md', thai: true, agentType: 'general-purpose',
    brief: `COMPETITOR TEARDOWN with LIVE BROWSING. Use the playwright-cli skill (Skill tool) to actually browse: ddproperty.com, livinginsider.com, fazwaz.com, baania.com, kaidee.com (property section), hipflat.co.th. For each: screenshot the homepage, a search-results page, a listing detail page, and the contact flow — save screenshots under docs/research/assets/a5/ with descriptive names (these also seed a later design mood board). Extract: listing fields actually displayed, search/filter UX, contact mechanics (LINE button? phone reveal? lead form?), agent-vs-owner labeling, monetization (featured listings, agent subscriptions), mobile experience. Then mine THAI user sentiment: Pantip threads, Thai app-store reviews — what people praise/complain about per portal. Treat Facebook/LINE groups as the real incumbent: why do listings live there instead of portals? End with a gap analysis vs OUR product. If the browser tooling fails on a site, note it explicitly and fall back to web research for that site — do not silently skip.` },
  { id: 'A6', model: 'sonnet', prefix: 'LEGAL', file: 'a6-legal-disclosure-test-phase.md', thai: true,
    brief: `LEGAL/DISCLOSURE — DELIBERATELY SCOPED SMALL. We are testing with a small user group and will disclose; full compliance is parked. Deliverables: (1) a practical DISCLOSURE/CONSENT CHECKLIST for the test phase — what a bot collecting messages in LINE groups should disclose under Thailand's PDPA (consent basis for collecting chat content, storing personal data like names/phones, and publishing a listing only with poster opt-in), in plain language we can put in the bot's group-join message and DMs; (2) a PARKED REGISTER of full-compliance items for later (PDPA controller duties, privacy policy, data-subject rights, advertising-content rules, accuracy disclaimers on foreign-ownership content, when to consult a Thai lawyer). Be practical and honest about uncertainty — this is an engineering checklist, NOT legal advice, and must say so. Keep it short relative to other artifacts.` },
  { id: 'B1', model: 'opus', prefix: 'TH', file: 'b1-thai-web-behavior-design.md', thai: true,
    brief: `THAI WEB USER BEHAVIOR & DESIGN PATTERNS 2026. Mobile/LINE-centricity (current stats), login preferences (LINE Login adoption vs phone-OTP vs email — what Thai users actually pick and abandon), trust signals Thai users expect on a commerce/listing site (visible LINE QR/ID, real phone numbers, real photos vs renders, Thai-language support presence), information-density preferences (the dense-Thai-website trope vs modern Thai design — find actual evidence both ways, e.g. how top Thai consumer apps design today), THAI TYPOGRAPHY craft (font choices: Noto Sans Thai, Sarabun, LINE Seed Sans TH, IBM Plex Thai; looped vs loopless debate; line-height needs; word-breaking without spaces — a real engineering issue for us), color/cultural notes that matter (and which clichés to ignore), Thai SEO behavior (Google share, how Thais phrase property searches in Thai). Identify actual Thai UX/design thought leaders writing in Thai. Gates: our entire design system and auth flows.` },
  { id: 'B2', model: 'opus', prefix: 'CONV', file: 'b2-re-browsing-psychology-conversion.md', thai: false,
    brief: `REAL-ESTATE BROWSING PSYCHOLOGY & CONVERSION — global evidence with Thai-specific overlays where findable (Thai sources welcome but global research is acceptable here; LABEL which is which). Photo-first behavior (photo count/order effects on engagement), map vs list usage patterns, price anchoring and the asking-vs-transaction gap psychology (Thai negotiation expectations specifically if findable), contact friction (chat-first vs lead forms — conversion evidence; this validates or challenges our LINE-first design), progressive disclosure on listing detail pages (what's above the fold on high-performing portals and why), saved-search/alert re-engagement mechanics, trust killers (stale listings, fake listings, watermark spam — and how good portals fight them). Distill from named conversion/marketplace thought leaders (e.g. Baymard-style research, marketplace growth practitioners) — vet credibility first. Gates: listing page layout, search UX, contact flows, re-engagement.` },
  { id: 'B3', model: 'sonnet', prefix: 'COPY', file: 'b3-bilingual-copy-canon.md', thai: true,
    brief: `BILINGUAL (THAI/ENGLISH) COPY CANON for a marketplace UI. Thai register/tone for consumer apps (polite-but-warm; where particles like ครับ/ค่ะ belong in UI copy vs not; formal vs casual norms in top Thai apps — examine how LINE, Shopee TH, Krungthai NEXT, Grab TH write), how Thai property listings are actually written (structure, superlatives, emoji conventions, the "ขายด่วน" genre), CTA verb conventions in Thai (what top apps use for submit/search/contact/save), microcopy patterns (errors, empty states, confirmations) in good Thai products, Thai/English text-length ratios and layout implications (which language runs longer, truncation risks), transliteration conventions for Northern place names (Tambon/Amphoe romanization consistency). DELIVERABLE: heuristics + a starter glossary table (EN term -> recommended TH term) for ~30 core marketplace terms (listing, for sale, for rent, contact agent, book viewing, price negotiable, title deed, etc.). Gates: every string in our i18n catalogs.` },
  { id: 'C1', model: 'sonnet', prefix: 'TECH', file: 'c1-frontend-stack-canon.md', thai: false, agentType: 'general-purpose',
    brief: `FRONTEND STACK CANON. STEP 1 (mandatory, do first): verify the ACTUAL LIVE current stable versions as of June 2026 of: Astro (is 6.x current? exact minor), Tailwind CSS (v4.x exact), shadcn/ui (current CLI/distribution model), React (19.x exact), and the Astro AWS SSR adapter options — via official sites/GitHub releases. Record exact versions in the artifact; our dev starts within a week and codes against THESE versions. STEP 2: use the documentation-downloader skill (Skill tool) to cache the key docs locally (Astro islands/SSR/i18n routing, Tailwind v4 theming, shadcn theming/installation) so later coding sessions have version-matched references; note in the artifact where the cached docs live. STEP 3: distill best-practice patterns FOR OUR SHAPE OF APP (SEO-critical listing site, SSR on AWS Lambda, React islands kept minimal, bilingual th/en routing): islands architecture discipline (what hydrates, what stays static; server islands), Astro i18n routing patterns for th/en, view transitions, schema.org RealEstateListing structured data, Tailwind v4 token/theming patterns (@theme) for a shared design system consumed by Astro + a separate React SPA, shadcn customization without fork-drift, React state discipline for islands (server-derived data, minimal client state, when TanStack Query is and is not justified). Vet 3-5 high-signal practitioners (framework core team members, recognized educators) rather than random blog spam. Gates: Stages 3-4 code patterns.` },
]

function researchPrompt(a) {
  return `${CONTEXT}

YOUR ASSIGNMENT — artifact ${a.id}: ${a.brief}

Heuristic ID prefix for this artifact: ${a.prefix}- (e.g. ${a.prefix}-01).
${a.thai ? 'THAI-LANGUAGE sourcing is REQUIRED for this artifact (search in Thai as well as English).' : 'Thai sources optional for this artifact; label Thai-specific vs global evidence.'}
Write the artifact to: /home/user/src/line-robot/docs/research/${a.file}

${FORMAT}`
}

function critiquePrompt(a) {
  return `${CONTEXT}

You are an ADVERSARIAL CRITIC. Read the research artifact at /home/user/src/line-robot/docs/research/${a.file} (assignment was: ${a.brief.slice(0, 400)}...).

Judge it through four lenses:
1. ALIGNMENT — is it specific to OUR product (LINE-first, bilingual Thai marketplace, private groups, vetted dealflow), or generic filler that could apply to any website? Generic sections are findings.
2. EVIDENCE — are citations real-looking, dated, current (2024-2026 preferred)? ${a.thai ? 'Were Thai-language sources actually used (REQUIRED for this artifact)? English-only sourcing here is a BLOCKER.' : 'Is global vs Thai-specific evidence honestly labeled?'} Are the claimed thought leaders credible and is their credibility justified?
3. ACTIONABILITY — is every heuristic falsifiable by a reviewer looking at a screen/schema/copy? Vague advice is a finding. Are there enough heuristics (6+) and do they carry the ${a.prefix}- prefix?
4. CONTRADICTIONS — internal contradictions, claims that contradict the product context above (flag explicitly — the founder wants these surfaced, not suppressed), and any claim that smells like training-data invention rather than research (spot-check 2-3 citations with WebFetch if suspicious).

Also verify the format contract was followed (sections 1-9, Confidence split, Ask-the-market present).

DO NOT edit any file. Return a numbered findings list, each with severity [BLOCKER/MAJOR/MINOR], the specific location in the artifact, and what a fix requires (including what to re-research). If the artifact is genuinely strong, say so briefly and list only real findings — do not invent issues to seem thorough.`
}

function revisePrompt(a, critique) {
  return `${CONTEXT}

You are revising the research artifact at /home/user/src/line-robot/docs/research/${a.file} (artifact ${a.id}, heuristic prefix ${a.prefix}-). An adversarial critic reviewed it. Their findings:

${critique}

Your job:
1. For each VALID finding: fix it — including doing targeted re-research with WebSearch/WebFetch where the critic flagged thin or unverified claims. ${a.thai ? 'If Thai sourcing was flagged as missing, you MUST do the Thai-language searches now.' : ''}
2. For each finding you judge INVALID: do not comply blindly — rebut it.
3. Append a final section "## Review response" listing each finding number with either "Applied: <what changed>" or "Rebutted: <why the critic was wrong>".
4. Keep the original format contract intact (sections 1-9). Edit the file in place with Edit/Write.

Return ONLY a 5-line summary: how many findings applied vs rebutted, the most significant change, and the artifact's remaining weakest area.`
}

log('Launching 10 research pipelines (research → critique → revise), artifacts land in docs/research/')

const results = await pipeline(
  ARTIFACTS,
  (a) => agent(researchPrompt(a), { label: `research:${a.id}`, phase: 'Research', model: a.model, ...(a.agentType ? { agentType: a.agentType } : {}) }),
  (researchSummary, a) => agent(critiquePrompt(a), { label: `critique:${a.id}`, phase: 'Critique', model: 'opus' })
    .then((critique) => ({ critique, researchSummary })),
  (prev, a) => prev && prev.critique
    ? agent(revisePrompt(a, prev.critique), { label: `revise:${a.id}`, phase: 'Revise', model: a.model })
        .then((rev) => ({ id: a.id, file: a.file, research: prev.researchSummary, revision: rev }))
    : { id: a.id, file: a.file, research: prev ? prev.researchSummary : null, revision: 'SKIPPED — critique unavailable' }
)

const completed = results.filter(Boolean)
log(`${completed.length}/10 artifact pipelines completed`)
return completed
