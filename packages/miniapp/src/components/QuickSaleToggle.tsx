/**
 * Quick-sale toggle on the detail screen (Stage 6, D10) — OWNER-only, SALE listings only. The claimant
 * marks the listing quick-sale → `POST /properties/{id}/quick-sale` (sets `urgency='quick_sale'` server
 * -side, idempotent). On success the toggle flips to a persistent "ขายด่วน" badge + an explanatory note
 * (vetted brokers get the quick-quote push, INC-B4). The api enforces claimant + sale-only — a rental
 * 409s `not_a_sale_listing` (mapped to a field error), a non-claimant 404s.
 *
 * Rendered only for an OWNED sale listing (the DetailScreen gates on `isClaimedByMe && dealType==='sale'`)
 * — so the toggle never shows for a member or a rental. Markers: `data-th-content` (TH-07) +
 * `data-cta-solid` on the solid toggle button (WCAG-AA contrast).
 */
import { primaryButtonClass, type Translator } from "@line-robot/ui";
import { useState } from "react";
import { type ApiClient, ApiError } from "../lib/api.ts";

export function QuickSaleToggle({ id, api, t }: { id: string; api: ApiClient; t: Translator }) {
  // Quick-sale state is session-local here: the detail GET doesn't surface `urgency`, so we reflect the
  // toggle's own confirmed result. The state IS persisted server-side (the POST is idempotent) — a
  // vetted broker's quote submit reads the persisted `urgency` (it 409s `not_quick_sale` without this).
  const [active, setActive] = useState(false);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function toggle(): Promise<void> {
    setError(null);
    setBusy(true);
    try {
      await api.quickSale(id);
      setActive(true);
    } catch (err) {
      setError(
        err instanceof ApiError && err.status === 409
          ? t("quickSale.errorNotSale")
          : t("quickSale.error"),
      );
    } finally {
      setBusy(false);
    }
  }

  return (
    <section className="grid gap-1.5" data-quick-sale={id} lang="th" data-th-content>
      <h2 className="m-0 font-heading-th font-semibold text-md text-text leading-normal">
        {t("quickSale.head")}
      </h2>
      {active ? (
        <div
          className="grid gap-1 rounded-md border border-danger bg-danger-bg px-3 py-2.5"
          data-quick-sale-active
        >
          <span className="inline-flex items-center gap-1.5 font-body-th font-semibold text-base text-text leading-relaxed">
            <span
              data-badge
              className="rounded-full bg-danger px-2 py-0.5 font-body-th font-semibold text-surface text-xs leading-normal"
            >
              ⚡ {t("quickSale.activeBadge")}
            </span>
          </span>
          <span className="font-body-th text-sm text-text-2 leading-relaxed">
            {t("quickSale.activeNote")}
          </span>
        </div>
      ) : (
        <>
          <button
            type="button"
            data-cta-solid
            data-quick-sale-toggle
            disabled={busy}
            onClick={toggle}
            className={`${primaryButtonClass} gap-2 disabled:opacity-60`}
          >
            {busy ? t("quickSale.toggling") : `⚡ ${t("quickSale.toggleCta")}`}
          </button>
          <p className="m-0 font-body-th text-sm text-text-disabled leading-relaxed">
            {t("quickSale.note")}
          </p>
          {error !== null && (
            <p
              className="m-0 font-body-th text-danger text-sm leading-relaxed"
              role="alert"
              data-quick-sale-error
            >
              {error}
            </p>
          )}
        </>
      )}
    </section>
  );
}
