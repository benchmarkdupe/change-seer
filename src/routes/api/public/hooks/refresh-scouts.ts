import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/api/public/hooks/refresh-scouts")({
  server: {
    handlers: {
      POST: async () => {
        // Delegate to the same server logic used at page-load. This gives
        // pg_cron a single endpoint that keeps every live source's
        // persisted signal cache fresh even when nobody is browsing. Each
        // source is isolated — one going down never blocks the others.
        const mod = await import("@/lib/opportunities.functions");
        const sources: Array<
          [string, () => Promise<{ opportunities: unknown[]; lastRun: string | null }>]
        > = [
          ["hackerNews", mod.getLiveOpportunities],
          ["aiEcosystem", mod.getLiveAiEcosystemOpportunities],
          ["dropshipping", mod.getLiveDropshippingOpportunities],
        ];

        const results = await Promise.allSettled(sources.map(([, fn]) => fn()));

        const summary: Record<
          string,
          { opportunities: number; lastRun: string | null } | { error: string }
        > = {};
        results.forEach((result, i) => {
          const [name] = sources[i];
          summary[name] =
            result.status === "fulfilled"
              ? { opportunities: result.value.opportunities.length, lastRun: result.value.lastRun }
              : {
                  error:
                    result.reason instanceof Error ? result.reason.message : String(result.reason),
                };
        });

        return Response.json({ ok: true, sources: summary });
      },
    },
  },
});
