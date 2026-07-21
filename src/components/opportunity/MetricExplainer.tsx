import { useState, type ReactNode } from "react";
import { Info, X } from "lucide-react";

/**
 * Layered information cell.
 *
 * Layer 1 — the number + one-line answer (always visible).
 * Layer 2 — plain-English "what this actually means" (tap the info icon).
 *
 * Consumers pass an explainer string; the sheet never invents new content.
 */
export function MetricExplainer({
  label,
  value,
  explainer,
  tone = "default",
}: {
  label: string;
  value: ReactNode;
  explainer: string;
  tone?: "default" | "high" | "mod" | "low";
}) {
  const [open, setOpen] = useState(false);
  const toneClass =
    tone === "high"
      ? "text-tier-high"
      : tone === "mod"
      ? "text-tier-mod"
      : tone === "low"
      ? "text-tier-low"
      : "text-foreground";

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        className="group flex w-full flex-col items-start gap-1 rounded-xl border border-border-soft bg-surface-sunken/60 p-3 text-left transition-colors hover:border-border"
        aria-label={`Explain ${label}`}
      >
        <span className="flex items-center gap-1 text-[10px] font-medium uppercase tracking-wider text-muted-foreground">
          {label}
          <Info className="h-3 w-3 opacity-60 transition-opacity group-hover:opacity-100" />
        </span>
        <span className={`font-mono text-lg font-semibold ${toneClass}`}>{value}</span>
      </button>
      {open && (
        <div
          role="dialog"
          aria-modal="true"
          className="fixed inset-0 z-50 flex items-end justify-center bg-background/70 backdrop-blur-sm"
          onClick={() => setOpen(false)}
        >
          <div
            onClick={(e) => e.stopPropagation()}
            className="w-full max-w-lg rounded-t-3xl border-t border-x border-border bg-surface-raised p-5 pb-8"
            style={{ paddingBottom: "max(2rem, env(safe-area-inset-bottom))" }}
          >
            <div className="mx-auto mb-4 h-1 w-10 rounded-full bg-border" />
            <div className="flex items-start justify-between gap-3">
              <div>
                <p className="text-[10px] font-medium uppercase tracking-wider text-muted-foreground">
                  What this means
                </p>
                <h4 className="mt-1 font-display text-lg font-semibold text-foreground">{label}</h4>
              </div>
              <button
                type="button"
                onClick={() => setOpen(false)}
                className="rounded-full p-1.5 text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
                aria-label="Close"
              >
                <X className="h-4 w-4" />
              </button>
            </div>
            <p className="mt-3 text-[14px] leading-relaxed text-foreground/85">{explainer}</p>
          </div>
        </div>
      )}
    </>
  );
}
