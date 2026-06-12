// LIVE Message Batches acceptance (B2 item): the batch transport's submit → poll →
// collect path against the real API, with the exact step requests the sweep would
// queue. Verifies strict-structured-output acceptance inside a batch, schema
// round-trip, and the 50%-priced cost accounting. Run: node test/live/batchAcceptance.mjs
// (loads the repo .env). Small batches usually end in minutes; this polls every 15s
// and gives up after 45 min with the batch id printed for a later collect.

import assert from "node:assert/strict";
import process from "node:process";

process.loadEnvFile(new URL("../../../../.env", import.meta.url).pathname);
const { default: Anthropic } = await import("@anthropic-ai/sdk");
const { submitBatch } = await import("../../src/batch/build.ts");
const { collectBatch } = await import("../../src/batch/collect.ts");
const { CostLog } = await import("../../src/cost.ts");
const { SEGMENT_SYSTEM, EXTRACT_SYSTEM } = await import("../../src/steps/prompts.ts");
const { segmentSchema, extractSchema } = await import("../../src/steps/schemas.ts");
const { STEP_MODELS } = await import("../../src/steps/context.ts");
const { specCatalog } = await import("../../src/synthetic/catalog.ts");
const { MESSY_GROUP_CHAT } = await import("../../src/synthetic/chaosProfile.ts");
const { generateCase } = await import("../../src/synthetic/generator.ts");

const specs = specCatalog(24).slice(4, 6);
const messy = generateCase(specs, { ...MESSY_GROUP_CHAT, seed: 4242 });

const entries = [
  {
    customId: "segment-0",
    request: {
      step: "segment",
      model: STEP_MODELS.segment,
      system: SEGMENT_SYSTEM,
      content: [
        {
          type: "text",
          text: `TRANSCRIPT:\n${messy.transcript}\n\nPHOTO MARKERS:\n(none)\n\nGEO HINTS: (none)\n\nEXISTING CANDIDATES:\n(none)`,
        },
      ],
      schema: segmentSchema,
      maxOutputTokens: 2048,
    },
  },
  ...specs.map((spec, i) => ({
    customId: `extract-${i}`,
    request: {
      step: "extract",
      model: STEP_MODELS.extract,
      system: EXTRACT_SYSTEM,
      content: [
        {
          type: "text",
          text: `TRANSCRIPT:\n${messy.transcript}\n\nFOCUS ON THE PROPERTY: ${spec.landmark}\n\nGEO HINTS: (none)\n\nEXISTING CANDIDATES:\n(none)`,
        },
      ],
      schema: extractSchema,
      maxOutputTokens: 4096,
    },
  })),
];

const client = new Anthropic();
const costLog = new CostLog();
const started = Date.now();
const batchId = await submitBatch(client, entries);
console.log(`batch submitted: ${batchId} (${entries.length} entries)`);

const deadline = setTimeout(
  () => {
    console.error(`TIMEOUT after 45 min — batch ${batchId} still processing; collect later with`);
    console.error(`  client.messages.batches.retrieve("${batchId}")`);
    process.exit(2);
  },
  45 * 60 * 1000,
);

const { responses } = await collectBatch(client, batchId, entries, costLog, 15_000);
clearTimeout(deadline);

let pass = 0;
const check = (name, cond) => {
  assert.ok(cond, name);
  pass += 1;
  console.log(`PASS  ${name}`);
};

const seg = responses.get("segment-0");
check("segment entry parsed against its zod schema", seg?.value !== null);
check(
  "segment found both properties",
  Array.isArray(seg.value.segments) && seg.value.segments.length === specs.length,
);
for (let i = 0; i < specs.length; i++) {
  const ex = responses.get(`extract-${i}`);
  check(`extract-${i} parsed`, ex?.value !== null);
  check(`extract-${i} carries a price`, typeof ex.value.priceThb === "number");
}
check(
  "usage recorded for every entry",
  [...responses.values()].every((r) => r.usage.inputTokens > 0),
);
const total = costLog.totalUsd();
check("batch-priced cost recorded (> $0)", total > 0);
// Same usage at sync pricing must cost exactly 2× the batch-priced log.
const syncLog = new CostLog();
for (const [id, r] of responses) {
  const entry = entries.find((e) => e.customId === id);
  syncLog.record(entry.request.step, entry.request.model, r.usage, "sync");
}
check("batch price is exactly half of sync", Math.abs(syncLog.totalUsd() - total * 2) < 1e-9);

const minutes = ((Date.now() - started) / 60_000).toFixed(1);
console.log(
  `ALL ${pass} BATCH ACCEPTANCE CHECKS PASSED — ${minutes} min, $${total.toFixed(4)} (batch-priced)`,
);
