import { Sparkles, Crown, Zap, Hammer, TrendingUp, Radar, ShieldCheck, Award, type LucideIcon } from "lucide-react";

const ICONS: Record<string, LucideIcon> = {
  sparkles: Sparkles,
  crown: Crown,
  zap: Zap,
  hammer: Hammer,
  "trending-up": TrendingUp,
  radar: Radar,
  "shield-check": ShieldCheck,
  award: Award,
};

const RARITY_RING: Record<string, string> = {
  common: "ring-border",
  uncommon: "ring-tier-mod/40",
  rare: "ring-primary/40",
  legendary: "ring-tier-high/50",
  mythic: "ring-tier-high",
};

export function BadgeChip({
  name,
  description,
  icon,
  rarity = "common",
  issueNumber,
  maxSupply,
}: {
  name: string;
  description?: string;
  icon: string;
  rarity?: string;
  issueNumber?: number | null;
  maxSupply?: number | null;
}) {
  const Icon = ICONS[icon] ?? Award;
  return (
    <div
      title={description}
      className={`flex items-center gap-3 rounded-2xl border border-border bg-surface p-3 ring-1 ${RARITY_RING[rarity] ?? "ring-border"}`}
    >
      <div className="grid h-11 w-11 place-items-center rounded-xl bg-primary/10 text-primary">
        <Icon className="h-5 w-5" strokeWidth={1.75} />
      </div>
      <div className="min-w-0 flex-1">
        <div className="flex items-center gap-2">
          <span className="font-display text-[13px] font-semibold">{name}</span>
          <span className="text-[10px] uppercase tracking-wider text-muted-foreground">{rarity}</span>
        </div>
        {description && <p className="mt-0.5 line-clamp-2 text-[11px] text-muted-foreground">{description}</p>}
        {issueNumber != null && (
          <p className="mt-1 font-mono text-[10px] text-primary">
            #{String(issueNumber).padStart(3, "0")}{maxSupply ? ` / ${maxSupply}` : ""}
          </p>
        )}
      </div>
    </div>
  );
}
