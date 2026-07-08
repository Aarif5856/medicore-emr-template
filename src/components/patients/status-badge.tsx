import { cn } from "@/lib/utils";
import type { PatientStatus } from "@/data/patients";

const STYLES: Record<PatientStatus, string> = {
  Stable: "bg-[color:var(--accent-teal)]/10 text-[color:var(--accent-teal)]",
  "Under Treatment": "bg-primary/10 text-primary",
  Critical: "bg-destructive/10 text-destructive",
  Discharged: "bg-muted text-muted-foreground",
};

export function PatientStatusBadge({
  status,
  className,
}: {
  status: PatientStatus;
  className?: string;
}) {
  return (
    <span
      className={cn(
        "inline-flex items-center rounded-full px-2 py-0.5 text-[11px] font-semibold",
        STYLES[status],
        className,
      )}
    >
      {status}
    </span>
  );
}

export function initials(first: string, last: string): string {
  return `${first[0] ?? ""}${last[0] ?? ""}`.toUpperCase();
}

export function formatDate(iso: string): string {
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return iso;
  return d.toLocaleDateString("en-US", { year: "numeric", month: "short", day: "numeric" });
}
