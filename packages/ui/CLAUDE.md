# CLAUDE.md — packages/ui (shared React components, tokens, i18n)

- **`theme.css` is THE single token source** (Tailwind v4 `@theme`); `--color-brand-*` are the non-flipping
  deep blues for hero/CTA bands. Dark mode keys on `<html data-theme>`; prefer flipping tokens over `dark:`.
- **`fallbacks.css`** is the generated oklch→hex fallback for old Thai-Android WebViews. Regenerate with
  `npm run tokens:fallbacks -w @line-robot/ui` after editing tokens; never hand-edit it.
- **shadcn primitives are owned code** in `src/components/ui/`, themed through the `@theme inline` alias
  layer. Author components in Tailwind utilities; never inline `style=` or bespoke CSS.
- **i18n catalogs** `src/i18n/{th,en}.ts` hold every user-facing string for the website and mini-app; the
  brand name is the `site.name` key (placeholder, D29). Thai copy follows the register (COPY-*, B3): bare-verb
  CTAs, no internal ids on screen.
- `npm run test -w @line-robot/ui` runs vitest + `scripts/check-colors.mjs` (tokens only, no raw colours in
  components). `npm run gallery -w @line-robot/ui` is a Vite component gallery for eyeballing components;
  never review the site from it — it is not the production build.
