import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/api/public/hooks/refresh-scouts")({
  server: {
    handlers: {
      POST: async () => {
        try {
          // Delegate to the same server logic used at page-load. This gives
          // pg_cron a single endpoint that keeps the persisted signal cache
          // fresh even when nobody is browsing.
          const mod = await import("@/lib/opportunities.functions");
          const result = await mod.getLiveOpportunities();
          return Response.json({
            ok: true,
            opportunities: result.opportunities.length,
            lastRun: result.lastRun,
          });
        } catch (e) {
          return Response.json(
            { ok: false, error: e instanceof Error ? e.message : String(e) },
            { status: 500 },
          );
        }
      },
    },
  },
});
