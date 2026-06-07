/** An in-app OpenStreetMap pin via Leaflet — no API key (avoids a Google Maps key in v1). Uses a
 * vector circle marker so we don't depend on Leaflet's bundler-fragile default marker icon assets. */
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import { useEffect, useRef } from "preact/hooks";

export function MapPin({ lat, long, title }: { lat: number; long: number; title?: string }) {
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const el = containerRef.current;
    if (el === null) {
      return;
    }
    const map = L.map(el, { attributionControl: true, scrollWheelZoom: false }).setView(
      [lat, long],
      15,
    );
    L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
      attribution: "© OpenStreetMap",
      maxZoom: 19,
    }).addTo(map);
    const marker = L.circleMarker([lat, long], {
      radius: 9,
      color: "#06c755",
      fillColor: "#06c755",
      fillOpacity: 0.9,
      weight: 2,
    }).addTo(map);
    if (title !== undefined && title !== "") {
      marker.bindTooltip(title);
    }
    // The container is sized by CSS after mount; recompute tiles once it has a real size.
    const raf = requestAnimationFrame(() => map.invalidateSize());
    return () => {
      cancelAnimationFrame(raf);
      map.remove();
    };
  }, [lat, long, title]);

  return <div ref={containerRef} class="map" />;
}
