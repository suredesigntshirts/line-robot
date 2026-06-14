/**
 * Per-listing follow-up NOTES on the detail screen (D13). Lists the caller's OWN notes (`GET
 * /properties/{id}/notes` — never another user's, enforced server-side) and an add-note textarea →
 * `POST /properties/{id}/notes`. Empty input is blocked client-side AND the server's `400 empty_note`
 * (ApiError 400) is mapped to the same field error. A successful add prepends the new note (the api
 * returns the created row, so no re-fetch). Mock: explore-stage5-3-viewings.html `.note-card`.
 *
 * Markers: `data-th-content` (the TH-07 net measures the Thai note bodies/labels) + `data-cta-solid`
 * on the solid add button.
 */
import type { Translator } from "@line-robot/ui";
import { useState } from "react";
import { useAsync } from "../app/useAsync.ts";
import { type ApiClient, ApiError } from "../lib/api.ts";
import { fullDateTime } from "../lib/display.ts";
import type { NoteDto } from "../lib/types.ts";

export function NotesSection({
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
  const { state } = useAsync(() => api.notes(id), [id]);
  // Notes added this session prepend to whatever the fetch returned (kept local so an add doesn't need
  // a re-fetch — the api returns the created row).
  const [added, setAdded] = useState<NoteDto[]>([]);
  const [draft, setDraft] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function add(): Promise<void> {
    const text = draft.trim();
    if (text === "") {
      setError(t("notes.errorEmpty"));
      return;
    }
    setError(null);
    setBusy(true);
    try {
      const note = await api.addNote(id, text);
      setAdded((prev) => [note, ...prev]);
      setDraft("");
    } catch (err) {
      setError(
        err instanceof ApiError && err.status === 400 ? t("notes.errorEmpty") : t("error.why"),
      );
    } finally {
      setBusy(false);
    }
  }

  const fetched = state.status === "ready" ? state.data : [];
  const notes = [...added, ...fetched];

  return (
    <section className="grid gap-2" data-notes-section lang="th" data-th-content>
      <h2 className="m-0 font-heading-th font-semibold text-md text-text leading-normal">
        {t("notes.head")}
      </h2>

      {/* Add-note input. */}
      <div className="grid gap-1.5">
        <textarea
          value={draft}
          onChange={(e) => setDraft(e.currentTarget.value)}
          placeholder={t("notes.placeholder")}
          rows={2}
          data-note-input
          className="resize-y rounded-md border border-border bg-surface px-3 py-2 font-body-th text-base text-text leading-relaxed placeholder:text-text-disabled"
        />
        {error !== null && (
          <p
            className="m-0 font-body-th text-danger text-sm leading-relaxed"
            role="alert"
            data-note-error
          >
            {error}
          </p>
        )}
        <button
          type="button"
          data-cta-solid
          data-add-note
          disabled={busy}
          onClick={add}
          className="justify-self-start rounded-md border-0 bg-primary-500 px-4 py-2 font-body-th font-semibold text-base text-surface leading-relaxed disabled:opacity-60"
        >
          {busy ? t("notes.adding") : t("notes.add")}
        </button>
      </div>

      {/* The note list (caller's own). */}
      {state.status === "loading" ? (
        <p className="m-0 font-body-th text-sm text-text-disabled leading-relaxed">
          {t("notes.loading")}
        </p>
      ) : notes.length === 0 ? (
        <p className="m-0 font-body-th text-sm text-text-disabled leading-relaxed" data-notes-empty>
          {t("notes.empty")}
        </p>
      ) : (
        <ul className="grid list-none gap-2 p-0">
          {notes.map((note) => (
            <li
              key={note.id}
              data-note-card
              className="grid gap-1 rounded-md border border-border bg-surface px-3 py-2.5 shadow-xs"
            >
              <p className="m-0 font-body-th text-base text-text leading-relaxed">{note.body}</p>
              <span className="font-body-th text-text-disabled text-xs leading-relaxed">
                {fullDateTime(note.createdAt, locale)}
              </span>
            </li>
          ))}
        </ul>
      )}

      <p className="m-0 font-body-th text-sm text-text-disabled leading-relaxed">
        {t("notes.private")}
      </p>
    </section>
  );
}
