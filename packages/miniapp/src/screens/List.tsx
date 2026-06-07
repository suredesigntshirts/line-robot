/** The List screen: every one of the caller's listings (no 12-card cap), narrowed by a search box +
 * status/type/area chips and ordered by a sort selector — all client-side over the fetched set. */

import type { PropertyListItem } from "@line-robot/shared";
import { useEffect, useMemo, useState } from "preact/hooks";
import { ApiError, api } from "../api.js";
import { detailPath } from "../lib/deeplink.js";
import {
  applyFilters,
  distinctValues,
  type Filters,
  type SortKey,
  sortItems,
} from "../lib/predicates.js";
import { getIdToken } from "../liff.js";
import { type AsyncState, Badge, ErrorView, Spinner } from "../ui.js";

export function ListScreen({ navigate }: { navigate: (path: string) => void }) {
  const [state, setState] = useState<AsyncState<PropertyListItem[]>>({ status: "loading" });
  const [reloadKey, setReloadKey] = useState(0);

  const [query, setQuery] = useState("");
  const [status, setStatus] = useState<string | undefined>(undefined);
  const [propertyType, setPropertyType] = useState<string | undefined>(undefined);
  const [area, setArea] = useState<string | undefined>(undefined);
  const [sort, setSort] = useState<SortKey>("recency");

  useEffect(() => {
    let cancelled = false;
    setState({ status: "loading" });
    const token = getIdToken();
    if (token === null) {
      setState({ status: "error", error: new ApiError(401) });
      return;
    }
    api.myProperties(token).then(
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
  }, [reloadKey]);

  const items = state.status === "ready" ? state.data : [];
  const filters: Filters = { status, propertyType, area, query };
  const visible = useMemo(
    () => sortItems(applyFilters(items, filters), sort),
    [items, status, propertyType, area, query, sort],
  );

  if (state.status === "loading") {
    return <Spinner label="Loading your listings…" />;
  }
  if (state.status === "error") {
    const code = state.error instanceof ApiError ? state.error.status : undefined;
    return <ErrorView status={code} onRetry={() => setReloadKey((k) => k + 1)} />;
  }

  return (
    <div class="screen">
      <header class="app-header">
        <h1>Listings</h1>
        <span class="muted small">{items.length}</span>
      </header>

      <input
        class="search"
        type="search"
        inputMode="search"
        placeholder="Search road, area, project…"
        value={query}
        onInput={(e) => setQuery((e.target as HTMLInputElement).value)}
      />

      <ChipRow values={distinctValues(items, "status")} active={status} onPick={setStatus} />
      <ChipRow
        values={distinctValues(items, "propertyType")}
        active={propertyType}
        onPick={setPropertyType}
      />
      <ChipRow values={distinctValues(items, "area")} active={area} onPick={setArea} />

      <div class="sort-row">
        <label class="muted small" for="sort">
          Sort
        </label>
        <select
          id="sort"
          class="sort"
          value={sort}
          onChange={(e) => setSort((e.target as HTMLSelectElement).value as SortKey)}
        >
          <option value="recency">Most recent</option>
          <option value="price-asc">Price ↑</option>
          <option value="price-desc">Price ↓</option>
        </select>
      </div>

      {visible.length === 0 ? (
        <p class="center muted">No listings match.</p>
      ) : (
        <ul class="cards">
          {visible.map((item) => (
            <li key={item.propertyId}>
              <button
                type="button"
                class="card"
                onClick={() => navigate(detailPath(item.propertyId))}
              >
                {item.heroUrl !== undefined ? (
                  <img class="card-hero" src={item.heroUrl} alt={item.title} loading="lazy" />
                ) : (
                  <div class="card-hero card-hero-empty" aria-hidden="true" />
                )}
                <div class="card-body">
                  <div class="card-title">{item.title}</div>
                  <Badge text={item.statusBadge} />
                  {item.price !== undefined ? <div class="card-price">{item.price}</div> : null}
                  {item.area !== undefined ? <div class="muted small">{item.area}</div> : null}
                  {item.propertyType !== undefined ? (
                    <div class="muted small">{item.propertyType}</div>
                  ) : null}
                </div>
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

/** A horizontal row of single-select toggle chips; tapping the active chip clears it. Renders
 * nothing when there are fewer than two distinct values (a one-value filter never narrows). */
function ChipRow({
  values,
  active,
  onPick,
}: {
  values: string[];
  active: string | undefined;
  onPick: (value: string | undefined) => void;
}) {
  if (values.length < 2) {
    return null;
  }
  return (
    <div class="chips">
      {values.map((value) => (
        <button
          key={value}
          type="button"
          class={value === active ? "chip chip-active" : "chip"}
          onClick={() => onPick(value === active ? undefined : value)}
        >
          {value}
        </button>
      ))}
    </div>
  );
}
