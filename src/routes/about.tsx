import { createFileRoute, Link } from "@tanstack/react-router";
import { ArrowLeft, ArrowRight } from "lucide-react";
import { AppShell } from "@/components/layout/AppShell";

export const Route = createFileRoute("/about")({
  head: () => ({
    meta: [
      { title: "What is OpportunityOS?" },
      { name: "description", content: "An operating system for opportunity — discover what's changing, understand why, decide what to build." },
      { property: "og:title", content: "What is OpportunityOS?" },
      { property: "og:description", content: "Discover → Understand → Build → Track → Improve → Expand." },
    ],
  }),
  component: AboutPage,
});

const STEPS = [
  { k: "Discover", d: "See what's changing in the world — search demand, local business gaps, resale margins, new markets." },
  { k: "Understand", d: "Every opportunity comes with plain-language reasoning and the evidence that produced it — not a black box." },
  { k: "Build", d: "Turn an opportunity into a project you're actually working on." },
  { k: "Track", d: "Record what you spent, earned, and learned — in your own numbers." },
  { k: "Improve", d: "See which projects deserve more of your attention, which don't." },
  { k: "Expand", d: "Grow multiple income sources instead of betting everything on one." },
];

function AboutPage() {
  return (
    <AppShell>
      <header className="sticky top-0 z-20 border-b border-border bg-background/85 backdrop-blur">
        <div className="flex items-center gap-2 px-3 py-3">
          <Link
            to="/"
            className="inline-flex items-center gap-1 rounded-full p-1.5 text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
          >
            <ArrowLeft className="h-4 w-4" />
            <span className="text-[12px] font-medium">Discover</span>
          </Link>
        </div>
      </header>

      <article className="mx-auto max-w-2xl px-5 pb-10 pt-4">
        <p className="text-[10px] font-medium uppercase tracking-wider text-primary">What this is</p>
        <h1 className="mt-2 font-display text-[30px] font-semibold leading-[1.1] tracking-tight">
          An operating system<br/>
          <span className="text-muted-foreground">for opportunity.</span>
        </h1>

        <p className="mt-5 text-[15px] leading-relaxed text-foreground/90">
          OpportunityOS helps you understand what's changing, find where opportunity may exist, and turn useful opportunities into things you can actually build. It's not a business-idea generator and it's not a chatbot.
        </p>

        <div className="mt-8 space-y-3">
          {STEPS.map((s, i) => (
            <div key={s.k} className="flex gap-3 rounded-2xl border border-border bg-card p-4">
              <span className="grid h-8 w-8 shrink-0 place-items-center rounded-xl bg-primary-soft font-mono text-[12px] font-semibold text-primary">
                {String(i + 1).padStart(2, "0")}
              </span>
              <div>
                <h3 className="font-display text-[15px] font-semibold text-foreground">{s.k}</h3>
                <p className="mt-1 text-[13px] leading-relaxed text-muted-foreground">{s.d}</p>
              </div>
            </div>
          ))}
        </div>

        <div className="mt-8 rounded-2xl border border-border bg-card p-5">
          <h2 className="font-display text-[16px] font-semibold">Every score is explainable</h2>
          <p className="mt-2 text-[13px] leading-relaxed text-foreground/85">
            OpportunityOS never shows a number without being able to show its math. Every signal comes from a specific scout, every scout says how sure it is, and every point of the final score maps to a line in the audit trail. If a user asks "why is this a 74?" — the answer is already data on the screen.
          </p>
        </div>

        <div className="mt-4 rounded-2xl border border-border bg-card p-5">
          <h2 className="font-display text-[16px] font-semibold">Sample data, real architecture</h2>
          <p className="mt-2 text-[13px] leading-relaxed text-foreground/85">
            Today, the scouts return seeded observations so you can see how the system thinks. When real scout integrations come online (Google Trends, Reddit, marketplaces, job boards, more) they slot into the same pipeline — the UI never changes.
          </p>
        </div>

        <Link
          to="/"
          className="mt-8 inline-flex items-center gap-2 rounded-full bg-primary px-4 py-2.5 text-[13px] font-medium text-primary-foreground"
        >
          See what's changing
          <ArrowRight className="h-4 w-4" />
        </Link>
      </article>
    </AppShell>
  );
}
