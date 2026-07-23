import { cn } from "@/lib/utils";
import {
  CATEGORY_STYLES,
  type LabCategory,
  type LabStatus,
  type ResultFlag,
} from "@/data/lab-tests";

const STATUS_STYLES: Record<LabStatus, string> = {
  Pending: "bg-warning/10 text-warning",
  "In Progress": "bg-primary/10 text-primary",
  Completed: "bg-[color:var(--accent-teal)]/10 text-[color:var(--accent-teal)]",
  Critical: "bg-destructive/10 text-destructive",
};

export function LabStatusBadge({ status, className }: { status: LabStatus; className?: string }) {
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

export function CategoryBadge({
  category,
  className,
}: {
  category: LabCategory;
  className?: string;
}) {
  const s = CATEGORY_STYLES[category];
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 rounded-md border bg-card px-1.5 py-0.5 text-[11px] font-medium text-foreground",
        className,
      )}
    >
      <span className={cn("h-1.5 w-1.5 rounded-full", s.dot)} />
      {category}
    </span>
  );
}

const FLAG_STYLES: Record<ResultFlag, string> = {
  Normal: "bg-[color:var(--accent-teal)]/10 text-[color:var(--accent-teal)]",
  High: "bg-destructive/10 text-destructive",
  Low: "bg-warning/10 text-warning",
};

export function FlagBadge({ flag }: { flag: ResultFlag }) {
  return (
    <span
      className={cn(
        "inline-flex items-center rounded-full px-2 py-0.5 text-[10px] font-semibold",
        FLAG_STYLES[flag],
      )}
    >
      {flag}
    </span>
  );
}

export function initialsFromName(name: string): string {
  const parts = name.trim().split(/\s+/);
  return `${parts[0]?.[0] ?? ""}${parts[1]?.[0] ?? ""}`.toUpperCase();
}

export function formatLabDate(iso: string): string {
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return iso;
  return d.toLocaleDateString("en-US", { year: "numeric", month: "short", day: "numeric" });
}

export function formatLabDateTime(iso: string): string {
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return iso;
  return d.toLocaleString("en-US", {
    year: "numeric",
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}
