import { Menu } from "lucide-react";
import { useState } from "react";
import { Outlet, useLocation } from "react-router-dom";
import { AnimatePresence } from "framer-motion";

import { PageTransition } from "@/components/common/PageTransition";
import { MobileSidebar, Sidebar } from "@/components/layout/Sidebar";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

const titles: Record<string, string> = {
  "/dashboard": "Dashboard",
  "/entries": "Entries",
  "/ask": "AI Assistant",
  "/analytics": "Analytics",
  "/settings": "Settings",
};

export function DashboardLayout() {
  const [collapsed, setCollapsed] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const { pathname } = useLocation();
  const isAsk = pathname === "/ask";

  return (
    <div className="flex h-screen overflow-hidden bg-background gradient-mesh">
      <div className="hidden lg:block">
        <Sidebar collapsed={collapsed} onToggle={() => setCollapsed((c) => !c)} />
      </div>
      <MobileSidebar open={mobileOpen} onClose={() => setMobileOpen(false)} />

      <div className="flex min-w-0 flex-1 flex-col">
        <header className="flex h-16 shrink-0 items-center gap-4 border-b border-border/60 bg-background/80 px-4 backdrop-blur-xl lg:px-6">
          <Button variant="ghost" size="icon" className="lg:hidden" onClick={() => setMobileOpen(true)}>
            <Menu className="h-5 w-5" />
          </Button>
          <h1 className="text-lg font-semibold tracking-tight">{titles[pathname] ?? "SmartLog"}</h1>
        </header>

        <main className={cn("flex-1 overflow-hidden", !isAsk && "overflow-y-auto")}>
          <AnimatePresence mode="wait">
            <PageTransition key={pathname} className={cn("h-full", !isAsk && "page-container")}>
              <Outlet />
            </PageTransition>
          </AnimatePresence>
        </main>
      </div>
    </div>
  );
}
