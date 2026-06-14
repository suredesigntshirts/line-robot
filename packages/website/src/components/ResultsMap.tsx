/**
 * CONV-08 results map — an OpenStreetMap pin map of the radius-search results, mirroring the
 * mini-app's MapPin (Leaflet + OSM tiles, a vector circleMarker so we don't depend on Leaflet's
 * bundler-fragile default marker icon assets; no API key, no custom tile server).
 *
 * It's a `client:visible` island (TECH-02 — a genuine browser API; lazy so the static list keeps
 * its zero-JS, TECH-01). List-first stays primary: this renders BELOW the result list as a
 * supplementary view, never the primary search surface. Mobile-first (TH-09/COMP-14): the
 * container is responsive and the map fits all pins on mount.
 *
 * Leaflet reads `window` at import, so it would crash Astro's SSR pass over this module. We
 * dynamic-import Leaflet (and its CSS) INSIDE the client-only effect — SSR never evaluates it, and
 * the heavy map bundle loads only when the island actually mounts.
 */
// CSS-only import: Vite extracts it to a stylesheet (no JS executes), so it's SSR-safe even though
// the Leaflet *JS* is dynamic-imported below to avoid its `window` access during SSR.
import "leaflet/dist/leaflet.css";
import { createTranslator, type UiLocale } from "@line-robot/ui";
import { useEffect, useRef } from "react";

export interface MapPinData {
  id: string;
  lat: number;
  lng: number;
  title: string;
  /** Detail-page href — a popup link so a pin leads to the listing. */
  href: string;
}

interface ResultsMapProps {
  pins: MapPinData[];
  locale: UiLocale;
}

export function ResultsMap({ pins, locale }: ResultsMapProps) {
  const t = createTranslator(locale);
  // Hoist the one translated string the effect needs so the effect depends on a stable value, not
  // the fresh-identity translator (which would needlessly tear down + rebuild the map on re-render).
  const viewLabel = t("map.view");
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const el = containerRef.current;
    if (el === null || pins.length === 0) return;

    let map: import("leaflet").Map | undefined;
    let raf = 0;
    let cancelled = false;

    // Dynamic import: keeps the Leaflet JS out of the SSR pass and out of the page's initial JS.
    import("leaflet").then((leaflet) => {
      if (cancelled || containerRef.current === null) return;
      const L = leaflet.default;
      map = L.map(el, { attributionControl: true, scrollWheelZoom: false });
      L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
        attribution: "© OpenStreetMap",
        maxZoom: 19,
      }).addTo(map);

      const latLngs: import("leaflet").LatLngExpression[] = [];
      for (const pin of pins) {
        latLngs.push([pin.lat, pin.lng]);
        const marker = L.circleMarker([pin.lat, pin.lng], {
          radius: 9,
          color: "#1d4ed8", // trust-blue, matches the site primary
          fillColor: "#1d4ed8",
          fillOpacity: 0.9,
          weight: 2,
        }).addTo(map);
        // Popup built via the DOM (never innerHTML) — title is user data, must not be an XSS sink.
        const wrap = document.createElement("div");
        const strong = document.createElement("strong");
        strong.textContent = pin.title;
        const link = document.createElement("a");
        link.href = pin.href;
        link.textContent = viewLabel;
        link.style.display = "block";
        link.style.marginTop = "4px";
        wrap.append(strong, link);
        marker.bindPopup(wrap);
      }

      // Fit all pins (a single pin gets a sensible zoom; many get a tight bounds with padding).
      if (latLngs.length === 1) {
        map.setView(latLngs[0], 15);
      } else {
        map.fitBounds(L.latLngBounds(latLngs), { padding: [32, 32], maxZoom: 16 });
      }
      // The container is sized by CSS after mount; recompute tiles once it has a real size.
      raf = requestAnimationFrame(() => map?.invalidateSize());
    });

    return () => {
      cancelled = true;
      cancelAnimationFrame(raf);
      map?.remove();
    };
  }, [pins, viewLabel]);

  if (pins.length === 0) return null;

  return (
    <section style={{ display: "grid", gap: "var(--spacing-2)" }}>
      <h2
        style={{
          fontSize: "var(--text-md)",
          fontFamily: "var(--font-heading-th)",
          margin: 0,
        }}
      >
        {t("map.title")}
      </h2>
      <div
        ref={containerRef}
        role="application"
        aria-label={t("map.title")}
        style={{
          height: "min(60vh, 420px)",
          width: "100%",
          borderRadius: "var(--radius-lg)",
          overflow: "hidden",
          border: "1px solid var(--color-border)",
        }}
      />
    </section>
  );
}
