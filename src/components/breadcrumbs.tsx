import { Link, useRouterState } from "@tanstack/react-router";
import { ChevronRight, Home } from "lucide-react";

const LABELS: Record<string, string> = {
  dashboard: "Dashboard",
  patients: "Patients",
  doctors: "Doctors",
  appointments: "Appointments",
  laboratory: "Laboratory",
  pharmacy: "Pharmacy",
  billing: "Billing & Invoices",
  staff: "Staff",
  messages: "Messages",
  notifications: "Notifications",
  settings: "Settings",
};

function toLabel(seg: string): string {
  return LABELS[seg] ?? seg.charAt(0).toUpperCase() + seg.slice(1);
}

export function Breadcrumbs() {
  const pathname = useRouterState({ select: (r) => r.location.pathname });
  const segments = pathname.split("/").filter(Boolean);

  return (
    <nav aria-label="Breadcrumb" className="flex items-center gap-1.5 text-xs text-muted-foreground">
      <Link
        to="/dashboard"
        className="inline-flex items-center gap-1 rounded px-1 py-0.5 hover:text-foreground"
      >
        <Home className="h-3.5 w-3.5" />
      </Link>
      {segments.map((seg, i) => {
        const isLast = i === segments.length - 1;
        return (
          <div key={i} className="flex items-center gap-1.5">
            <ChevronRight className="h-3.5 w-3.5 opacity-60 rtl:rotate-180" />
            {isLast ? (
              <span className="font-medium text-foreground">{toLabel(seg)}</span>
            ) : (
              <span>{toLabel(seg)}</span>
            )}
          </div>
        );
      })}
    </nav>
  );
}
