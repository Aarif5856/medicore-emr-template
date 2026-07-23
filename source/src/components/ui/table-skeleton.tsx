import { Skeleton } from "@/components/ui/skeleton";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { cn } from "@/lib/utils";

export interface TableSkeletonProps {
  /** Column widths — accepts any Tailwind width class (e.g. "w-24", "w-full"). */
  columns: string[];
  rows?: number;
  showHeader?: boolean;
  className?: string;
}

/**
 * TableSkeleton — mirrors the wrapping table shell so the loading state
 * matches the final layout shape instead of a generic spinner.
 */
export function TableSkeleton({
  columns,
  rows = 8,
  showHeader = true,
  className,
}: TableSkeletonProps) {
  return (
    <div className={cn("overflow-hidden rounded-lg border bg-card", className)} aria-hidden>
      <div className="overflow-x-auto">
        <Table>
          {showHeader ? (
            <TableHeader>
              <TableRow className="border-b bg-muted/40 hover:bg-muted/40">
                {columns.map((w, i) => (
                  <TableHead key={i} className="h-10">
                    <Skeleton className={cn("h-3", w)} />
                  </TableHead>
                ))}
              </TableRow>
            </TableHeader>
          ) : null}
          <TableBody>
            {Array.from({ length: rows }).map((_, r) => (
              <TableRow key={r}>
                {columns.map((w, c) => (
                  <TableCell key={c} className="py-3">
                    <Skeleton className={cn("h-4", w)} />
                  </TableCell>
                ))}
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}

export interface ListSkeletonProps {
  rows?: number;
  showAvatar?: boolean;
  className?: string;
}

/** ListSkeleton — for stacked lists (dashboard mini-cards, activity feeds). */
export function ListSkeleton({ rows = 5, showAvatar = true, className }: ListSkeletonProps) {
  return (
    <ul className={cn("divide-y divide-border", className)} aria-hidden>
      {Array.from({ length: rows }).map((_, i) => (
        <li key={i} className="flex items-center gap-3 px-2 py-3">
          {showAvatar ? <Skeleton className="h-9 w-9 rounded-full" /> : null}
          <div className="min-w-0 flex-1 space-y-1.5">
            <Skeleton className="h-3 w-2/5" />
            <Skeleton className="h-2.5 w-3/5" />
          </div>
          <Skeleton className="h-5 w-14 rounded-md" />
        </li>
      ))}
    </ul>
  );
}

export interface ChartSkeletonProps {
  height?: number;
  className?: string;
}

/** ChartSkeleton — a block placeholder that matches chart container height. */
export function ChartSkeleton({ height = 280, className }: ChartSkeletonProps) {
  return (
    <div
      className={cn("flex w-full items-end gap-2 px-1", className)}
      style={{ height }}
      aria-hidden
    >
      {[65, 40, 78, 52, 88, 60, 72, 45, 82, 58, 70, 48].map((h, i) => (
        <Skeleton key={i} className="flex-1 rounded-t-md" style={{ height: `${h}%` }} />
      ))}
    </div>
  );
}

export interface CardGridSkeletonProps {
  count?: number;
  className?: string;
}

/** CardGridSkeleton — placeholder for card grids (doctors, medicines). */
export function CardGridSkeleton({ count = 6, className }: CardGridSkeletonProps) {
  return (
    <div
      className={cn("grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4", className)}
      aria-hidden
    >
      {Array.from({ length: count }).map((_, i) => (
        <div key={i} className="space-y-3 rounded-xl border bg-card p-4">
          <div className="flex items-center gap-3">
            <Skeleton className="h-12 w-12 rounded-full" />
            <div className="flex-1 space-y-2">
              <Skeleton className="h-3.5 w-28" />
              <Skeleton className="h-2.5 w-20" />
            </div>
          </div>
          <Skeleton className="h-2.5 w-full" />
          <Skeleton className="h-2.5 w-4/5" />
          <div className="flex gap-2 pt-2">
            <Skeleton className="h-7 flex-1 rounded-md" />
            <Skeleton className="h-7 flex-1 rounded-md" />
          </div>
        </div>
      ))}
    </div>
  );
}
