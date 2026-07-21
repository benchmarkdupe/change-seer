import { createFileRoute } from "@tanstack/react-router";
import { User } from "lucide-react";
import { StubPage } from "@/components/layout/StubPage";

export const Route = createFileRoute("/profile")({
  head: () => ({
    meta: [
      { title: "Profile — OpportunityOS" },
      { name: "description", content: "A running record of what you've actually built — earned, not bought." },
      { property: "og:title", content: "Profile — OpportunityOS" },
      { property: "og:description", content: "Your building journey, on the record." },
    ],
  }),
  component: () => (
    <StubPage
      icon={User}
      eyebrow="Phase 2"
      title="Profile."
      intro="A record of what you've actually built, kept honest — the projects, the outcomes, and the signals you spotted early."
      coming={[
        "Projects you've launched from opportunities",
        "Verified outcome ranges — private by default, opt-in to share",
        "Early-signal history: opportunities you flagged before they were obvious",
        "Privacy controls at the field level, not one blanket toggle",
      ]}
    />
  ),
});
