/** SPA entry. Await `liff.init()` FIRST (LIFF requires it before any URL read/mutation), then render
 * the router. An init failure (e.g. missing LIFF ID, opened outside LINE) shows a friendly message. */
import { render } from "preact";
import { App } from "./App.js";
import { initLiff } from "./liff.js";
import "./styles.css";
import { ErrorView } from "./ui.js";

const root = document.getElementById("app");

async function boot(): Promise<void> {
  if (root === null) {
    return;
  }
  try {
    await initLiff();
    render(<App />, root);
  } catch (error) {
    console.error("LIFF init failed", error);
    render(
      <div class="screen">
        <ErrorView />
      </div>,
      root,
    );
  }
}

void boot();
