import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { cn } from "@/lib/utils";
import { DOCTOR_AVAILABILITY, type DoctorStatus } from "@/data/dashboard";

const DOT_STYLES: Record<DoctorStatus, string> = {
  Available: "bg-[color:var(--accent-teal)] shadow-[0_0_0_3px_color-mix(in_oklab,var(--accent-teal)_25%,transparent)]",
  "In surgery": "bg-warning shadow-[0_0_0_3px_color-mix(in_oklab,var(--warning)_25%,transparent)]",
  Off: "bg-muted-foreground/50",
};

const TEXT_STYLES: Record<DoctorStatus, string> = {
  Available: "text-[color:var(--accent-teal)]",
  "In surgery": "text-warning",
  Off: "text-muted-foreground",
};

function initials(name: string): string {
  const parts = name.replace(/^Dr\.\s*/, "").split(" ");
  return parts
    .map((n) => n[0])
    .slice(0, 2)
    .join("")
    .toUpperCase();
}

export function DoctorAvailability() {
  return (
    <Card className="card-glass h-full">
      <CardHeader className="pb-2">
        <CardTitle className="text-base">Doctor Availability</CardTitle>
        <p className="mt-0.5 text-xs text-muted-foreground">On-shift roster · today</p>
      </CardHeader>
      <CardContent className="p-0">
        <div className="grid grid-cols-[minmax(0,1fr)_auto_auto] gap-x-4 gap-y-1 border-t px-4 py-2 text-[10px] font-semibold uppercase tracking-wide text-muted-foreground">
          <div>Doctor</div>
          <div className="hidden sm:block">Hours</div>
          <div className="text-end">Status</div>
        </div>
        <ul>
          {DOCTOR_AVAILABILITY.map((d) => (
            <li
              key={d.id}
              className="grid grid-cols-[minmax(0,1fr)_auto_auto] items-center gap-x-4 border-t px-4 py-3 transition-colors hover:bg-muted/50"
            >
              <div className="flex min-w-0 items-center gap-3">
                <Avatar className="h-8 w-8">
                  <AvatarFallback className="bg-primary/10 text-[11px] font-semibold text-primary">
                    {initials(d.name)}
                  </AvatarFallback>
                </Avatar>
                <div className="min-w-0">
                  <div className="truncate text-sm font-medium text-foreground">{d.name}</div>
                  <div className="truncate text-[11px] text-muted-foreground">{d.specialty}</div>
                </div>
              </div>
              <div className="hidden text-xs text-muted-foreground tabular sm:block">
                {d.hours}
              </div>
              <div className="flex items-center justify-end gap-2">
                <span className={cn("h-2 w-2 rounded-full", DOT_STYLES[d.status])} aria-hidden />
                <span className={cn("text-xs font-medium", TEXT_STYLES[d.status])}>
                  {d.status}
                </span>
              </div>
            </li>
          ))}
        </ul>
      </CardContent>
    </Card>
  );
}
