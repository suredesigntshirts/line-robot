/**
 * The `/quote/{id}` QUOTE-RESPONSE screen (Stage 6, D10). The single LIFF surface a VETTED broker's
 * quick-quote Flex push (INC-B4) deep-links to: the broker reviews the quick-sale listing and submits a
 * STRUCTURED offer → `POST /properties/{id}/quotes`. The api is the authority on who may submit:
 *
 *   - `amountThb` (required, positive) + `discountVsMarket?` (0–100) + `termsNote?` → 201 {quoteId}.
 *   - 403 `not_vetted`     — the caller is not an approved broker/investor (the spec-auditor invariant:
 *                            a quote can NEVER be authored by an unvetted user; UI-gating is never trusted).
 *   - 404 `not_found`      — the listing doesn't exist.
 *   - 409 `not_quick_sale` — the listing isn't a live quick-sale target.
 *   - 400                  — a bad amount/discount (the client guards too, but the server re-validates).
 *
 * The form fields are client-guarded (positive amount, 0–100 discount) AND every server status is mapped
 * to a clear inline error. On success a calm Outcome confirms the offer was sent.
 *
 * Authored in Tailwind utilities over the shared `@theme` tokens — NO inline-style objects, NO bespoke
 * CSS. Markers for the LIFF-SPA frontend gate: `data-th-content` (TH-07 Thai line-height) + `data-cta-solid`
 * on the solid submit CTA (the WCAG-AA contrast net measures it, light AND dark).
 */
import { FieldList, primaryButtonClass, Screen } from "@line-robot/ui";
import { useState } from "react";
import { useApp } from "../app/context.ts";
import { useAsync } from "../app/useAsync.ts";
import { Outcome } from "../components/Outcome.tsx";
import { Loading } from "../components/States.tsx";
import { ApiError } from "../lib/api.ts";
import {
  detailHeadline,
  locationLine,
  priceFrameKey,
  priceText,
  propertyTypeKey,
} from "../lib/display.ts";
import type { ListingDetailDto } from "../lib/types.ts";

export function QuoteScreen({ id }: { id: string }) {
  const { api, locale, t } = useApp();
  // The listing summary is a NICE-TO-HAVE: a pushed broker need NOT be a group member, so the detail
  // GET may 404 for them (the membership gate). We render the form regardless — the submit's own
  // vetted + quick-sale gates are the real authorities — and show the summary only when it loads. A
  // loading state still shows the spinner so the screen doesn't flash an empty form.
  const { state } = useAsync(() => api.listing(id).catch(() => null), [id]);

  return (
    <Screen lang={locale}>
      {state.status === "loading" ? (
        <Loading label={t("quote.loading")} />
      ) : (
        <QuoteForm id={id} dto={state.status === "ready" ? state.data : null} />
      )}
    </Screen>
  );
}

function QuoteForm({ id, dto }: { id: string; dto: ListingDetailDto | null }) {
  const { api, t, navigate } = useApp();
  const [amount, setAmount] = useState("");
  const [discount, setDiscount] = useState("");
  const [terms, setTerms] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [submitted, setSubmitted] = useState(false);

  // The listing summary the broker is quoting on (shown only when the detail loaded — the broker may
  // not be a group member, in which case the detail 404s and we just render the form).
  const headline = dto !== null ? detailHeadline(dto, t) : "";
  const loc = dto !== null ? locationLine(dto) : "";
  const rows: Array<{ label: string; value: string }> =
    dto !== null
      ? [{ label: t("field.propertyType"), value: t(propertyTypeKey(dto.propertyType)) }]
      : [];
  if (dto !== null && loc !== "") rows.push({ label: t("detail.location"), value: loc });

  /** Map a thrown ApiError status to the right inline message (the server is the authority). */
  function messageFor(err: unknown): string {
    if (!(err instanceof ApiError)) return t("quote.error");
    switch (err.status) {
      case 403:
        return t("quote.errorNotVetted");
      case 404:
        return t("quote.errorNotFound");
      case 409:
        return t("quote.errorNotQuickSale");
      case 400:
        return t("quote.errorAmount");
      default:
        return t("quote.error");
    }
  }

  async function submit(): Promise<void> {
    // Client guards (the server re-validates identically): a positive amount, an optional 0–100 discount.
    const amountThb = Number(amount);
    if (!Number.isFinite(amountThb) || amountThb <= 0) {
      setError(t("quote.errorAmount"));
      return;
    }
    let discountVsMarket: number | undefined;
    if (discount.trim() !== "") {
      const d = Number(discount);
      if (!Number.isFinite(d) || d < 0 || d > 100) {
        setError(t("quote.errorDiscount"));
        return;
      }
      discountVsMarket = d;
    }
    const termsNote = terms.trim() === "" ? undefined : terms.trim();

    setError(null);
    setBusy(true);
    try {
      await api.submitQuote(id, { amountThb, discountVsMarket, termsNote });
      setSubmitted(true);
    } catch (err) {
      setError(messageFor(err));
    } finally {
      setBusy(false);
    }
  }

  if (submitted) {
    return (
      <Outcome
        tone="success"
        glyph="✓"
        title={t("quote.submittedTitle")}
        body={t("quote.submittedBody")}
        ctaLabel={t("quote.doneCta")}
        onCta={() => navigate("/")}
      />
    );
  }

  return (
    <article className="grid gap-4" data-quote-form={id} lang="th" data-th-content>
      <header className="grid gap-2">
        <h1 className="m-0 font-heading-th font-bold text-lg text-text leading-snug">
          {t("quote.title")}
        </h1>
        <p className="m-0 font-body-th text-base text-text-2 leading-relaxed">{t("quote.intro")}</p>
      </header>

      {/* The listing the broker is quoting on (summary + asking price) — only when the detail loaded. */}
      {dto !== null && (
        <section className="grid gap-1.5 rounded-md border border-border bg-surface px-3 py-2.5">
          <h2 className="m-0 font-heading-th font-semibold text-md text-text leading-normal">
            {headline}
          </h2>
          <div className="font-body-th">
            <div className="text-sm text-text-2 leading-relaxed">
              {t(priceFrameKey(dto.dealType))}
            </div>
            <div className="font-latin font-bold text-xl text-text leading-tight tracking-tight">
              {priceText(dto)}
            </div>
          </div>
          <FieldList rows={rows} />
        </section>
      )}

      {/* The structured offer form. */}
      <section className="grid gap-3">
        <label className="grid gap-1">
          <span className="font-body-th font-semibold text-sm text-text leading-relaxed">
            {t("quote.fieldAmount")}
          </span>
          <input
            type="number"
            inputMode="numeric"
            min={0}
            value={amount}
            onChange={(e) => setAmount(e.currentTarget.value)}
            placeholder={t("quote.fieldAmountPlaceholder")}
            data-quote-amount
            className="rounded-md border border-border bg-surface px-3 py-2 font-body-th text-base text-text leading-relaxed placeholder:text-text-disabled"
          />
        </label>

        <label className="grid gap-1">
          <span className="font-body-th font-semibold text-sm text-text leading-relaxed">
            {t("quote.fieldDiscount")}
          </span>
          <input
            type="number"
            inputMode="numeric"
            min={0}
            max={100}
            value={discount}
            onChange={(e) => setDiscount(e.currentTarget.value)}
            placeholder={t("quote.fieldDiscountPlaceholder")}
            data-quote-discount
            className="rounded-md border border-border bg-surface px-3 py-2 font-body-th text-base text-text leading-relaxed placeholder:text-text-disabled"
          />
        </label>

        <label className="grid gap-1">
          <span className="font-body-th font-semibold text-sm text-text leading-relaxed">
            {t("quote.fieldTerms")}
          </span>
          <textarea
            rows={3}
            value={terms}
            onChange={(e) => setTerms(e.currentTarget.value)}
            placeholder={t("quote.fieldTermsPlaceholder")}
            data-quote-terms
            className="resize-y rounded-md border border-border bg-surface px-3 py-2 font-body-th text-base text-text leading-relaxed placeholder:text-text-disabled"
          />
        </label>

        {error !== null && (
          <p
            className="m-0 font-body-th text-danger text-sm leading-relaxed"
            role="alert"
            data-quote-error
          >
            {error}
          </p>
        )}

        <button
          type="button"
          data-cta-solid
          data-submit-quote
          disabled={busy}
          onClick={submit}
          className={`${primaryButtonClass} w-full gap-2 py-3 font-bold disabled:opacity-60`}
        >
          {busy ? t("quote.submitting") : t("quote.submit")}
        </button>
      </section>
    </article>
  );
}
