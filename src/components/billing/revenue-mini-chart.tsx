import {
  Area,
  AreaChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";

import { Card } from "@/components/ui/card";
import { REVENUE_TREND_6M } from "@/data/invoices";

interface TipItem {
  value?: number;
  payload?: { month: string };
}

function MiniTooltip({
  active,
  payload,
}: {
  active?: boolean;
  payload?: TipItem[];
}) {
  if (!active || !payload || payload.length === 0) return null;
  const p = payload[0]!;
  return (
    <div className="rounded-md border border-border bg-popover px-2.5 py-1.5 text-[11px] shadow-md">
      <div className="font-semibold text-foreground">{p.payload?.month}</div>
      <div className="text-muted-foreground tabular">${p.value}k revenue</div>
    </div>
  );
}

export function RevenueMiniChart() {
  const latest = REVENUE_TREND_6M[REVENUE_TREND_6M.length - 1]!.revenue;
  const first = REVENUE_TREND_6M[0]!.revenue;
  const growth = Math.round(((latest - first) / first) * 100);

  return (
    <Card className="card-glass p-4">
      <div className="flex items-start justify-between gap-3">
        <div>
          <div className="text-[11px] font-medium text-muted-foreground">
            Revenue Trend
          </div>
          <div className="mt-0.5 text-lg font-semibold text-foreground tabular">
            ${latest}k
            <span className="ml-2 text-[11px] font-medium text-[color:var(--accent-teal)]">
              +{growth}% · 6mo
            </span>
          </div>
        </div>
      </div>
      <div className="mt-2 h-[70px] w-full">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart
            data={REVENUE_TREND_6M}
            margin={{ top: 6, right: 4, left: 0, bottom: 0 }}
          >
            <defs>
              <linearGradient id="billingRev" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="var(--chart-1)" stopOpacity={0.35} />
                <stop offset="95%" stopColor="var(--chart-1)" stopOpacity={0} />
              </linearGradient>
            </defs>
            <XAxis dataKey="month" hide />
            <YAxis hide domain={["dataMin - 10", "dataMax + 10"]} />
            <Tooltip content={<MiniTooltip />} cursor={{ stroke: "var(--border)" }} />
            <Area
              type="monotone"
              dataKey="revenue"
              stroke="var(--chart-1)"
              strokeWidth={2}
              fill="url(#billingRev)"
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>
    </Card>
  );
}
