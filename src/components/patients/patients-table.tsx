import { useMemo, useState } from "react";
import { Link, useNavigate } from "@tanstack/react-router";
import {
  ColumnDef,
  ColumnFiltersState,
  SortingState,
  VisibilityState,
  flexRender,
  getCoreRowModel,
  getFilteredRowModel,
  getPaginationRowModel,
  getSortedRowModel,
  useReactTable,
} from "@tanstack/react-table";
import {
  ArrowUpDown,
  ChevronLeft,
  ChevronRight,
  Columns3,
  Eye,
  MoreHorizontal,
  Pencil,
  Search,
  Trash2,
  UserPlus,
} from "lucide-react";

import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import {
  DropdownMenu,
  DropdownMenuCheckboxItem,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
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
import { PATIENTS, type Patient, type PatientStatus } from "@/data/patients";
import { formatDate, initials, PatientStatusBadge } from "@/components/patients/status-badge";
import { EmptyState } from "@/components/ui/empty-state";
import { ErrorState } from "@/components/ui/error-state";
import { TableSkeleton } from "@/components/ui/table-skeleton";
import { useMockQuery } from "@/lib/mock-query";

const STATUS_OPTIONS: (PatientStatus | "All")[] = [
  "All",
  "Stable",
  "Under Treatment",
  "Critical",
  "Discharged",
];
const GENDER_OPTIONS = ["All", "Male", "Female", "Other"] as const;

export function PatientsTable() {
  const navigate = useNavigate();
  const { data, isLoading, isError, refetch } = useMockQuery(PATIENTS);
  const [sorting, setSorting] = useState<SortingState>([]);
  const [columnFilters, setColumnFilters] = useState<ColumnFiltersState>([]);
  const [columnVisibility, setColumnVisibility] = useState<VisibilityState>({});
  const [rowSelection, setRowSelection] = useState<Record<string, boolean>>({});
  const [pageSize, setPageSize] = useState<number>(10);

  const columns = useMemo<ColumnDef<Patient>[]>(
    () => [
      {
        id: "select",
        header: ({ table }) => (
          <Checkbox
            checked={
              table.getIsAllPageRowsSelected() ||
              (table.getIsSomePageRowsSelected() && "indeterminate")
            }
            onCheckedChange={(v) => table.toggleAllPageRowsSelected(!!v)}
            aria-label="Select all"
          />
        ),
        cell: ({ row }) => (
          <Checkbox
            checked={row.getIsSelected()}
            onCheckedChange={(v) => row.toggleSelected(!!v)}
            aria-label="Select row"
            onClick={(e) => e.stopPropagation()}
          />
        ),
        enableSorting: false,
        enableHiding: false,
        size: 32,
      },
      {
        accessorFn: (row) => `${row.firstName} ${row.lastName}`,
        id: "patient",
        header: ({ column }) => (
          <SortHeader column={column} label="Patient" />
        ),
        cell: ({ row }) => {
          const p = row.original;
          return (
            <div className="flex items-center gap-3">
              <Avatar className="h-8 w-8">
                <AvatarFallback className="bg-primary/10 text-[11px] font-semibold text-primary">
                  {initials(p.firstName, p.lastName)}
                </AvatarFallback>
              </Avatar>
              <div className="min-w-0">
                <div className="truncate text-sm font-medium text-foreground">
                  {p.firstName} {p.lastName}
                </div>
                <div className="truncate text-[11px] text-muted-foreground tabular">{p.id}</div>
              </div>
            </div>
          );
        },
        filterFn: (row, _id, value: string) =>
          `${row.original.firstName} ${row.original.lastName}`
            .toLowerCase()
            .includes(value.toLowerCase()),
      },
      {
        accessorKey: "gender",
        header: "Gender",
        cell: ({ getValue }) => (
          <span className="text-sm text-muted-foreground">{getValue<string>()}</span>
        ),
        filterFn: (row, _id, value: string) =>
          value === "All" ? true : row.original.gender === value,
      },
      {
        accessorKey: "age",
        header: ({ column }) => <SortHeader column={column} label="Age" />,
        cell: ({ getValue }) => (
          <span className="text-sm tabular">{getValue<number>()}</span>
        ),
      },
      {
        accessorKey: "bloodGroup",
        header: "Blood",
        cell: ({ getValue }) => (
          <span className="rounded-md border bg-muted/50 px-1.5 py-0.5 text-[11px] font-semibold text-foreground tabular">
            {getValue<string>()}
          </span>
        ),
      },
      {
        accessorKey: "phone",
        header: "Phone",
        cell: ({ getValue }) => (
          <span className="text-sm text-muted-foreground tabular">{getValue<string>()}</span>
        ),
      },
      {
        accessorKey: "lastVisit",
        header: ({ column }) => <SortHeader column={column} label="Last Visit" />,
        cell: ({ getValue }) => (
          <span className="text-sm text-muted-foreground tabular">
            {formatDate(getValue<string>())}
          </span>
        ),
      },
      {
        accessorKey: "doctor",
        header: "Assigned Doctor",
        cell: ({ getValue }) => (
          <span className="text-sm text-foreground">{getValue<string>()}</span>
        ),
      },
      {
        accessorKey: "status",
        header: "Status",
        cell: ({ getValue }) => <PatientStatusBadge status={getValue<PatientStatus>()} />,
        filterFn: (row, _id, value: string) =>
          value === "All" ? true : row.original.status === value,
      },
      {
        id: "actions",
        enableHiding: false,
        cell: ({ row }) => {
          const p = row.original;
          return (
            <div className="flex justify-end" onClick={(e) => e.stopPropagation()}>
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" size="icon" className="h-8 w-8">
                    <MoreHorizontal className="h-4 w-4" />
                    <span className="sr-only">Open row actions</span>
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-40">
                  <DropdownMenuItem asChild>
                    <Link to="/patients/$patientId" params={{ patientId: p.id }}>
                      <Eye className="me-2 h-4 w-4" /> View
                    </Link>
                  </DropdownMenuItem>
                  <DropdownMenuItem>
                    <Pencil className="me-2 h-4 w-4" /> Edit
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem className="text-destructive focus:text-destructive">
                    <Trash2 className="me-2 h-4 w-4" /> Delete
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          );
        },
      },
    ],
    [],
  );

  const table = useReactTable({
    data: data ?? [],
    columns,
    state: { sorting, columnFilters, columnVisibility, rowSelection },
    onSortingChange: setSorting,
    onColumnFiltersChange: setColumnFilters,
    onColumnVisibilityChange: setColumnVisibility,
    onRowSelectionChange: setRowSelection,
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    initialState: { pagination: { pageSize: 10 } },
  });

  const search = (table.getColumn("patient")?.getFilterValue() as string) ?? "";
  const status = (table.getColumn("status")?.getFilterValue() as string) ?? "All";
  const gender = (table.getColumn("gender")?.getFilterValue() as string) ?? "All";

  const totalRows = table.getFilteredRowModel().rows.length;
  const { pageIndex } = table.getState().pagination;
  const firstRow = totalRows === 0 ? 0 : pageIndex * pageSize + 1;
  const lastRow = Math.min((pageIndex + 1) * pageSize, totalRows);
  const hasActiveFilters = Boolean(search) || status !== "All" || gender !== "All";
  const clearFilters = () => {
    table.getColumn("patient")?.setFilterValue("");
    table.getColumn("status")?.setFilterValue(undefined);
    table.getColumn("gender")?.setFilterValue(undefined);
  };

  return (
    <div className="space-y-3">
      {/* Toolbar */}
      <div className="flex flex-wrap items-center gap-2">
        <div className="relative min-w-[200px] flex-1 sm:max-w-xs">
          <Search className="pointer-events-none absolute start-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            value={search}
            onChange={(e) => table.getColumn("patient")?.setFilterValue(e.target.value)}
            placeholder="Search patients…"
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

        <Select
          value={gender}
          onValueChange={(v) =>
            table.getColumn("gender")?.setFilterValue(v === "All" ? undefined : v)
          }
        >
          <SelectTrigger className="h-9 w-[140px]">
            <SelectValue placeholder="Gender" />
          </SelectTrigger>
          <SelectContent>
            {GENDER_OPTIONS.map((g) => (
              <SelectItem key={g} value={g}>
                {g === "All" ? "All genders" : g}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="outline" size="sm" className="ms-auto h-9 gap-2">
              <Columns3 className="h-4 w-4" />
              Columns
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-44">
            <DropdownMenuLabel>Toggle columns</DropdownMenuLabel>
            <DropdownMenuSeparator />
            {table
              .getAllColumns()
              .filter((c) => c.getCanHide())
              .map((column) => (
                <DropdownMenuCheckboxItem
                  key={column.id}
                  checked={column.getIsVisible()}
                  onCheckedChange={(v) => column.toggleVisibility(!!v)}
                  className="capitalize"
                >
                  {column.id}
                </DropdownMenuCheckboxItem>
              ))}
          </DropdownMenuContent>
        </DropdownMenu>
      </div>

      {/* Table */}
      {isLoading ? (
        <TableSkeleton columns={["w-6", "w-40", "w-16", "w-10", "w-14", "w-32", "w-24", "w-32", "w-20", "w-8"]} />
      ) : isError ? (
        <div className="overflow-hidden rounded-lg border bg-card">
          <ErrorState
            title="Couldn't load patients"
            description="We hit a snag fetching the patient list. Retry to try again."
            onRetry={refetch}
          />
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
                        title="No matching patients"
                        description="Adjust your search or filters to see more results."
                        action={{ label: "Clear filters", onClick: clearFilters }}
                      />
                    ) : (
                      <EmptyState
                        icon={UserPlus}
                        title="No patients yet"
                        description="Add your first patient to start building the registry."
                        action={{ label: "Add patient", href: "/patients/new" }}
                      />
                    )}
                  </TableCell>
                </TableRow>
              ) : (
                table.getRowModel().rows.map((row) => (
                  <TableRow
                    key={row.id}
                    data-state={row.getIsSelected() && "selected"}
                    onClick={() =>
                      navigate({
                        to: "/patients/$patientId",
                        params: { patientId: row.original.id },
                      })
                    }
                    className="cursor-pointer transition-colors hover:bg-muted/50 data-[state=selected]:bg-primary/5"
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
          Showing <span className="font-medium text-foreground">{firstRow}-{lastRow}</span> of{" "}
          <span className="font-medium text-foreground">{totalRows}</span>
          {Object.keys(rowSelection).length > 0 && (
            <span className="ms-3">
              · {Object.keys(rowSelection).length} selected
            </span>
          )}
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

          <PageNumbers table={table} />
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

function PageNumbers<TData>({
  table,
}: {
  table: import("@tanstack/react-table").Table<TData>;
}) {
  const pageCount = table.getPageCount();
  const current = table.getState().pagination.pageIndex;
  const pages = getVisiblePages(current, pageCount);

  return (
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
      {pages.map((p, i) =>
        p === "…" ? (
          <span key={`e-${i}`} className="px-1.5 text-xs text-muted-foreground">
            …
          </span>
        ) : (
          <Button
            key={p}
            variant={p === current ? "default" : "outline"}
            size="icon"
            className={cn("h-8 w-8 text-xs tabular", p === current && "glow-primary")}
            onClick={() => table.setPageIndex(p)}
          aria-label={`Go to page ${p + 1}`}
            aria-current={p === current ? "page" : undefined}
          >
            {p + 1}
          </Button>
        ),
      )}
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
  );
}

function getVisiblePages(current: number, total: number): (number | "…")[] {
  if (total <= 7) return Array.from({ length: total }, (_, i) => i);
  const pages: (number | "…")[] = [0];
  const start = Math.max(1, current - 1);
  const end = Math.min(total - 2, current + 1);
  if (start > 1) pages.push("…");
  for (let i = start; i <= end; i++) pages.push(i);
  if (end < total - 2) pages.push("…");
  pages.push(total - 1);
  return pages;
}
