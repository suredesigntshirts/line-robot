/**
 * The `/apply` ROLE-APPLICATION screen (Stage 6, D9 / D-S6-6). A user applies for a broker or investor
 * role and captures their quick-quote matching PREFERENCES (provinces / property-types / price-band
 * range) in the SAME form → `POST /me/role-application`. Self-service: any authed user may apply; the
 * admin gate is on the approval step (the vetting queue), never here.
 *
 *   - On load, `GET /me/role-application` shows the caller's current standing (pending/approved/rejected
 *     /none) in a calm status banner — so a returning applicant sees where they stand.
 *   - The kind is a single choice (broker | investor). Each preference axis is a multi-select chip row;
 *     leaving an axis EMPTY means "any" on that axis (the server stores `[]` → matches everything).
 *   - A 201 (fresh application) → the "submitted, under review" outcome; a 200 (the re-application
 *     guard short-circuited because a live role already exists) → the "already applied" outcome.
 *
 * Authored in Tailwind utilities over the shared `@theme` tokens — NO inline-style objects, NO bespoke
 * CSS. Markers for the LIFF-SPA frontend gate: `data-th-content` (TH-07 Thai line-height) + `data-cta-solid`
 * on the solid submit CTA (the WCAG-AA contrast net measures it, light AND dark).
 */
import { SALE_PRICE_BANDS } from "@line-robot/domain";
import { Screen } from "@line-robot/ui";
import { useState } from "react";
import { useApp } from "../app/context.ts";
import { useAsync } from "../app/useAsync.ts";
import { ChipMultiSelect } from "../components/ChipMultiSelect.tsx";
import { Outcome } from "../components/Outcome.tsx";
import { Loading } from "../components/States.tsx";
import { propertyTypeKey } from "../lib/display.ts";
import type {
  ApplyRoleKind,
  MyRoleApplicationDto,
  RoleApplicationStatusDto,
} from "../lib/types.ts";

/** A small CURATED North-Thai province set (D-S6-6 says a curated set is fine). These are the provinces
 * the marketplace's a2 market-landscape covers; the values are the Thai province strings the catalog
 * stores on a listing's `province` column, so they match `matchVettedUsers`'s province axis directly. */
const NORTH_THAI_PROVINCES = [
  "เชียงใหม่",
  "เชียงราย",
  "ลำพูน",
  "ลำปาง",
  "แม่ฮ่องสอน",
  "น่าน",
  "พะเยา",
  "แพร่",
] as const;

/** The property types a broker/investor may state interest in (the full propertyType enum). */
const PROPERTY_TYPES = ["land", "house", "townhouse", "condo", "commercial", "other"] as const;

export function ApplyScreen() {
  const { api, locale, t } = useApp();
  // The caller's current standing (read once on mount). A failure (e.g. transient) is treated as
  // "none" — the form still renders so the user can apply.
  const { state } = useAsync(
    () =>
      api.myRoleApplication().catch((): MyRoleApplicationDto => ({ kind: null, status: "none" })),
    [],
  );

  return (
    <Screen lang={locale}>
      {state.status === "loading" ? (
        <Loading label={t("apply.loading")} />
      ) : (
        <ApplyForm status={state.status === "ready" ? state.data.status : "none"} />
      )}
    </Screen>
  );
}

/** The localized status-banner copy for the caller's current standing. */
function statusKey(status: RoleApplicationStatusDto): import("@line-robot/ui").MessageKey {
  switch (status) {
    case "pending":
      return "apply.statusPending";
    case "approved":
      return "apply.statusApproved";
    case "rejected":
      return "apply.statusRejected";
    default:
      return "apply.statusNone";
  }
}

function ApplyForm({ status }: { status: RoleApplicationStatusDto }) {
  const { api, t, navigate } = useApp();
  const [kind, setKind] = useState<ApplyRoleKind>("broker");
  const [provinces, setProvinces] = useState<string[]>([]);
  const [propertyTypes, setPropertyTypes] = useState<string[]>([]);
  const [priceBandIds, setPriceBandIds] = useState<string[]>([]);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  // `null` = not yet submitted; "created" (fresh 201) | "already" (200, the re-application guard fired).
  const [outcome, setOutcome] = useState<null | "created" | "already">(null);

  async function submit(): Promise<void> {
    setError(null);
    setBusy(true);
    try {
      // `created` is the api client's read of the 201 (fresh) vs 200 (re-application-guard) status —
      // so the outcome panel distinguishes "submitted, under review" from "you've already applied".
      const res = await api.applyForRole({ kind, provinces, propertyTypes, priceBandIds });
      setOutcome(res.created ? "created" : "already");
    } catch {
      setError(t("apply.error"));
    } finally {
      setBusy(false);
    }
  }

  if (outcome !== null) {
    const created = outcome === "created";
    return (
      <Outcome
        tone="success"
        glyph={created ? "✓" : "📋"}
        title={created ? t("apply.submittedTitle") : t("apply.alreadyTitle")}
        body={created ? t("apply.submittedBody") : t("apply.alreadyBody")}
        ctaLabel={t("apply.doneCta")}
        onCta={() => navigate("/")}
      />
    );
  }

  return (
    <article className="grid gap-4" data-apply-form lang="th" data-th-content>
      <header className="grid gap-2">
        <h1 className="m-0 font-heading-th font-bold text-lg text-text leading-snug">
          {t("apply.title")}
        </h1>
        <p className="m-0 font-body-th text-base text-text-2 leading-relaxed">{t("apply.intro")}</p>
      </header>

      {/* The caller's current standing (calm banner). */}
      <section
        className="grid gap-1 rounded-md border border-border bg-surface-2 px-3 py-2.5"
        data-apply-status={status}
      >
        <span className="font-body-th font-semibold text-sm text-text leading-relaxed">
          {t("apply.statusHead")}
        </span>
        <span className="font-body-th text-sm text-text-2 leading-relaxed">
          {t(statusKey(status))}
        </span>
      </section>

      {/* Role choice (broker | investor) — a two-option segmented control. */}
      <section className="grid gap-2">
        <h2 className="m-0 font-heading-th font-semibold text-md text-text leading-normal">
          {t("apply.roleHead")}
        </h2>
        <div className="grid grid-cols-2 gap-2">
          <RoleOption
            value="broker"
            label={t("apply.roleBroker")}
            selected={kind === "broker"}
            onSelect={setKind}
          />
          <RoleOption
            value="investor"
            label={t("apply.roleInvestor")}
            selected={kind === "investor"}
            onSelect={setKind}
          />
        </div>
      </section>

      {/* Preference capture (D-S6-6) — each axis an "any-when-empty" multi-select chip row. */}
      <PrefSection
        head={t("apply.provincesHead")}
        hint={t("apply.provincesHint")}
        marker="provinces"
        options={NORTH_THAI_PROVINCES.map((p) => ({ id: p, label: p }))}
        selected={provinces}
        onChange={setProvinces}
      />
      <PrefSection
        head={t("apply.propertyTypesHead")}
        hint={t("apply.propertyTypesHint")}
        marker="property-types"
        options={PROPERTY_TYPES.map((pt) => ({ id: pt, label: t(propertyTypeKey(pt)) }))}
        selected={propertyTypes}
        onChange={setPropertyTypes}
      />
      <PrefSection
        head={t("apply.priceBandsHead")}
        hint={t("apply.priceBandsHint")}
        marker="price-bands"
        options={SALE_PRICE_BANDS.map((b) => ({ id: b.id, label: priceBandLabel(b) }))}
        selected={priceBandIds}
        onChange={setPriceBandIds}
      />

      {error !== null && (
        <p
          className="m-0 font-body-th text-danger text-sm leading-relaxed"
          role="alert"
          data-apply-error
        >
          {error}
        </p>
      )}

      <button
        type="button"
        data-cta-solid
        data-apply-submit
        disabled={busy}
        onClick={submit}
        className="inline-flex w-full items-center justify-center gap-2 rounded-md border-0 bg-primary-500 px-4 py-3 font-body-th font-bold text-base text-surface leading-relaxed transition-opacity hover:opacity-90 disabled:opacity-60"
      >
        {busy ? t("apply.submitting") : t("apply.submit")}
      </button>
    </article>
  );
}

/** One role radio-option (broker | investor) — a tappable card that highlights when selected. */
function RoleOption({
  value,
  label,
  selected,
  onSelect,
}: {
  value: ApplyRoleKind;
  label: string;
  selected: boolean;
  onSelect: (v: ApplyRoleKind) => void;
}) {
  return (
    <button
      type="button"
      aria-pressed={selected}
      data-apply-role={value}
      data-selected={selected}
      onClick={() => onSelect(value)}
      className={`rounded-md border px-3 py-3 font-body-th font-semibold text-base leading-relaxed transition-colors ${
        selected
          ? "border-primary-500 bg-primary-50 text-primary-700"
          : "border-border bg-surface text-text-2"
      }`}
    >
      {label}
    </button>
  );
}

/** A labelled preference axis: a heading + a hint + the multi-select chip row. */
function PrefSection({
  head,
  hint,
  marker,
  options,
  selected,
  onChange,
}: {
  head: string;
  hint: string;
  marker: string;
  options: ReadonlyArray<{ id: string; label: string }>;
  selected: string[];
  onChange: (next: string[]) => void;
}) {
  return (
    <section className="grid gap-1.5" data-apply-pref={marker}>
      <h2 className="m-0 font-heading-th font-semibold text-md text-text leading-normal">{head}</h2>
      <p className="m-0 font-body-th text-sm text-text-disabled leading-relaxed">{hint}</p>
      <ChipMultiSelect options={options} selected={selected} onChange={onChange} />
    </section>
  );
}

/** A readable label for a sale price band (e.g. "1–3M" / "20M+"). Latin numerals, M = ล้าน convention. */
function priceBandLabel(band: { min: number; max: number | null }): string {
  const m = (n: number): string => `${(n / 1_000_000).toLocaleString("en-US")}M`;
  return band.max === null ? `${m(band.min)}+` : `${m(band.min)}–${m(band.max)}`;
}
