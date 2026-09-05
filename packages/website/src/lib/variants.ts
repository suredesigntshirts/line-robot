/**
 * UI template variants — pick an alternative template for a page via the URL, sticky across
 * navigation, for A/B tests and design-phase comparison.
 *
 *   ?ui=b               → variant "b" on every page that has one (others fall back to their default)
 *   ?ui=browse:b        → variant "b" on the browse page only
 *   ?ui=browse:b,home:c → several page-scoped picks, comma-separated
 *   ?ui=reset           → forget the choice
 *
 * The middleware persists the raw spec in the `ui` cookie so plain links keep the variant; each page
 * resolves its own template with `variantFor(page, spec)`. Unknown values fall back to the default.
 * Registry below = the single list of what exists (also what the preview chip offers).
 */
export const UI_VARIANTS = {
  browse: {
    a: "Sidebar filters (default)",
    b: "Quick-filter rail + filter sheet",
    c: "Toolbar with native selects",
  },
} as const;

export type UiPage = keyof typeof UI_VARIANTS;
export type UiVariant<P extends UiPage> = keyof (typeof UI_VARIANTS)[P] & string;

export const UI_COOKIE = "ui";
export const UI_PARAM = "ui";

export interface UiSpec {
  /** Site-wide pick ("b"). */
  global?: string;
  /** Page-scoped picks ("browse" → "b"). */
  pages: Record<string, string>;
}

const TOKEN = /^[a-z0-9_-]{1,24}$/i;

/** Parse "b" | "browse:b,home:c" → spec. Junk tokens are dropped; "" / "reset" → empty spec. */
export function parseUiSpec(raw: string | null | undefined): UiSpec {
  const spec: UiSpec = { pages: {} };
  const text = (raw ?? "").trim();
  if (text === "" || text === "reset") return spec;
  for (const part of text.split(",")) {
    const [left, right] = part.split(":").map((s) => s.trim());
    if (right !== undefined) {
      if (TOKEN.test(left) && TOKEN.test(right))
        spec.pages[left.toLowerCase()] = right.toLowerCase();
    } else if (TOKEN.test(left)) {
      spec.global = left.toLowerCase();
    }
  }
  return spec;
}

/** Serialise back to the cookie form ("" when nothing is set). */
export function serializeUiSpec(spec: UiSpec): string {
  const parts = Object.entries(spec.pages).map(([p, v]) => `${p}:${v}`);
  if (spec.global) parts.unshift(spec.global);
  return parts.join(",");
}

export const isEmptySpec = (spec: UiSpec): boolean =>
  !spec.global && Object.keys(spec.pages).length === 0;

/** The variant a page should render: page-scoped pick → global pick → the page's default ("a"). */
export function variantFor<P extends UiPage>(page: P, spec: UiSpec): UiVariant<P> {
  const known = UI_VARIANTS[page] as Record<string, string>;
  const pick = spec.pages[page] ?? spec.global;
  return (pick && pick in known ? pick : "a") as UiVariant<P>;
}
