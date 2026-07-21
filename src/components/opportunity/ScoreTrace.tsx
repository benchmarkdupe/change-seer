import type { ScoreBreakdown } from "@/domain/types/opportunity";

/**
 * Layer 4 — the full audit trail. Renders the exact ScoreContribution[]
 * the engine produced, in the order the engine produced it. This is the
 * ONE thing that must never disagree with the number on the card.
 */
export function ScoreTrace({ score }: { score: ScoreBreakdown }) {
  const max = Math.max(...score.contributions.map((c) => Math.abs(c.contribution)), 1);
  return (
    <div className="space-y-4">
      <div className="flex items-baseline justify-between text-[11px] text-muted-foreground">
        <span className="font-medium uppercase tracking-wider">Every point accounted for</span>
        <span className="font-mono">{score.scoringVersion}</span>
      </div>
      <ol className="space-y-3">
        {score.contributions.map((c, i) => {
          const positive = c.contribution >= 0;
          const pct = Math.max(4, (Math.abs(c.contribution) / max) * 100);
          return (
            <li key={`${c.signalType}-${i}`} className="rounded-xl border border-border-soft bg-surface-sunken/60 p-3">
              <div className="flex items-baseline justify-between gap-3">
                <p className="text-[13px] font-medium text-foreground">
                  {c.reason}
                  {c.inverted && (
                    <span className="ml-1.5 rounded bg-muted px-1 py-0.5 text-[9px] font-medium uppercase tracking-wider text-muted-foreground">
                      inverted
                    </span>
                  )}
                </p>
                <span className={`font-mono text-sm font-semibold ${positive ? "text-tier-high" : "text-tier-low"}`}>
                  {positive ? "+" : ""}
                  {c.contribution.toFixed(1)}
                </span>
              </div>
              <div className="mt-2 h-1 overflow-hidden rounded-full bg-border-soft">
                <div
                  className={`h-full ${positive ? "bg-tier-high" : "bg-tier-low"}`}
                  style={{ width: `${pct}%` }}
                />
              </div>
              <div className="mt-2 flex flex-wrap gap-x-3 gap-y-1 font-mono text-[10px] text-muted-foreground">
                <span>value {c.rawValue}</span>
                <span>×</span>
                <span>weight {c.weight}</span>
              </div>
            </li>
          );
        })}
      </ol>
    </div>
  );
}
