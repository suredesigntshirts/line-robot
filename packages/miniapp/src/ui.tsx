/** Small shared presentational bits + the async-fetch state shape used by the screens. */
import type { ComponentChildren } from "preact";

export type AsyncState<T> =
  | { readonly status: "loading" }
  | { readonly status: "error"; readonly error: unknown }
  | { readonly status: "ready"; readonly data: T };

export function Spinner({ label }: { label?: string }): ComponentChildren {
  return (
    <div class="center muted" role="status" aria-live="polite">
      <div class="spinner" aria-hidden="true" />
      {label !== undefined ? <span>{label}</span> : null}
    </div>
  );
}

export function ErrorView({ status, onRetry }: { status?: number; onRetry?: () => void }) {
  const message =
    status === 401
      ? "Please open this from inside LINE to see your listings."
      : status === 404
        ? "That listing isn't available."
        : "Something went wrong loading your listings.";
  return (
    <div class="center muted">
      <p>{message}</p>
      {onRetry !== undefined ? (
        <button type="button" class="btn" onClick={onRetry}>
          Try again
        </button>
      ) : null}
    </div>
  );
}

/** A single "Label: value" row, omitted entirely when the value is absent. */
export function Field({ label, value }: { label: string; value?: ComponentChildren }) {
  if (value === undefined || value === null || value === "") {
    return null;
  }
  return (
    <div class="field">
      <span class="field-label">{label}</span>
      <span class="field-value">{value}</span>
    </div>
  );
}

/** A status chip (emoji badge text from the DTO, or a plain label). */
export function Badge({ text }: { text?: string }) {
  if (text === undefined || text === "") {
    return null;
  }
  return <span class="badge">{text}</span>;
}
