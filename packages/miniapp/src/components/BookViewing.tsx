/**
 * Book-a-viewing on the detail screen (D13). A collapsible panel with a NATIVE `<input
 * type="datetime-local">` (no heavy date-picker dep — anti-over-engineering) → `POST
 * /properties/{id}/viewings`. Validates a FUTURE time client-side, and maps a server `400 invalid_time`
 * (ApiError 400) to a calm field error. On success it shows a confirmation and refreshes nothing on the
 * detail (the new viewing surfaces on the Viewings tab on its next fetch).
 *
 * `datetime-local` yields a LOCAL wall-clock string (`YYYY-MM-DDTHH:mm`, no zone). We convert it to an
 * absolute instant with `new Date(value)` (interpreted in the device's local zone — Asia/Bangkok on a
 * Thai phone) and send its ISO-8601 (UTC) string, which the api parses with `new Date(scheduledAt)`.
 *
 * Markers: `data-th-content` (the TH-07 net measures the Thai field labels/errors) + `data-cta-solid`
 * on the solid submit button (the WCAG-AA contrast net).
 */
import type { Translator } from "@line-robot/ui";
import { useState } from "react";
import { type ApiClient, ApiError } from "../lib/api.ts";

type Status = "idle" | "open" | "submitting" | "created";

export function BookViewing({ id, api, t }: { id: string; api: ApiClient; t: Translator }) {
  const [status, setStatus] = useState<Status>("idle");
  const [value, setValue] = useState("");
  const [error, setError] = useState<string | null>(null);

  async function submit(): Promise<void> {
    setError(null);
    const when = new Date(value);
    if (value === "" || Number.isNaN(when.getTime())) {
      setError(t("viewing.errorInvalid"));
      return;
    }
    if (when.getTime() <= Date.now()) {
      setError(t("viewing.errorPast"));
      return;
    }
    setStatus("submitting");
    try {
      await api.createViewing(id, when.toISOString());
      setStatus("created");
    } catch (err) {
      // The server's own future-time check (400 invalid_time) — surface it, stay on the form.
      setError(
        err instanceof ApiError && err.status === 400 ? t("viewing.errorPast") : t("error.why"),
      );
      setStatus("open");
    }
  }

  if (status === "created") {
    return (
      <div
        className="flex items-center gap-2 rounded-md border border-success bg-success-bg px-3 py-2.5"
        data-viewing-created
        lang="th"
        data-th-content
      >
        <span aria-hidden="true">✅</span>
        <span className="font-body-th text-base text-success leading-relaxed">
          {t("viewing.created")}
        </span>
      </div>
    );
  }

  if (status === "idle") {
    return (
      <button
        type="button"
        data-cta-solid
        data-book-viewing={id}
        onClick={() => setStatus("open")}
        className="inline-flex items-center justify-center gap-2 rounded-md border-0 bg-primary-500 px-4 py-2.5 font-body-th font-semibold text-base text-surface leading-relaxed"
        lang="th"
      >
        📅 {t("viewing.bookCta")}
      </button>
    );
  }

  // open / submitting — the picker form.
  return (
    <div
      className="grid gap-2 rounded-lg border border-border bg-surface p-3"
      data-viewing-form
      lang="th"
      data-th-content
    >
      <div className="font-heading-th font-bold text-base text-text leading-normal">
        {t("viewing.bookTitle")}
      </div>
      <label className="grid gap-1 font-body-th text-sm text-text-2 leading-relaxed">
        {t("viewing.pickLabel")}
        <input
          type="datetime-local"
          value={value}
          onChange={(e) => setValue(e.currentTarget.value)}
          className="rounded-md border border-border bg-surface px-3 py-2 font-body-th text-base text-text leading-relaxed"
          data-viewing-input
        />
      </label>
      {error !== null && (
        <p
          className="m-0 font-body-th text-danger text-sm leading-relaxed"
          role="alert"
          data-viewing-error
        >
          {error}
        </p>
      )}
      <div className="flex gap-2">
        <button
          type="button"
          data-cta-solid
          disabled={status === "submitting"}
          onClick={submit}
          className="inline-flex flex-1 items-center justify-center rounded-md border-0 bg-primary-500 px-4 py-2.5 font-body-th font-semibold text-base text-surface leading-relaxed disabled:opacity-60"
        >
          {status === "submitting" ? t("viewing.submitting") : t("viewing.submit")}
        </button>
        <button
          type="button"
          disabled={status === "submitting"}
          onClick={() => {
            setStatus("idle");
            setError(null);
          }}
          className="rounded-md border border-border bg-surface px-4 py-2.5 font-body-th font-semibold text-base text-text-2 leading-relaxed disabled:opacity-60"
        >
          {t("viewing.cancel")}
        </button>
      </div>
    </div>
  );
}
