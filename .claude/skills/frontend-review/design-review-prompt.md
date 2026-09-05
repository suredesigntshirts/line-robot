# Design-review sub-agent prompt (copy-paste, fill the {blanks})

Spawn a fresh `Explore` agent with the prompt below. Fill `{GALLERY_DIR}` with the target's gallery
(`packages/website/test-results/gallery/local` or `.../deployed`) and `{MOCK_RENDER_DIR}` with the
rendered mock screenshots (`handbook/design/mockups/renders/` — `direction-a-baania-clean-light.png` /
`direction-a-baania-clean-dark.png`; regenerate with `e2e/adhoc/render-mocks.mjs` if the mock changed). Do NOT
pre-summarise the design — fresh eyes are the point.

**Why images-only:** a prior version of this prompt handed the agent the mock's *HTML/CSS source*. The
agent read the source, imagined the mock, and confabulated "ALIGNED" — describing pills/chips/headers
that WEREN'T in the actual render, and citing token values (`#1f5fad`, `oklch(…)`) as "evidence." Text
telling it "use pixels not source" did not stop this. So the structural rule below: **the only inputs
are PNG screenshots; opening any CSS/HTML/theme source is forbidden.** With no source to read, it must
actually compare the two images.

---

You are reviewing the line-robot property website's DESIGN against our chosen direction by comparing
two sets of SCREENSHOTS. This is a pixel comparison of images — you have NO access to any code.

**INPUTS — images only:**
- **Rendered site** (what we built): the PNGs in `{GALLERY_DIR}/`, named `{viewport-theme}-{screen}.png`
  (e.g. `mobile-dark-detail.png`). Open them.
- **The design target** (where we're going): the rendered mock screenshots in `{MOCK_RENDER_DIR}/` —
  `direction-a-light.png` and `direction-a-dark.png` ("Baania-clean", trust-blue Thai portal). Open them.
- For context only (prose, no values to copy): `handbook/design/design-direction.md` (founder taste brief).

**FORBIDDEN — this is the whole point:** do NOT open `theme.css`, `direction-a-baania-clean.html`, any
`.css`/`.tsx`/`.astro` file, git, or any code. Do NOT cite a token/hex/oklch value (`#1f5fad`,
`oklch(…)`, `--color-*`) anywhere. Your only evidence is what you SEE in the two image sets. If you
catch yourself writing a colour code or "the CSS says…", delete it — that is the failure this guards.

## Procedure (do the steps in order; do not skip to the verdict)
1. **Describe the TARGET, blind.** Open `direction-a-light.png` + `direction-a-dark.png` and list the
   concrete visual elements you SEE (e.g. "sticky blue top bar with a wordmark + rounded search pill";
   "pill-shaped filter chips, the active one filled blue"; "each card photo has a small ขาย/เช่า pill
   overlaid top-left and a photo-count chip bottom-right"; "a section title with a short orange
   underline"; "a 5-icon bottom nav"; detail: "gallery + thumbnail strip, a yield pill, a spec table").
1.5. **Signature-element checklist — answer present/absent for the RENDER, cite a screen.** These are
   the elements that distinguish direction-a from a plain listing page; a render can be "blue and Thai"
   yet still miss most of them. For EACH, write `present` / `absent` / `UNVERIFIED` with the screen you
   checked — do not hand-wave "aligned" past them:
   - **a. Sticky app-header bar** with a brand wordmark + a rounded search pill + an icon button
     (target has it; a plain page title + a search form is NOT this).
   - **b. Filter chips as rounded PILLS with a FILLED active state** (target) vs plain outline
     buttons / a dropdown form.
   - **c. A results bar** ("N ประกาศ · …" + a sort control) and/or a **section header** ("ประกาศล่าสุด")
     with a short **orange accent underline**.
   - **d. A ขาย/เช่า deal-pill OVERLAID on the card photo** (top-left), distinct from the status badges
     in the card body.
   - **e. A photo-count chip on the card photo** (bottom-right).
   - **f. Card price treatment**: a small "ราคาเสนอขาย / ค่าเช่า" label ABOVE a bold price.
   - **g. Detail page**: a price block in a tinted box; a yield pill where applicable; a bordered spec
     table; the LINE CTA treatment (single inline vs a sticky dual footer).
   - **h. A bottom nav bar** (target shows one — but note: it may be intentionally omitted on web /
     "responsive not app-only"; flag as a question, don't assume).
   Any `absent` here is a divergence to surface — even if the render is recognisably trust-blue.
2. **Describe the RENDER, blind, screen by screen.** For each `{GALLERY_DIR}` screen, list what you
   actually SEE — header treatment, filter UI (plain form vs pill chips), card treatment (is there a
   deal pill on the photo? a photo-count chip? how are badges styled?), price block, section headers,
   bottom nav, typography feel, dark-mode surfaces. Describe the PIXELS, not what you expect.
3. **Diff them.** For each screen, list every element where the render differs from the target —
   present-in-target-absent-in-render and vice-versa, plus treatment differences (colour, weight,
   spacing, radius). Be specific and cite the screen file.
4. **Surface, don't adjudicate.** Phrase each difference as an open question for the founder ("the
   render's filter row is a plain dropdown form; the target shows pill chips with a filled active
   state — is the plain form intended for now?"). Do NOT decide it's fine; the founder rules.

## HARD RULES
1. **Style only.** Don't review content/fields/copy/data — those come from the live schema (a field the
   mock shows that the render doesn't, or vice-versa, is NOT a finding). This is about visual treatment.
2. **Images only, no source, no token values** (see FORBIDDEN above). Evidence = pixels you saw.
3. **Walk the whole matrix.** Cover every screen across {mobile,desktop} × {light,dark} (home,
   home-rent, detail, empty at minimum). A verdict from a subset is not a review; note any missing screen.
4. **ALIGNED is earned, not assumed.** You may only conclude ALIGNED if, screen by screen, the render's
   header / filter UI / card+photo treatment / badges / price block / section headers / typography /
   dark-mode actually MATCH the target images. "It's a blue Thai property site, so it's aligned" is the
   confabulation this guards against — a plain unstyled-ish render is NOT aligned just because it's blue.

RETURN, as markdown:
- `## Target (blind)` — the elements you saw in the mock renders.
- `## Per-screen` — one line per `{GALLERY_DIR}` screen: a concrete RENDERED observation + aligned/diverges.
- `## Divergences` — the differences, each an open question for the founder, ordered by visual impact.
- `## Look at these` — the 2–3 screen filenames most worth the founder's own eyes.
- `## Verdict` — ALIGNED (only with per-screen pixel evidence of a match) or OPEN-QUESTIONS (list them).
  Never "resolved." If the render plainly does not yet look like the target, say so — that is the
  honest, useful answer, not a failure to be smoothed over.
