# CLAUDE.md — Anthropic adapter

## ⚠️ STOP — strict structured output caps the schema at 16 union (nullable) parameters

`claudeExtractor.ts` builds a Zod schema and passes it to `messages.parse` via
`output_config.format` (`zodOutputFormat`). Anthropic **strict structured output** allows at most
**16 parameters with union types** in the ENTIRE schema (nested objects included). Every
`.nullable()`, `.optional()`, or `anyOf` field counts as one.

**If you exceed 16, EVERY extraction call fails with a hard `400 invalid_request_error`:**

```
Schemas contains too many parameters with union types (N parameters with type arrays or anyOf).
This causes exponential compilation cost. Reduce the number of nullable or union-typed
parameters (limit: 16 parameters with unions).
```

**Our unit/integration tests use a FAKE extractor, so this 400 only appears in production.** It
already took down extraction once (plan 12: 11 new `.nullable()` fields → 27 nullables → total
outage; root-caused in `plans/13-chanote-ocr-and-image-pipeline.md`).

### Rules

1. **Budget = 16 unions, total, across the whole schema.** Count before you add a field.
2. **Default to required-with-sentinel, not nullable.** Strict mode already requires every key to be
   present, so you don't need `.nullable()` for determinism:
   - text → `z.string()`, with `""` meaning "not stated"
   - lists → `z.array(z.string())`, with `[]` meaning "none"
   - **Keep the prompt in sync with the sentinel:** instruct the model `else ""` / `else []`, never
     `else null`. A prompt that says "null" while the schema is `z.string()` tells the model to emit a
     value strict mode rejects (this drift was a real, shipped mismatch — see `buildExtractionContent`).
3. **Spend nullables only on numbers** (no clean empty sentinel): lat, long, askingPrice, rentPrice,
   bedrooms, bathrooms, usableAreaSqm, floors ≈ the whole budget.
4. **Adding a group of fields?** Put them in **one nullable nested object** (1 union for the group),
   with the inner fields required — not N nullable scalars.
5. Keep the **schema-size regression test** green (it serialises the output schema and asserts the
   union count ≤ 16). If you must raise the budget, you can't — it's an Anthropic platform limit;
   restructure instead.
6. Mirror any change to this rule in the top-level `CLAUDE.md`.
