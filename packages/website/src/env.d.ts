/// <reference types="astro/client" />

declare namespace App {
  interface Locals {
    /** Parsed UI-variant spec (from `?ui=` or the `ui` cookie); see lib/variants.ts. */
    ui: import("./lib/variants.ts").UiSpec;
    /** True when THIS request carried `?ui=` — the explicit preview case (shows the variant chip). */
    uiFromQuery: boolean;
  }
}
