import { Cell, Pie, PieChart, ResponsiveContainer } from "recharts";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ChartSkeleton } from "@/components/ui/table-skeleton";
import { ErrorState } from "@/components/ui/error-state";
import { Skeleton } from "@/components/ui/skeleton";
import { useMockQuery } from "@/lib/mock-query";
import { AGE_GROUPS, GENDER_SPLIT } from "@/data/dashboard";

export function DemographicsCard() {
  const { data, isLoading, isError, refetch } = useMockQuery({
    gender: GENDER_SPLIT,
    ages: AGE_GROUPS,
  });
  const gender = data?.gender ?? [];
  const ages = data?.ages ?? [];
  const maxAge = Math.max(1, ...ages.map((g) => g.value));

  return (
    <Card className="card-glass h-full">
      <CardHeader className="pb-2">
        <CardTitle className="text-base">Patient Demographics</CardTitle>
        <p className="mt-0.5 text-xs text-muted-foreground">Gender &amp; age distribution</p>
      </CardHeader>
      <CardContent className="space-y-4">
        {isLoading ? (
          <>
            <ChartSkeleton height={120} />
            <div className="space-y-2">
              {Array.from({ length: 5 }).map((_, i) => (
                <Skeleton key={i} className="h-2.5 w-full" />
              ))}
            </div>
          </>
        ) : isError ? (
          <ErrorState compact title="Couldn't load demographics" onRetry={refetch} />
        ) : (
          <>
            <div className="flex items-center gap-4">
              <div className="relative h-[120px] w-[120px] shrink-0">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={gender}
                      dataKey="value"
                      nameKey="name"
                      cx="50%"
                      cy="50%"
                      innerRadius={38}
                      outerRadius={56}
                      paddingAngle={2}
                      stroke="var(--card)"
                      strokeWidth={2}
                    >
                      {gender.map((g) => (
                        <Cell key={g.name} fill={g.colorVar} />
                      ))}
                    </Pie>
                  </PieChart>
                </ResponsiveContainer>
              </div>
              <ul className="min-w-0 flex-1 space-y-1.5">
                {gender.map((g) => (
                  <li key={g.name} className="flex items-center gap-2 text-xs">
                    <span
                      className="h-2 w-2 shrink-0 rounded-full"
                      style={{ backgroundColor: g.colorVar }}
                      aria-hidden
                    />
                    <span className="flex-1 truncate text-foreground">{g.name}</span>
                    <span className="font-semibold text-foreground tabular">{g.value}%</span>
                  </li>
                ))}
              </ul>
            </div>

            <div>
              <div className="mb-2 text-[10px] font-semibold uppercase tracking-wide text-muted-foreground">
                Age groups
              </div>
              <ul className="space-y-2">
                {ages.map((g) => (
                  <li key={g.label} className="grid grid-cols-[3rem_1fr_2.25rem] items-center gap-2">
                    <span className="text-[11px] text-muted-foreground">{g.label}</span>
                    <div className="h-1.5 overflow-hidden rounded-full bg-muted">
                      <div
                        className="h-full rounded-full bg-primary"
                        style={{ width: `${(g.value / maxAge) * 100}%` }}
                      />
                    </div>
                    <span className="text-end text-[11px] font-semibold text-foreground tabular">
                      {g.value}%
                    </span>
                  </li>
                ))}
              </ul>
            </div>
          </>
        )}
      </CardContent>
    </Card>
  );
}
