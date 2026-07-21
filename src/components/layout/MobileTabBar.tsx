import { Link } from "@tanstack/react-router";
import { Compass, Hammer, Wallet, Users, User } from "lucide-react";

type Tab = { to: string; label: string; icon: typeof Compass; exact?: boolean };
const TABS: Tab[] = [
  { to: "/", label: "Discover", icon: Compass, exact: true },
  { to: "/build", label: "Build", icon: Hammer },
  { to: "/cashflow", label: "Cash Flow", icon: Wallet },
  { to: "/community", label: "Community", icon: Users },
  { to: "/profile", label: "Profile", icon: User },
];

export function MobileTabBar() {
  return (
    <nav
      className="sticky bottom-0 z-30 grid grid-cols-5 border-t border-border bg-surface-sunken/95 backdrop-blur supports-[backdrop-filter]:bg-surface-sunken/80"
      style={{ paddingBottom: "env(safe-area-inset-bottom)" }}
      aria-label="Primary"
    >
      {TABS.map(({ to, label, icon: Icon, exact }) => (
        <Link
          key={to}
          to={to}
          activeOptions={{ exact: !!exact }}
          className="group flex flex-col items-center justify-center gap-1 py-2.5 text-[10px] font-medium uppercase tracking-wider text-muted-foreground transition-colors data-[status=active]:text-primary"
        >
          <Icon className="h-[18px] w-[18px] transition-transform group-data-[status=active]:scale-110" strokeWidth={1.75} />
          <span>{label}</span>
        </Link>
      ))}
    </nav>
  );
}
