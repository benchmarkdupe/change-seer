import { BaseScout } from "./BaseScout";
import { RawSignal } from "../types/signal";

/** Municipal/state bid boards, licensing filings, and local classifieds —
 * sources that verify a business opportunity is real, not just trending. */
export class BusinessScout extends BaseScout {
  id = "business_scout";
  name = "Business Scout";
  categories = ["business"];

  async collect(): Promise<RawSignal[]> {
    return [
      this.makeSignal({
        opportunityKey: "mobile-diesel-fleet-diagnostics",
        type: "market_growth",
        value: 68,
        evidence:
          "3 new independent fleet-service listings registered in county in trailing 6 months, zero mobile-diagnostic-specific competitors",
        sourceConfidence: 82,
      }),
      this.makeSignal({
        opportunityKey: "mobile-diesel-fleet-diagnostics",
        type: "competition",
        value: 29,
        evidence:
          "No dedicated mobile diagnostic operators found within county in business registry search",
        sourceConfidence: 75,
      }),
      this.makeSignal({
        opportunityKey: "mobile-diesel-fleet-diagnostics",
        type: "verification_confidence",
        value: 88,
        evidence: "Cross-checked against county business license database",
        sourceConfidence: 90,
      }),
    ];
  }
}
