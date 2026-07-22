import type { LucideIcon } from "lucide-react";
import { AppShell } from "./AppShell";

export function StubPage({
  icon: Icon,
  eyebrow,
  title,
  intro,
  coming,
}: {
  icon: LucideIcon;
  eyebrow: string;
  title: string;
  intro: string;
  coming: string[];
}) {
  return (
    <AppShell>
      <div className="mx-auto max-w-2xl px-4 pb-8 pt-8">
        <div className="grid h-12 w-12 place-items-center rounded-2xl bg-primary-soft">
          <Icon className="h-6 w-6 text-primary" strokeWidth={1.75} />
        </div>
        <p className="mt-4 text-[10px] font-medium uppercase tracking-wider text-muted-foreground">
          {eyebrow}
        </p>
        <h1 className="mt-1 font-display text-[26px] font-semibold leading-tight tracking-tight">
          {title}
        </h1>
        <p className="mt-3 text-[14px] leading-relaxed text-foreground/85">{intro}</p>

        <div className="mt-6 rounded-2xl border border-border bg-card p-5">
          <p className="text-[10px] font-medium uppercase tracking-wider text-muted-foreground">
            Coming soon
          </p>
          <ul className="mt-3 space-y-2.5">
            {coming.map((c) => (
              <li key={c} className="flex gap-2.5 text-[14px] leading-relaxed text-foreground/90">
                <span className="mt-2 h-1 w-1 shrink-0 rounded-full bg-primary" />
                <span>{c}</span>
              </li>
            ))}
          </ul>
        </div>

        <p className="mt-6 text-[12px] leading-relaxed text-muted-foreground">
          OpportunityOS is being built in the open. This section is intentionally empty until the
          underlying data model is ready — no fake dashboards, no filler.
        </p>
      </div>
    </AppShell>
  );
}
