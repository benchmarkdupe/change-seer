import { RawSignal } from "../types/signal";

/**
 * A Scout's only job is: go look at one source of truth, come back with
 * normalized Signals. It knows nothing about scoring, weighting, or the
 * UI. This is the seam that lets us add BusinessScout, TikTokScout,
 * StockScout, etc. independently — each is a small, isolated, testable
 * unit with one external dependency (an API, a scrape target, a feed).
 *
 * Contract:
 *  - `collect()` is the only required method. It may hit a real API,
 *    scrape a page, or (at this stage) synthesize mock data — the engine
 *    and UI cannot tell the difference, which is the point.
 *  - Scouts must NEVER throw across their collect() boundary in
 *    production; the orchestrator treats a rejected promise as "this
 *    scout is down" and continues with the rest. (Mock scouts here don't
 *    implement retry/backoff — that's a real-integration concern.)
 *  - `categories` declares which Opportunity categories this scout is
 *    relevant to, so the orchestrator can route work and the UI can show
 *    coverage gaps (e.g. "no scout currently covers Jobs in this region").
 */
export interface Scout {
  id: string;
  name: string;
  categories: string[];
  collect(): Promise<RawSignal[]>;
}

export abstract class BaseScout implements Scout {
  abstract id: string;
  abstract name: string;
  abstract categories: string[];
  abstract collect(): Promise<RawSignal[]>;

  protected makeSignal(
    partial: Omit<RawSignal, "scoutId" | "detectedAt"> & { detectedAt?: string }
  ): RawSignal {
    return {
      ...partial,
      scoutId: this.id,
      detectedAt: partial.detectedAt ?? new Date().toISOString(),
    };
  }
}
