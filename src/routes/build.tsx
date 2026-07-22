import { createFileRoute } from "@tanstack/react-router";
import { Hammer } from "lucide-react";
import { StubPage } from "@/components/layout/StubPage";

export const Route = createFileRoute("/build")({
  head: () => ({
    meta: [
      { title: "Build — OpportunityOS" },
      {
        name: "description",
        content:
          "Turn opportunities into projects you're actually working on, and track what happens.",
      },
      { property: "og:title", content: "Build — OpportunityOS" },
      {
        property: "og:description",
        content: "Track the real projects you build from opportunities you discover.",
      },
    ],
  }),
  component: () => (
    <StubPage
      icon={Hammer}
      eyebrow="Phase 2"
      title="Build."
      intro="This is where discovered opportunities turn into your own projects — tracked in your language, with your numbers, not a template's."
      coming={[
        "Start a project from any opportunity, in one tap",
        "Record what you actually spent, made, and learned",
        "Log status: idea, testing, running, growing, paused, done",
        "Attach evidence and outcomes — the raw material for your Profile later",
      ]}
    />
  ),
});
