import { useMemo } from "react";
import { Link } from "@tanstack/react-router";
import { AlertTriangle, PackageCheck, Printer, User } from "lucide-react";
import { toast } from "sonner";

import { Avatar, AvatarFallback } from "@/components/ui/avatar";
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
import { Textarea } from "@/components/ui/textarea";
import { cn } from "@/lib/utils";
import { formatDate, type Medicine } from "@/data/pharmacy";
import type { Prescription } from "@/data/prescriptions";
import {
  PrescriptionStatusBadge,
  initialsFromName,
} from "@/components/pharmacy/badges";

interface Props {
  prescription: Prescription | null;
  medicines: Medicine[];
  onOpenChange: (open: boolean) => void;
  onDispense: (rx: Prescription) => void;
  onUpdateNotes: (id: string, notes: string) => void;
}

export function PrescriptionSheet({
  prescription,
  medicines,
  onOpenChange,
  onDispense,
  onUpdateNotes,
}: Props) {
  const medById = useMemo(() => {
    const m = new Map<string, Medicine>();
    for (const x of medicines) m.set(x.id, x);
    return m;
  }, [medicines]);

  if (!prescription) {
    return (
      <Sheet open={false} onOpenChange={onOpenChange}>
        <SheetContent side="right" className="w-full sm:max-w-xl" />
      </Sheet>
    );
  }

  const rx = prescription;
  const outOfStockLines = rx.lines.filter((l) => {
    if (l.dispensed) return false;
    const med = medById.get(l.medicineId);
    if (!med) return false;
    return med.stockQty < l.qty;
  });
  const canDispense =
    rx.status !== "Dispensed" &&
    rx.status !== "Cancelled" &&
    outOfStockLines.length === 0;

  const handlePrint = () => toast.success(`Printing ${rx.id} (demo)…`);
  const handleDispense = () => onDispense(rx);

  return (
    <Sheet open={rx !== null} onOpenChange={onOpenChange}>
      <SheetContent
        side="right"
        className="flex w-full flex-col gap-0 bg-card p-0 sm:max-w-xl"
      >
        <SheetHeader className="border-b p-6">
          <div className="flex items-start justify-between gap-4">
            <div className="min-w-0">
              <div className="text-[11px] font-semibold uppercase tracking-wide text-muted-foreground">
                Prescription
              </div>
              <SheetTitle className="mt-0.5 text-lg tabular">{rx.id}</SheetTitle>
              <SheetDescription className="mt-1">
                Issued {formatDate(rx.date)} by {rx.doctorName}
              </SheetDescription>
            </div>
            <PrescriptionStatusBadge status={rx.status} />
          </div>

          <div className="mt-4 flex items-center gap-3 rounded-lg border bg-muted/30 p-3">
            <Avatar className="h-10 w-10">
              <AvatarFallback className="bg-primary/10 text-sm font-semibold text-primary">
                {initialsFromName(rx.patientName)}
              </AvatarFallback>
            </Avatar>
            <div className="min-w-0 flex-1">
              <Link
                to="/patients/$patientId"
                params={{ patientId: rx.patientId }}
                className="truncate text-sm font-semibold text-foreground hover:text-primary hover:underline"
              >
                {rx.patientName}
              </Link>
              <div className="truncate text-[11px] text-muted-foreground tabular">
                {rx.patientId}
              </div>
            </div>
            <Link
              to="/patients/$patientId"
              params={{ patientId: rx.patientId }}
              className="inline-flex items-center gap-1 rounded-md border bg-card px-2 py-1 text-[11px] font-medium text-muted-foreground hover:text-foreground"
            >
              <User className="h-3 w-3" /> Profile
            </Link>
          </div>
        </SheetHeader>

        <div className="flex-1 space-y-5 overflow-y-auto p-6">
          <section>
            <h3 className="mb-2 text-[11px] font-semibold uppercase tracking-wide text-muted-foreground">
              Medicines
            </h3>
            <div className="overflow-hidden rounded-lg border bg-background">
              <Table>
                <TableHeader>
                  <TableRow className="bg-muted/40 hover:bg-muted/40">
                    <TableHead className="h-9 text-[11px] font-semibold uppercase tracking-wide text-muted-foreground">
                      Medicine
                    </TableHead>
                    <TableHead className="h-9 text-[11px] font-semibold uppercase tracking-wide text-muted-foreground">
                      Dosage
                    </TableHead>
                    <TableHead className="h-9 text-[11px] font-semibold uppercase tracking-wide text-muted-foreground">
                      Freq
                    </TableHead>
                    <TableHead className="h-9 text-[11px] font-semibold uppercase tracking-wide text-muted-foreground">
                      Duration
                    </TableHead>
                    <TableHead className="h-9 text-right text-[11px] font-semibold uppercase tracking-wide text-muted-foreground">
                      Qty
                    </TableHead>
                    <TableHead className="h-9 text-right text-[11px] font-semibold uppercase tracking-wide text-muted-foreground">
                      Status
                    </TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {rx.lines.map((l) => {
                    const med = medById.get(l.medicineId);
                    const short = med && !l.dispensed && med.stockQty < l.qty;
                    return (
                      <TableRow key={l.id}>
                        <TableCell className="py-2">
                          <div className="text-sm font-medium text-foreground">
                            {l.medicineName}
                          </div>
                          {med && (
                            <div className="text-[10px] text-muted-foreground">
                              Stock: {med.stockQty.toLocaleString()} {med.unit}
                            </div>
                          )}
                        </TableCell>
                        <TableCell className="py-2 text-sm">{l.dosage}</TableCell>
                        <TableCell className="py-2 text-sm">{l.frequency}</TableCell>
                        <TableCell className="py-2 text-sm">{l.duration}</TableCell>
                        <TableCell className="py-2 text-right text-sm tabular">
                          {l.qty}
                        </TableCell>
                        <TableCell className="py-2 text-right">
                          <span
                            className={cn(
                              "inline-flex items-center rounded-full px-2 py-0.5 text-[10px] font-semibold",
                              l.dispensed
                                ? "bg-[color:var(--accent-teal)]/10 text-[color:var(--accent-teal)]"
                                : short
                                  ? "bg-destructive/10 text-destructive"
                                  : "bg-warning/10 text-warning",
                            )}
                          >
                            {l.dispensed
                              ? "Dispensed"
                              : short
                                ? "Out of stock"
                                : "Pending"}
                          </span>
                        </TableCell>
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>
            </div>

            {outOfStockLines.length > 0 && rx.status !== "Dispensed" && rx.status !== "Cancelled" && (
              <div className="mt-3 flex items-start gap-2 rounded-md border border-destructive/40 bg-destructive/10 p-3 text-xs text-destructive">
                <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0" />
                <div>
                  <div className="font-semibold">Cannot fully dispense</div>
                  <div className="text-destructive/90">
                    {outOfStockLines.length} medicine
                    {outOfStockLines.length > 1 ? "s are" : " is"} out of stock or
                    below requested quantity. Restock before dispensing.
                  </div>
                </div>
              </div>
            )}
          </section>

          <section>
            <h3 className="mb-2 text-[11px] font-semibold uppercase tracking-wide text-muted-foreground">
              Notes
            </h3>
            <Textarea
              defaultValue={rx.notes ?? ""}
              placeholder="Add clinical notes for the pharmacist…"
              rows={3}
              onBlur={(e) => {
                const v = e.target.value.trim();
                if (v !== (rx.notes ?? "")) onUpdateNotes(rx.id, v);
              }}
            />
          </section>
        </div>

        <div className="border-t bg-background/50 p-4">
          <div className="flex flex-wrap items-center justify-end gap-2">
            <Button variant="ghost" onClick={handlePrint}>
              <Printer className="mr-2 h-4 w-4" /> Print Prescription
            </Button>
            <Button
              className="glow-primary"
              onClick={handleDispense}
              disabled={!canDispense}
            >
              <PackageCheck className="mr-2 h-4 w-4" /> Dispense All
            </Button>
          </div>
        </div>
      </SheetContent>
    </Sheet>
  );
}
