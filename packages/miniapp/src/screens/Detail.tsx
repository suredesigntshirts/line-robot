/** The Detail screen: every field of one listing, its photo gallery, the chanote (title-deed) block,
 * an in-app map pin, and an "Open in Maps" deep link. Read-only — editing stays in chat. */

import type { Chanote, PropertyDetail } from "@line-robot/shared";
import { useEffect, useState } from "preact/hooks";
import { ApiError, api } from "../api.js";
import { Gallery } from "../components/Gallery.js";
import { MapPin } from "../components/MapPin.js";
import { formatDate } from "../lib/format.js";
import { getIdToken } from "../liff.js";
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
        <DetailBody p={state.data} />
      )}
    </div>
  );
}

function DetailBody({ p }: { p: PropertyDetail }) {
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

      <footer class="stamps muted small">
        {p.createdAt !== undefined ? <span>Saved {formatDate(p.createdAt)}</span> : null}
        {p.updatedAt !== undefined ? <span>Updated {formatDate(p.updatedAt)}</span> : null}
      </footer>
    </article>
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
