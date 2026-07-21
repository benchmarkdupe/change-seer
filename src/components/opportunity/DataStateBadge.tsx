import type { DataState } from "@/domain/dataState";
import { DATA_STATE_LABEL } from "@/domain/dataState";
import { DATA_STATE_STYLE } from "./tokens";

export function DataStateBadge({ state, className = "" }: { state: DataState; className?: string }) {
  const s = DATA_STATE_STYLE[state];
  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-full px-2 py-0.5 text-[10px] font-medium uppercase tracking-wider ${s.bg} ${s.text} ${className}`}
    >
      <span className={`h-1.5 w-1.5 rounded-full ${s.dot}`} />
      {DATA_STATE_LABEL[state]}
    </span>
  );
}
