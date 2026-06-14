/**
 * The `/p/{id}` DETAIL screen. Every field of one listing from `GET /properties/{id}`: headline,
 * lifecycle badge, price, photo gallery, a spec table (FieldList), and a location block with an
 * "Open in Maps" deep link. Read-only in Build B (claim/publish/edit land in Build C). Authored in
 * Tailwind utilities + the shared FieldList (which is pure Tailwind, no inline styles); the photo
 * gallery is the mini-app's own Tailwind Gallery (not the inline-styled shared one).
 */
import { FieldList, Screen } from "@line-robot/ui";
import { useApp } from "../app/context.ts";
import { useAsync } from "../app/useAsync.ts";
import { BookViewing } from "../components/BookViewing.tsx";
import { Gallery } from "../components/Gallery.tsx";
import { InterestSection } from "../components/InterestSection.tsx";
import { LifecycleBadge } from "../components/LifecycleBadge.tsx";
import { NotesSection } from "../components/NotesSection.tsx";
import { QuickSaleToggle } from "../components/QuickSaleToggle.tsx";
import { QuotesSection } from "../components/QuotesSection.tsx";
import { SaveToggle } from "../components/SaveToggle.tsx";
import { ErrorView, Loading } from "../components/States.tsx";
import { apiStatus } from "../lib/api.ts";
import { editPath } from "../lib/deeplink.ts";
import {
  detailHeadline,
  lifecycleKind,
  locationLine,
  mapsUri,
  priceFrameKey,
  priceText,
  propertyTypeKey,
} from "../lib/display.ts";
import type { ListingDetailDto } from "../lib/types.ts";

export function DetailScreen({ id }: { id: string }) {
  const { api, t, locale, navigate } = useApp();
  const { state, reload } = useAsync(() => api.listing(id), [id]);

  return (
    <Screen lang={locale}>
      <div className="flex items-center gap-2" lang="th" data-th-content>
        <button
          type="button"
          onClick={() => navigate("/")}
          aria-label={t("detail.back")}
          className="flex size-8 shrink-0 items-center justify-center rounded-full border border-border bg-surface-2 text-text"
        >
          ‹
        </button>
        <span className="font-body-th text-sm text-text-2 leading-relaxed">{t("detail.back")}</span>
      </div>

      {state.status === "loading" ? (
        <Loading label={t("detail.loading")} />
      ) : state.status === "error" ? (
        <ErrorView t={t} status={apiStatus(state.error)} onRetry={reload} />
      ) : (
        <DetailBody dto={state.data} />
      )}
    </Screen>
  );
}

function DetailBody({ dto }: { dto: ListingDetailDto }) {
  const { api, t, locale, navigate } = useApp();
  const kind = lifecycleKind(dto);
  const headline = detailHeadline(dto, t);
  const loc = locationLine(dto);

  // The spec table rows — only fields the api actually returned (absent → omitted). Localized labels.
  const rows: Array<{ label: string; value: string }> = [];
  rows.push({
    label: t("field.dealType"),
    value: dto.dealType === "rent" ? t("badge.forRent") : t("badge.forSale"),
  });
  rows.push({ label: t("field.propertyType"), value: t(propertyTypeKey(dto.propertyType)) });
  if (dto.bedrooms !== null) {
    rows.push({
      label: t("field.bedrooms"),
      value: t("listing.bedrooms", { count: dto.bedrooms }),
    });
  }
  if (dto.bathrooms !== null) {
    rows.push({
      label: t("field.bathrooms"),
      value: t("listing.bathrooms", { count: dto.bathrooms }),
    });
  }
  if (dto.projectName) rows.push({ label: t("field.project"), value: dto.projectName });
  if (dto.landmark) rows.push({ label: t("field.landmark"), value: dto.landmark });
  if (dto.tambon) rows.push({ label: t("field.tambon"), value: dto.tambon });
  if (dto.amphoe) rows.push({ label: t("field.amphoe"), value: dto.amphoe });
  if (dto.province) rows.push({ label: t("field.province"), value: dto.province });

  return (
    <article className="grid gap-4" lang="th" data-th-content>
      {/* Headline + status + price hero. */}
      <header className="grid gap-2">
        <div className="flex flex-wrap items-center justify-between gap-1.5">
          <LifecycleBadge kind={kind} t={t} />
          {/* Save/unsave (optimistic, seeded from the persisted isSaved). For the owner, an edit entry
              alongside (own listing). */}
          <div className="flex items-center gap-1.5">
            <SaveToggle id={dto.id} api={api} t={t} initialSaved={dto.isSaved} />
            {dto.isClaimedByMe && (
              <button
                type="button"
                data-edit-listing={dto.id}
                onClick={() => navigate(editPath(dto.id))}
                className="rounded-full border border-border bg-surface px-3 py-1.5 font-body-th font-semibold text-primary-600 text-sm leading-relaxed"
                lang="th"
              >
                {t("edit.cta")}
              </button>
            )}
          </div>
        </div>
        <h1 className="m-0 font-heading-th font-bold text-lg text-text leading-snug">{headline}</h1>
        <div className="font-body-th">
          <div className="text-sm text-text-2 leading-relaxed">
            {t(priceFrameKey(dto.dealType))}
          </div>
          <div className="font-latin font-bold text-2xl text-text leading-tight tracking-tight">
            {priceText(dto)}
          </div>
        </div>
      </header>

      {dto.photos.length > 0 && <Gallery photos={dto.photos} alt={headline} t={t} />}

      {/* Description (poster/LLM content) — Thai body text, ≥1.6 leading. */}
      {dto.description && dto.description.trim() !== "" && (
        <section className="grid gap-1.5">
          <h2 className="m-0 font-heading-th font-semibold text-md text-text leading-normal">
            {t("detail.description")}
          </h2>
          <p className="m-0 whitespace-pre-line font-body-th text-base text-text leading-relaxed">
            {dto.description}
          </p>
        </section>
      )}

      {/* Spec table. */}
      <section className="grid gap-1.5">
        <h2 className="m-0 font-heading-th font-semibold text-md text-text leading-normal">
          {t("detail.specSection")}
        </h2>
        <FieldList rows={rows} />
      </section>

      {/* Location + Open-in-Maps CTA (only with coordinates). */}
      {dto.lat !== null && dto.lon !== null && (
        <section className="grid gap-1.5">
          <h2 className="m-0 font-heading-th font-semibold text-md text-text leading-normal">
            {t("detail.location")}
          </h2>
          {loc !== "" && (
            <p className="m-0 font-body-th text-base text-text-2 leading-relaxed">{`📍 ${loc}`}</p>
          )}
          {/* A SOLID primary CTA (not an outline): bg-primary-500 + text-surface is the both-mode-safe
              pairing (surface flips with the lighter-in-dark primary → WCAG-AA in light AND dark). Marked
              data-cta-solid so the contrast net verifies it in dark too (an outline primary-600-on-surface
              CTA had an unverified, likely-failing dark pairing). */}
          <a
            href={mapsUri(dto.lat, dto.lon)}
            target="_blank"
            rel="noreferrer"
            data-cta-solid
            className="inline-flex items-center justify-center gap-1 rounded-md border-0 bg-primary-500 px-4 py-2 font-body-th text-base text-surface leading-relaxed no-underline"
          >
            🗺 {t("detail.openInMaps")}
          </a>
        </section>
      )}

      {/* Book a viewing (D13) — native datetime-local picker → POST /properties/{id}/viewings. */}
      <section className="grid gap-1.5">
        <BookViewing id={dto.id} api={api} t={t} />
      </section>

      {/* Stage 6 dealflow. A non-owner group MEMBER flags non-binding interest (D-S6-3); the OWNER sees
          the interested-members list, a quick-sale toggle (SALE listings only, D10), and the offers
          (quotes) brokers submitted (D10). */}
      {dto.isClaimedByMe ? (
        <>
          {dto.dealType === "sale" && <QuickSaleToggle id={dto.id} api={api} t={t} />}
          <InterestSection id={dto.id} isOwner api={api} t={t} locale={locale} />
          <QuotesSection id={dto.id} api={api} t={t} locale={locale} />
        </>
      ) : (
        <InterestSection id={dto.id} isOwner={false} api={api} t={t} locale={locale} />
      )}

      {/* Follow-up notes (D13) — the caller's own notes on this listing. */}
      <NotesSection id={dto.id} api={api} t={t} locale={locale} />

      {/* LEGAL-06: poster-provided disclaimer (P4). Thai body text. */}
      <p className="m-0 font-body-th text-sm text-text-disabled leading-relaxed">
        {t("legal.posterProvided")}
      </p>
    </article>
  );
}
