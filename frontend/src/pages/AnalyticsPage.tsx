import { motion } from "framer-motion";
import { BarChart2, Flame, TrendingUp } from "lucide-react";
import { useState } from "react";
import {
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { useStats } from "@/hooks/useStats";
import { cn } from "@/lib/utils";

const COLORS = ["#8b5cf6", "#6366f1", "#3b82f6", "#06b6d4", "#10b981", "#f59e0b"];

// Custom styled tooltip that replaces the native browser title="" box
function HeatmapTooltip({ content, x, y }: { content: string; x: number; y: number }) {
  return (
    <div
      style={{ left: x + 12, top: y - 36 }}
      className="pointer-events-none absolute z-50 rounded-md border border-border bg-popover px-2.5 py-1.5 text-xs text-popover-foreground shadow-lg"
    >
      {content}
    </div>
  );
}

function HeatmapCalendar({ data }: { data: { date: string; count: number; hours: number }[] }) {
  const [tooltip, setTooltip] = useState<{ content: string; x: number; y: number } | null>(null);

  const maxCount = Math.max(1, ...data.map((d) => d.count));
  const weeks: typeof data[] = [];
  for (let i = 0; i < data.length; i += 7) {
    weeks.push(data.slice(i, i + 7));
  }

  return (
    <div className="relative overflow-x-auto">
      {tooltip && <HeatmapTooltip content={tooltip.content} x={tooltip.x} y={tooltip.y} />}
      <div className="inline-flex gap-1">
        {weeks.map((week, wi) => (
          <div key={wi} className="flex flex-col gap-1">
            {week.map((day) => (
              <div
                key={day.date}
                className={cn(
                  "h-3 w-3 cursor-default rounded-sm border border-border/30 transition-opacity hover:opacity-80",
                  day.count === 0 && "bg-muted/30",
                )}
                style={
                  day.count > 0
                    ? { backgroundColor: `hsl(263 70% 65% / ${0.2 + (day.count / maxCount) * 0.8})` }
                    : undefined
                }
                onMouseEnter={(e) => {
                  const rect = (e.currentTarget as HTMLElement).getBoundingClientRect();
                  const parent = (e.currentTarget as HTMLElement).closest(".relative")!.getBoundingClientRect();
                  setTooltip({
                    content: `${day.date}: ${day.count} entr${day.count === 1 ? "y" : "ies"}, ${day.hours}h`,
                    x: rect.left - parent.left,
                    y: rect.top - parent.top,
                  });
                }}
                onMouseLeave={() => setTooltip(null)}
              />
            ))}
          </div>
        ))}
      </div>
    </div>
  );
}

export default function AnalyticsPage() {
  const { data: stats, isLoading } = useStats();

  const topicData = stats?.hours_by_topic?.slice(0, 8) ?? [];
  const weeklyData =
    stats?.heatmap?.slice(-7).map((d) => ({
      name: new Date(d.date).toLocaleDateString(undefined, { weekday: "short" }),
      hours: d.hours,
    })) ?? [];

  const hasWeeklyData = weeklyData.some((d) => d.hours > 0);

  const chartTooltipStyle = {
    background: "hsl(var(--popover))",
    border: "1px solid hsl(var(--border))",
    borderRadius: "8px",
    color: "hsl(var(--popover-foreground))",
    fontSize: "12px",
    boxShadow: "0 4px 16px -4px hsl(var(--foreground) / 0.15)",
  };

  return (
    <div className="space-y-8 py-2">
      <div>
        <h2 className="text-2xl font-bold tracking-tight">Analytics</h2>
        <p className="text-muted-foreground">Insights into your learning habits.</p>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {[
          { label: "Current streak", value: stats?.current_streak, icon: Flame },
          { label: "Longest streak", value: stats?.longest_streak, icon: TrendingUp },
          { label: "Total hours", value: stats?.total_hours?.toFixed(1), icon: TrendingUp },
          { label: "Total entries", value: stats?.total_entries, icon: BarChart2 },
        ].map((s, i) => {
          const Icon = s.icon;
          return (
            <motion.div key={s.label} initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.05 }}>
              <Card className="border-border/60">
                <CardHeader className="flex flex-row items-center justify-between pb-2">
                  <CardTitle className="text-sm font-medium text-muted-foreground">{s.label}</CardTitle>
                  <Icon className="h-4 w-4 text-primary" />
                </CardHeader>
                <CardContent>
                  {isLoading ? <Skeleton className="h-8 w-16" /> : <p className="text-3xl font-bold">{s.value ?? 0}</p>}
                </CardContent>
              </Card>
            </motion.div>
          );
        })}
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <Card className="border-border/60">
          <CardHeader>
            <CardTitle>Study activity</CardTitle>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <Skeleton className="h-32 w-full" />
            ) : (
              <HeatmapCalendar data={stats?.heatmap ?? []} />
            )}
          </CardContent>
        </Card>

        <Card className="border-border/60">
          <CardHeader>
            <CardTitle>Weekly hours</CardTitle>
          </CardHeader>
          <CardContent className="h-64">
            {isLoading ? (
              <Skeleton className="h-full w-full" />
            ) : !hasWeeklyData ? (
              <div className="flex h-full flex-col items-center justify-center gap-2 text-center">
                <BarChart2 className="h-8 w-8 text-muted-foreground/40" />
                <p className="text-sm text-muted-foreground">No activity in the last 7 days.</p>
              </div>
            ) : (
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={weeklyData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" vertical={false} />
                  <XAxis dataKey="name" stroke="hsl(var(--muted-foreground))" fontSize={12} tickLine={false} axisLine={false} />
                  <YAxis stroke="hsl(var(--muted-foreground))" fontSize={12} tickLine={false} axisLine={false} />
                  <Tooltip
                    cursor={{ fill: "hsl(var(--muted) / 0.4)", radius: 4 }}
                    contentStyle={chartTooltipStyle}
                    labelStyle={{ color: "hsl(var(--muted-foreground))", marginBottom: "4px" }}
                  />
                  <Bar dataKey="hours" fill="hsl(var(--primary))" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            )}
          </CardContent>
        </Card>

        <Card className="border-border/60 lg:col-span-2">
          <CardHeader>
            <CardTitle>Hours by topic</CardTitle>
          </CardHeader>
          <CardContent className="h-72">
            {isLoading ? (
              <Skeleton className="h-full w-full" />
            ) : topicData.length === 0 ? (
              <p className="py-12 text-center text-muted-foreground">No topic data yet.</p>
            ) : (
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={topicData}
                    dataKey="hours"
                    nameKey="topic"
                    cx="50%"
                    cy="50%"
                    outerRadius={100}
                    label={({ topic, hours }) => `${topic} (${hours}h)`}
                  >
                    {topicData.map((_, i) => (
                      <Cell key={i} fill={COLORS[i % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip contentStyle={chartTooltipStyle} />
                </PieChart>
              </ResponsiveContainer>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
