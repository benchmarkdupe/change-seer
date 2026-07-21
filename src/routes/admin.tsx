import { createFileRoute, Link } from "@tanstack/react-router";
import { useSuspenseQuery } from "@tanstack/react-query";
import { createServerFn } from "@tanstack/react-start";
import { useServerFn } from "@tanstack/react-start";
import { ArrowLeft, Activity, AlertCircle, CheckCircle2, Clock } from "lucide-react";

const listSourceHealth = createServerFn({ method: "GET" }).handler(async () => {
  const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
  const { data } = await supabaseAdmin.from("source_health").select("*").order("scout_id");
  return data ?? [];
});

export const Route = createFileRoute("/admin")({
  head: () => ({
    meta: [{ title: "Admin — Source Health · OpportunityOS" }, { name: "robots", content: "noindex" }],
  }),
  loader: ({ context }) =>
    context.queryClient.ensureQueryData({ queryKey: ["source-health"], queryFn: () => listSourceHealth() }),
  component: AdminPage,
});

function AdminPage() {
  const fetchHealth = useServerFn(listSourceHealth);
  const { data } = useSuspenseQuery({ queryKey: ["source-health"], queryFn: () => fetchHealth() });

  return (
    <div className="min-h-screen bg-background pb-24">
      <header className="sticky top-0 z-20 border-b border-border bg-background/85 px-4 py-3 backdrop-blur">
        <Link to="/" className="inline-flex items-center gap-1.5 text-[13px] text-muted-foreground hover:text-foreground">
          <ArrowLeft className="h-3.5 w-3.5" /> Back
        </Link>
      </header>
      <div className="px-4 pt-5">
        <div className="flex items-center gap-2">
          <Activity className="h-5 w-5 text-primary" />
          <h1 className="font-display text-2xl font-semibold tracking-tight">Source health</h1>
        </div>
        <p className="mt-1 text-[13px] text-muted-foreground">
          Every scout, its last successful pull, freshness window, and error state. Public read-only.
        </p>

        <div className="mt-5 space-y-2">
          {data.map((s) => {
            const Icon =
              s.status === "healthy" ? CheckCircle2 :
              s.status === "down" ? AlertCircle : Clock;
            const tone =
              s.status === "healthy" ? "text-state-verified" :
              s.status === "down" ? "text-tier-low" : "text-muted-foreground";
            return (
              <div key={s.scout_id} className="rounded-2xl border border-border bg-surface p-3">
                <div className="flex items-start justify-between gap-3">
                  <div className="min-w-0">
                    <div className="flex items-center gap-2">
                      <Icon className={`h-4 w-4 ${tone}`} />
                      <span className="font-display text-[14px] font-semibold">{s.scout_name}</span>
                    </div>
                    <div className="mt-0.5 font-mono text-[11px] text-muted-foreground">{s.scout_id}</div>
                    {s.last_error && <p className="mt-1 text-[11px] text-tier-low">{s.last_error}</p>}
                  </div>
                  <div className="text-right">
                    <div className={`text-[10px] uppercase tracking-wider ${tone}`}>{s.status.replace("_", " ")}</div>
                    <div className="mt-0.5 font-mono text-[10px] text-muted-foreground">
                      refresh every {s.refresh_interval_minutes}m
                    </div>
                  </div>
                </div>
                <div className="mt-2 grid grid-cols-3 gap-2 border-t border-border-soft pt-2 text-[10px] text-muted-foreground">
                  <div>
                    <div className="uppercase tracking-wider">Last success</div>
                    <div className="mt-0.5 font-mono text-foreground">{s.last_success_at ? new Date(s.last_success_at).toLocaleString() : "—"}</div>
                  </div>
                  <div>
                    <div className="uppercase tracking-wider">Records / run</div>
                    <div className="mt-0.5 font-mono text-foreground">{s.records_last_run}</div>
                  </div>
                  <div>
                    <div className="uppercase tracking-wider">Total runs</div>
                    <div className="mt-0.5 font-mono text-foreground">{s.total_runs}</div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
