import { BaseScout } from "./BaseScout";
import { RawSignal } from "../types/signal";

/**
 * Reads discussion volume/sentiment trajectory from relevant subreddits.
 * In production this hits Reddit's API per tracked keyword/subreddit set;
 * here it synthesizes plausible signals so the rest of the pipeline
 * (scoring, UI) can be built and tested against a realistic shape.
 */
export class RedditScout extends BaseScout {
  id = "reddit_scout";
  name = "Reddit Scout";
  categories = ["trend", "income", "product"];

  async collect(): Promise<RawSignal[]> {
    return [
      this.makeSignal({
        opportunityKey: "predator-212-parts-bundle",
        type: "community_interest",
        value: 66,
        evidence: "r/gokarts: recurring weekly thread requesting a stage-2 parts bundle, 40+ comments",
        sourceConfidence: 55,
      }),
      this.makeSignal({
        opportunityKey: "obs-bronco-restoration-demand",
        type: "community_interest",
        value: 74,
        evidence: "r/Bronco and r/ClassicBroncos: OBS-specific posts up ~30% quarter over quarter",
        sourceConfidence: 70,
      }),
    ];
  }
}
