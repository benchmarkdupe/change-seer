import { createFileRoute } from "@tanstack/react-router";
import { Wallet } from "lucide-react";
import { StubPage } from "@/components/layout/StubPage";

export const Route = createFileRoute("/cashflow")({
  head: () => ({
    meta: [
      { title: "Cash Flow — OpportunityOS" },
      { name: "description", content: "See every income source you've built from a single, honest view." },
      { property: "og:title", content: "Cash Flow — OpportunityOS" },
      { property: "og:description", content: "One honest view of every project you're running — what's growing, what's not." },
    ],
  }),
  component: () => (
    <StubPage
      icon={Wallet}
      eyebrow="Phase 2"
      title="Cash Flow."
      intro="One place to see every income source you're actually running — not projections, not promises."
      coming={[
        "Total monthly cash flow across every active project",
        "Return on effort: which projects earn the most per hour",
        "Trend view — which are growing, which are cooling",
        "Honest signal on which projects may deserve to be dropped",
      ]}
    />
  ),
});
