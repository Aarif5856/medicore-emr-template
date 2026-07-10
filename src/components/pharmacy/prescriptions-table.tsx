import { useMemo, useState } from "react";
import {
  ColumnDef,
  SortingState,
  flexRender,
  getCoreRowModel,
  getFilteredRowModel,
  getPaginationRowModel,
  getSortedRowModel,
  useReactTable,
} from "@tanstack/react-table";
import { Link } from "@tanstack/react-router";
import {
  ArrowUpDown,
  Ban,
  ChevronLeft,
  ChevronRight,
  Eye,
  MoreHorizontal,
  PackageCheck,
  Search,
} from "lucide-react";

import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { cn } from "@/lib/utils";
import { formatDate } from "@/data/pharmacy";
import {
  PRESCRIPTION_STATUSES,
  type Prescription,
  type PrescriptionStatus,
} from "@/data/prescriptions";
import { PrescriptionStatusBadge, initialsFromName } from "@/components/pharmacy/badges";

const DATE_RANGES = ["All time", "Last 7 days", "Last 30 days", "This month"] as const;
type DateRange = (typeof DATE_RANGES)[number];

function inRange(iso: string, r: DateRange): boolean {
  if (r === "All time") return true;
  const t = new Date(iso).getTime();
  const now = Date.now();
  if (r === "Last 7 days") return now - t <= 7 * 864e5;
  if (r === "Last 30 days") return now - t <= 30 * 864e5;
  const d = new Date(iso);
  const n = new Date();
  return d.getFullYear() === n.getFullYear() && d.getMonth() === n.getMonth();
}

interface Props {
  prescriptions: Prescription[];
  onView: (rx: Prescription) => void;
  onDispense: (rx: Prescription) => void;
  onCancel: (rx: Prescription) => void;
}

export function PrescriptionsTable({
  prescriptions,
  onView,
  onDispense,
  onCancel,
}: Props) {
  const [sorting, setSorting] = useState<SortingState>([{ id: "date", desc: true }]);
  const [search, setSearch] = useState("");
  const [status, setStatus] = useState<PrescriptionStatus | "All">("All");
  const [dateRange, setDateRange] = useState<DateRange>("All time");
  const [pageSize, setPageSize] = useState(10);

  const columns = useMemo<ColumnDef<Prescription>[]>(
    () => [
      {
        accessorKey: "id",
        header: ({ column }) => <SortHeader column={column} label="Prescription" />,
        cell: ({ getValue }) => (
          <span className="text-sm font-medium tabular text-foreground">
            {getValue<string>()}
          </span>
        ),
      },
      {
        id: "patient",
        accessorFn: (r) => r.patientName,
        header: "Patient",
        cell: ({ row }) => {
          const rx = row.original;
          return (
            <div
              className="flex items-center gap-3"
              onClick={(e) => e.stopPropagation()}
            >
              <Avatar className="h-8 w-8">
                <AvatarFallback className="bg-primary/10 text-[11px] font-semibold text-primary">
                  {initialsFromName(rx.patientName)}
                </AvatarFallback>
              </Avatar>
              <div className="min-w-0">
                <Link
                  to="/patients/$patientId"
                  params={{ patientId: rx.patientId }}
                  className="truncate text-sm font-medium text-foreground hover:text-primary hover:underline"
                >
                  {rx.patientName}
                </Link>
                <div className="truncate text-[11px] text-muted-foreground tabular">
                  {rx.patientId}
                </div>
              </div>
            </div>
          );
        },
      },
      {
        accessorKey: "doctorName",
        header: "Prescribed By",
        cell: ({ getValue }) => (
          <span className="text-sm text-foreground">{getValue<string>()}</span>
        ),
      },
      {
        accessorKey: "date",
        header: ({ column }) => <SortHeader column={column} label="Date" />,
        cell: ({ getValue }) => (
          <span className="text-sm text-muted-foreground tabular">
            {formatDate(getValue<string>())}
          </span>
        ),
      },
      {
        id: "medicines",
        header: "Medicines",
        cell: ({ row }) => {
          const rx = row.original;
          const first = rx.lines[0]?.medicineName ?? "-";
          const extra = rx.lines.length - 1;
          return (
            <div className="flex items-center gap-2">
              <span className="text-sm text-foreground">{first}</span>
              {extra > 0 && (
                <span className="inline-flex items-center rounded-full bg-muted px-1.5 py-0.5 text-[10px] font-semibold text-muted-foreground">
                  +{extra} more
                </span>
              )}
            </div>
          );
        },
      },
      {
        accessorKey: "status",
        header: "Status",
        cell: ({ getValue }) => (
          <PrescriptionStatusBadge status={getValue<PrescriptionStatus>()} />
        ),
      },
      {
        id: "actions",
        cell: ({ row }) => {
          const rx = row.original;
          const canDispense = rx.status !== "Dispensed" && rx.status !== "Cancelled";
          return (
            <div className="flex justify-end" onClick={(e) => e.stopPropagation()}>
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" size="icon" className="h-8 w-8">
                    <MoreHorizontal className="h-4 w-4" />
                    <span className="sr-only">Row actions</span>
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-44">
                  <DropdownMenuItem onClick={() => onView(rx)}>
                    <Eye className="me-2 h-4 w-4" /> View Details
                  </DropdownMenuItem>
                  <DropdownMenuItem
                    onClick={() => onDispense(rx)}
                    disabled={!canDispense}
                  >
                    <PackageCheck className="me-2 h-4 w-4" /> Dispense
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem
                    onClick={() => onCancel(rx)}
                    disabled={rx.status === "Cancelled"}
                    className="text-destructive focus:text-destructive"
                  >
                    <Ban className="me-2 h-4 w-4" /> Cancel
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          );
        },
      },
    ],
    [onView, onDispense, onCancel],
  );

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    return prescriptions.filter((rx) => {
      if (status !== "All" && rx.status !== status) return false;
      if (!inRange(rx.date, dateRange)) return false;
      if (!q) return true;
      return (
        rx.id.toLowerCase().includes(q) ||
        rx.patientName.toLowerCase().includes(q) ||
        rx.doctorName.toLowerCase().includes(q) ||
        rx.lines.some((l) => l.medicineName.toLowerCase().includes(q))
      );
    });
  }, [prescriptions, search, status, dateRange]);

  const table = useReactTable({
    data: filtered,
    columns,
    state: { sorting },
    onSortingChange: setSorting,
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    initialState: { pagination: { pageSize: 10 } },
  });

  const total = table.getFilteredRowModel().rows.length;
  const { pageIndex } = table.getState().pagination;
  const first = total === 0 ? 0 : pageIndex * pageSize + 1;
  const last = Math.min((pageIndex + 1) * pageSize, total);

  return (
    <div className="space-y-3">
      <div className="flex flex-wrap items-center gap-2">
        <div className="relative min-w-[200px] flex-1 sm:max-w-xs">
          <Search className="pointer-events-none absolute start-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search prescription, patient, medicine…"
            className="h-9 ps-9"
          />
        </div>
        <Select
          value={status}
          onValueChange={(v) => setStatus(v as PrescriptionStatus | "All")}
        >
          <SelectTrigger className="h-9 w-[190px]">
            <SelectValue placeholder="Status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="All">All statuses</SelectItem>
            {PRESCRIPTION_STATUSES.map((s) => (
              <SelectItem key={s} value={s}>
                {s}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        <Select value={dateRange} onValueChange={(v) => setDateRange(v as DateRange)}>
          <SelectTrigger className="h-9 w-[160px]">
            <SelectValue placeholder="Date" />
          </SelectTrigger>
          <SelectContent>
            {DATE_RANGES.map((r) => (
              <SelectItem key={r} value={r}>
                {r}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div className="overflow-hidden rounded-lg border bg-card">
        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              {table.getHeaderGroups().map((hg) => (
                <TableRow key={hg.id} className="border-b bg-muted/40 hover:bg-muted/40">
                  {hg.headers.map((h) => (
                    <TableHead
                      key={h.id}
                      className="h-10 whitespace-nowrap text-[11px] font-semibold uppercase tracking-wide text-muted-foreground"
                    >
                      {h.isPlaceholder
                        ? null
                        : flexRender(h.column.columnDef.header, h.getContext())}
                    </TableHead>
                  ))}
                </TableRow>
              ))}
            </TableHeader>
            <TableBody>
              {table.getRowModel().rows.length === 0 ? (
                <TableRow>
                  <TableCell
                    colSpan={columns.length}
                    className={cn("h-24 text-center text-sm text-muted-foreground")}
                  >
                    No prescriptions match your filters.
                  </TableCell>
                </TableRow>
              ) : (
                table.getRowModel().rows.map((row) => (
                  <TableRow
                    key={row.id}
                    onClick={() => onView(row.original)}
                    className="cursor-pointer transition-colors hover:bg-muted/50"
                  >
                    {row.getVisibleCells().map((cell) => (
                      <TableCell key={cell.id} className="whitespace-nowrap py-3">
                        {flexRender(cell.column.columnDef.cell, cell.getContext())}
                      </TableCell>
                    ))}
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </div>
      </div>

      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="text-xs text-muted-foreground tabular">
          Showing{" "}
          <span className="font-medium text-foreground">
            {first}-{last}
          </span>{" "}
          of <span className="font-medium text-foreground">{total}</span>
        </div>
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2 text-xs text-muted-foreground">
            <span>Rows</span>
            <Select
              value={String(pageSize)}
              onValueChange={(v) => {
                const n = Number(v);
                setPageSize(n);
                table.setPageSize(n);
              }}
            >
              <SelectTrigger className="h-8 w-[68px]">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {[10, 20, 50].map((n) => (
                  <SelectItem key={n} value={String(n)}>
                    {n}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="flex items-center gap-1">
            <Button
              variant="outline"
              size="icon"
              className="h-8 w-8"
              onClick={() => table.previousPage()}
              disabled={!table.getCanPreviousPage()}
            >
              <ChevronLeft className="h-4 w-4 rtl:rotate-180" />
            </Button>
            <span className="px-2 text-xs text-muted-foreground tabular">
              Page {pageIndex + 1} of {Math.max(1, table.getPageCount())}
            </span>
            <Button
              variant="outline"
              size="icon"
              className="h-8 w-8"
              onClick={() => table.nextPage()}
              disabled={!table.getCanNextPage()}
            >
              <ChevronRight className="h-4 w-4 rtl:rotate-180" />
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}

function SortHeader<TData>({
  column,
  label,
}: {
  column: import("@tanstack/react-table").Column<TData, unknown>;
  label: string;
}) {
  return (
    <button
      type="button"
      onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
      className="inline-flex items-center gap-1 text-[11px] font-semibold uppercase tracking-wide text-muted-foreground transition-colors hover:text-foreground"
    >
      {label}
      <ArrowUpDown className="h-3 w-3 opacity-60" />
    </button>
  );
}
