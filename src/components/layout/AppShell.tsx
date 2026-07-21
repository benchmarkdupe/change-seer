import type { ReactNode } from "react";
import { MobileTabBar } from "./MobileTabBar";

export function AppShell({ children }: { children: ReactNode }) {
  return (
    <div className="flex min-h-full flex-col bg-background text-foreground grain">
      <main className="flex-1 pb-2">{children}</main>
      <MobileTabBar />
    </div>
  );
}
