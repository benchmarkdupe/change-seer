import { BaseScout } from "./BaseScout";
import { RawSignal } from "../types/signal";

export class GoogleTrendScout extends BaseScout {
  id = "google_trend_scout";
  name = "Google Trend Scout";
  categories = ["trend", "product", "income", "business"];

  async collect(): Promise<RawSignal[]> {
    return [
      this.makeSignal({
        opportunityKey: "offroad-lighting-dropship",
        type: "search_growth",
        value: 79,
        evidence: "'LED light bar off-road' search interest +42% over trailing 90 days (US)",
        sourceConfidence: 85,
      }),
      this.makeSignal({
        opportunityKey: "obs-bronco-restoration-demand",
        type: "search_growth",
        value: 71,
        evidence: "'OBS Bronco parts' search interest steadily climbing since Q1",
        sourceConfidence: 85,
      }),
      this.makeSignal({
        opportunityKey: "mobile-diesel-fleet-diagnostics",
        type: "search_growth",
        value: 58,
        evidence: "'mobile diesel diagnostic near me' regional search volume up modestly",
        sourceConfidence: 80,
      }),
    ];
  }
}
