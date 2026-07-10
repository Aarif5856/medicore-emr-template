import {
  Bar,
  BarChart,
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
import { useMockQuery } from "@/lib/mock-query";
import { REVENUE_BREAKDOWN } from "@/data/dashboard";

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
  const total = payload.reduce((s, p) => s + (p.value ?? 0), 0);
  return (
    <div className="rounded-md border border-border bg-popover px-3 py-2 text-xs shadow-md">
      <div className="mb-1 flex items-center justify-between gap-4">
        <span className="font-semibold text-foreground">{label}</span>
        <span className="text-muted-foreground tabular">${total}k</span>
      </div>
      <div className="space-y-1">
        {payload.map((p, i) => (
          <div key={i} className="flex items-center gap-2 text-muted-foreground">
            <span
              className="h-2 w-2 rounded-full"
              style={{ backgroundColor: p.color }}
              aria-hidden
            />
            <span className="flex-1">{p.name}</span>
            <span className="font-semibold text-foreground tabular">${p.value}k</span>
          </div>
        ))}
      </div>
    </div>
  );
}

export function RevenueChart() {
  const { data, isLoading, isError, refetch } = useMockQuery(REVENUE_BREAKDOWN);

  return (
    <Card className="card-glass h-full">
      <CardHeader className="pb-2">
        <CardTitle className="text-base">Revenue Breakdown</CardTitle>
        <p className="mt-0.5 text-xs text-muted-foreground">By service line · last 6 months</p>
      </CardHeader>
      <CardContent className="ps-2">
        {isLoading ? (
          <ChartSkeleton height={280} />
        ) : isError || !data ? (
          <div className="h-[280px]">
            <ErrorState title="Couldn't load revenue" onRetry={refetch} />
          </div>
        ) : (() => {
          const last = data[data.length - 1];
          const lastTotal = last.consultations + last.procedures + last.pharmacy + last.lab;
          const summary = `Revenue breakdown by service line for the last 6 months. Latest month ${last.month}: $${lastTotal}k total (procedures $${last.procedures}k, consultations $${last.consultations}k, pharmacy $${last.pharmacy}k, lab $${last.lab}k).`;
          return (
        <figure className="m-0 h-[280px] w-full" role="img" aria-label={summary}>
          <figcaption className="sr-only">{summary}</figcaption>
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={data} margin={{ top: 10, right: 12, left: 0, bottom: 0 }}>
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
                width={40}
                tickFormatter={(v: number) => `$${v}k`}
              />
              <Tooltip
                content={<ChartTooltip />}
                cursor={{ fill: "var(--muted)", opacity: 0.4 }}
              />
              <Legend
                verticalAlign="top"
                height={28}
                iconType="circle"
                iconSize={8}
                wrapperStyle={{ fontSize: 12, color: "var(--muted-foreground)" }}
              />
              <Bar
                dataKey="consultations"
                name="Consultations"
                stackId="rev"
                fill="var(--chart-5)"
                radius={[0, 0, 0, 0]}
              />
              <Bar
                dataKey="procedures"
                name="Procedures"
                stackId="rev"
                fill="var(--chart-2)"
              />
              <Bar dataKey="pharmacy" name="Pharmacy" stackId="rev" fill="var(--chart-3)" />
              <Bar
                dataKey="lab"
                name="Lab"
                stackId="rev"
                fill="var(--chart-4)"
                radius={[6, 6, 0, 0]}
              />
            </BarChart>
          </ResponsiveContainer>
        </figure>
          );
        })()}
      </CardContent>
    </Card>
  );
}
