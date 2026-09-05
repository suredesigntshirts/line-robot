# Product vision

## Original vision (plan 19 §2, 2026-06-12 — verbatim)

A real-estate marketplace for Thailand (North-flavored marketing, no hard geographic restriction) with a LINE-native growth loop:

1. **Passive collection** — the bot sits in LINE groups where brokers/owners already share listings and extracts them automatically. Listings are **private to that group's mirror** by default.
2. **Claim & publish** — the bot DMs the poster: claim your listing, publish it publicly with one tap (**poster opt-in is the only path to public**; doubles as user onboarding).
3. **Group first-dibs** — each listing gets a **time-based exclusivity window** in its group (default 7 days, configurable per group). Members can flag interest to hold it; when the window lapses, the poster can release it publicly or to other groups.
4. **Public website** — SEO-ready Astro site: anonymous browse/search of public listings (buy / sell / rent), owner submission via form *or* chat, Thai + English.
5. **Roles & dealflow** — broker / investor / owner / visitor. Broker and investor are **admin-approved**. Owners can submit discounted quick-sale properties; matched vetted brokers/investors get a LINE push and respond with structured quotes in-app.
6. **Price estimates (AVM)** — hybrid: own listing corpus + LLM comparable analysis first; public land-office sales data ingested via a dedicated pipeline; broker quotes enrich it over time. Outputs market price + time-to-sell at various price points.

**Business model:** public listings free; later, broker/investor subscriptions pay for private dealflow access. Build order optimizes for the inventory/traffic flywheel first.

## 2026-09 pivot — website first, bot parked

As of 2026-09-05 the **public website is the product** and the LINE bot / mini-app (points 1–3 and 5
above, plus the mini-app CRM) are **parked**: still deployed, not developed (decision D27). Why:
the bot's extraction quality and the effort of keeping the group → claim → publish loop working
outweighed what it produced (5 real listings), while the website is the asset users actually see and
search engines index. Listing supply therefore moves to the website: an owner/agent submission form
that re-uses the extraction pipeline (text + photos → structured listing → review → publish) — its
own plan, not yet written. The exclusivity, roles and dealflow mechanics (points 3 and 5) and the
AVM (point 6) remain the long-term vision but are not being built now; D5 (LINE Login primary) and
D7 (poster opt-in is the only public path) are under review because the supply decision may change
them.

What carries over unchanged: the Postgres/PostGIS catalog and its migrations, the extraction /
dedup / quality-gate pipeline and its eval scorecard, the design tokens and `packages/ui`, the
bilingual copy canon and heuristic register (`handbook/research/00-product-principles.md`), and the
real-browser e2e discipline (a feature is not done because it renders; a test must prove it works).
