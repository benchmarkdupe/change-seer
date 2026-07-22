import type { VerificationStatus } from "@/domain/types/opportunity";
import { VERIFICATION_META } from "./tokens";

export function VerificationBadge({ status }: { status: VerificationStatus }) {
  const meta = VERIFICATION_META[status];
  const Icon = meta.icon;
  return (
    <span
      className={`inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[10px] font-medium uppercase tracking-wider ${meta.bg} ${meta.text}`}
    >
      <Icon className="h-3 w-3" strokeWidth={2} />
      {meta.label}
    </span>
  );
}
