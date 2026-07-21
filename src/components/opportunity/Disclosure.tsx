import { useState, type ReactNode } from "react";
import { ChevronDown } from "lucide-react";

export function Disclosure({
  title,
  subtitle,
  children,
  defaultOpen = false,
}: {
  title: string;
  subtitle?: string;
  children: ReactNode;
  defaultOpen?: boolean;
}) {
  const [open, setOpen] = useState(defaultOpen);
  return (
    <section className="overflow-hidden rounded-2xl border border-border bg-card">
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        className="flex w-full items-center justify-between gap-3 px-4 py-3 text-left"
        aria-expanded={open}
      >
        <div className="min-w-0">
          <h3 className="font-display text-[15px] font-semibold text-foreground">{title}</h3>
          {subtitle && <p className="mt-0.5 text-[12px] text-muted-foreground">{subtitle}</p>}
        </div>
        <ChevronDown
          className={`h-4 w-4 shrink-0 text-muted-foreground transition-transform ${open ? "rotate-180" : ""}`}
        />
      </button>
      {open && <div className="border-t border-border-soft px-4 py-4">{children}</div>}
    </section>
  );
}
