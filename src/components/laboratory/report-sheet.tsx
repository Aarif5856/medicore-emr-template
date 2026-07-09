import { Link } from "@tanstack/react-router";
import { Download, ImageIcon, Printer, ShieldAlert, Upload } from "lucide-react";

import { Button } from "@/components/ui/button";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { cn } from "@/lib/utils";
import type { LabTest } from "@/data/lab-tests";
import {
  CategoryBadge,
  FlagBadge,
  LabStatusBadge,
  formatLabDateTime,
} from "@/components/laboratory/status-badge";

interface Props {
  test: LabTest | null;
  onOpenChange: (open: boolean) => void;
  onUpload: (t: LabTest) => void;
  onMarkCritical: (t: LabTest) => void;
}

export function ReportSheet({ test, onOpenChange, onUpload, onMarkCritical }: Props) {
  return (
    <Sheet open={test !== null} onOpenChange={onOpenChange}>
      <SheetContent
        side="right"
        className="flex w-full flex-col gap-0 p-0 sm:max-w-xl"
      >
        {test && <ReportBody test={test} onUpload={onUpload} onMarkCritical={onMarkCritical} />}
      </SheetContent>
    </Sheet>
  );
}

function ReportBody({
  test,
  onUpload,
  onMarkCritical,
}: {
  test: LabTest;
  onUpload: (t: LabTest) => void;
  onMarkCritical: (t: LabTest) => void;
}) {
  const canUpload = test.status === "Pending" || test.status === "In Progress";
  return (
    <>
      <SheetHeader className="space-y-3 border-b bg-card p-6">
        <div className="flex items-start justify-between gap-3">
          <div className="min-w-0 space-y-1">
            <SheetTitle className="truncate text-lg">{test.testName}</SheetTitle>
            <SheetDescription className="text-xs tabular">
              {test.id} · Ordered by {test.orderedBy}
            </SheetDescription>
          </div>
          <LabStatusBadge status={test.status} />
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <CategoryBadge category={test.category} />
          <Link
            to="/patients/$patientId"
            params={{ patientId: test.patientId }}
            className="inline-flex items-center gap-1 rounded-md border bg-card px-2 py-0.5 text-[11px] font-medium text-foreground transition-colors hover:border-primary hover:text-primary"
          >
            {test.patientName} · {test.patientId}
          </Link>
          <span className="rounded-md border bg-card px-2 py-0.5 text-[11px] font-medium text-muted-foreground">
            Priority: {test.priority}
          </span>
        </div>
        <dl className="grid grid-cols-2 gap-3 pt-1 text-xs">
          <div>
            <dt className="text-muted-foreground">Ordered</dt>
            <dd className="font-medium text-foreground tabular">
              {formatLabDateTime(test.orderedDate)}
            </dd>
          </div>
          <div>
            <dt className="text-muted-foreground">Completed</dt>
            <dd className="font-medium text-foreground tabular">
              {test.completedDate ? formatLabDateTime(test.completedDate) : "—"}
            </dd>
          </div>
        </dl>
      </SheetHeader>

      <div className="flex-1 overflow-y-auto p-6">
        {test.result ? (
          test.kind === "pathology" ? (
            <ResultTable test={test} />
          ) : (
            <ImagingResult test={test} />
          )
        ) : (
          <EmptyResult />
        )}

        {test.notes && (
          <div className="mt-6 rounded-lg border bg-muted/40 p-3">
            <div className="text-[11px] font-semibold uppercase tracking-wide text-muted-foreground">
              Notes
            </div>
            <p className="mt-1 text-sm text-foreground">{test.notes}</p>
          </div>
        )}
      </div>

      <div className="flex flex-wrap items-center justify-between gap-2 border-t bg-card p-4">
        <div className="flex items-center gap-1">
          <Button variant="ghost" size="sm" className="gap-2">
            <Download className="h-4 w-4" /> Download PDF
          </Button>
          <Button variant="ghost" size="sm" className="gap-2">
            <Printer className="h-4 w-4" /> Print
          </Button>
        </div>
        <div className="flex items-center gap-2">
          {canUpload ? (
            <Button size="sm" className="glow-primary gap-2" onClick={() => onUpload(test)}>
              <Upload className="h-4 w-4" /> Upload Result
            </Button>
          ) : (
            <Button
              size="sm"
              variant="outline"
              className={cn(
                "gap-2 border-destructive/50 text-destructive hover:bg-destructive/10 hover:text-destructive",
                test.status === "Critical" && "bg-destructive/10",
              )}
              onClick={() => onMarkCritical(test)}
            >
              <ShieldAlert className="h-4 w-4" />
              {test.status === "Critical" ? "Unmark Critical" : "Mark as Critical"}
            </Button>
          )}
        </div>
      </div>
    </>
  );
}

function ResultTable({ test }: { test: LabTest }) {
  const params = test.result?.parameters ?? [];
  return (
    <div className="overflow-hidden rounded-lg border bg-card">
      <Table>
        <TableHeader>
          <TableRow className="border-b bg-muted/40 hover:bg-muted/40">
            <TableHead className="h-9 text-[11px] font-semibold uppercase tracking-wide text-muted-foreground">
              Parameter
            </TableHead>
            <TableHead className="h-9 text-[11px] font-semibold uppercase tracking-wide text-muted-foreground">
              Result
            </TableHead>
            <TableHead className="h-9 text-[11px] font-semibold uppercase tracking-wide text-muted-foreground">
              Reference Range
            </TableHead>
            <TableHead className="h-9 text-end text-[11px] font-semibold uppercase tracking-wide text-muted-foreground">
              Flag
            </TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {params.map((p) => (
            <TableRow key={p.name}>
              <TableCell className="py-2 text-sm font-medium text-foreground">
                {p.name}
              </TableCell>
              <TableCell className="py-2 text-sm tabular text-foreground">
                {p.value}
                {p.unit && <span className="ms-1 text-muted-foreground">{p.unit}</span>}
              </TableCell>
              <TableCell className="py-2 text-sm tabular text-muted-foreground">
                {p.refLow}–{p.refHigh} {p.unit}
              </TableCell>
              <TableCell className="py-2 text-end">
                <FlagBadge flag={p.flag} />
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}

function ImagingResult({ test }: { test: LabTest }) {
  return (
    <div className="space-y-4">
      <div className="grid h-48 w-full place-items-center rounded-lg border border-dashed bg-muted/40 text-muted-foreground">
        <div className="flex flex-col items-center gap-2">
          <ImageIcon className="h-8 w-8 opacity-60" />
          <span className="text-xs font-medium">Scan Image</span>
        </div>
      </div>
      <div className="rounded-lg border bg-card p-4">
        <div className="text-[11px] font-semibold uppercase tracking-wide text-muted-foreground">
          Findings
        </div>
        <p className="mt-2 text-sm leading-relaxed text-foreground">
          {test.result?.findings ?? "No findings recorded."}
        </p>
      </div>
    </div>
  );
}

function EmptyResult() {
  return (
    <div className="grid h-40 place-items-center rounded-lg border border-dashed bg-muted/30">
      <p className="text-sm text-muted-foreground">
        Result not yet available. Upload once the test is complete.
      </p>
    </div>
  );
}
