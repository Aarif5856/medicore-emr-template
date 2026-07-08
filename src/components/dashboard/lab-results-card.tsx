import { FlaskConical } from "lucide-react";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import { LAB_RESULTS, type LabStatus } from "@/data/dashboard";

const STATUS_STYLES: Record<LabStatus, string> = {
  Normal: "bg-[color:var(--accent-teal)]/10 text-[color:var(--accent-teal)]",
  Abnormal: "bg-warning/10 text-warning",
  Critical: "bg-destructive/10 text-destructive",
};

export function LabResultsCard() {
  return (
    <Card className="card-glass h-full">
      <CardHeader className="pb-2">
        <CardTitle className="text-base">Recent Lab Results</CardTitle>
        <p className="mt-0.5 text-xs text-muted-foreground">Latest completed tests</p>
      </CardHeader>
      <CardContent className="p-2">
        <ul className="divide-y divide-border">
          {LAB_RESULTS.map((r) => (
            <li
              key={r.id}
              className="flex items-center gap-3 rounded-md px-2 py-2.5 transition-colors hover:bg-muted/50"
            >
              <div className="grid h-9 w-9 shrink-0 place-items-center rounded-md bg-primary/10 text-primary">
                <FlaskConical className="h-4 w-4" />
              </div>
              <div className="min-w-0 flex-1">
                <div className="truncate text-sm font-medium text-foreground">{r.test}</div>
                <div className="truncate text-[11px] text-muted-foreground">
                  {r.patient} · {r.when}
                </div>
              </div>
              <span
                className={cn(
                  "shrink-0 rounded-full px-2 py-0.5 text-[10px] font-semibold",
                  STATUS_STYLES[r.status],
                )}
              >
                {r.status}
              </span>
            </li>
          ))}
        </ul>
      </CardContent>
    </Card>
  );
}
