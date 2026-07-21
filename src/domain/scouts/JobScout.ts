import { BaseScout } from "./BaseScout";
import { RawSignal } from "../types/signal";

export class JobScout extends BaseScout {
  id = "job_scout";
  name = "Job Scout";
  categories = ["job"];

  async collect(): Promise<RawSignal[]> {
    return [
      this.makeSignal({
        opportunityKey: "emergency-vehicle-upfit-tech-ii",
        type: "revenue_potential",
        value: 74,
        evidence: "Posted rate $4-7/hr above trailing 12-month market median for comparable roles in region",
        sourceConfidence: 90,
      }),
      this.makeSignal({
        opportunityKey: "emergency-vehicle-upfit-tech-ii",
        type: "verification_confidence",
        value: 92,
        evidence: "Listed directly on employer's careers page, cross-posted to Indeed 1 day ago",
        sourceConfidence: 92,
      }),
    ];
  }
}
