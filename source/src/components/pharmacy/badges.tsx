import { cn } from "@/lib/utils";
import { CATEGORY_DOT, type MedicineCategory } from "@/data/pharmacy";
import type { PrescriptionStatus } from "@/data/prescriptions";

export function CategoryBadge({
  category,
  className,
}: {
  category: MedicineCategory;
  className?: string;
}) {
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 rounded-md border bg-card px-1.5 py-0.5 text-[11px] font-medium text-foreground",
        className,
      )}
    >
      <span className={cn("h-1.5 w-1.5 rounded-full", CATEGORY_DOT[category])} />
      {category}
    </span>
  );
}

const RX_STATUS_STYLES: Record<PrescriptionStatus, string> = {
  Pending: "bg-warning/10 text-warning",
  "Partially Dispensed": "bg-primary/10 text-primary",
  Dispensed: "bg-[color:var(--accent-teal)]/10 text-[color:var(--accent-teal)]",
  Cancelled: "bg-destructive/10 text-destructive",
};

export function PrescriptionStatusBadge({
  status,
  className,
}: {
  status: PrescriptionStatus;
  className?: string;
}) {
  return (
    <span
      className={cn(
        "inline-flex items-center rounded-full px-2 py-0.5 text-[11px] font-semibold",
        RX_STATUS_STYLES[status],
        className,
      )}
    >
      {status}
    </span>
  );
}

export function StockBar({ qty, threshold }: { qty: number; threshold: number }) {
  const denom = Math.max(threshold * 2, 1);
  const pct = Math.min(100, Math.round((qty / denom) * 100));
  const level = qty <= 0 ? "out" : qty < threshold ? "low" : "healthy";
  const bar =
    level === "out"
      ? "bg-destructive"
      : level === "low"
        ? "bg-warning"
        : "bg-[color:var(--accent-teal)]";
  const text =
    level === "out" ? "text-destructive" : level === "low" ? "text-warning" : "text-foreground";
  return (
    <div className="min-w-[110px]">
      <div className={cn("text-sm font-medium tabular", text)}>{qty.toLocaleString()}</div>
      <div className="mt-1 h-1.5 w-full overflow-hidden rounded-full bg-muted">
        <div
          className={cn("h-full rounded-full transition-all", bar)}
          style={{ width: `${Math.max(pct, qty > 0 ? 6 : 0)}%` }}
        />
      </div>
      <div className="mt-0.5 text-[10px] text-muted-foreground tabular">Reorder ≤ {threshold}</div>
    </div>
  );
}

export function initialsFromName(name: string): string {
  const parts = name.trim().split(/\s+/);
  return `${parts[0]?.[0] ?? ""}${parts[1]?.[0] ?? ""}`.toUpperCase();
}
