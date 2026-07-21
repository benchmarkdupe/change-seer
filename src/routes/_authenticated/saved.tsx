import { createFileRoute, Link } from "@tanstack/react-router";
import { useSuspenseQuery } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { ArrowLeft, Bookmark } from "lucide-react";
import { listSaved } from "@/lib/saved.functions";
import { SAMPLE_OPPORTUNITIES } from "@/data/sample/opportunities";
import { OpportunityCard } from "@/components/opportunity/OpportunityCard";

export const Route = createFileRoute("/_authenticated/saved")({
  loader: ({ context }) =>
    context.queryClient.ensureQueryData({
      queryKey: ["saved"],
      queryFn: () => listSaved(),
    }),
  component: SavedPage,
});

function SavedPage() {
  const fetchSaved = useServerFn(listSaved);
  const { data: saved } = useSuspenseQuery({ queryKey: ["saved"], queryFn: () => fetchSaved() });
  const opps = saved
    .map((s) => SAMPLE_OPPORTUNITIES.find((o) => o.id === s.opportunity_id))
    .filter((o): o is (typeof SAMPLE_OPPORTUNITIES)[number] => !!o);

  return (
    <div className="min-h-screen bg-background pb-24">
      <header className="sticky top-0 z-20 border-b border-border bg-background/85 px-4 py-3 backdrop-blur">
        <Link to="/" className="inline-flex items-center gap-1.5 text-[13px] text-muted-foreground hover:text-foreground">
          <ArrowLeft className="h-3.5 w-3.5" /> Back
        </Link>
      </header>
      <div className="px-4 pt-5">
        <h1 className="font-display text-2xl font-semibold tracking-tight">Saved</h1>
        <p className="mt-1 text-[13px] text-muted-foreground">
          Opportunities you flagged. When one crosses into High Signal, you'll earn an Early Signal badge.
        </p>
        {opps.length === 0 ? (
          <div className="mt-10 rounded-2xl border border-dashed border-border p-8 text-center">
            <Bookmark className="mx-auto h-6 w-6 text-muted-foreground" />
            <p className="mt-3 text-[13px] text-muted-foreground">Nothing saved yet. Tap the bookmark on any card.</p>
          </div>
        ) : (
          <div className="mt-5 space-y-3">
            {opps.map((o) => (
              <OpportunityCard key={o.id} opp={o} dataState="sample" />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
