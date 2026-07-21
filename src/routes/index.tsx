import { createFileRoute, Link } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import { Search, SlidersHorizontal, Info } from "lucide-react";
import { SAMPLE_OPPORTUNITIES, SAMPLE_DATA_STATE } from "@/data/sample/opportunities";
import { CATEGORY_META } from "@/components/opportunity/tokens";
import { OpportunityCard } from "@/components/opportunity/OpportunityCard";
import { AppShell } from "@/components/layout/AppShell";
import type { Category } from "@/domain/types/opportunity";

const ALL_CATEGORIES = Object.keys(CATEGORY_META) as Category[];

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "OpportunityOS — See what's changing, decide what to build" },
      {
        name: "description",
        content:
          "OpportunityOS helps you find real, evidence-backed opportunities — businesses, products, jobs, trends and online income — with every score fully explained.",
      },
      { property: "og:title", content: "OpportunityOS — See what's changing, decide what to build" },
      {
        property: "og:description",
        content:
          "Discover evidence-backed opportunities with fully explainable scoring. Mobile-first, built for people who actually build things.",
      },
    ],
  }),
  component: DiscoverPage,
});

function DiscoverPage() {
  const [query, setQuery] = useState("");
  const [active, setActive] = useState<Category[]>(ALL_CATEGORIES);
  const [minScore, setMinScore] = useState(0);
  const [showFilters, setShowFilters] = useState(false);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    return SAMPLE_OPPORTUNITIES.filter(
      (o) =>
        active.includes(o.category) &&
        o.score.signalScore >= minScore &&
        (q === "" ||
          o.title.toLowerCase().includes(q) ||
          o.summary.toLowerCase().includes(q) ||
          o.region.toLowerCase().includes(q)),
    ).sort((a, b) => b.score.signalScore - a.score.signalScore);
  }, [query, active, minScore]);

  const toggle = (c: Category) =>
    setActive((prev) => (prev.includes(c) ? prev.filter((x) => x !== c) : [...prev, c]));

  return (
    <AppShell>
      <header className="sticky top-0 z-20 border-b border-border bg-background/85 backdrop-blur">
        <div className="px-4 pt-4 pb-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="grid h-7 w-7 place-items-center rounded-lg bg-primary/15 font-display text-[13px] font-bold text-primary">
                O
              </div>
              <span className="font-display text-[15px] font-semibold tracking-tight">OpportunityOS</span>
            </div>
            <Link
              to="/about"
              className="rounded-full p-1.5 text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
              aria-label="About OpportunityOS"
            >
              <Info className="h-4 w-4" />
            </Link>
          </div>

          <h1 className="mt-4 font-display text-[26px] font-semibold leading-tight tracking-tight">
            What's changing
            <span className="text-muted-foreground"> right now.</span>
          </h1>
          <p className="mt-1 text-[13px] leading-relaxed text-muted-foreground">
            Every score below is computed from real, weighted signals — tap a card to see exactly why.
          </p>

          <div className="mt-4 flex items-center gap-2">
            <div className="relative flex-1">
              <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <input
                type="search"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Search signals"
                className="h-10 w-full rounded-xl border border-border bg-surface pl-9 pr-3 text-[14px] text-foreground placeholder:text-muted-foreground focus:border-primary focus:outline-none"
              />
            </div>
            <button
              type="button"
              onClick={() => setShowFilters((v) => !v)}
              className={`grid h-10 w-10 shrink-0 place-items-center rounded-xl border transition-colors ${
                showFilters ? "border-primary bg-primary-soft text-primary" : "border-border bg-surface text-muted-foreground"
              }`}
              aria-label="Filters"
            >
              <SlidersHorizontal className="h-4 w-4" />
            </button>
          </div>
        </div>

        <div className="scrollbar-none flex gap-2 overflow-x-auto px-4 pb-3">
          {ALL_CATEGORIES.map((c) => {
            const meta = CATEGORY_META[c];
            const Icon = meta.icon;
            const on = active.includes(c);
            return (
              <button
                key={c}
                onClick={() => toggle(c)}
                className={`inline-flex shrink-0 items-center gap-1.5 rounded-full border px-3 py-1.5 text-[12px] font-medium transition-colors ${
                  on
                    ? "border-primary/50 bg-primary-soft text-primary"
                    : "border-border bg-surface text-muted-foreground"
                }`}
              >
                <Icon className="h-3.5 w-3.5" strokeWidth={1.75} />
                {meta.label}
              </button>
            );
          })}
        </div>

        {showFilters && (
          <div className="border-t border-border-soft bg-surface px-4 py-3">
            <label className="flex items-center justify-between text-[11px] font-medium uppercase tracking-wider text-muted-foreground">
              <span>Minimum signal score</span>
              <span className="font-mono text-foreground">{minScore}</span>
            </label>
            <input
              type="range"
              min={0}
              max={100}
              step={5}
              value={minScore}
              onChange={(e) => setMinScore(Number(e.target.value))}
              className="mt-2 w-full accent-[oklch(0.78_0.15_75)]"
            />
          </div>
        )}
      </header>

      <div className="mx-auto max-w-2xl px-4 py-4">
        <div className="mb-3 flex items-baseline justify-between text-[11px] uppercase tracking-wider text-muted-foreground">
          <span>{filtered.length} {filtered.length === 1 ? "signal" : "signals"}</span>
          <span className="font-mono">sorted by score</span>
        </div>

        {filtered.length === 0 ? (
          <div className="rounded-2xl border border-dashed border-border p-10 text-center text-muted-foreground">
            <p className="text-[13px]">No signals match these filters.</p>
          </div>
        ) : (
          <div className="space-y-3">
            {filtered.map((opp) => (
              <OpportunityCard key={opp.id} opp={opp} dataState={SAMPLE_DATA_STATE} />
            ))}
          </div>
        )}

        <p className="mt-6 text-center text-[11px] leading-relaxed text-muted-foreground">
          You're seeing sample data. Real scouts (Reddit, Google Trends, marketplaces, job boards, more) haven't been connected yet — the scoring pipeline they'll feed is already in place.
        </p>
      </div>
    </AppShell>
  );
}
