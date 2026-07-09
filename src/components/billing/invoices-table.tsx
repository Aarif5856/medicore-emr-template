import { useMemo, useState } from "react";
import { Link } from "@tanstack/react-router";
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
  CheckCircle2,
  ChevronLeft,
  ChevronRight,
  Eye,
  MoreHorizontal,
  Search,
  Send,
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
import {
  INVOICE_SERVICES,
  formatCurrency,
  formatDate,
  isOverdue,
  totalsOf,
  type Invoice,
  type InvoiceService,
  type InvoiceStatus,
} from "@/data/invoices";
import {
  InvoiceStatusBadge,
  ServiceBadge,
  initialsFromName,
} from "@/components/billing/badges";

type StatusTab = "All" | InvoiceStatus;
const TABS: StatusTab[] = ["All", "Paid", "Pending", "Overdue", "Cancelled"];

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
  invoices: Invoice[];
  onView: (i: Invoice) => void;
  onSendReminder: (i: Invoice) => void;
  onMarkPaid: (i: Invoice) => void;
  onCancel: (i: Invoice) => void;
}

export function InvoicesTable({
  invoices,
  onView,
  onSendReminder,
  onMarkPaid,
  onCancel,
}: Props) {
  const [sorting, setSorting] = useState<SortingState>([
    { id: "issueDate", desc: true },
  ]);
  const [columnFilters, setColumnFilters] = useState<ColumnFiltersState>([]);
  const [tab, setTab] = useState<StatusTab>("All");
  const [service, setService] = useState<InvoiceService | "All">("All");
  const [dateRange, setDateRange] = useState<DateRange>("All time");
  const [pageSize, setPageSize] = useState<number>(10);

  const columns = useMemo<ColumnDef<Invoice>[]>(
    () => [
      {
        accessorKey: "id",
        header: ({ column }) => <SortHeader column={column} label="Invoice #" />,
        cell: ({ getValue }) => (
          <span className="text-sm font-medium tabular text-foreground">
            {getValue<string>()}
          </span>
        ),
      },
      {
        id: "patient",
        accessorFn: (row) => row.patientName,
        header: "Patient",
        cell: ({ row }) => {
          const inv = row.original;
          return (
            <div
              className="flex items-center gap-3"
              onClick={(e) => e.stopPropagation()}
            >
              <Avatar className="h-8 w-8">
                <AvatarFallback className="bg-primary/10 text-[11px] font-semibold text-primary">
                  {initialsFromName(inv.patientName)}
                </AvatarFallback>
              </Avatar>
              <div className="min-w-0">
                <Link
                  to="/patients/$patientId"
                  params={{ patientId: inv.patientId }}
                  className="block truncate text-sm font-medium text-foreground hover:text-primary hover:underline"
                >
                  {inv.patientName}
                </Link>
                <div className="truncate text-[11px] text-muted-foreground tabular">
                  {inv.patientId}
                </div>
              </div>
            </div>
          );
        },
        filterFn: (row, _id, value: string) => {
          const q = value.toLowerCase();
          return (
            row.original.patientName.toLowerCase().includes(q) ||
            row.original.patientId.toLowerCase().includes(q) ||
            row.original.id.toLowerCase().includes(q)
          );
        },
      },
      {
        accessorKey: "service",
        header: "Service",
        cell: ({ getValue }) => <ServiceBadge service={getValue<InvoiceService>()} />,
        filterFn: (row, _id, value: string) =>
          value === "All" ? true : row.original.service === value,
      },
      {
        accessorKey: "issueDate",
        header: ({ column }) => <SortHeader column={column} label="Issued" />,
        cell: ({ getValue }) => (
          <span className="text-sm text-muted-foreground tabular">
            {formatDate(getValue<string>())}
          </span>
        ),
      },
      {
        accessorKey: "dueDate",
        header: ({ column }) => <SortHeader column={column} label="Due" />,
        cell: ({ row }) => {
          const inv = row.original;
          const overdue = isOverdue(inv);
          return (
            <span
              className={cn(
                "text-sm tabular",
                overdue ? "font-medium text-destructive" : "text-muted-foreground",
              )}
            >
              {formatDate(inv.dueDate)}
            </span>
          );
        },
      },
      {
        id: "amount",
        accessorFn: (row) => totalsOf(row).total,
        header: ({ column }) => <SortHeader column={column} label="Amount" />,
        cell: ({ row }) => (
          <span className="text-sm font-semibold text-foreground tabular">
            {formatCurrency(totalsOf(row.original).total)}
          </span>
        ),
      },
      {
        accessorKey: "status",
        header: "Status",
        cell: ({ getValue }) => <InvoiceStatusBadge status={getValue<InvoiceStatus>()} />,
        filterFn: (row, _id, value: string) =>
          value === "All" ? true : row.original.status === value,
      },
      {
        id: "actions",
        cell: ({ row }) => {
          const inv = row.original;
          const canRemind = inv.status === "Pending" || inv.status === "Overdue";
          const canPay = inv.status !== "Paid" && inv.status !== "Cancelled";
          const canCancel = inv.status !== "Cancelled" && inv.status !== "Paid";
          return (
            <div className="flex justify-end" onClick={(e) => e.stopPropagation()}>
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" size="icon" className="h-8 w-8">
                    <MoreHorizontal className="h-4 w-4" />
                    <span className="sr-only">Row actions</span>
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-48">
                  <DropdownMenuItem onClick={() => onView(inv)}>
                    <Eye className="mr-2 h-4 w-4" /> View Invoice
                  </DropdownMenuItem>
                  <DropdownMenuItem
                    onClick={() => onSendReminder(inv)}
                    disabled={!canRemind}
                  >
                    <Send className="mr-2 h-4 w-4" /> Send Reminder
                  </DropdownMenuItem>
                  <DropdownMenuItem
                    onClick={() => onMarkPaid(inv)}
                    disabled={!canPay}
                  >
                    <CheckCircle2 className="mr-2 h-4 w-4" /> Mark as Paid
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem
                    onClick={() => onCancel(inv)}
                    disabled={!canCancel}
                    className="text-destructive focus:text-destructive"
                  >
                    <Ban className="mr-2 h-4 w-4" /> Cancel
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          );
        },
      },
    ],
    [onView, onSendReminder, onMarkPaid, onCancel],
  );

  const filteredData = useMemo(() => {
    return invoices.filter((inv) => {
      if (tab !== "All" && inv.status !== tab) return false;
      if (service !== "All" && inv.service !== service) return false;
      if (!withinRange(inv.issueDate, dateRange)) return false;
      return true;
    });
  }, [invoices, tab, service, dateRange]);

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

  const counts = useMemo(() => {
    const c: Record<StatusTab, number> = {
      All: invoices.length,
      Paid: 0,
      Pending: 0,
      Overdue: 0,
      Cancelled: 0,
    };
    for (const inv of invoices) c[inv.status]++;
    return c;
  }, [invoices]);

  return (
    <div className="space-y-3">
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

      <div className="flex flex-wrap items-center gap-2">
        <div className="relative min-w-[200px] flex-1 sm:max-w-xs">
          <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            value={search}
            onChange={(e) => table.getColumn("patient")?.setFilterValue(e.target.value)}
            placeholder="Search invoice # or patient…"
            className="h-9 pl-9"
          />
        </div>

        <Select
          value={service}
          onValueChange={(v) => setService(v as InvoiceService | "All")}
        >
          <SelectTrigger className="h-9 w-[170px]">
            <SelectValue placeholder="Service" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="All">All services</SelectItem>
            {INVOICE_SERVICES.map((s) => (
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
                    className="h-24 text-center text-sm text-muted-foreground"
                  >
                    No invoices match your filters.
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
            >
              <ChevronLeft className="h-4 w-4" />
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
              <ChevronRight className="h-4 w-4" />
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
