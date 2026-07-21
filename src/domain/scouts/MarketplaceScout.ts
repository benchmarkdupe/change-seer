import { BaseScout } from "./BaseScout";
import { RawSignal } from "../types/signal";

/** Sold-listing and pricing data from eBay, Amazon, Bring a Trailer, etc.
 * This is where "marketplace prices increasing" evidence originates. */
export class MarketplaceScout extends BaseScout {
  id = "marketplace_scout";
  name = "Marketplace Scout";
  categories = ["product", "income", "trend"];

  async collect(): Promise<RawSignal[]> {
    return [
      this.makeSignal({
        opportunityKey: "obs-bronco-restoration-demand",
        type: "revenue_potential",
        value: 81,
        evidence: "BaT sold prices on clean 1992-96 Broncos up ~18% YoY, outpacing comparable OBS trucks",
        sourceConfidence: 88,
      }),
      this.makeSignal({
        opportunityKey: "obs-bronco-restoration-demand",
        type: "market_saturation",
        value: 34,
        evidence: "Low count of restoration-ready sellers relative to buyer inquiries in sold listings",
        sourceConfidence: 60,
      }),
      this.makeSignal({
        opportunityKey: "niche-tool-reselling-snapon",
        type: "revenue_potential",
        value: 58,
        evidence: "eBay sold data shows stable 25-35% margin on used Snap-on take-off tools",
        sourceConfidence: 82,
      }),
      this.makeSignal({
        opportunityKey: "niche-tool-reselling-snapon",
        type: "market_saturation",
        value: 55,
        evidence: "Moderate seller count increase in category over trailing 6 months",
        sourceConfidence: 65,
      }),
    ];
  }
}
