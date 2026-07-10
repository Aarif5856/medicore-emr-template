import { Cell, Pie, PieChart, ResponsiveContainer } from "recharts";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ChartSkeleton } from "@/components/ui/table-skeleton";
import { ErrorState } from "@/components/ui/error-state";
import { useMockQuery } from "@/lib/mock-query";
import { DEPARTMENTS } from "@/data/dashboard";

export function DepartmentChart() {
  const { data, isLoading, isError, refetch } = useMockQuery(DEPARTMENTS);
  const items = data ?? [];
  const total = items.reduce((s, d) => s + d.count, 0);

  return (
    <Card className="card-glass h-full">
      <CardHeader className="pb-2">
        <CardTitle className="text-base">Appointments by Department</CardTitle>
        <p className="mt-0.5 text-xs text-muted-foreground">
          This week · {isLoading ? "loading" : `${total} total`}
        </p>
      </CardHeader>
      <CardContent>
        {isLoading ? (
          <ChartSkeleton height={180} />
        ) : isError ? (
          <div className="h-[180px]">
            <ErrorState compact title="Couldn't load departments" onRetry={refetch} />
          </div>
        ) : (
          <>
            <div className="relative h-[180px] w-full">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={items}
                    dataKey="value"
                    nameKey="name"
                    cx="50%"
                    cy="50%"
                    innerRadius={54}
                    outerRadius={78}
                    paddingAngle={2}
                    stroke="var(--card)"
                    strokeWidth={2}
                  >
                    {items.map((d) => (
                      <Cell key={d.name} fill={d.colorVar} />
                    ))}
                  </Pie>
                </PieChart>
              </ResponsiveContainer>
              <div className="pointer-events-none absolute inset-0 grid place-items-center text-center">
                <div>
                  <div className="text-[22px] font-semibold leading-none text-foreground tabular">
                    {total}
                  </div>
                  <div className="mt-1 text-[10px] uppercase tracking-wide text-muted-foreground">
                    visits
                  </div>
                </div>
              </div>
            </div>

            <ul className="mt-4 space-y-2">
              {items.map((d) => (
                <li key={d.name} className="flex items-center gap-2.5 text-xs">
                  <span
                    className="h-2 w-2 shrink-0 rounded-full"
                    style={{ backgroundColor: d.colorVar }}
                    aria-hidden
                  />
                  <span className="flex-1 truncate text-foreground" title={d.name}>
                    {d.name}
                  </span>
                  <span className="text-muted-foreground tabular">{d.count}</span>
                  <span className="w-10 text-end font-semibold text-foreground tabular">
                    {d.value}%
                  </span>
                </li>
              ))}
            </ul>
          </>
        )}
      </CardContent>
    </Card>
  );
}
