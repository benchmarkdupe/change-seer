import type { Category, ScoreBreakdown, VerificationStatus } from "@/domain/types/opportunity";
import type { DataState } from "@/domain/dataState";
import {
  Briefcase,
  TrendingUp,
  Package,
  Building2,
  Sparkles,
  DollarSign,
  ShieldCheck,
  ShieldAlert,
  ShieldQuestion,
  type LucideIcon,
} from "lucide-react";

export const CATEGORY_META: Record<Category, { label: string; icon: LucideIcon; blurb: string }> = {
  business: { label: "Business", icon: Building2, blurb: "A local or regional business gap" },
  product: { label: "Product", icon: Package, blurb: "A product niche gaining demand" },
  job: { label: "Job", icon: Briefcase, blurb: "A role paying above market" },
  investment: { label: "Investment", icon: TrendingUp, blurb: "A market signal worth watching" },
  trend: { label: "Trend", icon: Sparkles, blurb: "Something shifting in the world" },
  income: { label: "Online Income", icon: DollarSign, blurb: "An online income avenue" },
};

export function tierClass(rating: ScoreBreakdown["rating"]) {
  if (rating === "high_signal")
    return {
      text: "text-tier-high",
      bg: "bg-tier-high-soft",
      ring: "ring-tier-high/30",
      label: "High signal",
    };
  if (rating === "moderate")
    return {
      text: "text-tier-mod",
      bg: "bg-tier-mod-soft",
      ring: "ring-tier-mod/30",
      label: "Moderate",
    };
  return {
    text: "text-tier-low",
    bg: "bg-tier-low-soft",
    ring: "ring-tier-low/30",
    label: "Low signal",
  };
}

export const VERIFICATION_META: Record<
  VerificationStatus,
  { icon: LucideIcon; label: string; text: string; bg: string }
> = {
  verified: {
    icon: ShieldCheck,
    label: "Verified",
    text: "text-state-verified",
    bg: "bg-state-verified-soft",
  },
  pending: {
    icon: ShieldQuestion,
    label: "Pending",
    text: "text-state-pending",
    bg: "bg-state-pending-soft",
  },
  unverified: {
    icon: ShieldAlert,
    label: "Unverified",
    text: "text-muted-foreground",
    bg: "bg-muted",
  },
};

export const DATA_STATE_STYLE: Record<DataState, { text: string; bg: string; dot: string }> = {
  sample: { text: "text-state-sample", bg: "bg-state-sample-soft", dot: "bg-state-sample" },
  live: { text: "text-state-live", bg: "bg-state-live-soft", dot: "bg-state-live" },
  pending: { text: "text-state-pending", bg: "bg-state-pending-soft", dot: "bg-state-pending" },
  verified: { text: "text-state-verified", bg: "bg-state-verified-soft", dot: "bg-state-verified" },
  stale: { text: "text-state-stale", bg: "bg-state-stale-soft", dot: "bg-state-stale" },
};

export function formatMoney(n: number): string {
  if (n === 0) return "$0";
  if (n >= 1000) return `$${(Math.round(n / 100) / 10).toString().replace(/\.0$/, "")}k`;
  return `$${n}`;
}

export function formatRange(range: { min: number; max: number }): string {
  if (range.min === 0 && range.max === 0) return "None";
  if (range.min === range.max) return formatMoney(range.min);
  return `${formatMoney(range.min)} – ${formatMoney(range.max)}`;
}

export function relativeDate(iso: string): string {
  const then = new Date(iso).getTime();
  if (Number.isNaN(then)) return iso;
  const diff = Date.now() - then;
  const days = Math.round(diff / 86_400_000);
  if (days <= 0) return "today";
  if (days === 1) return "1 day ago";
  if (days < 7) return `${days} days ago`;
  const weeks = Math.round(days / 7);
  if (weeks < 5) return `${weeks} wk ago`;
  const months = Math.round(days / 30);
  return `${months} mo ago`;
}
