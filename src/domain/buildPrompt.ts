import type { Category, Opportunity } from "./types/opportunity";

const CATEGORY_LABEL: Record<Category, string> = {
  business: "Business",
  product: "Product",
  job: "Job",
  investment: "Investment",
  trend: "Trend",
  income: "Online Income",
};

function formatMoney(n: number): string {
  if (n === 0) return "$0";
  if (n >= 1000) return `$${(Math.round(n / 100) / 10).toString().replace(/\.0$/, "")}k`;
  return `$${n}`;
}

function formatRange(range: { min: number; max: number }): string {
  if (range.min === 0 && range.max === 0) return "None";
  if (range.min === range.max) return formatMoney(range.min);
  return `${formatMoney(range.min)} – ${formatMoney(range.max)}`;
}

/**
 * Turns an Opportunity into a single copy-pasteable brief for an AI coding
 * agent (Claude Code, Cursor, ChatGPT, etc.) to actually build and automate
 * the business it describes. Pure function of the Opportunity — every
 * opportunity already carries the evidence, scoring, and AI narrative this
 * draws from, so no extra fetch is needed to generate it.
 *
 * This is a starting brief, not a guarantee: it's built from the same
 * evidence shown on the page, with the same "sample vs live" honesty
 * caveat carried through explicitly so the agent (and the person prompting
 * it) knows how much to trust the premise before acting on it.
 */
export function generateBuildPrompt(opp: Opportunity, isSample: boolean): string {
  const cat = CATEGORY_LABEL[opp.category];
  const evidence =
    opp.aiDetail.publicEvidence.map((e) => `- ${e.label}`).join("\n") ||
    "- (no evidence recorded yet)";
  const risks = opp.aiDetail.risks.map((r) => `- ${r}`).join("\n");
  const steps = opp.aiDetail.howToBegin.map((s, i) => `${i + 1}. ${s}`).join("\n");

  return `You are helping me build and, as much as possible, automate a real business based on the opportunity below. Be concrete: propose an actual MVP scope, then build it — code, content, or automation scripts as appropriate — rather than only describing a plan.

## The opportunity
**${opp.title}** (${cat}${opp.region ? `, ${opp.region}` : ""})

${opp.summary}

${isSample ? "NOTE: this opportunity is SAMPLE/seed data used to demonstrate the app, not a real live signal — validate demand yourself before investing real time or money.\n\n" : ""}Signal score: ${opp.score.signalScore}/100 (${opp.score.rating.replace("_", " ")}), confidence ${opp.score.confidence}/100.
Why this looks worth building: ${opp.aiDetail.whyGrowing}
Who's already succeeding at it: ${opp.aiDetail.whoIsSucceeding}

## Constraints to design around
- Startup capital: ${formatRange(opp.estimatedStartupCost)} — ${opp.aiDetail.recommendedCapital}
- Time commitment: ${opp.estimatedTimeCommitment}
- Difficulty: ${opp.estimatedDifficulty.replace("_", " ")} — ${opp.aiDetail.difficultyExplanation}
- Target monthly potential: ${formatRange(opp.estimatedMonthlyPotential)}
- Time to profitability: ${opp.aiDetail.timeToProfitability}

## Risks to design around, not ignore
${risks}

## Evidence this is based on
${evidence}

## A reasonable starting sequence
${steps}

## What I want from you
1. Propose the smallest automatable MVP that tests this opportunity's core demand assumption within a week.
2. Identify exactly which parts of running this business can be automated end-to-end (content generation, fulfillment, customer response, marketing, etc.) versus which genuinely need a human, and design the MVP so the automatable parts are automated from day one.
3. Build the first automatable piece now — a working script, a site, a content pipeline, whatever the MVP needs — rather than just describing it.
4. Flag anywhere you're relying on an assumption from the evidence above that you haven't independently verified.`;
}
