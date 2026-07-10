import { useState } from "react";
import {
  Area,
  AreaChart,
  CartesianGrid,
  Legend,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ChartSkeleton } from "@/components/ui/table-skeleton";
import { ErrorState } from "@/components/ui/error-state";
import { cn } from "@/lib/utils";
import { useMockQuery } from "@/lib/mock-query";
import { VISITS_BY_RANGE, VISITS_RANGES, VISITS_RANGE_UNIT, type VisitsRange } from "@/data/dashboard";

interface TooltipItem {
  name?: string;
  value?: number;
  color?: string;
}

function ChartTooltip({
  active,
  payload,
  label,
}: {
  active?: boolean;
  payload?: TooltipItem[];
  label?: string | number;
}) {
  if (!active || !payload || payload.length === 0) return null;
  return (
    <div className="rounded-md border border-border bg-popover px-3 py-2 text-xs shadow-md">
      <div className="mb-1 font-semibold text-foreground">{label}</div>
      <div className="space-y-1">
        {payload.map((p, i) => (
          <div key={i} className="flex items-center gap-2 text-muted-foreground">
            <span
              className="h-2 w-2 rounded-full"
              style={{ backgroundColor: p.color }}
              aria-hidden
            />
            <span className="flex-1">{p.name}</span>
            <span className="font-semibold text-foreground tabular">{p.value}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

export function VisitsChart() {
  const [range, setRange] = useState<VisitsRange>("Monthly");
  const { data, isLoading, isError, refetch } = useMockQuery(VISITS_MONTHLY);

  return (
    <Card className="card-glass h-full">
      <CardHeader className="grid grid-cols-[minmax(0,1fr)_auto] items-center gap-3 pb-2 sm:flex sm:flex-wrap sm:items-center sm:justify-between">
        <div className="min-w-0">
          <CardTitle className="text-base">Patient Visits Overview</CardTitle>
          <p className="mt-0.5 text-xs text-muted-foreground">
            In-patient vs Out-patient · last 12 months
          </p>
        </div>
        <div className="inline-flex shrink-0 items-center rounded-md border bg-muted/50 p-0.5">
          {VISITS_RANGES.map((r) => (
            <button
              key={r}
              type="button"
              onClick={() => setRange(r)}
              className={cn(
                "rounded-[5px] px-3 py-1 text-xs font-medium transition-colors",
                range === r
                  ? "bg-background text-foreground shadow-sm"
                  : "text-muted-foreground hover:text-foreground",
              )}
            >
              {r}
            </button>
          ))}
        </div>
      </CardHeader>
      <CardContent className="ps-2">
        {isLoading ? (
          <ChartSkeleton height={280} />
        ) : isError || !data ? (
          <div className="h-[280px]">
            <ErrorState title="Couldn't load visits" onRetry={refetch} />
          </div>
        ) : (() => {
          const last = data[data.length - 1];
          const first = data[0];
          const summary = `Patient visits over the last 12 months. In-patient rose from ${first.inPatient} in ${first.month} to ${last.inPatient} in ${last.month}. Out-patient rose from ${first.outPatient} to ${last.outPatient}.`;
          return (
        <figure className="m-0 h-[280px] w-full" role="img" aria-label={summary}>
          <figcaption className="sr-only">{summary}</figcaption>
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={data} margin={{ top: 10, right: 12, left: 0, bottom: 0 }}>
              <defs>
                <linearGradient id="visits-in" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="var(--chart-2)" stopOpacity={0.35} />
                  <stop offset="100%" stopColor="var(--chart-2)" stopOpacity={0} />
                </linearGradient>
                <linearGradient id="visits-out" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="var(--muted-foreground)" stopOpacity={0.25} />
                  <stop offset="100%" stopColor="var(--muted-foreground)" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" vertical={false} />
              <XAxis
                dataKey="month"
                stroke="var(--muted-foreground)"
                fontSize={11}
                tickLine={false}
                axisLine={false}
              />
              <YAxis
                stroke="var(--muted-foreground)"
                fontSize={11}
                tickLine={false}
                axisLine={false}
                width={36}
              />
              <Tooltip content={<ChartTooltip />} cursor={{ stroke: "var(--border)" }} />
              <Legend
                verticalAlign="top"
                height={28}
                iconType="circle"
                iconSize={8}
                wrapperStyle={{ fontSize: 12, color: "var(--muted-foreground)" }}
              />
              <Area
                type="monotone"
                name="Out-patient"
                dataKey="outPatient"
                stroke="var(--muted-foreground)"
                strokeWidth={2}
                fill="url(#visits-out)"
              />
              <Area
                type="monotone"
                name="In-patient"
                dataKey="inPatient"
                stroke="var(--chart-2)"
                strokeWidth={2}
                fill="url(#visits-in)"
              />
            </AreaChart>
          </ResponsiveContainer>
        </figure>
          );
        })()}
      </CardContent>
    </Card>
  );
}
