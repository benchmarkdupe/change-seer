import { Scout } from "./BaseScout";
import { RedditScout } from "./RedditScout";
import { GoogleTrendScout } from "./GoogleTrendScout";
import { BusinessScout } from "./BusinessScout";
import { MarketplaceScout } from "./MarketplaceScout";
import { JobScout } from "./JobScout";
import { TikTokScout, YouTubeScout, NewsScout, StockScout } from "./plannedScouts";
import { RawSignal } from "../types/signal";

/**
 * The registry is the single place new scouts get wired in. Everything
 * upstream (ScoringEngine) and downstream (UI) is agnostic to this list's
 * contents — growing it from 5 scouts to 50 never touches those layers.
 */
export const SCOUT_REGISTRY: Scout[] = [
  new RedditScout(),
  new GoogleTrendScout(),
  new BusinessScout(),
  new MarketplaceScout(),
  new JobScout(),
  new TikTokScout(),
  new YouTubeScout(),
  new NewsScout(),
  new StockScout(),
];

/**
 * Orchestrator: runs every scout concurrently, isolates failures so one
 * broken source never takes down collection, and returns a flat signal
 * pool keyed by opportunity for the ScoringEngine to consume.
 *
 * In production this becomes a scheduled job (queue-driven, one task per
 * scout run) rather than a synchronous fan-out — noted in ARCHITECTURE.md.
 */
export async function runAllScouts(): Promise<RawSignal[]> {
  const results = await Promise.allSettled(SCOUT_REGISTRY.map((s) => s.collect()));

  const signals: RawSignal[] = [];
  results.forEach((result, i) => {
    if (result.status === "fulfilled") {
      signals.push(...result.value);
    } else {
      // A scout going down degrades confidence for affected opportunities,
      // it never crashes the pipeline. Real version: structured log + alert.
      console.warn(`Scout ${SCOUT_REGISTRY[i].id} failed:`, result.reason);
    }
  });
  return signals;
}

export function groupSignalsByOpportunity(
  signals: RawSignal[]
): Record<string, RawSignal[]> {
  return signals.reduce<Record<string, RawSignal[]>>((acc, s) => {
    (acc[s.opportunityKey] ??= []).push(s);
    return acc;
  }, {});
}
