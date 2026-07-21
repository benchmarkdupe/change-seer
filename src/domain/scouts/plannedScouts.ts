import { BaseScout } from "./BaseScout";
import { RawSignal } from "../types/signal";

/**
 * These are intentionally unimplemented. They exist to prove the pattern:
 * adding a new source is "write a collect() method", full stop — no
 * changes to ScoringEngine, no changes to the UI, no changes to any other
 * scout. Wire one up by giving it a real collect() and registering it in
 * scouts/index.ts.
 */

export class TikTokScout extends BaseScout {
  id = "tiktok_scout";
  name = "TikTok Scout";
  categories = ["trend", "income"];
  async collect(): Promise<RawSignal[]> {
    // TODO: TikTok Creative Center / hashtag velocity API
    return [];
  }
}

export class YouTubeScout extends BaseScout {
  id = "youtube_scout";
  name = "YouTube Scout";
  categories = ["trend", "income"];
  async collect(): Promise<RawSignal[]> {
    // TODO: YouTube Data API — video velocity + comment growth on niche topics
    return [];
  }
}

export class NewsScout extends BaseScout {
  id = "news_scout";
  name = "News Scout";
  categories = ["business", "investment", "trend"];
  async collect(): Promise<RawSignal[]> {
    // TODO: news API + NLP sentiment/topic extraction
    return [];
  }
}

export class StockScout extends BaseScout {
  id = "stock_scout";
  name = "Stock Scout";
  categories = ["investment"];
  async collect(): Promise<RawSignal[]> {
    // TODO: market data feed — volatility, volume, options flow
    return [];
  }
}
