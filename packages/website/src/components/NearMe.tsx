import { createTranslator, primaryButtonStyle, type UiLocale } from "@line-robot/ui";
import { useState } from "react";
import {
  type BrowseQuery,
  browseQueryString,
  DEFAULT_RADIUS_M,
  RADIUS_OPTIONS_M,
} from "../lib/browse.ts";

interface NearMeProps {
  /** The current browse query — preserved so "near me" composes with the active filters (CONV-08). */
  query: BrowseQuery;
  locale: UiLocale;
  basePath: string;
}

type Status = "idle" | "locating" | "denied" | "unavailable" | "timeout";

/** Radius value → its i18n key suffix ("near.radius3" etc.). */
const RADIUS_LABEL_KEY = {
  1000: "near.radius1",
  3000: "near.radius3",
  5000: "near.radius5",
  10000: "near.radius10",
} as const;

/**
 * CONV-08 "search near me" — a thin geolocation island (TECH-02: islands are for genuine browser
 * APIs; Geolocation qualifies). The button asks the browser for the user's position (privacy:
 * ask, don't demand — it's opt-in and the page works fully without it), then navigates to the SSR
 * radius search (?lat&lng&radius), which does the actual work. A full-page nav mirrors FilterBar.
 * Permission-denied / unsupported / timeout all degrade to a clear message, never a broken state.
 */
export function NearMe({ query, locale, basePath }: NearMeProps) {
  const t = createTranslator(locale);
  const [status, setStatus] = useState<Status>("idle");
  // Keep an already-active radius selected, else default to 3 km (a neighbourhood; MKT-04).
  const [radiusM, setRadiusM] = useState<number>(query.near?.radiusM ?? DEFAULT_RADIUS_M);

  const active = query.near !== undefined;

  const locate = () => {
    if (typeof navigator === "undefined" || !navigator.geolocation) {
      setStatus("unavailable");
      return;
    }
    setStatus("locating");
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        const target: BrowseQuery = {
          ...query,
          near: { lat: pos.coords.latitude, lng: pos.coords.longitude, radiusM },
          page: 1,
        };
        // Navigate to the shareable SSR radius URL; the server runs the radius search there.
        window.location.assign(`${basePath}/${browseQueryString(target)}`);
      },
      (err) => {
        // GeolocationPositionError: 1 = PERMISSION_DENIED, 2 = POSITION_UNAVAILABLE, 3 = TIMEOUT.
        setStatus(err.code === 1 ? "denied" : err.code === 3 ? "timeout" : "unavailable");
      },
      { enableHighAccuracy: false, timeout: 10000, maximumAge: 60000 },
    );
  };

  const clear = () => {
    const { near: _near, ...rest } = query;
    window.location.assign(`${basePath}/${browseQueryString({ ...rest, page: 1 })}`);
  };

  const message =
    status === "denied"
      ? t("near.denied")
      : status === "unavailable"
        ? t("near.unavailable")
        : status === "timeout"
          ? t("near.timeout")
          : "";

  return (
    <div style={{ display: "grid", gap: "var(--spacing-2)", fontFamily: "var(--font-body-th)" }}>
      <div
        style={{ display: "flex", gap: "var(--spacing-2)", alignItems: "center", flexWrap: "wrap" }}
      >
        <button
          type="button"
          onClick={locate}
          disabled={status === "locating"}
          style={{ ...primaryButtonStyle, opacity: status === "locating" ? 0.6 : 1 }}
        >
          {status === "locating" ? t("near.locating") : `\u{1F4CD} ${t("near.button")}`}
        </button>
        <label
          style={{
            display: "flex",
            gap: "var(--spacing-1)",
            alignItems: "center",
            fontSize: "var(--text-sm)",
            color: "var(--color-text-2)",
          }}
        >
          {t("near.radius")}
          <select
            value={radiusM}
            onChange={(e) => setRadiusM(Number(e.target.value))}
            style={{
              padding: "var(--spacing-1) var(--spacing-2)",
              borderRadius: "var(--radius-md)",
              border: "1px solid var(--color-border-2)",
              background: "var(--color-surface)",
              color: "var(--color-text)",
              fontSize: "var(--text-sm)",
              fontFamily: "var(--font-body-th)",
            }}
          >
            {RADIUS_OPTIONS_M.map((m) => (
              <option key={m} value={m}>
                {t(RADIUS_LABEL_KEY[m])}
              </option>
            ))}
          </select>
        </label>
        {active && (
          <button
            type="button"
            onClick={clear}
            style={{
              padding: "var(--spacing-1) var(--spacing-3)",
              borderRadius: "var(--radius-full)",
              border: "1px dashed var(--color-border-2)",
              background: "var(--color-surface)",
              color: "var(--color-text-2)",
              fontSize: "var(--text-sm)",
              fontFamily: "var(--font-body-th)",
              cursor: "pointer",
            }}
          >
            {t("near.clear")}
          </button>
        )}
      </div>
      {active && !message && (
        <span style={{ fontSize: "var(--text-sm)", color: "var(--color-text-2)" }}>
          {t("near.active")}
        </span>
      )}
      {message && (
        // COPY-07 graceful failure: what + why + next; the page still works without location.
        <span role="status" style={{ fontSize: "var(--text-sm)", color: "var(--color-text-2)" }}>
          {message}
        </span>
      )}
    </div>
  );
}
