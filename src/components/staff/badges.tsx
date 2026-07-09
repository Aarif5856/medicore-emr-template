import { cn } from "@/lib/utils";
import type { Shift, StaffRole, StaffStatus } from "@/data/staff";

const ROLE_STYLES: Record<StaffRole, string> = {
  Doctor: "bg-primary/10 text-primary",
  Nurse: "bg-[color:var(--accent-teal)]/10 text-[color:var(--accent-teal)]",
  Admin: "bg-warning/10 text-warning",
  Support: "bg-muted text-muted-foreground",
};

export function RoleBadge({ role, className }: { role: StaffRole; className?: string }) {
  return (
    <span
      className={cn(
        "inline-flex items-center rounded-full px-2 py-0.5 text-[11px] font-semibold",
        ROLE_STYLES[role],
        className,
      )}
    >
      {role}
    </span>
  );
}

const STATUS_STYLES: Record<StaffStatus, string> = {
  Active: "bg-[color:var(--accent-teal)]/10 text-[color:var(--accent-teal)]",
  "On Leave": "bg-warning/10 text-warning",
  Inactive: "bg-muted text-muted-foreground",
};

export function StatusBadge({
  status,
  className,
}: {
  status: StaffStatus;
  className?: string;
}) {
  return (
    <span
      className={cn(
        "inline-flex items-center rounded-full px-2 py-0.5 text-[11px] font-semibold",
        STATUS_STYLES[status],
        className,
      )}
    >
      {status}
    </span>
  );
}

const SHIFT_DOT: Record<Shift, string> = {
  Morning: "bg-warning",
  Evening: "bg-primary",
  Night: "bg-[color:var(--accent-teal)]",
};

export function ShiftBadge({ shift, className }: { shift: Shift; className?: string }) {
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 rounded-md border bg-card px-1.5 py-0.5 text-[11px] font-medium text-foreground",
        className,
      )}
    >
      <span className={cn("h-1.5 w-1.5 rounded-full", SHIFT_DOT[shift])} />
      {shift}
    </span>
  );
}

export function AttendanceBadge({
  status,
}: {
  status: "Present" | "Late" | "Absent";
}) {
  const styles: Record<typeof status, string> = {
    Present: "bg-[color:var(--accent-teal)]/10 text-[color:var(--accent-teal)]",
    Late: "bg-warning/10 text-warning",
    Absent: "bg-destructive/10 text-destructive",
  };
  return (
    <span
      className={cn(
        "inline-flex items-center rounded-full px-2 py-0.5 text-[10px] font-semibold",
        styles[status],
      )}
    >
      {status}
    </span>
  );
}
