// ---------------------------------------------------------------------------
// DF-6 quality-gate contract (stage-2 D2.8/DF-6): the pipeline's gate step
// emits this; packages/bot owns the conversation that iterates it to pass.
// Pipeline returns data; bot renders — no LINE types may appear here.
// ---------------------------------------------------------------------------

export interface WeakField {
  field: string;
  severity: "required" | "important";
  /** i18n key the bot uses to phrase the ask (one concise ask at a time). */
  promptKey: string;
}

export interface Blocker {
  /** Hard FIELD-03 reason, e.g. "deed_not_transferable". */
  reason: string;
  /** i18n key explaining why publish is stopped. */
  promptKey: string;
}

export interface GateResult {
  pass: boolean;
  missing: WeakField[];
  blockers: Blocker[];
}
