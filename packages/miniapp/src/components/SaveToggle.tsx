/**
 * The save/unsave bookmark control on the detail screen (D13). Tapping it POSTs/DELETEs
 * `/properties/{id}/save` and flips OPTIMISTICALLY — the icon/label change immediately, and a failed
 * request ROLLS BACK to the prior state (no silent divergence). Idempotent server-side, so a fast
 * double-tap is safe.
 *
 * DTO gap (noted in the build report): the detail DTO carries no `isSaved`, so the initial state can't
 * be derived from the detail fetch. We start UNSAVED and let the toggle drive it (the simplest correct
 * thing per the build prompt) — a re-fetch of `/me/saved` to seed it would be a heavier call for a
 * single boolean; queued as a possible api addition if the founder wants the persisted state shown.
 *
 * Authored in Tailwind utilities; `data-save-toggle` marks it for the e2e gate (the bookmark is an
 * icon button — exempt from the Thai-line-height net, which skips `button`).
 */
import type { Translator } from "@line-robot/ui";
import { useState } from "react";
import type { ApiClient } from "../lib/api.ts";

export function SaveToggle({ id, api, t }: { id: string; api: ApiClient; t: Translator }) {
  const [saved, setSaved] = useState(false);
  const [busy, setBusy] = useState(false);

  async function toggle(): Promise<void> {
    if (busy) return;
    const next = !saved;
    setSaved(next); // optimistic
    setBusy(true);
    try {
      await (next ? api.save(id) : api.unsave(id));
    } catch {
      setSaved(!next); // rollback on error
    } finally {
      setBusy(false);
    }
  }

  return (
    <button
      type="button"
      data-save-toggle={id}
      data-saved={saved}
      aria-pressed={saved}
      aria-label={t("save.toggleLabel")}
      onClick={toggle}
      lang="th"
      className={`inline-flex items-center gap-1.5 rounded-full border px-3 py-1.5 font-body-th font-semibold text-sm leading-relaxed transition-colors ${
        saved
          ? "border-primary-200 bg-primary-50 text-primary-600"
          : "border-border bg-surface text-text-2"
      }`}
    >
      <span aria-hidden="true">{saved ? "🔖" : "🏷"}</span>
      {saved ? t("save.saved") : t("save.save")}
    </button>
  );
}
