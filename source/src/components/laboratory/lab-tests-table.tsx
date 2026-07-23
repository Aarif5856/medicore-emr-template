import { useMemo, useState } from "react";
import {
  ColumnDef,
  ColumnFiltersState,
  SortingState,
  flexRender,
  getCoreRowModel,
  getFilteredRowModel,
  getPaginationRowModel,
  getSortedRowModel,
  useReactTable,
} from "@tanstack/react-table";
import {
  ArrowUpDown,
  Ban,
  ChevronLeft,
  ChevronRight,
  Eye,
  MoreHorizontal,
  Search,
  ShieldAlert,
  Upload,
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
import { LAB_CATEGORIES, type LabCategory, type LabStatus, type LabTest } from "@/data/lab-tests";
import {
  CategoryBadge,
  LabStatusBadge,
  formatLabDate,
  initialsFromName,
} from "@/components/laboratory/status-badge";
import { EmptyState } from "@/components/ui/empty-state";
import { ErrorState } from "@/components/ui/error-state";
import { TableSkeleton } from "@/components/ui/table-skeleton";
import { useMockQuery } from "@/lib/mock-query";
import { FlaskConical } from "lucide-react";
import { toast } from "sonner";
import { exportToCsv, type CsvColumn } from "@/lib/export-csv";

type StatusTab = "All" | LabStatus;

const TABS: StatusTab[] = ["All", "Pending", "In Progress", "Completed", "Critical"];
const DATE_RANGES = ["All time", "Last 7 days", "Last 30 days", "This month"] as const;
type DateRange = (typeof DATE_RANGES)[number];

function withinRange(iso: string, range: DateRange): boolean {
  if (range === "All time") return true;
  const d = new Date(iso).getTime();
  const now = Date.now();
  if (range === "Last 7 days") return now - d <= 7 * 864e5;
  if (range === "Last 30 days") return now - d <= 30 * 864e5;
  const dt = new Date(iso);
  const n = new Date();
  return dt.getFullYear() === n.getFullYear() && dt.getMonth() === n.getMonth();
}

interface Props {
  tests: LabTest[];
  onView: (t: LabTest) => void;
  onUpload: (t: LabTest) => void;
  onMarkCritical: (t: LabTest) => void;
  onCancel: (t: LabTest) => void;
  exportRef?: React.MutableRefObject<(() => void) | null>;
}

export function LabTestsTable({
  tests,
  onView,
  onUpload,
  onMarkCritical,
  onCancel,
  exportRef,
}: Props) {
  const { data, isLoading, isError, refetch } = useMockQuery(tests);
  const source = useMemo(() => data ?? [], [data]);
  const [sorting, setSorting] = useState<SortingState>([{ id: "orderedDate", desc: true }]);
  const [columnFilters, setColumnFilters] = useState<ColumnFiltersState>([]);
  const [tab, setTab] = useState<StatusTab>("All");
  const [category, setCategory] = useState<LabCategory | "All">("All");
  const [dateRange, setDateRange] = useState<DateRange>("All time");
  const [pageSize, setPageSize] = useState<number>(10);

  const columns = useMemo<ColumnDef<LabTest>[]>(
    () => [
      {
        accessorKey: "id",
        header: ({ column }) => <SortHeader column={column} label="Test ID" />,
        cell: ({ getValue }) => (
          <span className="text-sm font-medium tabular text-foreground">{getValue<string>()}</span>
        ),
      },
      {
        id: "patient",
        accessorFn: (row) => row.patientName,
        header: "Patient",
        cell: ({ row }) => {
          const t = row.original;
          return (
            <div className="flex items-center gap-3">
              <Avatar className="h-8 w-8">
                <AvatarFallback className="bg-primary/10 text-[11px] font-semibold text-primary">
                  {initialsFromName(t.patientName)}
                </AvatarFallback>
              </Avatar>
              <div className="min-w-0">
                <div className="truncate text-sm font-medium text-foreground">{t.patientName}</div>
                <div className="truncate text-[11px] text-muted-foreground tabular">
                  {t.patientId}
                </div>
              </div>
            </div>
          );
        },
        filterFn: (row, _id, value: string) => {
          const q = value.toLowerCase();
          return (
            row.original.patientName.toLowerCase().includes(q) ||
            row.original.testName.toLowerCase().includes(q) ||
            row.original.patientId.toLowerCase().includes(q)
          );
        },
      },
      {
        accessorKey: "testName",
        header: ({ column }) => <SortHeader column={column} label="Test Name" />,
        cell: ({ getValue }) => (
          <span className="text-sm text-foreground">{getValue<string>()}</span>
        ),
      },
      {
        accessorKey: "category",
        header: "Category",
        cell: ({ getValue }) => <CategoryBadge category={getValue<LabCategory>()} />,
        filterFn: (row, _id, value: string) =>
          value === "All" ? true : row.original.category === value,
      },
      {
        accessorKey: "orderedBy",
        header: "Ordered By",
        cell: ({ getValue }) => (
          <span className="text-sm text-foreground">{getValue<string>()}</span>
        ),
      },
      {
        accessorKey: "orderedDate",
        header: ({ column }) => <SortHeader column={column} label="Ordered" />,
        cell: ({ getValue }) => (
          <span className="text-sm text-muted-foreground tabular">
            {formatLabDate(getValue<string>())}
          </span>
        ),
      },
      {
        accessorKey: "status",
        header: "Status",
        cell: ({ getValue }) => <LabStatusBadge status={getValue<LabStatus>()} />,
        filterFn: (row, _id, value: string) =>
          value === "All" ? true : row.original.status === value,
      },
      {
        id: "actions",
        cell: ({ row }) => {
          const t = row.original;
          const canUpload = t.status === "Pending" || t.status === "In Progress";
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
                  <DropdownMenuItem onClick={() => onView(t)}>
                    <Eye className="me-2 h-4 w-4" /> View Report
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => onUpload(t)} disabled={!canUpload}>
                    <Upload className="me-2 h-4 w-4" /> Upload Result
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => onMarkCritical(t)}>
                    <ShieldAlert className="me-2 h-4 w-4" /> Mark Critical
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem
                    onClick={() => onCancel(t)}
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
    [onView, onUpload, onMarkCritical, onCancel],
  );

  // apply status tab + category + date range as pre-filter
  const filteredData = useMemo(() => {
    return source.filter((t) => {
      if (tab !== "All" && t.status !== tab) return false;
      if (category !== "All" && t.category !== category) return false;
      if (!withinRange(t.orderedDate, dateRange)) return false;
      return true;
    });
  }, [source, tab, category, dateRange]);

  const table = useReactTable({
    data: filteredData,
    columns,
    state: { sorting, columnFilters },
    onSortingChange: setSorting,
    onColumnFiltersChange: setColumnFilters,
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    initialState: { pagination: { pageSize: 10 } },
  });

  const search = (table.getColumn("patient")?.getFilterValue() as string) ?? "";

  const totalRows = table.getFilteredRowModel().rows.length;
  const { pageIndex } = table.getState().pagination;
  const firstRow = totalRows === 0 ? 0 : pageIndex * pageSize + 1;
  const lastRow = Math.min((pageIndex + 1) * pageSize, totalRows);
  const hasActiveFilters =
    Boolean(search) || tab !== "All" || category !== "All" || dateRange !== "All time";
  const clearFilters = () => {
    table.getColumn("patient")?.setFilterValue("");
    setTab("All");
    setCategory("All");
    setDateRange("All time");
  };

  if (exportRef) {
    exportRef.current = () => {
      const rows = table.getFilteredRowModel().rows.map((r) => r.original);
      const columns: CsvColumn<LabTest>[] = [
        { header: "Test ID", value: (t) => t.id },
        { header: "Patient ID", value: (t) => t.patientId },
        { header: "Patient Name", value: (t) => t.patientName },
        { header: "Test", value: (t) => t.testName },
        { header: "Category", value: (t) => t.category },
        { header: "Priority", value: (t) => t.priority },
        { header: "Ordered By", value: (t) => t.orderedBy },
        { header: "Ordered Date", value: (t) => t.orderedDate },
        { header: "Completed Date", value: (t) => t.completedDate ?? "" },
        { header: "Status", value: (t) => t.status },
      ];
      exportToCsv("medicore-lab-tests.csv", rows, columns);
      toast.success(`Exported ${rows.length} lab ${rows.length === 1 ? "test" : "tests"}`);
    };
  }

  const counts = useMemo(() => {
    const c: Record<StatusTab, number> = {
      All: source.length,
      Pending: 0,
      "In Progress": 0,
      Completed: 0,
      Critical: 0,
    };
    for (const t of source) c[t.status]++;
    return c;
  }, [source]);

  return (
    <div className="space-y-3">
      {/* Status tabs (segmented) */}
      <div className="flex flex-wrap items-center gap-1 rounded-lg border bg-card p-1">
        {TABS.map((s) => (
          <button
            key={s}
            type="button"
            onClick={() => setTab(s)}
            className={cn(
              "inline-flex items-center gap-2 rounded-md px-3 py-1.5 text-xs font-medium transition-colors",
              tab === s
                ? "bg-primary text-primary-foreground shadow-sm"
                : "text-muted-foreground hover:bg-muted hover:text-foreground",
            )}
          >
            {s}
            <span
              className={cn(
                "rounded-full px-1.5 py-0.5 text-[10px] font-semibold tabular",
                tab === s ? "bg-primary-foreground/20" : "bg-muted",
              )}
            >
              {counts[s]}
            </span>
          </button>
        ))}
      </div>

      {/* Toolbar */}
      <div className="flex flex-wrap items-center gap-2">
        <div className="relative min-w-[200px] flex-1 sm:max-w-xs">
          <Search className="pointer-events-none absolute start-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            value={search}
            onChange={(e) => table.getColumn("patient")?.setFilterValue(e.target.value)}
            placeholder="Search patient or test…"
            className="h-9 ps-9"
          />
        </div>

        <Select value={category} onValueChange={(v) => setCategory(v as LabCategory | "All")}>
          <SelectTrigger className="h-9 w-[170px]">
            <SelectValue placeholder="Category" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="All">All categories</SelectItem>
            {LAB_CATEGORIES.map((c) => (
              <SelectItem key={c} value={c}>
                {c}
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

      {/* Table */}
      {isLoading ? (
        <TableSkeleton columns={["w-20", "w-32", "w-40", "w-24", "w-24", "w-24", "w-24", "w-8"]} />
      ) : isError ? (
        <div className="overflow-hidden rounded-lg border bg-card">
          <ErrorState title="Couldn't load lab tests" onRetry={refetch} />
        </div>
      ) : (
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
                    <TableCell colSpan={columns.length} className="p-0">
                      {hasActiveFilters ? (
                        <EmptyState
                          icon={Search}
                          title="No matching lab tests"
                          description="Adjust your search or filters to see more results."
                          action={{ label: "Clear filters", onClick: clearFilters }}
                        />
                      ) : (
                        <EmptyState
                          icon={FlaskConical}
                          title="No lab tests ordered"
                          description="New orders and results will appear here."
                        />
                      )}
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
      )}

      {/* Footer */}
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="text-xs text-muted-foreground tabular">
          Showing{" "}
          <span className="font-medium text-foreground">
            {firstRow}-{lastRow}
          </span>{" "}
          of <span className="font-medium text-foreground">{totalRows}</span>
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
              aria-label="Previous page"
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
              aria-label="Next page"
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
