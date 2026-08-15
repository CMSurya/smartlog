import { AnimatePresence, motion } from "framer-motion";
import {
  BarChart3,
  BookOpen,
  ChevronLeft,
  LayoutDashboard,
  LogOut,
  MessageSquare,
  Moon,
  Settings,
  Sparkles,
  Sun,
} from "lucide-react";
import { useTheme } from "next-themes";
import { NavLink, useNavigate } from "react-router-dom";

import { UserAvatar } from "@/components/layout/UserAvatar";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useLogout } from "@/hooks/useAuth";
import { cn } from "@/lib/utils";
import { useAuthStore } from "@/store/auth-store";
import { useSettingsStore } from "@/store/settings-store";

const mainNav = [
  { to: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
  { to: "/entries", label: "Entries", icon: BookOpen },
  { to: "/ask", label: "AI Assistant", icon: MessageSquare },
  { to: "/analytics", label: "Analytics", icon: BarChart3 },
];

const secondaryNav = [{ to: "/settings", label: "Settings", icon: Settings }];

interface SidebarProps {
  collapsed: boolean;
  onToggle: () => void;
  mobile?: boolean;
  onNavigate?: () => void;
}

export function Sidebar({ collapsed, onToggle, mobile, onNavigate }: SidebarProps) {
  const user = useAuthStore((s) => s.user);
  const profile = useSettingsStore((s) => s.profile);
  const logout = useLogout();
  const navigate = useNavigate();
  const { theme, setTheme } = useTheme();

  const displayName = profile.displayName || user?.email?.split("@")[0] || "User";

  const linkClass = ({ isActive }: { isActive: boolean }) =>
    cn(
      "group flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-all",
      isActive
        ? "bg-primary/10 text-primary"
        : "text-muted-foreground hover:bg-accent hover:text-foreground",
      collapsed && !mobile && "justify-center px-2",
    );

  return (
    <aside
      className={cn(
        "flex h-full flex-col border-r border-border bg-card/50 backdrop-blur-xl",
        mobile ? "w-full" : collapsed ? "w-[72px]" : "w-64",
      )}
    >
      <div className={cn("flex h-16 items-center gap-2 px-4", collapsed && !mobile && "justify-center px-2")}>
        <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-primary/15">
          <Sparkles className="h-5 w-5 text-primary" />
        </div>
        {(!collapsed || mobile) && (
          <span className="text-lg font-semibold tracking-tight">SmartLog</span>
        )}
        {!mobile && (
          <Button variant="ghost" size="icon" className={cn("ml-auto", collapsed && "ml-0")} onClick={onToggle}>
            <ChevronLeft className={cn("h-4 w-4 transition-transform", collapsed && "rotate-180")} />
          </Button>
        )}
      </div>

      <nav className="flex-1 space-y-6 overflow-y-auto px-3 py-4">
        <div className="space-y-1">
          {(!collapsed || mobile) && (
            <p className="mb-2 px-3 text-xs font-medium uppercase tracking-wider text-muted-foreground">Main</p>
          )}
          {mainNav.map(({ to, label, icon: Icon }) => (
            <NavLink key={to} to={to} className={linkClass} onClick={onNavigate}>
              <Icon className="h-4 w-4 shrink-0" />
              {(!collapsed || mobile) && <span>{label}</span>}
            </NavLink>
          ))}
        </div>

        <div className="space-y-1">
          {(!collapsed || mobile) && (
            <p className="mb-2 px-3 text-xs font-medium uppercase tracking-wider text-muted-foreground">Account</p>
          )}
          {secondaryNav.map(({ to, label, icon: Icon }) => (
            <NavLink key={to} to={to} className={linkClass} onClick={onNavigate}>
              <Icon className="h-4 w-4 shrink-0" />
              {(!collapsed || mobile) && <span>{label}</span>}
            </NavLink>
          ))}
        </div>
      </nav>

      <div className="mt-auto border-t border-border p-3">
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <button
              className={cn(
                "flex w-full items-center gap-3 rounded-lg p-2 text-left transition-colors hover:bg-accent",
                collapsed && !mobile && "justify-center",
              )}
            >
              <UserAvatar size="sm" />
              {(!collapsed || mobile) && (
                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm font-medium">{displayName}</p>
                  <p className="truncate text-xs text-muted-foreground">{user?.email}</p>
                </div>
              )}
            </button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="start" side="top" className="w-56">
            <DropdownMenuLabel>My account</DropdownMenuLabel>
            <DropdownMenuSeparator />
            <DropdownMenuItem onClick={() => navigate("/settings")}>
              <Settings className="mr-2 h-4 w-4" /> Settings
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => setTheme(theme === "dark" ? "light" : "dark")}>
              {theme === "dark" ? <Sun className="mr-2 h-4 w-4" /> : <Moon className="mr-2 h-4 w-4" />}
              Toggle theme
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem onClick={logout} className="text-red-500 focus:text-red-500">
              <LogOut className="mr-2 h-4 w-4" /> Sign out
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </aside>
  );
}

export function MobileSidebar({ open, onClose }: { open: boolean; onClose: () => void }) {
  return (
    <AnimatePresence>
      {open && (
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-40 bg-black/50 backdrop-blur-sm lg:hidden"
            onClick={onClose}
          />
          <motion.div
            initial={{ x: -280 }}
            animate={{ x: 0 }}
            exit={{ x: -280 }}
            transition={{ type: "spring", damping: 25, stiffness: 300 }}
            className="fixed inset-y-0 left-0 z-50 w-72 lg:hidden"
          >
            <Sidebar collapsed={false} onToggle={() => {}} mobile onNavigate={onClose} />
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
