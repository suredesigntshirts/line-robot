import process from "node:process";
import { evalConfig } from "../../eval.config.ts";
import { loadCases } from "./cases.ts";
import { emptyScorecard, renderScorecard } from "./scorecard.ts";

const cases = loadCases();
const card = emptyScorecard();
card.caseCount = cases.length;
// The scoring loop lands in Stage 2 alongside the real pipeline; with zero cases there is nothing to run.

console.log(renderScorecard(card, evalConfig));
process.exit(0); // D21: advisory — never a failing exit, even on regression.
