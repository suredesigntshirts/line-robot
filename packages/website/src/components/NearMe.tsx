import { createTranslator, type UiLocale } from "@line-robot/ui";
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
  /** The locale-prefixed browse path the island navigates to. */
  basePath: string;
  /** Lay out as one row (toolbar variant) instead of a stacked block. */
  compact?: boolean;
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
 * APIs). The button asks for the user's position (opt-in — the page works fully without it), then
 * navigates to the SSR radius search (?lat&lng&radius), which does the actual work. The radius is a
 * row of pill toggles (thumb-sized, no native select). Permission-denied / unsupported / timeout
 * all degrade to a clear message, never a broken state.
 */
export function NearMe({ query, locale, basePath, compact = false }: NearMeProps) {
  const t = createTranslator(locale);
  const [status, setStatus] = useState<Status>("idle");
  const [radiusM, setRadiusM] = useState<number>(query.near?.radiusM ?? DEFAULT_RADIUS_M);
  const active = query.near !== undefined;

  const go = (near: BrowseQuery["near"]) => {
    const { near: _drop, ...rest } = query;
    const target: BrowseQuery = { ...rest, ...(near ? { near } : {}), page: 1 };
    window.location.assign(`${basePath}${browseQueryString(target)}`);
  };

  const locate = () => {
    if (typeof navigator === "undefined" || !navigator.geolocation) {
      setStatus("unavailable");
      return;
    }
    setStatus("locating");
    navigator.geolocation.getCurrentPosition(
      (pos) => go({ lat: pos.coords.latitude, lng: pos.coords.longitude, radiusM }),
      (err) => {
        // 1 = PERMISSION_DENIED, 2 = POSITION_UNAVAILABLE, 3 = TIMEOUT.
        setStatus(err.code === 1 ? "denied" : err.code === 3 ? "timeout" : "unavailable");
      },
      { enableHighAccuracy: false, timeout: 10000, maximumAge: 60000 },
    );
  };

  // Changing the radius while a radius search is active re-runs it around the same point.
  const pickRadius = (m: number) => {
    setRadiusM(m);
    if (query.near) go({ ...query.near, radiusM: m });
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
    <div
      className={`font-body-th ${compact ? "flex flex-wrap items-center gap-2" : "grid gap-2"}`}
      data-near-me
    >
      <button
        type="button"
        onClick={locate}
        disabled={status === "locating"}
        aria-pressed={active}
        className={`inline-flex h-10 items-center justify-center gap-2 rounded-full border px-4 font-semibold text-sm leading-relaxed transition-colors disabled:opacity-60 ${
          active
            ? "border-primary-500 bg-primary-500 text-surface"
            : "border-primary-200 bg-primary-50 text-primary-700 hover:bg-primary-100"
        }`}
      >
        <svg
          xmlns="http://www.w3.org/2000/svg"
          width="16"
          height="16"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
          aria-hidden="true"
        >
          <line x1="2" x2="5" y1="12" y2="12" />
          <line x1="19" x2="22" y1="12" y2="12" />
          <line x1="12" x2="12" y1="2" y2="5" />
          <line x1="12" x2="12" y1="19" y2="22" />
          <circle cx="12" cy="12" r="7" />
        </svg>
        {status === "locating" ? t("near.locating") : t("near.button")}
      </button>
      <fieldset className="m-0 flex items-center gap-1 border-0 p-0">
        <legend className="float-left mr-1 text-sm text-text-2 leading-relaxed">
          {t("near.radius")}
        </legend>
        {RADIUS_OPTIONS_M.map((m) => (
          <button
            key={m}
            type="button"
            aria-pressed={radiusM === m}
            onClick={() => pickRadius(m)}
            className={`h-8 rounded-full border px-2.5 font-latin text-xs leading-none transition-colors ${
              radiusM === m
                ? "border-primary-500 bg-primary-50 font-semibold text-primary-700"
                : "border-border-2 bg-surface text-text-2 hover:text-text"
            }`}
          >
            {t(RADIUS_LABEL_KEY[m])}
          </button>
        ))}
      </fieldset>
      {active && (
        <button
          type="button"
          onClick={() => go(undefined)}
          className="inline-flex w-fit items-center rounded-full border border-border-2 border-dashed px-3 py-1 text-sm text-text-2 leading-relaxed transition-colors hover:text-text"
        >
          {t("near.clear")}
        </button>
      )}
      {active && !message && !compact && (
        <span className="text-sm text-text-2 leading-relaxed">{t("near.active")}</span>
      )}
      {message && (
        // COPY-07 graceful failure: what + why + next; the page still works without location.
        <span role="status" className="basis-full text-sm text-text-2 leading-relaxed">
          {message}
        </span>
      )}
    </div>
  );
}
