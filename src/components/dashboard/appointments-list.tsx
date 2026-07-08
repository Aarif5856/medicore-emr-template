import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { cn } from "@/lib/utils";
import { TODAYS_APPOINTMENTS, type AppointmentStatus } from "@/data/dashboard";

const STATUS_STYLES: Record<AppointmentStatus, string> = {
  Confirmed: "bg-[color:var(--accent-teal)]/10 text-[color:var(--accent-teal)]",
  Pending: "bg-warning/10 text-warning",
  Cancelled: "bg-destructive/10 text-destructive",
};

function initials(name: string): string {
  return name
    .split(" ")
    .map((n) => n[0])
    .slice(0, 2)
    .join("")
    .toUpperCase();
}

export function AppointmentsList() {
  return (
    <Card className="card-glass h-full">
      <CardHeader className="pb-2">
        <CardTitle className="text-base">Today's Appointments</CardTitle>
        <p className="mt-0.5 text-xs text-muted-foreground">
          {TODAYS_APPOINTMENTS.length} scheduled
        </p>
      </CardHeader>
      <CardContent className="p-2">
        <ul className="divide-y divide-border">
          {TODAYS_APPOINTMENTS.map((a) => (
            <li
              key={a.id}
              className="flex items-center gap-3 rounded-md px-2 py-2.5 transition-colors hover:bg-muted/50"
            >
              <Avatar className="h-9 w-9">
                <AvatarFallback className="bg-primary/10 text-[11px] font-semibold text-primary">
                  {initials(a.patient)}
                </AvatarFallback>
              </Avatar>
              <div className="min-w-0 flex-1">
                <div className="truncate text-sm font-medium text-foreground">{a.patient}</div>
                <div className="truncate text-[11px] text-muted-foreground">{a.doctor}</div>
              </div>
              <span className="rounded-md border bg-background px-2 py-0.5 text-[11px] font-medium text-foreground tabular">
                {a.time}
              </span>
              <span
                className={cn(
                  "shrink-0 rounded-full px-2 py-0.5 text-[10px] font-semibold",
                  STATUS_STYLES[a.status],
                )}
              >
                {a.status}
              </span>
            </li>
          ))}
        </ul>
      </CardContent>
    </Card>
  );
}
