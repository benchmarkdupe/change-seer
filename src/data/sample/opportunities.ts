/**
 * Sample opportunity dataset.
 *
 * Uses the real scout registry + scoring engine — the pipeline the
 * production version will use — but every scout currently returns
 * synthesized data. That's why every card ships with a `SAMPLE` badge.
 *
 * Replacing this file with a real backend fetch (or a TanStack Query
 * loader against a persistence layer) is the only change needed once
 * real scouts are wired in. The UI never needs to change.
 */
import { runAllScouts, groupSignalsByOpportunity } from "@/domain/scouts";
import { ScoringEngine } from "@/domain/scoring/ScoringEngine";
import type { Opportunity, Category, Difficulty } from "@/domain/types/opportunity";
import type { DataState } from "@/domain/dataState";

interface OpportunitySeed {
  key: string;
  title: string;
  category: Category;
  region: string;
  detectedAt: string;
  verification: "verified" | "pending" | "unverified";
  estimatedStartupCost: { min: number; max: number };
  estimatedTimeCommitment: string;
  estimatedDifficulty: Difficulty;
  estimatedMonthlyPotential: { min: number; max: number };
  summary: string;
  aiDetail: Opportunity["aiDetail"];
}

const SEEDS: OpportunitySeed[] = [
  {
    key: "mobile-diesel-fleet-diagnostics",
    title: "Mobile Diesel Fleet Diagnostics",
    category: "business",
    region: "South Jersey",
    detectedAt: "2026-07-15",
    verification: "verified",
    estimatedStartupCost: { min: 8000, max: 22000 },
    estimatedTimeCommitment: "Full-time (30-40 hrs/wk)",
    estimatedDifficulty: "moderate",
    estimatedMonthlyPotential: { min: 4500, max: 11000 },
    summary:
      "Independent fleet operators in rural South Jersey counties have no dedicated mobile diagnostic option, forcing costly downtime shipping vehicles to dealer service centers.",
    aiDetail: {
      whyGrowing:
        "Fleet operators are replacing older, easier-to-diagnose trucks with ECU-heavy models that small in-house shops can't service, pushing demand toward specialized mobile diagnostic capability.",
      whoIsSucceeding:
        "Solo operators with a diagnostic laptop rig and a service van in adjacent counties report full weekly schedules within 4-6 months of launch.",
      risks: [
        "Diagnostic tool/subscription costs rise with new vehicle model years",
        "Seasonal demand dip in harsh winter months",
        "Single-operator capacity ceiling limits scaling without hiring",
      ],
      recommendedCapital:
        "$10,000-$15,000 covers a reliable van, core diagnostic hardware, and 3 months of operating buffer.",
      difficultyExplanation:
        "Moderate: requires existing diagnostic competency plus business setup — insurance, service van outfitting, invoicing.",
      howToBegin: [
        "Register business entity and secure commercial auto insurance",
        "Outfit a van with core OEM diagnostic tools for the 2-3 most common fleet makes locally",
        "Reach out directly to independent fleet operators identified in county registry",
      ],
      timeToProfitability:
        "Typically 2-4 months to break even on setup costs given existing technical skill.",
      publicEvidence: [
        {
          label: "County business registry: 0 dedicated mobile diagnostic operators found",
          sourceScoutId: "business_scout",
        },
        {
          label: "Search interest for 'mobile diesel diagnostic near me' trending up regionally",
          sourceScoutId: "google_trend_scout",
        },
      ],
    },
  },
  {
    key: "obs-bronco-restoration-demand",
    title: "OBS Ford Bronco Restoration Demand",
    category: "trend",
    region: "National",
    detectedAt: "2026-07-12",
    verification: "verified",
    estimatedStartupCost: { min: 3000, max: 15000 },
    estimatedTimeCommitment: "Variable — project-based",
    estimatedDifficulty: "high",
    estimatedMonthlyPotential: { min: 800, max: 6000 },
    summary:
      "Sold prices on clean 1992-1996 Broncos are climbing faster than comparable OBS-era Ford trucks, with restoration-ready sellers scarce relative to buyer demand.",
    aiDetail: {
      whyGrowing:
        "Nostalgia-driven collector demand is broadening from F-series OBS trucks into Broncos specifically, while the eligible unrestored supply shrinks each year.",
      whoIsSucceeding:
        "Sellers who source rust-free Southern/Southwestern donor trucks and do mechanical-only (non-cosmetic) restorations are seeing the fastest turn times on BaT.",
      risks: [
        "Restoration costs can balloon past resale value on rougher starting vehicles",
        "Parts availability for trim/interior pieces is a real bottleneck",
        "Collector market sentiment can cool with broader economic conditions",
      ],
      recommendedCapital:
        "$5,000-$8,000 per project vehicle is a reasonable entry point for a mechanically-sound donor truck plus core restoration work.",
      difficultyExplanation:
        "High: requires both mechanical skill and body/trim sourcing knowledge; margin depends heavily on buying the right starting vehicle.",
      howToBegin: [
        "Source a rust-free, mechanically complete donor Bronco (avoid rough cosmetic projects for the first build)",
        "Track BaT/Facebook Marketplace sold comps weekly to calibrate target sale price before starting work",
        "Budget a hard ceiling on restoration spend before purchase, not after",
      ],
      timeToProfitability:
        "First flip typically 3-6 months depending on parts sourcing; ongoing cadence depends on garage capacity.",
      publicEvidence: [
        {
          label: "BaT sold prices on 1992-96 Broncos up ~18% YoY",
          sourceScoutId: "marketplace_scout",
        },
        { label: "r/Bronco OBS-specific post volume up ~30% QoQ", sourceScoutId: "reddit_scout" },
        {
          label: "'OBS Bronco parts' search interest climbing since Q1",
          sourceScoutId: "google_trend_scout",
        },
      ],
    },
  },
  {
    key: "offroad-lighting-dropship",
    title: "Off-Road Lighting Accessories — Focused Storefront",
    category: "income",
    region: "National",
    detectedAt: "2026-07-19",
    verification: "pending",
    estimatedStartupCost: { min: 500, max: 2500 },
    estimatedTimeCommitment: "10-15 hrs/wk",
    estimatedDifficulty: "low",
    estimatedMonthlyPotential: { min: 300, max: 3500 },
    summary:
      "Search interest for LED off-road lighting is rising faster than paid-ad supplier saturation, suggesting room for a focused storefront before competition catches up.",
    aiDetail: {
      whyGrowing:
        "Broader off-road/overlanding culture growth is pulling accessory demand up faster than the niche-specific supplier base is expanding.",
      whoIsSucceeding:
        "Stores that pick one sub-niche (e.g. Jeep-specific or truck-specific light pods) rather than general off-road accessories see better ad conversion.",
      risks: [
        "Verification pending — this signal hasn't been cross-corroborated by a second source yet",
        "Dropship margins are thin and highly sensitive to ad costs",
        "Low differentiation risk if supplier is used by many other stores",
      ],
      recommendedCapital:
        "$1,000-$1,500 covers store setup, initial ad testing budget, and a small sample-order buffer.",
      difficultyExplanation:
        "Low technical barrier, but success depends heavily on ad execution and niche selection — treat as a marketing problem, not a product problem.",
      howToBegin: [
        "Validate supplier reliability and shipping times before committing ad spend",
        "Pick one vehicle platform niche rather than general off-road",
        "Run a small $200-300 ad test before scaling budget",
      ],
      timeToProfitability:
        "High variance — some stores profitable within weeks, many never reach it; this is the riskiest opportunity in this scan.",
      publicEvidence: [
        {
          label: "'LED light bar off-road' search interest +42% trailing 90 days",
          sourceScoutId: "google_trend_scout",
        },
      ],
    },
  },
  {
    key: "emergency-vehicle-upfit-tech-ii",
    title: "Emergency Vehicle Upfit Technician II",
    category: "job",
    region: "Vineland, NJ",
    detectedAt: "2026-07-19",
    verification: "verified",
    estimatedStartupCost: { min: 0, max: 0 },
    estimatedTimeCommitment: "Full-time",
    estimatedDifficulty: "moderate",
    estimatedMonthlyPotential: { min: 4800, max: 6200 },
    summary:
      "Senior upfit role paying $4-7/hr above regional market rate, requiring wiring and fabrication skill directly aligned with existing experience.",
    aiDetail: {
      whyGrowing:
        "Regional EMS and municipal fleet expansion is driving direct hiring demand for experienced upfit technicians faster than the local labor pool is growing.",
      whoIsSucceeding:
        "Candidates with documented wiring/fabrication portfolio work (not just installation) are clearing this pay band fastest.",
      risks: [
        "Single employer dependency",
        "Rate could reflect a hard-to-fill posting rather than a durable market shift",
      ],
      recommendedCapital: "None — this is direct employment, not a capital opportunity.",
      difficultyExplanation:
        "Moderate: requires demonstrable wiring and fabrication experience beyond basic installation.",
      howToBegin: [
        "Apply directly through employer careers page (cross-posted listing has slower response times)",
        "Bring documented photos/examples of prior fabrication work to interview",
      ],
      timeToProfitability: "N/A — standard employment timeline.",
      publicEvidence: [
        {
          label: "Posted rate $4-7/hr above trailing 12-month regional median",
          sourceScoutId: "job_scout",
        },
      ],
    },
  },
  {
    key: "niche-tool-reselling-snapon",
    title: "Niche Tool Reselling — Snap-on Take-offs",
    category: "income",
    region: "National",
    detectedAt: "2026-07-16",
    verification: "verified",
    estimatedStartupCost: { min: 300, max: 2000 },
    estimatedTimeCommitment: "5-10 hrs/wk",
    estimatedDifficulty: "low",
    estimatedMonthlyPotential: { min: 400, max: 1800 },
    summary:
      "Consistent 25-35% margin flipping used mechanic tools sourced locally and sold nationally, though seller count is rising moderately.",
    aiDetail: {
      whyGrowing:
        "Steady demand from independent mechanics for discounted name-brand tools, sourced from techs upgrading or leaving the trade.",
      whoIsSucceeding:
        "Sellers with an existing trade network for sourcing (rather than buying retail-to-resell) maintain the healthiest margins.",
      risks: [
        "Rising seller count is compressing margins gradually",
        "Authentication/counterfeit concerns require buyer trust-building",
      ],
      recommendedCapital:
        "$500-$1,000 in starting inventory is enough to establish a consistent listing cadence.",
      difficultyExplanation:
        "Low: primarily sourcing relationships and marketplace listing discipline, not technical skill.",
      howToBegin: [
        "Use existing trade contacts to source take-off tools before they hit public marketplaces",
        "Build a consistent listing/photo process to reduce per-item time cost",
      ],
      timeToProfitability:
        "Typically profitable from first sale given low inventory cost; scaling requires consistent sourcing.",
      publicEvidence: [
        {
          label: "eBay sold data: stable 25-35% margin on used Snap-on take-offs",
          sourceScoutId: "marketplace_scout",
        },
      ],
    },
  },
];

/** All sample opportunities carry this state — nothing here is live. */
export const SAMPLE_DATA_STATE: DataState = "sample";

const scoringEngine = new ScoringEngine();

async function buildSampleOpportunities(): Promise<Opportunity[]> {
  const allSignals = await runAllScouts();
  const grouped = groupSignalsByOpportunity(allSignals);

  return SEEDS.map((seed) => {
    const signals = grouped[seed.key] ?? [];
    const score = scoringEngine.score(seed.category, signals);
    const sparkline = Array.from({ length: 10 }, (_, i) =>
      Math.max(5, Math.round(score.signalScore - (9 - i) * (score.momentum / 30))),
    );
    const trend: Opportunity["trend"] =
      score.momentum >= 60 ? "up" : score.momentum <= 40 ? "down" : "flat";
    return {
      id: seed.key,
      title: seed.title,
      category: seed.category,
      region: seed.region,
      detectedAt: seed.detectedAt,
      verification: seed.verification,
      trend,
      sparkline,
      estimatedStartupCost: seed.estimatedStartupCost,
      estimatedTimeCommitment: seed.estimatedTimeCommitment,
      estimatedDifficulty: seed.estimatedDifficulty,
      estimatedMonthlyPotential: seed.estimatedMonthlyPotential,
      summary: seed.summary,
      score,
      aiDetail: seed.aiDetail,
      sourceScoutIds: [...new Set(signals.map((s) => s.scoutId))],
    } satisfies Opportunity;
  });
}

/**
 * Resolved synchronously at module load. Scouts return literal data with
 * no real I/O, so awaiting them at module scope is free. When real scouts
 * are wired in, this module gets replaced with a TanStack Query loader
 * against the persistence layer — no consumer of this module changes.
 */
export const SAMPLE_OPPORTUNITIES: readonly Opportunity[] = await buildSampleOpportunities();

export function getSampleOpportunityById(id: string): Opportunity | undefined {
  return SAMPLE_OPPORTUNITIES.find((o) => o.id === id);
}
