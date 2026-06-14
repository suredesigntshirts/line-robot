/**
 * The OWNER's "ข้อเสนอ (N)" quotes section on the detail screen (Stage 6, D10). Lists the structured
 * offers vetted brokers submitted on this listing (`GET /properties/{id}/quotes`, newest-first). Visible
 * to the claimant/admin only (server-gated) — a plain member 404s and the section isn't rendered for
 * them. Each row shows the offered amount, an optional discount-vs-market, an optional terms note, and
 * when it was submitted.
 *
 * Markers: `data-th-content` (the TH-07 Thai line-height net measures the labels/notes).
 */
import type { Translator } from "@line-robot/ui";
import { useAsync } from "../app/useAsync.ts";
import type { ApiClient } from "../lib/api.ts";
import { formatThb, fullDateTime } from "../lib/display.ts";

export function QuotesSection({
  id,
  api,
  t,
  locale,
}: {
  id: string;
  api: ApiClient;
  t: Translator;
  locale: "th" | "en";
}) {
  const { state } = useAsync(() => api.quotes(id), [id]);
  const quotes = state.status === "ready" ? state.data : [];

  return (
    <section className="grid gap-2" data-quotes-list lang="th" data-th-content>
      <h2 className="m-0 font-heading-th font-semibold text-md text-text leading-normal">
        {t("quotes.ownerHead", { count: quotes.length })}
      </h2>
      {state.status === "loading" ? (
        <p className="m-0 font-body-th text-sm text-text-disabled leading-relaxed">
          {t("quotes.loading")}
        </p>
      ) : quotes.length === 0 ? (
        <p
          className="m-0 font-body-th text-sm text-text-disabled leading-relaxed"
          data-quotes-empty
        >
          {t("quotes.empty")}
        </p>
      ) : (
        <ul className="grid list-none gap-2 p-0">
          {quotes.map((q) => (
            <li
              key={q.quoteId}
              data-quote-card
              className="grid gap-1 rounded-md border border-border bg-surface px-3 py-2.5 shadow-xs"
            >
              {/* The amount line carries the Thai label "เสนอ", so it's measured by the TH-07 net →
                  leading-relaxed (≥1.6), NOT the leading-tight a Latin-only price hero could use. */}
              <span className="font-body-th font-bold text-lg text-text leading-relaxed">
                {t("quotes.amount", { amount: formatThb(q.amountThb) })}
              </span>
              {q.discountVsMarket !== null && (
                <span className="font-body-th text-sm text-success leading-relaxed">
                  {t("quotes.discount", { pct: String(q.discountVsMarket) })}
                </span>
              )}
              {q.termsNote !== null && q.termsNote !== "" && (
                <span className="font-body-th text-base text-text-2 leading-relaxed">
                  {q.termsNote}
                </span>
              )}
              <span className="font-body-th text-text-disabled text-xs leading-relaxed">
                {t("quotes.submittedAt", { date: fullDateTime(q.createdAt, locale) })}
              </span>
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}
