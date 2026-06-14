/**
 * SPA entry. Await `liff.init()` FIRST (LIFF requires it before any URL read/mutation), then render
 * the React router. An init failure (e.g. missing LIFF ID, opened outside LINE) shows a friendly,
 * themed message. The production api client is bound to the LIFF id-token here — the SDK stays
 * isolated to liff.ts (hexagonal); the rest of the app only sees the injected client + translator.
 */
import { createTranslator } from "@line-robot/ui";
// Self-hosted brand fonts (closes the "fonts named but never delivered" gap — TECH-06). @fontsource
// ships @font-face + woff2 for the Thai + Latin subsets; family names match the --font-*-th stacks in
// theme.css. No external CDN (the website self-hosts the same way — Base.astro).
import "@fontsource/sarabun/thai-400.css";
import "@fontsource/sarabun/thai-700.css";
import "@fontsource/sarabun/latin-400.css";
import "@fontsource/sarabun/latin-700.css";
import "@fontsource/noto-sans-thai/thai-600.css";
import "@fontsource/noto-sans-thai/thai-700.css";
import "@fontsource/noto-sans-thai/latin-600.css";
import "@fontsource/noto-sans-thai/latin-700.css";
import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { App } from "./app/App.tsx";
import { ErrorView } from "./components/States.tsx";
import "./global.css";
import { createDefaultApiClient } from "./lib/api.ts";
import { getIdToken, initLiff, uiLocale } from "./lib/liff.ts";

const container = document.getElementById("app");

async function boot(): Promise<void> {
  if (container === null) return;
  const root = createRoot(container);
  try {
    await initLiff();
    const locale = uiLocale();
    const api = createDefaultApiClient(getIdToken);
    root.render(
      <StrictMode>
        <App api={api} locale={locale} />
      </StrictMode>,
    );
  } catch (error) {
    console.error("LIFF init failed", error);
    // Themed fallback — the global stylesheet is already imported, so this renders styled (not the
    // unstyled serif fallback). 401 copy nudges the user to open from inside LINE.
    const t = createTranslator("th");
    root.render(
      <StrictMode>
        <div className="min-h-dvh bg-bg font-body-th text-text" lang="th">
          <div className="mx-auto grid max-w-[480px] gap-4 p-4">
            <ErrorView t={t} status={401} />
          </div>
        </div>
      </StrictMode>,
    );
  }
}

void boot();
