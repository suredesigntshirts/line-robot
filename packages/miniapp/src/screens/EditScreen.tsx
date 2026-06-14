/**
 * The `/edit/{id}` OWNER EDIT screen (Stage 5, Build D — D13). The mini-app edit surface that REPLACED
 * edit-by-reply (founder ruling A3a). An owner edits their claimed listing's allowlisted fields and
 * submits → `PATCH /properties/{id}`. Authz is server-side (claimant-only): a non-claimant PATCH is
 * `404 not_found`, which we surface as a clear "you can't edit this" message rather than a blank form.
 *
 * The PATCHable set mirrors the api allowlist: string fields (project/landmark/tambon/amphoe/province)
 * + int fields (priceThb/bedrooms/bathrooms), plus monthlyRent for a RENT listing only (the form shows
 * the price field that matches dealType). The form seeds from `GET /properties/{id}`; on submit it
 * sends only the CHANGED fields (a minimal patch — empty patch is a no-op success).
 *
 * Authored in Tailwind utilities; markers: `data-th-content` (TH-07) + `data-cta-solid` on the solid
 * save button.
 */
import { Screen } from "@line-robot/ui";
import { useState } from "react";
import { useApp } from "../app/context.ts";
import { useAsync } from "../app/useAsync.ts";
import { ErrorView, Loading } from "../components/States.tsx";
import { ApiError } from "../lib/api.ts";
import type { ListingDetailDto, ListingPatch } from "../lib/types.ts";

export function EditScreen({ id }: { id: string }) {
  const { api, locale, t } = useApp();
  const { state, reload } = useAsync(() => api.listing(id), [id]);

  return (
    <Screen lang={locale}>
      {state.status === "loading" ? (
        <Loading label={t("edit.loading")} />
      ) : state.status === "error" ? (
        <ErrorView
          t={t}
          status={state.error instanceof ApiError ? state.error.status : undefined}
          onRetry={reload}
        />
      ) : (
        <EditForm id={id} dto={state.data} />
      )}
    </Screen>
  );
}

type Phase = "editing" | "saving" | "saved" | "error" | "notOwner";

/** The string-form values for every editable field (numbers are kept as strings for `<input>` and
 * parsed on submit). Seeded from the dto; only fields that CHANGED are sent. */
interface FormState {
  priceThb: string;
  monthlyRent: string;
  bedrooms: string;
  bathrooms: string;
  projectName: string;
  landmark: string;
  tambon: string;
  amphoe: string;
  province: string;
}

const numOrEmpty = (n: number | null): string => (n === null ? "" : String(n));
const strOrEmpty = (s: string | null): string => s ?? "";

function seed(dto: ListingDetailDto): FormState {
  return {
    priceThb: numOrEmpty(dto.priceThb),
    monthlyRent: numOrEmpty(dto.monthlyRent),
    bedrooms: numOrEmpty(dto.bedrooms),
    bathrooms: numOrEmpty(dto.bathrooms),
    projectName: strOrEmpty(dto.projectName),
    landmark: strOrEmpty(dto.landmark),
    tambon: strOrEmpty(dto.tambon),
    amphoe: strOrEmpty(dto.amphoe),
    province: strOrEmpty(dto.province),
  };
}

/** Build the minimal patch: only fields whose form value differs from the seeded original. Numbers
 * parse to ints (a non-numeric or empty numeric field is skipped); strings send their trimmed value.
 * Built mutably then returned as the readonly `ListingPatch`. */
function buildPatch(form: FormState, original: FormState, isRent: boolean): ListingPatch {
  const patch: { -readonly [K in keyof ListingPatch]: ListingPatch[K] } = {};
  const strFields = ["projectName", "landmark", "tambon", "amphoe", "province"] as const;
  for (const f of strFields) {
    if (form[f].trim() !== original[f].trim()) patch[f] = form[f].trim();
  }
  const intFields = ["bedrooms", "bathrooms"] as const;
  for (const f of intFields) {
    if (form[f] !== original[f]) {
      const n = Number.parseInt(form[f], 10);
      if (Number.isFinite(n)) patch[f] = n;
    }
  }
  // Price: a sale edits priceThb, a rent edits monthlyRent (the form shows only the matching one).
  const priceKey = isRent ? "monthlyRent" : "priceThb";
  if (form[priceKey] !== original[priceKey]) {
    const n = Number.parseInt(form[priceKey], 10);
    if (Number.isFinite(n)) patch[priceKey] = n;
  }
  return patch;
}

function EditForm({ id, dto }: { id: string; dto: ListingDetailDto }) {
  const { api, t, navigate } = useApp();
  const isRent = dto.dealType === "rent";
  const [original] = useState<FormState>(() => seed(dto));
  const [form, setForm] = useState<FormState>(original);
  const [phase, setPhase] = useState<Phase>("editing");

  const set = (key: keyof FormState) => (e: { currentTarget: { value: string } }) =>
    setForm((f) => ({ ...f, [key]: e.currentTarget.value }));

  async function save(): Promise<void> {
    setPhase("saving");
    try {
      await api.editListing(id, buildPatch(form, original, isRent));
      setPhase("saved");
    } catch (err) {
      // 404 = not the claimant (server authz). Distinct copy from a transient failure.
      setPhase(err instanceof ApiError && err.status === 404 ? "notOwner" : "error");
    }
  }

  if (phase === "saved") {
    return (
      <Outcome
        glyph="✅"
        tone="success"
        title={t("edit.savedTitle")}
        body={t("edit.savedBody")}
        cta={t("edit.back")}
        onCta={() => navigate("/")}
      />
    );
  }
  if (phase === "notOwner") {
    return (
      <Outcome
        glyph="🔒"
        tone="warn"
        title={t("edit.errorTitle")}
        body={t("edit.notOwnerBody")}
        cta={t("edit.back")}
        onCta={() => navigate("/")}
      />
    );
  }

  const priceKey = isRent ? "monthlyRent" : "priceThb";
  const priceLabel = isRent ? t("edit.fieldMonthlyRent") : t("edit.fieldPriceThb");

  return (
    <article className="grid gap-4" lang="th" data-th-content data-edit-form={id}>
      <div className="flex items-center gap-2">
        <button
          type="button"
          onClick={() => navigate("/")}
          aria-label={t("edit.back")}
          className="flex size-8 shrink-0 items-center justify-center rounded-full border border-border bg-surface-2 text-text"
        >
          ‹
        </button>
        <h1 className="m-0 font-heading-th font-bold text-lg text-text leading-snug">
          {t("edit.title")}
        </h1>
      </div>

      <div className="grid gap-3">
        <NumberField label={priceLabel} value={form[priceKey]} onChange={set(priceKey)} />
        <NumberField
          label={t("edit.fieldBedrooms")}
          value={form.bedrooms}
          onChange={set("bedrooms")}
        />
        <NumberField
          label={t("edit.fieldBathrooms")}
          value={form.bathrooms}
          onChange={set("bathrooms")}
        />
        <TextField
          label={t("edit.fieldProjectName")}
          value={form.projectName}
          onChange={set("projectName")}
        />
        <TextField
          label={t("edit.fieldLandmark")}
          value={form.landmark}
          onChange={set("landmark")}
        />
        <TextField label={t("edit.fieldTambon")} value={form.tambon} onChange={set("tambon")} />
        <TextField label={t("edit.fieldAmphoe")} value={form.amphoe} onChange={set("amphoe")} />
        <TextField
          label={t("edit.fieldProvince")}
          value={form.province}
          onChange={set("province")}
        />
      </div>

      {phase === "error" && (
        <p className="m-0 font-body-th text-danger text-sm leading-relaxed" role="alert">
          {t("edit.errorBody")}
        </p>
      )}

      <button
        type="button"
        data-cta-solid
        data-save-edit
        disabled={phase === "saving"}
        onClick={save}
        className="w-full rounded-md border-0 bg-primary-500 px-4 py-3 font-body-th font-bold text-base text-surface leading-relaxed disabled:opacity-60"
      >
        {phase === "saving" ? t("edit.saving") : t("edit.save")}
      </button>
    </article>
  );
}

/** A labelled text field (Tailwind, shared tokens). */
function TextField({
  label,
  value,
  onChange,
}: {
  label: string;
  value: string;
  onChange: (e: { currentTarget: { value: string } }) => void;
}) {
  return (
    <label className="grid gap-1 font-body-th text-sm text-text-2 leading-relaxed">
      {label}
      <input
        type="text"
        value={value}
        onChange={onChange}
        className="rounded-md border border-border bg-surface px-3 py-2 font-body-th text-base text-text leading-relaxed"
      />
    </label>
  );
}

/** A labelled numeric field — `inputMode="numeric"` for a Thai-phone number pad; the value is parsed
 * to an int on submit (non-numeric is skipped, never sent). */
function NumberField({
  label,
  value,
  onChange,
}: {
  label: string;
  value: string;
  onChange: (e: { currentTarget: { value: string } }) => void;
}) {
  return (
    <label className="grid gap-1 font-body-th text-sm text-text-2 leading-relaxed">
      {label}
      <input
        type="number"
        inputMode="numeric"
        value={value}
        onChange={onChange}
        className="rounded-md border border-border bg-surface px-3 py-2 font-latin text-base text-text leading-relaxed"
      />
    </label>
  );
}

/** A terminal outcome panel (saved / not-owner) — a tinted glyph, title+body, and a CTA back. */
function Outcome({
  glyph,
  tone,
  title,
  body,
  cta,
  onCta,
}: {
  glyph: string;
  tone: "success" | "warn";
  title: string;
  body: string;
  cta: string;
  onCta: () => void;
}) {
  const ring =
    tone === "success"
      ? "border-success bg-success-bg"
      : "border-[var(--badge-owner-text)] bg-[var(--badge-owner)]";
  return (
    <article
      className="grid justify-items-center gap-3 py-8 text-center"
      lang="th"
      data-th-content
      data-state="edit-outcome"
    >
      <span
        aria-hidden="true"
        className={`flex size-14 items-center justify-center rounded-full border-2 text-2xl ${ring}`}
      >
        {glyph}
      </span>
      <h1 className="m-0 font-heading-th font-bold text-lg text-text leading-snug">{title}</h1>
      <p className="m-0 max-w-[20rem] font-body-th text-base text-text-2 leading-relaxed">{body}</p>
      <button
        type="button"
        data-cta-solid
        onClick={onCta}
        className="rounded-md border-0 bg-primary-500 px-5 py-2.5 font-body-th font-semibold text-base text-surface leading-relaxed"
      >
        {cta}
      </button>
    </article>
  );
}
