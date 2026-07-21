import { createFileRoute, Link } from "@tanstack/react-router";
import { useMemo, useState, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { Search, SlidersHorizontal, Info, User as UserIcon, Activity } from "lucide-react";
import { SAMPLE_OPPORTUNITIES, SAMPLE_DATA_STATE } from "@/data/sample/opportunities";
import { CATEGORY_META } from "@/components/opportunity/tokens";
import { OpportunityCard } from "@/components/opportunity/OpportunityCard";
import { AppShell } from "@/components/layout/AppShell";
import { getLiveOpportunities } from "@/lib/opportunities.functions";
import { listSaved } from "@/lib/saved.functions";
import { useAuth } from "@/hooks/useAuth";
import type { Category } from "@/domain/types/opportunity";
import type { DataState } from "@/domain/dataState";

const ALL_CATEGORIES = Object.keys(CATEGORY_META) as Category[];

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "OpportunityOS — See what's changing, decide what to build" },
      { name: "description", content: "OpportunityOS surfaces evidence-backed opportunities — businesses, products, jobs, trends, online income — with every score fully explained. Live signals from real APIs, sample seeds clearly labelled." },
      { property: "og:title", content: "OpportunityOS — See what's changing, decide what to build" },
      { property: "og:description", content: "Discover evidence-backed opportunities with fully explainable scoring." },
    ],
  }),
  component: DiscoverPage,
});

function DiscoverPage() {
  const { user } = useAuth();
  const fetchLive = useServerFn(getLiveOpportunities);
  const fetchSaved = useServerFn(listSaved);

  const liveQuery = useQuery({
    queryKey: ["live-opps"],
    queryFn: () => fetchLive(),
    staleTime: 5 * 60_000,
  });

  const savedQuery = useQuery({
    queryKey: ["saved"],
    queryFn: () => fetchSaved(),
    enabled: !!user,
    staleTime: 60_000,
  });

  const [query, setQuery] = useState("");
  const [active, setActive] = useState<Category[]>(ALL_CATEGORIES);
  const [minScore, setMinScore] = useState(0);
  const [showFilters, setShowFilters] = useState(false);
  const [feed, setFeed] = useState<"all" | "saved">("all");

  useEffect(() => { if (!user) setFeed("all"); }, [user]);

  const savedIds = useMemo(
    () => new Set((savedQuery.data ?? []).map((s) => s.opportunity_id)),
    [savedQuery.data],
  );

  const combined = useMemo(() => {
    const live = (liveQuery.data?.opportunities ?? []).map((o) => ({ opp: o, state: "live" as DataState }));
    const sample = SAMPLE_OPPORTUNITIES.map((o) => ({ opp: o, state: SAMPLE_DATA_STATE }));
    return [...live, ...sample];
  }, [liveQuery.data]);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    return combined
      .filter(({ opp }) =>
        active.includes(opp.category) &&
        opp.score.signalScore >= minScore &&
        (q === "" || opp.title.toLowerCase().includes(q) || opp.summary.toLowerCase().includes(q) || opp.region.toLowerCase().includes(q)) &&
        (feed === "all" || savedIds.has(opp.id))
      )
      .sort((a, b) => b.opp.score.signalScore - a.opp.score.signalScore);
  }, [combined, query, active, minScore, feed, savedIds]);

  const toggle = (c: Category) =>
    setActive((prev) => (prev.includes(c) ? prev.filter((x) => x !== c) : [...prev, c]));

  return (
    <AppShell>
      <header className="sticky top-0 z-20 border-b border-border bg-background/85 backdrop-blur">
        <div className="px-4 pt-4 pb-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="grid h-7 w-7 place-items-center rounded-lg bg-primary/15 font-display text-[13px] font-bold text-primary">O</div>
              <span className="font-display text-[15px] font-semibold tracking-tight">OpportunityOS</span>
            </div>
            <div className="flex items-center gap-1">
              <Link to="/about" className="rounded-full p-1.5 text-muted-foreground hover:bg-muted hover:text-foreground" aria-label="About">
                <Info className="h-4 w-4" />
              </Link>
              <Link to="/admin" className="rounded-full p-1.5 text-muted-foreground hover:bg-muted hover:text-foreground" aria-label="Source health">
                <Activity className="h-4 w-4" />
              </Link>
              {user ? (
                <Link to="/profile" className="rounded-full p-1.5 text-muted-foreground hover:bg-muted hover:text-foreground" aria-label="Profile">
                  <UserIcon className="h-4 w-4" />
                </Link>
              ) : (
                <Link to="/auth" className="rounded-full bg-primary px-3 py-1 text-[12px] font-medium text-primary-foreground">
                  Sign in
                </Link>
              )}
            </div>
          </div>

          <h1 className="mt-4 font-display text-[26px] font-semibold leading-tight tracking-tight">
            What's changing<span className="text-muted-foreground"> right now.</span>
          </h1>
          <p className="mt-1 text-[13px] leading-relaxed text-muted-foreground">
            {liveQuery.isLoading ? "Fetching live signals…" :
             liveQuery.data?.opportunities.length ? `${liveQuery.data.opportunities.length} live signals from Hacker News, plus curated sample opportunities.` :
             "Sample opportunities below; live scouts refresh in the background."}
          </p>

          <div className="mt-4 flex items-center gap-2">
            <div className="relative flex-1">
              <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <input type="search" value={query} onChange={(e) => setQuery(e.target.value)} placeholder="Search signals"
                className="h-10 w-full rounded-xl border border-border bg-surface pl-9 pr-3 text-[14px] focus:border-primary focus:outline-none" />
            </div>
            <button type="button" onClick={() => setShowFilters((v) => !v)}
              className={`grid h-10 w-10 shrink-0 place-items-center rounded-xl border ${showFilters ? "border-primary bg-primary-soft text-primary" : "border-border bg-surface text-muted-foreground"}`} aria-label="Filters">
              <SlidersHorizontal className="h-4 w-4" />
            </button>
          </div>

          {user && (
            <div className="mt-3 inline-flex rounded-lg border border-border bg-surface p-0.5 text-[12px]">
              <button onClick={() => setFeed("all")}
                className={`rounded-md px-3 py-1 ${feed === "all" ? "bg-primary text-primary-foreground" : "text-muted-foreground"}`}>
                All signals
              </button>
              <button onClick={() => setFeed("saved")}
                className={`rounded-md px-3 py-1 ${feed === "saved" ? "bg-primary text-primary-foreground" : "text-muted-foreground"}`}>
                Saved
              </button>
            </div>
          )}
        </div>

        <div className="scrollbar-none flex gap-2 overflow-x-auto px-4 pb-3">
          {ALL_CATEGORIES.map((c) => {
            const meta = CATEGORY_META[c];
            const Icon = meta.icon;
            const on = active.includes(c);
            return (
              <button key={c} onClick={() => toggle(c)}
                className={`inline-flex shrink-0 items-center gap-1.5 rounded-full border px-3 py-1.5 text-[12px] font-medium ${on ? "border-primary/50 bg-primary-soft text-primary" : "border-border bg-surface text-muted-foreground"}`}>
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
            <input type="range" min={0} max={100} step={5} value={minScore}
              onChange={(e) => setMinScore(Number(e.target.value))} className="mt-2 w-full accent-[oklch(0.78_0.15_75)]" />
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
            <p className="text-[13px]">
              {feed === "saved" ? "You haven't saved anything yet. Tap the bookmark on a card." : "No signals match these filters."}
            </p>
          </div>
        ) : (
          <div className="space-y-3">
            {filtered.map(({ opp, state }) => (
              <OpportunityCard key={opp.id} opp={opp} dataState={state} isSaved={savedIds.has(opp.id)} />
            ))}
          </div>
        )}

        <p className="mt-6 text-center text-[11px] leading-relaxed text-muted-foreground">
          Signals labelled <span className="text-state-live">Live</span> come from real public APIs. Signals labelled <span className="text-state-sample">Sample</span> are curated seeds used to demonstrate the scoring pipeline. Every score is deterministic and fully explainable — tap any card.
        </p>
      </div>
    </AppShell>
  );
}
