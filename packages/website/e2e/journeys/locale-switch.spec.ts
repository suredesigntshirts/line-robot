/**
 * Journey: locale — /en/ renders the English document
 * Covers:  i18n routing — the English route renders with lang="en".
 * Target:  both
 * Added:   2026-06-14
 */
import { expect, test } from "@playwright/test";
import { capture } from "../support.ts";

test(
  "journey: locale — /en/ renders English",
  { tag: ["@journey"] },
  async ({ page }, testInfo) => {
    await page.goto("/en/");
    await expect(page.locator('html[lang="en"]')).toBeAttached();
    await capture(page, "journey-locale-en", testInfo);
  },
);
