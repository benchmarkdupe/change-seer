import { Link } from "@tanstack/react-router";
import { Compass, Hammer, Wallet, Users, User, type LucideIcon } from "lucide-react";

const cls =
  "group flex flex-col items-center justify-center gap-1 py-2.5 text-[10px] font-medium uppercase tracking-wider text-muted-foreground transition-colors data-[status=active]:text-primary";
const iconCls = "h-[18px] w-[18px] transition-transform group-data-[status=active]:scale-110";

function TabIcon({ Icon }: { Icon: LucideIcon }) {
  return <Icon className={iconCls} strokeWidth={1.75} />;
}

export function MobileTabBar() {
  return (
    <nav
      className="sticky bottom-0 z-30 grid grid-cols-5 border-t border-border bg-surface-sunken/95 backdrop-blur supports-[backdrop-filter]:bg-surface-sunken/80"
      style={{ paddingBottom: "env(safe-area-inset-bottom)" }}
      aria-label="Primary"
    >
      <Link to="/" activeOptions={{ exact: true }} className={cls}>
        <TabIcon Icon={Compass} />
        <span>Discover</span>
      </Link>
      <Link to="/build" className={cls}>
        <TabIcon Icon={Hammer} />
        <span>Build</span>
      </Link>
      <Link to="/cashflow" className={cls}>
        <TabIcon Icon={Wallet} />
        <span>Cash Flow</span>
      </Link>
      <Link to="/community" className={cls}>
        <TabIcon Icon={Users} />
        <span>Community</span>
      </Link>
      <Link to="/profile" className={cls}>
        <TabIcon Icon={User} />
        <span>Profile</span>
      </Link>
    </nav>
  );
}
