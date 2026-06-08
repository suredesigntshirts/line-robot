/** The Detail screen: every field of one listing, its photo gallery, the chanote (title-deed) block,
 * an in-app map pin, and an "Open in Maps" deep link. Read-only — editing stays in chat. */

import type { Chanote, PropertyDetail } from "@line-robot/shared";
import { useEffect, useState } from "preact/hooks";
import { ApiError, api } from "../api.js";
import { Gallery } from "../components/Gallery.js";
import { MapPin } from "../components/MapPin.js";
import { detailPath } from "../lib/deeplink.js";
import { formatDate, formatDateTime } from "../lib/format.js";
import { buildShareFlex } from "../lib/share.js";
import { canShare, getIdToken, miniAppDeepLink, shareListing } from "../liff.js";
import { type AsyncState, Badge, ErrorView, Field, Spinner } from "../ui.js";

export function DetailScreen({ id, navigate }: { id: string; navigate: (path: string) => void }) {
  const [state, setState] = useState<AsyncState<PropertyDetail>>({ status: "loading" });
  const [reloadKey, setReloadKey] = useState(0);

  useEffect(() => {
    let cancelled = false;
    setState({ status: "loading" });
    const token = getIdToken();
    if (token === null) {
      setState({ status: "error", error: new ApiError(401) });
      return;
    }
    api.property(id, token).then(
      (data) => {
        if (!cancelled) {
          setState({ status: "ready", data });
        }
      },
      (error) => {
        if (!cancelled) {
          setState({ status: "error", error });
        }
      },
    );
    return () => {
      cancelled = true;
    };
  }, [id, reloadKey]);

  return (
    <div class="screen">
      <header class="app-header">
        <button type="button" class="back" onClick={() => navigate("/")}>
          ‹ Listings
        </button>
      </header>

      {state.status === "loading" ? (
        <Spinner label="Loading…" />
      ) : state.status === "error" ? (
        <ErrorView
          status={state.error instanceof ApiError ? state.error.status : undefined}
          onRetry={() => setReloadKey((k) => k + 1)}
        />
      ) : (
        <DetailBody p={state.data} id={id} />
      )}
    </div>
  );
}

function DetailBody({ p, id }: { p: PropertyDetail; id: string }) {
  const beds = p.bedrooms !== undefined ? `${p.bedrooms} bed` : undefined;
  const baths = p.bathrooms !== undefined ? `${p.bathrooms} bath` : undefined;
  const rooms = [beds, baths].filter((s): s is string => s !== undefined).join(" · ");
  const headline = p.price ?? p.rent;

  return (
    <article class="detail">
      <h1 class="detail-title">{p.title}</h1>
      <div class="detail-sub">
        <Badge text={p.statusBadge} />
        {headline !== undefined ? <span class="detail-price">{headline}</span> : null}
      </div>

      {p.photos.length > 0 ? <Gallery photos={p.photos} /> : null}

      <section class="fields">
        <Field label="Type" value={p.propertyType} />
        <Field label="For" value={p.listingType} />
        <Field label="Rooms" value={rooms !== "" ? rooms : undefined} />
        <Field
          label="Usable area"
          value={p.usableAreaSqm !== undefined ? `${p.usableAreaSqm} sqm` : undefined}
        />
        <Field label="Land" value={p.landArea} />
        <Field label="Floors" value={p.floors !== undefined ? String(p.floors) : undefined} />
        <Field label="Furnishing" value={p.furnishing} />
        {p.price !== undefined && p.rent !== undefined ? (
          <Field label="Rent" value={p.rent} />
        ) : null}
        <Field label="Project" value={p.projectName} />
        <Field label="Address" value={p.address} />
        <Field label="Area" value={p.area} />
        <Field label="Contact" value={p.contact} />
        <Field label="Source" value={p.source} />
        <Field
          label="Tags"
          value={p.tags !== undefined && p.tags.length > 0 ? p.tags.join(", ") : undefined}
        />
        <Field label="Notes" value={p.notes} />
      </section>

      {p.chanote !== undefined ? <ChanoteBlock c={p.chanote} /> : null}

      {p.lat !== undefined && p.long !== undefined ? (
        <MapPin lat={p.lat} long={p.long} title={p.title} />
      ) : null}

      {p.mapsUri !== undefined ? (
        <a class="btn btn-block" href={p.mapsUri} target="_blank" rel="noreferrer">
          🗺 Open in Maps
        </a>
      ) : null}

      <section class="actions">
        <BookViewing id={id} />
        {canShare() ? <ShareButton p={p} id={id} /> : null}
      </section>

      <footer class="stamps muted small">
        {p.createdAt !== undefined ? <span>Saved {formatDate(p.createdAt)}</span> : null}
        {p.updatedAt !== undefined ? <span>Updated {formatDate(p.updatedAt)}</span> : null}
      </footer>
    </article>
  );
}

/** `YYYY-MM-DDTHH:mm` for "now" in the device's local time — the `min` for the datetime picker so a
 * past slot can't be chosen in the UI (the server re-checks too). */
function nowLocalInput(): string {
  const d = new Date();
  const pad = (n: number): string => String(n).padStart(2, "0");
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`;
}

/** A short status line under the action buttons (success/error of a share or booking). */
type ActionMsg = { readonly ok: boolean; readonly text: string };

/** "Book a viewing": a datetime picker + optional note that POSTs a follow-up event. The reminder is
 * pushed to the user's 1:1 chat with the bot (they reached this app from it, so they're friends). */
function BookViewing({ id }: { id: string }) {
  const [open, setOpen] = useState(false);
  const [when, setWhen] = useState("");
  const [note, setNote] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [msg, setMsg] = useState<ActionMsg | null>(null);

  const submit = async (): Promise<void> => {
    const token = getIdToken();
    if (token === null) {
      setMsg({ ok: false, text: "Open this from inside LINE to book." });
      return;
    }
    if (when === "") {
      setMsg({ ok: false, text: "Pick a date and time first." });
      return;
    }
    setSubmitting(true);
    setMsg(null);
    const trimmedNote = note.trim();
    try {
      const res = await api.bookViewing(id, token, {
        datetimeLocal: when,
        ...(trimmedNote !== "" ? { title: trimmedNote } : {}),
      });
      setMsg({
        ok: true,
        text: `Viewing booked for ${formatDateTime(res.dueAt)} — I'll remind you in LINE.`,
      });
      setOpen(false);
      setWhen("");
      setNote("");
    } catch (error) {
      const status = error instanceof ApiError ? error.status : undefined;
      setMsg({
        ok: false,
        text:
          status === 400
            ? "Please pick a future date and time."
            : status === 401
              ? "Open this from inside LINE to book."
              : "Couldn't book that viewing — please try again.",
      });
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div class="book">
      {open ? (
        <div class="book-form">
          <label class="book-field">
            <span class="field-label">When</span>
            <input
              type="datetime-local"
              value={when}
              min={nowLocalInput()}
              onInput={(e) => setWhen((e.target as HTMLInputElement).value)}
            />
          </label>
          <label class="book-field">
            <span class="field-label">Note (optional)</span>
            <input
              type="text"
              placeholder="Viewing"
              maxLength={60}
              value={note}
              onInput={(e) => setNote((e.target as HTMLInputElement).value)}
            />
          </label>
          <div class="book-actions">
            <button type="button" class="btn" disabled={submitting} onClick={submit}>
              {submitting ? "Booking…" : "Confirm"}
            </button>
            <button
              type="button"
              class="btn btn-ghost"
              disabled={submitting}
              onClick={() => setOpen(false)}
            >
              Cancel
            </button>
          </div>
        </div>
      ) : (
        <button
          type="button"
          class="btn btn-block"
          onClick={() => {
            setMsg(null);
            setOpen(true);
          }}
        >
          📅 Book a viewing
        </button>
      )}
      {msg !== null ? <p class={`action-msg ${msg.ok ? "ok" : "err"}`}>{msg.text}</p> : null}
    </div>
  );
}

/** "Share listing": open the native target picker with a self-contained Flex card that deep-links
 * back to this listing. Only rendered when {@link canShare} is true. */
function ShareButton({ p, id }: { p: PropertyDetail; id: string }) {
  const [busy, setBusy] = useState(false);
  const [msg, setMsg] = useState<ActionMsg | null>(null);

  const onShare = async (): Promise<void> => {
    setBusy(true);
    setMsg(null);
    try {
      const flex = buildShareFlex(p, miniAppDeepLink(detailPath(id)));
      const sent = await shareListing([flex]);
      if (sent) {
        setMsg({ ok: true, text: "Shared ✓" });
      }
    } catch {
      setMsg({ ok: false, text: "Couldn't open the share picker — please try again." });
    } finally {
      setBusy(false);
    }
  };

  return (
    <div class="share">
      <button type="button" class="btn btn-block" disabled={busy} onClick={onShare}>
        📤 Share listing
      </button>
      {msg !== null ? <p class={`action-msg ${msg.ok ? "ok" : "err"}`}>{msg.text}</p> : null}
    </div>
  );
}

function ChanoteBlock({ c }: { c: Chanote }) {
  const encumbrances =
    c.encumbrances !== undefined && c.encumbrances.length > 0
      ? c.encumbrances.join("; ")
      : undefined;
  return (
    <section class="fields chanote">
      <h2 class="section-title">Title deed</h2>
      <Field label="Type" value={c.titleType} />
      <Field label="Deed no." value={c.deedNumber} />
      <Field label="Parcel no." value={c.landNumber} />
      <Field label="Survey page" value={c.surveyPage} />
      <Field label="Map sheet" value={c.mapSheet} />
      <Field label="Land office" value={c.landOffice} />
      <Field label="Owner" value={c.ownerName} />
      <Field label="Land area" value={c.landArea} />
      <Field label="Encumbrances" value={encumbrances} />
      {c.confidenceNote !== undefined ? <Field label="⚠ Note" value={c.confidenceNote} /> : null}
    </section>
  );
}
