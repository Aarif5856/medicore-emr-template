import { useMemo, useState } from "react";
import {
  format,
  isAfter,
  isBefore,
  isSameDay,
  parseISO,
} from "date-fns";
import type { DateRange } from "react-day-picker";
import {
  ArrowUpDown,
  CalendarIcon,
  ChevronLeft,
  ChevronRight,
  Eye,
  MoreHorizontal,
  Search,
  X,
} from "lucide-react";
import {
  type ColumnDef,
  type ColumnFiltersState,
  type SortingState,
  flexRender,
  getCoreRowModel,
  getFilteredRowModel,
  getPaginationRowModel,
  getSortedRowModel,
  useReactTable,
} from "@tanstack/react-table";

import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Input } from "@/components/ui/input";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
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
import { AppointmentStatusBadge } from "@/components/appointments/status-badge";
import {
  APPOINTMENT_STATUSES,
  type Appointment,
  type AppointmentStatus,
} from "@/data/appointments";

interface Props {
  appointments: Appointment[];
  onView: (a: Appointment) => void;
  onReschedule: (a: Appointment) => void;
  onCancel: (a: Appointment) => void;
}

const STATUS_OPTIONS: (AppointmentStatus | "All")[] = ["All", ...APPOINTMENT_STATUSES];

export function AppointmentsListTable({
  appointments,
  onView,
  onReschedule,
  onCancel,
}: Props) {
  const [sorting, setSorting] = useState<SortingState>([{ id: "start", desc: false }]);
  const [columnFilters, setColumnFilters] = useState<ColumnFiltersState>([]);
  const [pageSize, setPageSize] = useState<number>(10);
  const [range, setRange] = useState<DateRange | undefined>(undefined);

  const filtered = useMemo(() => {
    if (!range?.from && !range?.to) return appointments;
    return appointments.filter((a) => {
      const d = parseISO(a.start);
      if (range.from && isBefore(d, range.from) && !isSameDay(d, range.from)) return false;
      if (range.to && isAfter(d, range.to) && !isSameDay(d, range.to)) return false;
      return true;
    });
  }, [appointments, range]);

  const columns = useMemo<ColumnDef<Appointment>[]>(
    () => [
      {
        accessorKey: "start",
        id: "start",
        header: ({ column }) => <SortHeader column={column} label="Date & Time" />,
        cell: ({ getValue }) => {
          const d = parseISO(getValue<string>());
          return (
            <div className="flex flex-col">
              <span className="text-sm font-medium text-foreground tabular">
                {format(d, "MMM d, yyyy")}
              </span>
              <span className="text-[11px] text-muted-foreground tabular">
                {format(d, "EEE · HH:mm")}
              </span>
            </div>
          );
        },
      },
      {
        accessorKey: "patientName",
        id: "patient",
        header: ({ column }) => <SortHeader column={column} label="Patient" />,
        cell: ({ row }) => (
          <div className="min-w-0">
            <div className="truncate text-sm font-medium text-foreground">
              {row.original.patientName}
            </div>
            <div className="text-[11px] text-muted-foreground tabular">
              {row.original.patientId}
            </div>
          </div>
        ),
        filterFn: (row, _id, value: string) => {
          const q = value.toLowerCase();
          const a = row.original;
          return (
            a.patientName.toLowerCase().includes(q) ||
            a.patientId.toLowerCase().includes(q) ||
            a.doctorName.toLowerCase().includes(q)
          );
        },
      },
      {
        accessorKey: "doctorName",
        header: "Doctor",
        cell: ({ getValue }) => (
          <span className="text-sm text-foreground">{getValue<string>()}</span>
        ),
      },
      {
        accessorKey: "department",
        header: "Department",
        cell: ({ getValue }) => (
          <span className="text-sm text-muted-foreground">{getValue<string>()}</span>
        ),
      },
      {
        accessorKey: "type",
        header: "Type",
        cell: ({ getValue }) => (
          <span className="rounded-md border bg-muted/50 px-1.5 py-0.5 text-[11px] font-semibold text-foreground">
            {getValue<string>()}
          </span>
        ),
      },
      {
        accessorKey: "status",
        header: "Status",
        cell: ({ getValue }) => (
          <AppointmentStatusBadge status={getValue<AppointmentStatus>()} />
        ),
        filterFn: (row, _id, value: string) =>
          value === "All" ? true : row.original.status === value,
      },
      {
        id: "actions",
        cell: ({ row }) => {
          const a = row.original;
          return (
            <div className="flex justify-end" onClick={(e) => e.stopPropagation()}>
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" size="icon" className="h-8 w-8">
                    <MoreHorizontal className="h-4 w-4" />
                    <span className="sr-only">Row actions</span>
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-40">
                  <DropdownMenuItem onSelect={() => onView(a)}>
                    <Eye className="me-2 h-4 w-4" /> View
                  </DropdownMenuItem>
                  <DropdownMenuItem
                    onSelect={() => onReschedule(a)}
                    disabled={a.status === "Cancelled" || a.status === "Completed"}
                  >
                    Reschedule
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem
                    className="text-destructive focus:text-destructive"
                    onSelect={() => onCancel(a)}
                    disabled={a.status === "Cancelled" || a.status === "Completed"}
                  >
                    <X className="me-2 h-4 w-4" /> Cancel
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          );
        },
      },
    ],
    [onView, onReschedule, onCancel],
  );

  const table = useReactTable({
    data: filtered,
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
  const status = (table.getColumn("status")?.getFilterValue() as string) ?? "All";
  const totalRows = table.getFilteredRowModel().rows.length;
  const { pageIndex } = table.getState().pagination;
  const firstRow = totalRows === 0 ? 0 : pageIndex * pageSize + 1;
  const lastRow = Math.min((pageIndex + 1) * pageSize, totalRows);

  return (
    <div className="space-y-3">
      <div className="flex flex-wrap items-center gap-2">
        <div className="relative min-w-[200px] flex-1 sm:max-w-xs">
          <Search className="pointer-events-none absolute start-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            value={search}
            onChange={(e) => table.getColumn("patient")?.setFilterValue(e.target.value)}
            placeholder="Search patient, doctor…"
            className="h-9 ps-9"
          />
        </div>

        <Select
          value={status}
          onValueChange={(v) =>
            table.getColumn("status")?.setFilterValue(v === "All" ? undefined : v)
          }
        >
          <SelectTrigger className="h-9 w-[160px]">
            <SelectValue placeholder="Status" />
          </SelectTrigger>
          <SelectContent>
            {STATUS_OPTIONS.map((s) => (
              <SelectItem key={s} value={s}>
                {s === "All" ? "All statuses" : s}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        <Popover>
          <PopoverTrigger asChild>
            <Button
              variant="outline"
              size="sm"
              className={cn(
                "h-9 gap-2 font-normal",
                !range?.from && "text-muted-foreground",
              )}
            >
              <CalendarIcon className="h-4 w-4" />
              {range?.from ? (
                range.to ? (
                  <span className="tabular">
                    {format(range.from, "MMM d")} – {format(range.to, "MMM d")}
                  </span>
                ) : (
                  <span className="tabular">{format(range.from, "MMM d, yyyy")}</span>
                )
              ) : (
                "Date range"
              )}
              {range?.from && (
                <span
                  role="button"
                  tabIndex={0}
                  onClick={(e) => {
                    e.stopPropagation();
                    setRange(undefined);
                  }}
                  onKeyDown={(e) => {
                    if (e.key === "Enter" || e.key === " ") {
                      e.preventDefault();
                      e.stopPropagation();
                      setRange(undefined);
                    }
                  }}
                  className="ms-1 rounded p-0.5 hover:bg-muted"
                >
                  <X className="h-3 w-3" />
                </span>
              )}
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-auto p-0" align="start">
            <Calendar
              mode="range"
              selected={range}
              onSelect={setRange}
              numberOfMonths={2}
              initialFocus
              className={cn("p-3 pointer-events-auto")}
            />
          </PopoverContent>
        </Popover>
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
                    No appointments match your filters.
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
              <ChevronLeft className="h-4 w-4 rtl:rotate-180" />
            </Button>
            <span className="px-2 text-xs text-muted-foreground tabular">
              Page {pageIndex + 1} of {Math.max(table.getPageCount(), 1)}
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
