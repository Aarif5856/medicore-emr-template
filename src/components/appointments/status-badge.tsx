import { cn } from "@/lib/utils";
import type { AppointmentStatus } from "@/data/appointments";

interface StatusStyle {
  chip: string;
  leftBorder: string;
  dot: string;
  ring: string;
}

export const STATUS_STYLES: Record<AppointmentStatus, StatusStyle> = {
  Confirmed: {
    chip: "bg-[color:var(--accent-teal)]/12 text-[color:var(--accent-teal)]",
    leftBorder: "border-l-[color:var(--accent-teal)]",
    dot: "bg-[color:var(--accent-teal)]",
    ring: "ring-[color:var(--accent-teal)]/25",
  },
  Pending: {
    chip: "bg-warning/12 text-warning",
    leftBorder: "border-l-warning",
    dot: "bg-warning",
    ring: "ring-warning/25",
  },
  Cancelled: {
    chip: "bg-destructive/10 text-destructive",
    leftBorder: "border-l-destructive",
    dot: "bg-destructive",
    ring: "ring-destructive/25",
  },
  Completed: {
    chip: "bg-primary/10 text-primary",
    leftBorder: "border-l-primary",
    dot: "bg-primary",
    ring: "ring-primary/25",
  },
};

export function AppointmentStatusBadge({
  status,
  className,
}: {
  status: AppointmentStatus;
  className?: string;
}) {
  const s = STATUS_STYLES[status];
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 rounded-full px-2 py-0.5 text-[11px] font-semibold",
        s.chip,
        className,
      )}
    >
      <span className={cn("h-1.5 w-1.5 rounded-full", s.dot)} />
      {status}
    </span>
  );
}
