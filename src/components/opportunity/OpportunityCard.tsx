import { Link } from "@tanstack/react-router";
import { ArrowUpRight, ArrowDownRight, Minus } from "lucide-react";
import type { Opportunity } from "@/domain/types/opportunity";
import type { DataState } from "@/domain/dataState";
import { CATEGORY_META, tierClass, relativeDate } from "./tokens";
import { DataStateBadge } from "./DataStateBadge";
import { Sparkline } from "./Sparkline";

function MomentumIcon({ momentum }: { momentum: number }) {
  const cls = "h-3 w-3";
  if (momentum >= 60) return <ArrowUpRight className={`${cls} text-tier-high`} />;
  if (momentum <= 40) return <ArrowDownRight className={`${cls} text-tier-low`} />;
  return <Minus className={`${cls} text-muted-foreground`} />;
}

export function OpportunityCard({ opp, dataState }: { opp: Opportunity; dataState: DataState }) {
  const tier = tierClass(opp.score.rating);
  const cat = CATEGORY_META[opp.category];
  const Icon = cat.icon;
  return (
    <Link
      to="/opportunity/$id"
      params={{ id: opp.id }}
      className="group block rounded-2xl border border-border bg-card p-4 transition-colors hover:border-primary/40 active:scale-[0.995]"
    >
      <div className="flex items-start gap-3">
        <div className={`grid h-10 w-10 shrink-0 place-items-center rounded-xl ${tier.bg}`}>
          <Icon className={`h-5 w-5 ${tier.text}`} strokeWidth={1.75} />
        </div>
        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-2 text-[10px] font-medium uppercase tracking-wider text-muted-foreground">
            <span>{cat.label}</span>
            <span className="text-border">·</span>
            <span className="truncate">{opp.region}</span>
          </div>
          <h3 className="mt-0.5 font-display text-[15px] font-semibold leading-snug text-foreground">
            {opp.title}
          </h3>
        </div>
        <div className="shrink-0 text-right">
          <div className={`font-mono text-2xl font-semibold leading-none ${tier.text}`}>
            {opp.score.signalScore}
          </div>
          <div className={`mt-1 text-[9px] font-medium uppercase tracking-wider ${tier.text}`}>
            {tier.label}
          </div>
        </div>
      </div>

      <p className="mt-3 line-clamp-2 text-[13px] leading-relaxed text-muted-foreground">
        {opp.summary}
      </p>

      <ul className="mt-3 space-y-1">
        {opp.score.topReasons.slice(0, 2).map((r) => (
          <li key={r} className="flex items-start gap-1.5 text-[12px] text-foreground/85">
            <span className="mt-1 h-1 w-1 shrink-0 rounded-full bg-primary/70" />
            <span className="line-clamp-1">{r}</span>
          </li>
        ))}
      </ul>

      <div className="mt-3 flex items-center justify-between gap-2 border-t border-border-soft pt-3">
        <div className="flex items-center gap-2 text-[11px] text-muted-foreground">
          <DataStateBadge state={dataState} />
          <span className="hidden xs:inline">· {relativeDate(opp.detectedAt)}</span>
        </div>
        <div className="flex items-center gap-2">
          <span className="flex items-center gap-1 font-mono text-[11px] text-muted-foreground">
            <MomentumIcon momentum={opp.score.momentum} />
            {opp.score.momentum}
          </span>
          <Sparkline data={opp.sparkline} className={tier.text} width={56} height={20} />
        </div>
      </div>
    </Link>
  );
}
