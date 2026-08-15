import { motion } from "framer-motion";
import { ArrowRight, BookOpen, Flame, MessageSquare, Plus, TrendingUp } from "lucide-react";
import { Link } from "react-router-dom";

import { EntryCard } from "@/components/entries/EntryCard";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { useEntriesInfinite } from "@/hooks/useEntries";
import { useStats } from "@/hooks/useStats";

const quickActions = [
  { to: "/entries", label: "New entry", icon: Plus, desc: "Log what you learned" },
  { to: "/ask", label: "Ask AI", icon: MessageSquare, desc: "Query your notes" },
  { to: "/analytics", label: "View stats", icon: TrendingUp, desc: "Track progress" },
];

export default function DashboardPage() {
  const { data: stats, isLoading: statsLoading } = useStats();
  const { data: entriesData, isLoading: entriesLoading } = useEntriesInfinite({});
  const recentEntries = entriesData?.pages[0]?.items.slice(0, 3) ?? [];

  const statCards = [
    { label: "Current streak", value: stats?.current_streak ?? 0, suffix: "days", icon: Flame },
    { label: "Total hours", value: stats?.total_hours?.toFixed(1) ?? "0", suffix: "hrs", icon: TrendingUp },
    { label: "Total entries", value: stats?.total_entries ?? 0, suffix: "", icon: BookOpen },
  ];

  return (
    <div className="space-y-8 py-2">
      <div>
        <h2 className="text-2xl font-bold tracking-tight">Dashboard</h2>
        <p className="text-muted-foreground">Your learning overview at a glance.</p>
      </div>

      <div className="grid gap-4 sm:grid-cols-3">
        {statCards.map((s, i) => {
          const Icon = s.icon;
          return (
            <motion.div key={s.label} initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.05 }}>
              <Card className="border-border/60">
                <CardHeader className="flex flex-row items-center justify-between pb-2">
                  <CardTitle className="text-sm font-medium text-muted-foreground">{s.label}</CardTitle>
                  <Icon className="h-4 w-4 text-primary" />
                </CardHeader>
                <CardContent>
                  {statsLoading ? (
                    <Skeleton className="h-8 w-16" />
                  ) : (
                    <p className="text-3xl font-bold">
                      {s.value}
                      {s.suffix && <span className="ml-1 text-sm font-normal text-muted-foreground">{s.suffix}</span>}
                    </p>
                  )}
                </CardContent>
              </Card>
            </motion.div>
          );
        })}
      </div>

      <div>
        <h3 className="mb-4 text-lg font-semibold">Quick actions</h3>
        <div className="grid gap-4 sm:grid-cols-3">
          {quickActions.map((a) => {
            const Icon = a.icon;
            return (
              <Link key={a.to} to={a.to}>
                <Card className="group cursor-pointer border-border/60 transition-all hover:border-primary/30 hover:shadow-md">
                  <CardContent className="flex items-center gap-4 p-6">
                    <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10 transition-colors group-hover:bg-primary/20">
                      <Icon className="h-5 w-5 text-primary" />
                    </div>
                    <div className="flex-1">
                      <p className="font-medium">{a.label}</p>
                      <p className="text-sm text-muted-foreground">{a.desc}</p>
                    </div>
                    <ArrowRight className="h-4 w-4 text-muted-foreground opacity-0 transition-opacity group-hover:opacity-100" />
                  </CardContent>
                </Card>
              </Link>
            );
          })}
        </div>
      </div>

      <div>
        <div className="mb-4 flex items-center justify-between">
          <h3 className="text-lg font-semibold">Recent entries</h3>
          <Button variant="ghost" size="sm" asChild>
            <Link to="/entries">View all</Link>
          </Button>
        </div>
        {entriesLoading ? (
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {Array.from({ length: 3 }).map((_, i) => (
              <Skeleton key={i} className="h-40 rounded-xl" />
            ))}
          </div>
        ) : recentEntries.length === 0 ? (
          <Card className="border-dashed">
            <CardContent className="flex flex-col items-center justify-center py-12 text-center">
              <BookOpen className="mb-3 h-10 w-10 text-muted-foreground" />
              <p className="font-medium">No entries yet</p>
              <p className="mb-4 text-sm text-muted-foreground">Start logging what you learn today.</p>
              <Button asChild>
                <Link to="/entries">Create first entry</Link>
              </Button>
            </CardContent>
          </Card>
        ) : (
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {recentEntries.map((entry, i) => (
              <EntryCard key={entry.id} entry={entry} onEdit={() => {}} onDelete={() => {}} index={i} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
