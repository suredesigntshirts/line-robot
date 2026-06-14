/**
 * The `/claim/{id}` CLAIM screen (Stage 5, Build C — D7 poster opt-in). The single LIFF surface the
 * bot's claim DM deep-links to. It folds the claim mock's three storyboard phones (the bot DM lives in
 * chat) into one in-app flow:
 *
 *   review  → (claim)  → decide  → (publish | keep-private)  → done
 *
 * - REVIEW: fetch `GET /properties/{id}`, render the bot-extracted listing (headline, price, spec
 *   table) with a "bot auto-extracted — verify" banner (LEGAL-06), and a single "claim ownership" CTA.
 * - DECIDE (post-claim): a success tick + the publish-vs-group-private choice. The group-private option
 *   carries the boundary copy "เฉพาะสมาชิกกลุ่มเดิม" (the spec's mandated string).
 * - DONE: a calm outcome confirming public or group-private, with a CTA back to My Listings.
 *
 * Concurrency: a 409 from `POST /claim` (another group member won the optimistic lock) is caught and
 * rendered as a clear "already claimed by someone else" message — the loser is never left guessing.
 *
 * Authored in Tailwind utilities over the shared `@theme` tokens — NO inline-style objects, NO bespoke
 * CSS (style = match the mock, content = schema/code-driven). Markers for the LIFF-SPA frontend gate:
 * `data-th-content` (the TH-07 Thai line-height net scopes here) and `data-cta-solid` on every FILLED
 * CTA (the WCAG-AA contrast net measures them, light AND dark).
 */
import { FieldList, Screen } from "@line-robot/ui";
import { useState } from "react";
import { useApp } from "../app/context.ts";
import { useAsync } from "../app/useAsync.ts";
import { Outcome } from "../components/Outcome.tsx";
import { ErrorView, Loading } from "../components/States.tsx";
import { Stepper } from "../components/Stepper.tsx";
import { ApiError, apiStatus } from "../lib/api.ts";
import { detailPath } from "../lib/deeplink.ts";
import {
  detailHeadline,
  locationLine,
  priceFrameKey,
  priceText,
  propertyTypeKey,
} from "../lib/display.ts";
import type { ListingDetailDto } from "../lib/types.ts";

// CTA class strings, named once (a reader shouldn't diff the long strings). Both solid variants are
// `bg-primary-500` + `text-surface` (the both-mode-safe pairing the contrast net verifies) with
// `leading-relaxed` (≥1.6, TH-07). `solidBtnFull` = the full-width, disable-able primary used for the
// step actions (claim / publish); `outlineBtn` = the group-private secondary. Each FILLED button also
// carries `data-cta-solid` at its call site. The terminal-outcome CTA uses the shared <Outcome>.
const SOLID_BTN_BASE =
  "inline-flex items-center justify-center gap-2 rounded-md border-0 bg-primary-500 font-body-th text-base text-surface leading-relaxed transition-opacity hover:opacity-90";
const solidBtnFull = `${SOLID_BTN_BASE} w-full px-4 py-3 font-bold disabled:opacity-60`;
const outlineBtn =
  "inline-flex w-full items-center justify-center gap-2 rounded-md border border-border-2 bg-surface px-4 py-2.5 font-body-th font-semibold text-base text-text-2 leading-relaxed transition-opacity hover:opacity-90 disabled:opacity-60";
// The S5-7 verify affordance — the mock's `.btn-secondary` outline (NOT solid): an OUTLINE button is
// correct here because it's a secondary "go verify" action, and an outline avoids an unverified solid
// dark pairing (the contrast net only measures `data-cta-solid`, which this is deliberately NOT).
const outlineLinkBtn = `${outlineBtn} no-underline`;

/** The flow phase. `review` (pre-claim) → `decide` (claimed, choosing visibility) → a terminal
 * outcome (`published`/`privated`/`alreadyClaimed`/`failed`). In-flight phases drive the spinners. */
type Phase =
  | "review"
  | "claiming"
  | "decide"
  | "publishing"
  | "keeping"
  | "published"
  | "privated"
  | "alreadyClaimed"
  | "failed";

export function ClaimScreen({ id }: { id: string }) {
  const { api, locale, t } = useApp();
  const { state, reload } = useAsync(() => api.listing(id), [id]);

  return (
    <Screen lang={locale}>
      {state.status === "loading" ? (
        <Loading label={t("claim.loading")} />
      ) : state.status === "error" ? (
        <ErrorView t={t} status={apiStatus(state.error)} onRetry={reload} />
      ) : (
        <ClaimFlow id={id} dto={state.data} />
      )}
    </Screen>
  );
}

function ClaimFlow({ id, dto }: { id: string; dto: ListingDetailDto }) {
  const { api, t, navigate } = useApp();
  // If the api already reports the caller as the claimant (a re-open of an own listing), skip straight
  // to the visibility decision — claiming again would just be idempotent.
  const [phase, setPhase] = useState<Phase>(dto.isClaimedByMe ? "decide" : "review");

  async function claim(): Promise<void> {
    setPhase("claiming");
    try {
      await api.claim(id);
      setPhase("decide");
    } catch (error) {
      // 409 = another group member won the optimistic lock (the concurrent-claim loser).
      setPhase(error instanceof ApiError && error.status === 409 ? "alreadyClaimed" : "failed");
    }
  }

  async function publish(): Promise<void> {
    setPhase("publishing");
    try {
      await api.publish(id);
      setPhase("published");
    } catch {
      setPhase("failed");
    }
  }

  async function keepPrivate(): Promise<void> {
    setPhase("keeping");
    try {
      await api.keepPrivate(id);
      setPhase("privated");
    } catch {
      setPhase("failed");
    }
  }

  const toMyListings = (): void => navigate("/");

  if (phase === "alreadyClaimed") {
    return (
      <Outcome
        tone="warn"
        glyph="🔒"
        title={t("claim.alreadyClaimedTitle")}
        body={t("claim.alreadyClaimedBody")}
        ctaLabel={t("claim.alreadyClaimedNext")}
        onCta={toMyListings}
      />
    );
  }
  if (phase === "failed") {
    return (
      <Outcome
        tone="danger"
        glyph="⚠️"
        title={t("claim.failedTitle")}
        body={t("claim.failedBody")}
        ctaLabel={t("claim.doneCta")}
        onCta={toMyListings}
      />
    );
  }
  if (phase === "published") {
    return (
      <Outcome
        tone="success"
        glyph="🌐"
        title={t("claim.publishedTitle")}
        body={t("claim.publishedBody")}
        ctaLabel={t("claim.doneCta")}
        onCta={toMyListings}
      />
    );
  }
  if (phase === "privated") {
    return (
      <Outcome
        tone="success"
        glyph="🔒"
        title={t("claim.privatedTitle")}
        body={t("claim.privatedBody")}
        ctaLabel={t("claim.doneCta")}
        onCta={toMyListings}
      />
    );
  }

  // review / claiming / decide / publishing / keeping — all render the listing summary + the active step.
  const onReview = phase === "review" || phase === "claiming";
  return (
    <article className="grid gap-4" lang="th" data-th-content>
      <h1 className="m-0 font-heading-th font-bold text-lg text-text leading-snug">
        {t("claim.title")}
      </h1>

      {/* Step-progress indicator (mock `.step-progress`): ตรวจสอบ → อ้างสิทธิ์ → เผยแพร่. Review = step 1
          (index 0); while the claim request is in flight = step 2 (index 1, the user is claiming); once
          claimed, the decision step = step 3 (index 2, review+claim done). */}
      <Stepper
        steps={[t("claim.stepReview"), t("claim.stepClaim"), t("claim.stepPublish")]}
        current={phase === "claiming" ? 1 : onReview ? 0 : 2}
      />

      {onReview ? (
        <ReviewStep dto={dto} busy={phase === "claiming"} onClaim={claim} />
      ) : (
        <DecideStep dto={dto} phase={phase} onPublish={publish} onKeepPrivate={keepPrivate} />
      )}
    </article>
  );
}

/** PHASE 1 — review the bot-extracted listing + the claim CTA. The mock's review screen shows a
 * structured field-card (label/value rows) the poster checks BEFORE the irreversible publish, plus a
 * verify link to the full detail. */
function ReviewStep({
  dto,
  busy,
  onClaim,
}: {
  dto: ListingDetailDto;
  busy: boolean;
  onClaim: () => void;
}) {
  const { t, navigate } = useApp();
  return (
    <>
      {/* LEGAL-06 banner: the listing is auto-extracted — verify before claiming/publishing. */}
      <div className="flex items-start gap-2 rounded-md border border-primary-200 bg-primary-50 px-3 py-2.5">
        <span aria-hidden="true" className="shrink-0 text-lg leading-none">
          🤖
        </span>
        <div className="font-body-th text-primary-700">
          {/* Sarabun body title — leading-relaxed (≥1.6) to satisfy the TH-07 line-height net (NOT a
              loopless-Noto heading, so it can't take the tighter heading leading). */}
          <div className="font-bold text-base leading-relaxed">{t("claim.reviewBannerTitle")}</div>
          <div className="text-sm leading-relaxed">{t("claim.reviewBannerBody")}</div>
        </div>
      </div>

      {/* Structured review spec card (mock `.field-card`): a section head + the schema-present rows.
          NOTE (deferred): the mock also shows a "เอกสารสิทธิ์ / โฉนดที่ดิน" (title-deed) row + warning —
          deferred until the ListingDetailDto carries a deed-type field (schema gap S5-4). NOT faked here. */}
      <section className="grid gap-1.5">
        <h2 className="m-0 font-heading-th font-bold text-sm text-text leading-normal">
          {t("claim.specHead")}
        </h2>
        <ReviewSpec dto={dto} />
      </section>

      {/* S5-7 — verify affordance: navigate to the full detail (`/p/{id}`) so the poster can verify the
          bot's full extraction (description, gallery, every field) BEFORE the irreversible publish. */}
      <button
        type="button"
        data-verify-detail={dto.id}
        onClick={() => navigate(detailPath(dto.id))}
        className={outlineLinkBtn}
      >
        🔍 {t("claim.viewFullDetail")}
      </button>

      {/* Claim CTA — a SOLID primary button (data-cta-solid → contrast net measures it, both modes). */}
      <button
        type="button"
        data-cta-solid
        disabled={busy}
        onClick={onClaim}
        className={solidBtnFull}
      >
        {busy ? t("claim.claiming") : `${t("claim.claimCta")} →`}
      </button>

      <p className="m-0 text-center font-body-th text-sm text-text-disabled leading-relaxed">
        {t("claim.legalNote")}
      </p>
    </>
  );
}

/** The structured review spec card (mock `.field-card`) — a label/value {@link FieldList} of the
 * SCHEMA-PRESENT fields only (nulls skipped): headline / type / price (asking for sale, monthly for
 * rent — the frame label flips) / bedrooms / bathrooms / location. Reuses the SAME shared FieldList +
 * display mappers the detail screen uses, so the review and the full detail can't drift. Content is
 * schema-driven, never faked. (The mock's separate "รายได้/เดือน" income row + the title-deed row are
 * NOT rendered — the DTO carries no distinct income field, and deed-type is schema gap S5-4.) */
function ReviewSpec({ dto }: { dto: ListingDetailDto }) {
  const { t } = useApp();
  const rows: Array<{ label: string; value: string }> = [];
  const headline = detailHeadline(dto, t);
  if (headline.trim() !== "") rows.push({ label: t("claim.fieldHeadline"), value: headline });
  rows.push({ label: t("field.propertyType"), value: t(propertyTypeKey(dto.propertyType)) });
  // The price row — the frame label flips with deal type (asking for sale / monthly rent for rent),
  // and `priceText` already returns monthlyRent for a rental, so this single row covers both.
  rows.push({ label: t(priceFrameKey(dto.dealType)), value: priceText(dto) });
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
  const loc = locationLine(dto);
  if (loc !== "") rows.push({ label: t("detail.location"), value: loc });
  return <FieldList rows={rows} />;
}

/** PHASE 2 — claimed; choose public vs group-private (D7). */
function DecideStep({
  dto,
  phase,
  onPublish,
  onKeepPrivate,
}: {
  dto: ListingDetailDto;
  phase: Phase;
  onPublish: () => void;
  onKeepPrivate: () => void;
}) {
  const { t } = useApp();
  const busy = phase === "publishing" || phase === "keeping";
  return (
    <>
      {/* Claim success header. */}
      <div className="grid justify-items-center gap-2 text-center" data-state="claimed">
        <span
          aria-hidden="true"
          className="flex size-14 items-center justify-center rounded-full border-2 border-success bg-success-bg text-2xl"
        >
          ✅
        </span>
        <div className="font-heading-th font-bold text-lg text-text leading-snug">
          {t("claim.successTitle")}
        </div>
        <div className="font-body-th text-sm text-text-2 leading-relaxed">
          {t("claim.successBody")}
        </div>
      </div>

      <ListingSummary dto={dto} />

      <hr className="m-0 border-0 border-border border-t" />

      <h2 className="m-0 font-heading-th font-bold text-md text-text leading-normal">
        {t("claim.visibilityHead")}
      </h2>

      {/* PUBLIC option. */}
      <VisibilityOption
        glyph="🌐"
        title={t("claim.publicTitle")}
        subtitle={t("claim.publicSubtitle")}
        features={[
          t("claim.publicFeatPublic"),
          t("claim.publicFeatSeo"),
          t("claim.publicFeatContact"),
        ]}
      />

      {/* GROUP-PRIVATE option — the boundary copy "เฉพาะสมาชิกกลุ่มเดิม" (the spec's mandated string). */}
      <VisibilityOption
        glyph="🔒"
        title={t("claim.privateTitle")}
        subtitle={t("claim.privateSubtitle")}
        features={[t("claim.privateFeatGroup"), t("claim.privateFeatNoPublic")]}
      />

      {/* Decision CTAs: publish (solid primary) + keep-private (outline secondary). */}
      <div className="grid gap-2">
        <button
          type="button"
          data-cta-solid
          disabled={busy}
          onClick={onPublish}
          className={solidBtnFull}
        >
          🌐 {phase === "publishing" ? t("claim.publishing") : t("claim.publishCta")}
        </button>
        <button type="button" disabled={busy} onClick={onKeepPrivate} className={outlineBtn}>
          🔒 {phase === "keeping" ? t("claim.keepingPrivate") : t("claim.keepPrivateCta")}
        </button>
      </div>

      <p className="m-0 text-center font-body-th text-sm text-text-disabled leading-relaxed">
        {t("claim.publishConsentNote")}
      </p>
    </>
  );
}

/** One visibility option card (mock `.option-card`): a glyph header (title + subtitle) and a feature
 * list. Presentational only — the choice is made by the CTA buttons below (not by tapping the card),
 * keeping the interaction model simple (anti-over-engineering: no radio state nobody reads). */
function VisibilityOption({
  glyph,
  title,
  subtitle,
  features,
}: {
  glyph: string;
  title: string;
  subtitle: string;
  features: string[];
}) {
  return (
    <section className="overflow-hidden rounded-lg border border-border bg-surface">
      <div className="flex items-center gap-2.5 border-border border-b bg-surface-2 px-3.5 py-3">
        <span
          aria-hidden="true"
          className="flex size-9 shrink-0 items-center justify-center rounded-full bg-primary-50 text-lg"
        >
          {glyph}
        </span>
        <div className="min-w-0">
          <div className="font-heading-th font-bold text-base text-text leading-normal">
            {title}
          </div>
          <div className="font-body-th text-sm text-text-2 leading-relaxed">{subtitle}</div>
        </div>
      </div>
      <ul className="m-0 grid list-none gap-1.5 px-3.5 py-3">
        {features.map((f) => (
          <li
            key={f}
            className="flex items-start gap-2 font-body-th text-sm text-text-2 leading-relaxed"
          >
            <span aria-hidden="true" className="shrink-0 text-success">
              ✓
            </span>
            <span>{f}</span>
          </li>
        ))}
      </ul>
    </section>
  );
}

/** A compact summary of the listing under review/claimed (mock `.listing-summary`): the headline, the
 * framed price, and the location line. Reuses the same schema-driven display mappers as the cards. */
function ListingSummary({ dto }: { dto: ListingDetailDto }) {
  const { t } = useApp();
  const headline = detailHeadline(dto, t);
  const loc = locationLine(dto);
  const ptype = t(propertyTypeKey(dto.propertyType));
  return (
    <section
      data-listing-summary={dto.id}
      className="overflow-hidden rounded-lg border border-border bg-surface shadow-sm"
    >
      <div className="grid gap-1 p-3">
        <div className="font-heading-th font-bold text-base text-text leading-normal">
          {headline}
        </div>
        <div className="font-body-th text-sm text-text-2 leading-relaxed">
          {t(priceFrameKey(dto.dealType))}
        </div>
        <div className="font-latin font-bold text-text text-xl leading-tight tracking-tight">
          {priceText(dto)}
        </div>
        <div className="font-body-th text-sm text-text-disabled leading-relaxed">
          <span>{ptype}</span>
          {loc !== "" && <span>{` · 📍 ${loc}`}</span>}
        </div>
      </div>
    </section>
  );
}
