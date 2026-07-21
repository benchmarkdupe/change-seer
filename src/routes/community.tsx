import { createFileRoute } from "@tanstack/react-router";
import { Users } from "lucide-react";
import { StubPage } from "@/components/layout/StubPage";

export const Route = createFileRoute("/community")({
  head: () => ({
    meta: [
      { title: "Community — OpportunityOS" },
      { name: "description", content: "Discussions tied to specific opportunities — challenges, corroborations, and real outcomes." },
      { property: "og:title", content: "Community — OpportunityOS" },
      { property: "og:description", content: "Real conversations tied to specific opportunities, not generic feeds." },
    ],
  }),
  component: () => (
    <StubPage
      icon={Users}
      eyebrow="Phase 3"
      title="Community."
      intro="Every opportunity gets its own thread — for people who've tried it, are trying it, or have counter-evidence. Not a social feed."
      coming={[
        "Discussions attached to specific opportunities",
        "Members can corroborate or challenge signals with their own evidence",
        "Outcome reports feed back into scoring over time",
        "Reputation earned from useful contributions, not follower counts",
      ]}
    />
  ),
});
