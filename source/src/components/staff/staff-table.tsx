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
  ChevronLeft,
  ChevronRight,
  Eye,
  Mail,
  MoreHorizontal,
  Pencil,
  Phone,
  Search,
  UserMinus,
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
  SHIFTS,
  STAFF_DEPARTMENTS,
  formatStaffDate,
  fullName,
  initialsOf,
  type Shift,
  type StaffDepartment,
  type StaffMember,
  type StaffRole,
} from "@/data/staff";
import { RoleBadge, ShiftBadge, StatusBadge } from "@/components/staff/badges";
import { EmptyState } from "@/components/ui/empty-state";
import { ErrorState } from "@/components/ui/error-state";
import { TableSkeleton } from "@/components/ui/table-skeleton";
import { useMockQuery } from "@/lib/mock-query";
import { UserPlus } from "lucide-react";
import { toast } from "sonner";
import { exportToCsv, type CsvColumn } from "@/lib/export-csv";

type RoleTab = "All" | StaffRole;
const ROLE_TABS: RoleTab[] = ["All", "Doctor", "Nurse", "Admin", "Support"];

interface Props {
  staff: StaffMember[];
  onView: (s: StaffMember) => void;
  onEdit: (s: StaffMember) => void;
  onDeactivate: (s: StaffMember) => void;
  exportRef?: React.MutableRefObject<(() => void) | null>;
}

export function StaffTable({ staff, onView, onEdit, onDeactivate, exportRef }: Props) {
  const { data, isLoading, isError, refetch } = useMockQuery(staff);
  const source = useMemo(() => data ?? [], [data]);
  const [sorting, setSorting] = useState<SortingState>([{ id: "joinedDate", desc: true }]);
  const [columnFilters, setColumnFilters] = useState<ColumnFiltersState>([]);
  const [tab, setTab] = useState<RoleTab>("All");
  const [department, setDepartment] = useState<StaffDepartment | "All">("All");
  const [shift, setShift] = useState<Shift | "All">("All");
  const [pageSize, setPageSize] = useState<number>(10);

  const columns = useMemo<ColumnDef<StaffMember>[]>(
    () => [
      {
        id: "staff",
        accessorFn: (row) => `${fullName(row)} ${row.id}`,
        header: ({ column }) => <SortHeader column={column} label="Staff" />,
        cell: ({ row }) => {
          const s = row.original;
          return (
            <div className="flex items-center gap-3">
              <Avatar className="h-8 w-8">
                <AvatarFallback className="bg-primary/10 text-[11px] font-semibold text-primary">
                  {initialsOf(s)}
                </AvatarFallback>
              </Avatar>
              <div className="min-w-0">
                <div className="truncate text-sm font-medium text-foreground">{fullName(s)}</div>
                <div className="truncate text-[11px] text-muted-foreground tabular">{s.id}</div>
              </div>
            </div>
          );
        },
        filterFn: (row, _id, value: string) => {
          const q = value.toLowerCase();
          return (
            fullName(row.original).toLowerCase().includes(q) ||
            row.original.id.toLowerCase().includes(q) ||
            row.original.email.toLowerCase().includes(q)
          );
        },
      },
      {
        accessorKey: "role",
        header: "Role",
        cell: ({ getValue }) => <RoleBadge role={getValue<StaffRole>()} />,
        filterFn: (row, _id, value: string) =>
          value === "All" ? true : row.original.role === value,
      },
      {
        accessorKey: "department",
        header: ({ column }) => <SortHeader column={column} label="Department" />,
        cell: ({ getValue }) => (
          <span className="text-sm text-foreground">{getValue<string>()}</span>
        ),
      },
      {
        id: "contact",
        header: "Contact",
        cell: ({ row }) => {
          const s = row.original;
          return (
            <div className="min-w-0 space-y-0.5">
              <div className="flex items-center gap-1.5 text-[12px] text-foreground">
                <Phone className="h-3 w-3 text-muted-foreground" />
                <span className="tabular">{s.phone}</span>
              </div>
              <div className="flex items-center gap-1.5 text-[11px] text-muted-foreground">
                <Mail className="h-3 w-3" />
                <span className="truncate">{s.email}</span>
              </div>
            </div>
          );
        },
      },
      {
        accessorKey: "joinedDate",
        header: ({ column }) => <SortHeader column={column} label="Joined" />,
        cell: ({ getValue }) => (
          <span className="text-sm text-muted-foreground tabular">
            {formatStaffDate(getValue<string>())}
          </span>
        ),
      },
      {
        accessorKey: "shift",
        header: "Shift",
        cell: ({ getValue }) => <ShiftBadge shift={getValue<Shift>()} />,
      },
      {
        accessorKey: "status",
        header: "Status",
        cell: ({ getValue }) => (
          <StatusBadge status={getValue<"Active" | "On Leave" | "Inactive">()} />
        ),
      },
      {
        id: "actions",
        cell: ({ row }) => {
          const s = row.original;
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
                  <DropdownMenuItem onClick={() => onView(s)}>
                    <Eye className="me-2 h-4 w-4" /> View Profile
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => onEdit(s)}>
                    <Pencil className="me-2 h-4 w-4" /> Edit
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem
                    onClick={() => onDeactivate(s)}
                    className="text-destructive focus:text-destructive"
                  >
                    <UserMinus className="me-2 h-4 w-4" />
                    {s.status === "Inactive" ? "Reactivate" : "Deactivate"}
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          );
        },
      },
    ],
    [onView, onEdit, onDeactivate],
  );

  const filteredData = useMemo(() => {
    return source.filter((s) => {
      if (tab !== "All" && s.role !== tab) return false;
      if (department !== "All" && s.department !== department) return false;
      if (shift !== "All" && s.shift !== shift) return false;
      return true;
    });
  }, [source, tab, department, shift]);

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

  const search = (table.getColumn("staff")?.getFilterValue() as string) ?? "";

  const totalRows = table.getFilteredRowModel().rows.length;
  const { pageIndex } = table.getState().pagination;
  const firstRow = totalRows === 0 ? 0 : pageIndex * pageSize + 1;
  const lastRow = Math.min((pageIndex + 1) * pageSize, totalRows);
  const hasActiveFilters =
    Boolean(search) || tab !== "All" || department !== "All" || shift !== "All";
  const clearFilters = () => {
    table.getColumn("staff")?.setFilterValue("");
    setTab("All");
    setDepartment("All");
    setShift("All");
  };

  if (exportRef) {
    exportRef.current = () => {
      const rows = table.getFilteredRowModel().rows.map((r) => r.original);
      const columns: CsvColumn<StaffMember>[] = [
        { header: "Staff ID", value: (s) => s.id },
        { header: "Name", value: (s) => fullName(s) },
        { header: "Role", value: (s) => s.role },
        { header: "Department", value: (s) => s.department },
        { header: "Phone", value: (s) => s.phone },
        { header: "Email", value: (s) => s.email },
        { header: "Shift", value: (s) => s.shift },
        { header: "Status", value: (s) => s.status },
        { header: "Joined", value: (s) => s.joinedDate },
      ];
      exportToCsv("medicore-staff.csv", rows, columns);
      toast.success(`Exported ${rows.length} staff ${rows.length === 1 ? "member" : "members"}`);
    };
  }

  const counts = useMemo(() => {
    const c: Record<RoleTab, number> = {
      All: source.length,
      Doctor: 0,
      Nurse: 0,
      Admin: 0,
      Support: 0,
    };
    for (const s of source) c[s.role]++;
    return c;
  }, [source]);

  return (
    <div className="space-y-3">
      {/* Role tabs */}
      <div className="flex flex-wrap items-center gap-1 rounded-lg border bg-card p-1">
        {ROLE_TABS.map((r) => (
          <button
            key={r}
            type="button"
            onClick={() => setTab(r)}
            className={cn(
              "inline-flex items-center gap-2 rounded-md px-3 py-1.5 text-xs font-medium transition-colors",
              tab === r
                ? "bg-primary text-primary-foreground shadow-sm"
                : "text-muted-foreground hover:bg-muted hover:text-foreground",
            )}
          >
            {r === "Doctor" ? "Doctors" : r === "Nurse" ? "Nurses" : r}
            <span
              className={cn(
                "rounded-full px-1.5 py-0.5 text-[10px] font-semibold tabular",
                tab === r ? "bg-primary-foreground/20" : "bg-muted",
              )}
            >
              {counts[r]}
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
            onChange={(e) => table.getColumn("staff")?.setFilterValue(e.target.value)}
            placeholder="Search name or employee ID…"
            className="h-9 ps-9"
          />
        </div>

        <Select
          value={department}
          onValueChange={(v) => setDepartment(v as StaffDepartment | "All")}
        >
          <SelectTrigger className="h-9 w-[180px]">
            <SelectValue placeholder="Department" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="All">All departments</SelectItem>
            {STAFF_DEPARTMENTS.map((d) => (
              <SelectItem key={d} value={d}>
                {d}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        <Select value={shift} onValueChange={(v) => setShift(v as Shift | "All")}>
          <SelectTrigger className="h-9 w-[140px]">
            <SelectValue placeholder="Shift" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="All">All shifts</SelectItem>
            {SHIFTS.map((s) => (
              <SelectItem key={s} value={s}>
                {s}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* Table */}
      {isLoading ? (
        <TableSkeleton
          columns={["w-40", "w-20", "w-24", "w-24", "w-32", "w-16", "w-20", "w-20", "w-8"]}
        />
      ) : isError ? (
        <div className="overflow-hidden rounded-lg border bg-card">
          <ErrorState title="Couldn't load staff" onRetry={refetch} />
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
                          title="No matching staff"
                          description="Adjust your search or filters to see more results."
                          action={{ label: "Clear filters", onClick: clearFilters }}
                        />
                      ) : (
                        <EmptyState
                          icon={UserPlus}
                          title="No staff yet"
                          description="Add clinical and admin staff to build your roster."
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
