import type Anthropic from "@anthropic-ai/sdk";
import { describe, expect, it } from "vitest";
import { CostLog } from "../cost.ts";
import { translateSchema } from "../steps/schemas.ts";
import { type BatchEntry, submitBatch, toBatchRequest } from "./build.ts";
import { collectBatch } from "./collect.ts";

const ENTRY: BatchEntry = {
  customId: "case-1:translate",
  request: {
    step: "translate",
    model: "claude-haiku-4-5",
    system: "translate things",
    content: [{ type: "text", text: "TITLE: บ้าน" }],
    schema: translateSchema,
    maxOutputTokens: 1024,
  },
};

function fakeClient(overrides: {
  retrieveStatuses?: string[];
  results?: Array<{ custom_id: string; result: unknown }>;
}) {
  const created: unknown[] = [];
  const statuses = overrides.retrieveStatuses ?? ["ended"];
  let retrieveCalls = 0;
  const client = {
    messages: {
      batches: {
        create: (params: unknown) => {
          created.push(params);
          return Promise.resolve({ id: "batch_1", processing_status: "in_progress" });
        },
        retrieve: () => {
          const status = statuses[Math.min(retrieveCalls, statuses.length - 1)];
          retrieveCalls += 1;
          return Promise.resolve({ id: "batch_1", processing_status: status });
        },
        results: () => {
          async function* iterate() {
            for (const r of overrides.results ?? []) yield r;
          }
          return Promise.resolve(iterate());
        },
      },
    },
  } as unknown as Anthropic;
  return { client, created, retrieveCalls: () => retrieveCalls };
}

const SUCCEEDED = {
  custom_id: "case-1:translate",
  result: {
    type: "succeeded",
    message: {
      content: [
        { type: "text", text: JSON.stringify({ title: "House", description: "", notes: "" }) },
      ],
      usage: { input_tokens: 1200, output_tokens: 300, cache_read_input_tokens: 4096 },
    },
  },
};

describe("toBatchRequest (one code path, two transports)", () => {
  it("serializes the same fields the sync adapter sends", () => {
    const request = toBatchRequest(ENTRY);
    expect(request.custom_id).toBe("case-1:translate");
    expect(request.params).toMatchObject({
      model: "claude-haiku-4-5",
      max_tokens: 1024,
      system: [{ type: "text", text: "translate things", cache_control: { type: "ephemeral" } }],
    });
    expect(request.params.output_config?.format).toBeDefined();
  });
});

describe("submitBatch + collectBatch", () => {
  it("submits, polls to ended, parses through the entry schema, and logs batch pricing", async () => {
    const { client, retrieveCalls } = fakeClient({
      retrieveStatuses: ["in_progress", "ended"],
      results: [SUCCEEDED],
    });
    const costLog = new CostLog();
    const batchId = await submitBatch(client, [ENTRY]);
    const collected = await collectBatch(client, batchId, [ENTRY], costLog, 1, () =>
      Promise.resolve(),
    );

    expect(retrieveCalls()).toBe(2);
    expect(collected.responses.get("case-1:translate")?.value).toMatchObject({ title: "House" });
    const entry = costLog.all()[0];
    expect(entry?.mode).toBe("batch");
    // 50% of sync pricing (D2.3): haiku 1200in/300out/4096cache halved.
    expect(entry?.estCostUsd).toBeCloseTo((1200 * 1 + 300 * 5 + 4096 * 0.1) / 1_000_000 / 2, 10);
    expect(costLog.sawCacheHit()).toBe(true);
  });

  it("errored and missing entries become value:null with zero-cost rows (step fallbacks apply)", async () => {
    const errored = {
      custom_id: "case-1:translate",
      result: { type: "errored", error: { type: "invalid_request" } },
    };
    const ghost: BatchEntry = { ...ENTRY, customId: "case-2:translate" };
    const { client } = fakeClient({ results: [errored] });
    const costLog = new CostLog();
    const collected = await collectBatch(client, "batch_1", [ENTRY, ghost], costLog, 1, () =>
      Promise.resolve(),
    );
    expect(collected.responses.get("case-1:translate")?.value).toBeNull();
    expect(collected.responses.get("case-2:translate")?.value).toBeNull();
    expect(costLog.all()).toHaveLength(2);
  });

  it("rejects malformed JSON through the schema rather than crashing", async () => {
    const malformed = {
      custom_id: "case-1:translate",
      result: {
        type: "succeeded",
        message: {
          content: [{ type: "text", text: "{not json" }],
          usage: { input_tokens: 10, output_tokens: 5, cache_read_input_tokens: 0 },
        },
      },
    };
    const { client } = fakeClient({ results: [malformed] });
    const collected = await collectBatch(client, "batch_1", [ENTRY], new CostLog(), 1, () =>
      Promise.resolve(),
    );
    expect(collected.responses.get("case-1:translate")?.value).toBeNull();
  });
});
