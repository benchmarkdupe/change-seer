import { createFileRoute, Link, notFound } from "@tanstack/react-router";
import { ArrowLeft, ArrowUpRight, ArrowDownRight, Minus } from "lucide-react";
import { getSampleOpportunityById, SAMPLE_DATA_STATE } from "@/data/sample/opportunities";
import { CATEGORY_META, tierClass, formatRange, relativeDate } from "@/components/opportunity/tokens";
import { VerificationBadge } from "@/components/opportunity/VerificationBadge";
import { DataStateBadge } from "@/components/opportunity/DataStateBadge";
import { Sparkline } from "@/components/opportunity/Sparkline";
import { MetricExplainer } from "@/components/opportunity/MetricExplainer";
import { Disclosure } from "@/components/opportunity/Disclosure";
import { ScoreTrace } from "@/components/opportunity/ScoreTrace";
import { BuildPrompt } from "@/components/opportunity/BuildPrompt";
import { AppShell } from "@/components/layout/AppShell";
import type { Opportunity } from "@/domain/types/opportunity";
import type { DataState } from "@/domain/dataState";

export const Route = createFileRoute("/opportunity/$id")({
  loader: async ({ params }): Promise<{ opp: Opportunity; dataState: DataState }> => {
    // Live opportunity ids are always "live-<key>" (see live-signal-source.server.ts);
    // sample ids are bare slugs — branch on that instead of trying sample first,
    // since a live-only id would never match a sample seed anyway.
    if (params.id.startsWith("live-")) {
      const { getLiveOpportunityById } = await import("@/lib/opportunities.functions");
      const { opportunity } = await getLiveOpportunityById({ data: { id: params.id } });
      if (!opportunity) throw notFound();
      return { opp: opportunity, dataState: "live" };
    }
    const opp = getSampleOpportunityById(params.id);
    if (!opp) throw notFound();
    return { opp, dataState: SAMPLE_DATA_STATE };
  },
  head: ({ loaderData }) => {
    if (!loaderData) {
      return {
        meta: [
          { title: "Opportunity not found — OpportunityOS" },
          { name: "robots", content: "noindex" },
        ],
      };
    }
    const { opp } = loaderData;
    return {
      meta: [
        { title: `${opp.title} — OpportunityOS` },
        { name: "description", content: opp.summary },
        { property: "og:title", content: `${opp.title} — OpportunityOS` },
        { property: "og:description", content: opp.summary },
      ],
    };
  },
  component: OpportunityDetail,
  notFoundComponent: OppNotFound,
});

function OppNotFound() {
  return (
    <AppShell>
      <div className="mx-auto max-w-md px-6 py-16 text-center">
        <h1 className="font-display text-2xl font-semibold">Opportunity not found</h1>
        <p className="mt-2 text-sm text-muted-foreground">This signal may have been removed or the link is out of date.</p>
        <Link to="/" className="mt-6 inline-flex rounded-full bg-primary px-4 py-2 text-sm font-medium text-primary-foreground">Back to Discover</Link>
      </div>
    </AppShell>
  );
}

function MomentumBadge({ momentum }: { momentum: number }) {
  if (momentum >= 60) return <ArrowUpRight className="h-3.5 w-3.5 text-tier-high" />;
  if (momentum <= 40) return <ArrowDownRight className="h-3.5 w-3.5 text-tier-low" />;
  return <Minus className="h-3.5 w-3.5 text-muted-foreground" />;
}

function OpportunityDetail() {
  const { opp, dataState } = Route.useLoaderData() as { opp: Opportunity; dataState: DataState };
  const tier = tierClass(opp.score.rating);
  const cat = CATEGORY_META[opp.category];
  const Icon = cat.icon;

  return (
    <AppShell>
      <header className="sticky top-0 z-20 border-b border-border bg-background/85 backdrop-blur">
        <div className="flex items-center gap-2 px-3 py-3">
          <Link
            to="/"
            className="inline-flex items-center gap-1 rounded-full p-1.5 text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
            aria-label="Back to Discover"
          >
            <ArrowLeft className="h-4 w-4" />
            <span className="text-[12px] font-medium">Discover</span>
          </Link>
        </div>
      </header>

      <article className="mx-auto max-w-2xl space-y-4 px-4 pb-8 pt-4">
        {/* Hero */}
        <div className="rounded-3xl border border-border bg-card p-5">
          <div className="flex items-center gap-2">
            <div className={`grid h-9 w-9 place-items-center rounded-xl ${tier.bg}`}>
              <Icon className={`h-5 w-5 ${tier.text}`} strokeWidth={1.75} />
            </div>
            <div className="flex flex-wrap items-center gap-1.5 text-[10px] font-medium uppercase tracking-wider text-muted-foreground">
              <span>{cat.label}</span>
              <span className="text-border">·</span>
              <span>{opp.region}</span>
              <span className="text-border">·</span>
              <span>Detected {relativeDate(opp.detectedAt)}</span>
            </div>
          </div>
          <h1 className="mt-3 font-display text-[24px] font-semibold leading-tight tracking-tight">
            {opp.title}
          </h1>
          <div className="mt-3 flex flex-wrap gap-2">
            <DataStateBadge state={dataState} />
            <VerificationBadge status={opp.verification} />
          </div>
          <p className="mt-4 text-[14px] leading-relaxed text-foreground/85">{opp.summary}</p>
        </div>

        {/* L1 metrics — always visible, tap to expand */}
        <div className="grid grid-cols-3 gap-2">
          <MetricExplainer
            label="Signal"
            value={opp.score.signalScore}
            tone={opp.score.rating === "high_signal" ? "high" : opp.score.rating === "moderate" ? "mod" : "low"}
            explainer="Signal Score is a 0-100 composite of every weighted piece of evidence the scouts collected for this opportunity, using the weight profile for its category. Higher means the underlying signals point more strongly toward opportunity."
          />
          <MetricExplainer
            label="Confidence"
            value={opp.score.confidence}
            explainer="Confidence reflects how corroborated the score is: how many independent scouts observed the signals, and how sure each scout was of its own observation. A high score from a single source will still have modest confidence."
          />
          <MetricExplainer
            label={
              <span className="inline-flex items-center gap-1">
                <MomentumBadge momentum={opp.score.momentum} />
                Momentum
              </span>
            }
            value={opp.score.momentum}
            explainer="Momentum is the rate-of-change component: is this opportunity accelerating, cooling, or holding steady over the recent window? It comes from momentum-type signals reported by the scouts."
          />
        </div>

        <div className="flex items-center justify-between rounded-2xl border border-border-soft bg-surface-sunken/60 px-4 py-3">
          <span className="text-[11px] font-medium uppercase tracking-wider text-muted-foreground">
            Score trajectory
          </span>
          <Sparkline data={opp.sparkline} className={tier.text} width={140} height={30} />
        </div>

        {/* L2 — why this matters */}
        <Disclosure title="Why now" subtitle="The change that made this appear" defaultOpen>
          <p className="text-[14px] leading-relaxed text-foreground/90">{opp.aiDetail.whyGrowing}</p>
        </Disclosure>

        <Disclosure title="Who this suits" subtitle="Who's actually pulling this off">
          <p className="text-[14px] leading-relaxed text-foreground/90">{opp.aiDetail.whoIsSucceeding}</p>
        </Disclosure>

        <Disclosure title="Risks & unknowns" subtitle="What could make this a bad bet">
          <ul className="space-y-2">
            {opp.aiDetail.risks.map((r) => (
              <li key={r} className="flex gap-2 text-[14px] leading-relaxed text-foreground/90">
                <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-tier-low" />
                <span>{r}</span>
              </li>
            ))}
          </ul>
        </Disclosure>

        <Disclosure title="What it might take" subtitle="Capital, time, and difficulty">
          <div className="grid grid-cols-2 gap-2">
            <MetricExplainer
              label="Startup cost"
              value={formatRange(opp.estimatedStartupCost)}
              explainer="A rough capital range based on comparable operators or listings — not a quote. Real cost depends heavily on your existing tools, network, and market."
            />
            <MetricExplainer
              label="Time"
              value={<span className="text-[13px]">{opp.estimatedTimeCommitment}</span>}
              explainer="Estimated weekly time commitment during the active phase of this opportunity. Ramp-up and slow periods will differ."
            />
            <MetricExplainer
              label="Difficulty"
              value={<span className="capitalize text-[13px]">{opp.estimatedDifficulty.replace("_", " ")}</span>}
              explainer="How hard it typically is to execute — combining technical skill, business setup, and market navigation. Not a measure of whether it's worth doing."
            />
            <MetricExplainer
              label="Monthly potential"
              value={formatRange(opp.estimatedMonthlyPotential)}
              explainer="A plausible range for a typical operator once past initial ramp. Outliers land above and below; treat this as a reasonable middle."
            />
          </div>
          <p className="mt-3 text-[13px] leading-relaxed text-foreground/85">
            <span className="text-muted-foreground">Capital: </span>
            {opp.aiDetail.recommendedCapital}
          </p>
          <p className="mt-2 text-[13px] leading-relaxed text-foreground/85">
            <span className="text-muted-foreground">Difficulty: </span>
            {opp.aiDetail.difficultyExplanation}
          </p>
          <p className="mt-2 text-[13px] leading-relaxed text-foreground/85">
            <span className="text-muted-foreground">Time to profit: </span>
            {opp.aiDetail.timeToProfitability}
          </p>
        </Disclosure>

        <Disclosure title="A reasonable first step" subtitle="Not a business plan — a starting move">
          <ol className="space-y-3">
            {opp.aiDetail.howToBegin.map((step, i) => (
              <li key={step} className="flex gap-3">
                <span className="grid h-6 w-6 shrink-0 place-items-center rounded-full bg-primary-soft font-mono text-[11px] font-semibold text-primary">
                  {i + 1}
                </span>
                <span className="text-[14px] leading-relaxed text-foreground/90">{step}</span>
              </li>
            ))}
          </ol>
        </Disclosure>

        <Disclosure title="Evidence" subtitle={`${opp.score.contributions.length} signal${opp.score.contributions.length === 1 ? "" : "s"} from ${opp.sourceScoutIds.length} scout${opp.sourceScoutIds.length === 1 ? "" : "s"}`}>
          <ul className="space-y-2">
            {opp.aiDetail.publicEvidence.map((e) => (
              <li key={e.label} className="rounded-xl border border-border-soft bg-surface-sunken/60 p-3">
                <p className="text-[13px] leading-relaxed text-foreground/90">{e.label}</p>
                <p className="mt-1 font-mono text-[10px] uppercase tracking-wider text-muted-foreground">
                  {e.sourceScoutId}
                </p>
              </li>
            ))}
          </ul>
        </Disclosure>

        <Disclosure title="How this score was calculated" subtitle="Layer 4 — the full audit trail">
          <ScoreTrace score={opp.score} />
        </Disclosure>

        <BuildPrompt opp={opp} isSample={dataState === SAMPLE_DATA_STATE} />

        {dataState === SAMPLE_DATA_STATE && (
          <div className="rounded-2xl border border-dashed border-border p-4 text-[12px] leading-relaxed text-muted-foreground">
            <strong className="font-semibold text-foreground">Heads up: </strong>
            This opportunity is built on sample data for illustration. Real scout integrations will replace it — the scoring, evidence, and audit trail architecture above are the real thing.
          </div>
        )}
      </article>
    </AppShell>
  );
}
