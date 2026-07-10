import { ArrowDownRight, ArrowUpRight, Minus } from "lucide-react";
import { Area, AreaChart, ResponsiveContainer } from "recharts";

import { Card, CardContent } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import type { StatCardData } from "@/data/dashboard";

const TONE_MAP: Record<StatCardData["tone"], { bg: string; fg: string }> = {
  primary: { bg: "bg-primary/10", fg: "text-primary" },
  teal: { bg: "bg-[color:var(--accent-teal)]/10", fg: "text-[color:var(--accent-teal)]" },
  warning: { bg: "bg-warning/10", fg: "text-warning" },
  destructive: { bg: "bg-destructive/10", fg: "text-destructive" },
  neutral: { bg: "bg-muted", fg: "text-muted-foreground" },
};

export function StatCard({ data }: { data: StatCardData }) {
  const Icon = data.icon;
  const tone = TONE_MAP[data.tone];
  const trend = data.trend;
  const TrendIcon =
    trend?.direction === "up" ? ArrowUpRight : trend?.direction === "down" ? ArrowDownRight : Minus;
  const trendClass =
    trend?.direction === "up"
      ? "text-[color:var(--accent-teal)] bg-[color:var(--accent-teal)]/10"
      : trend?.direction === "down"
        ? "text-destructive bg-destructive/10"
        : "text-muted-foreground bg-muted";

  const spark = data.sparkline?.map((v, i) => ({ i, v }));

  return (
    <Card className="card-glass group relative overflow-hidden transition-all duration-200 hover:-translate-y-0.5 hover:shadow-md">
      <CardContent className="p-5">
        <div className="flex items-start justify-between gap-3">
          <div
            className={cn(
              "grid h-10 w-10 shrink-0 place-items-center rounded-lg",
              data.tone === "primary" && "glow-primary",
              tone.bg,
              tone.fg,
            )}
          >
            <Icon className="h-5 w-5" />
          </div>
          {trend && (
            <span
              className={cn(
                "inline-flex items-center gap-0.5 rounded-full px-2 py-0.5 text-[11px] font-semibold tabular",
                trendClass,
              )}
            >
              <TrendIcon className="h-3 w-3" />
              {trend.value}
            </span>
          )}
        </div>

        <div className="mt-4 space-y-1">
          <div className="text-xs font-medium text-muted-foreground">{data.label}</div>
          <div className="text-[28px] font-semibold leading-none tracking-tight text-foreground tabular">
            {data.value}
          </div>
          <div className="pt-1 text-[11px] text-muted-foreground">
            {trend ? trend.label : data.meta}
          </div>
        </div>

        {spark && data.sparkline && (
          <div
            className="pointer-events-none absolute inset-x-0 bottom-0 h-10 opacity-70"
            role="img"
            aria-label={`${data.label} trend, from ${data.sparkline[0]} to ${data.sparkline[data.sparkline.length - 1]} over ${data.sparkline.length} periods.`}
          >
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={spark} margin={{ top: 0, right: 0, left: 0, bottom: 0 }}>
                <defs>
                  <linearGradient id={`sp-${data.id}`} x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="var(--chart-2)" stopOpacity={0.5} />
                    <stop offset="100%" stopColor="var(--chart-2)" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <Area
                  type="monotone"
                  dataKey="v"
                  stroke="var(--chart-2)"
                  strokeWidth={1.5}
                  fill={`url(#sp-${data.id})`}
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
