/**
 * Sentinel helpers shared by the extraction-result -> domain mappers. The extractor models absent
 * values as sentinels (see {@link ../ports/extraction.ts}) to stay under Anthropic's 16-nullable
 * limit: `""` = absent text, `[]` = absent list, `null` = absent number. These map each sentinel to
 * `undefined` so a set-if-present upsert never clobbers a stored value with an empty one.
 */

/** Absent number (`null`) -> `undefined`. (Numbers have no clean empty sentinel, so the schema keeps
 * them nullable — these are the only fields that stay `null` end-to-end.) */
export function nullToUndef<T>(value: T | null): T | undefined {
  return value === null ? undefined : value;
}

/** Absent text (`""`) -> `undefined`. */
export function emptyToUndef(value: string): string | undefined {
  return value === "" ? undefined : value;
}

/** Absent list (`[]`) -> `undefined`; otherwise a fresh mutable copy. */
export function listToUndef(value: readonly string[]): string[] | undefined {
  return value.length > 0 ? [...value] : undefined;
}
