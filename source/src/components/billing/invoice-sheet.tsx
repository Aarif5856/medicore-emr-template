import { Link } from "@tanstack/react-router";
import { CheckCircle2, Download, Printer, Send } from "lucide-react";

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
import {
  TAX_RATE,
  formatCurrency,
  formatDate,
  isOverdue,
  totalsOf,
  type Invoice,
} from "@/data/invoices";
import { InvoiceStatusBadge, PaymentMethodBadge, ServiceBadge } from "@/components/billing/badges";

interface Props {
  invoice: Invoice | null;
  onOpenChange: (open: boolean) => void;
  onSendReminder: (inv: Invoice) => void;
  onMarkPaid: (inv: Invoice) => void;
  onDownload: (inv: Invoice) => void;
  onPrint: (inv: Invoice) => void;
}

export function InvoiceSheet({
  invoice,
  onOpenChange,
  onSendReminder,
  onMarkPaid,
  onDownload,
  onPrint,
}: Props) {
  return (
    <Sheet open={invoice !== null} onOpenChange={onOpenChange}>
      <SheetContent side="right" className="flex w-full flex-col gap-0 p-0 sm:max-w-xl">
        {invoice && (
          <InvoiceBody
            invoice={invoice}
            onSendReminder={onSendReminder}
            onMarkPaid={onMarkPaid}
            onDownload={onDownload}
            onPrint={onPrint}
          />
        )}
      </SheetContent>
    </Sheet>
  );
}

function InvoiceBody({
  invoice,
  onSendReminder,
  onMarkPaid,
  onDownload,
  onPrint,
}: {
  invoice: Invoice;
  onSendReminder: (inv: Invoice) => void;
  onMarkPaid: (inv: Invoice) => void;
  onDownload: (inv: Invoice) => void;
  onPrint: (inv: Invoice) => void;
}) {
  const totals = totalsOf(invoice);
  const overdue = isOverdue(invoice);
  const canRemind = invoice.status === "Pending" || invoice.status === "Overdue";
  const canPay = invoice.status !== "Paid" && invoice.status !== "Cancelled";

  return (
    <>
      <SheetHeader className="space-y-3 border-b bg-card p-6">
        <div className="flex items-start justify-between gap-3">
          <div className="min-w-0 space-y-1">
            <SheetTitle className="truncate text-lg tabular">{invoice.id}</SheetTitle>
            <SheetDescription className="text-xs">
              Issued {formatDate(invoice.issueDate)} · Due{" "}
              <span className={cn("tabular", overdue && "font-medium text-destructive")}>
                {formatDate(invoice.dueDate)}
              </span>
            </SheetDescription>
          </div>
          <InvoiceStatusBadge status={invoice.status} />
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <ServiceBadge service={invoice.service} />
          <Link
            to="/patients/$patientId"
            params={{ patientId: invoice.patientId }}
            className="inline-flex items-center gap-1 rounded-md border bg-card px-2 py-0.5 text-[11px] font-medium text-foreground transition-colors hover:border-primary hover:text-primary"
          >
            {invoice.patientName} · {invoice.patientId}
          </Link>
        </div>
      </SheetHeader>

      <div className="flex-1 overflow-y-auto p-6">
        {/* Letterhead */}
        <div className="mb-5 rounded-lg border bg-muted/30 p-4">
          <div className="flex items-start justify-between gap-3">
            <div>
              <div className="text-sm font-semibold text-foreground">MediCore Clinic</div>
              <div className="text-[11px] text-muted-foreground">
                240 Wellness Ave, Suite 500
                <br />
                San Francisco, CA 94103
                <br />
                +1 (415) 555-0100 · billing@medicore.health
              </div>
            </div>
            <div className="text-end text-[11px] text-muted-foreground">
              <div className="font-semibold uppercase tracking-wide">Invoice</div>
              <div className="mt-1 tabular text-foreground">{invoice.id}</div>
            </div>
          </div>
        </div>

        {/* Line items */}
        <div className="overflow-hidden rounded-lg border bg-card">
          <Table>
            <TableHeader>
              <TableRow className="border-b bg-muted/40 hover:bg-muted/40">
                <TableHead className="h-9 text-[11px] font-semibold uppercase tracking-wide text-muted-foreground">
                  Description
                </TableHead>
                <TableHead className="h-9 text-end text-[11px] font-semibold uppercase tracking-wide text-muted-foreground">
                  Qty
                </TableHead>
                <TableHead className="h-9 text-end text-[11px] font-semibold uppercase tracking-wide text-muted-foreground">
                  Unit Price
                </TableHead>
                <TableHead className="h-9 text-end text-[11px] font-semibold uppercase tracking-wide text-muted-foreground">
                  Total
                </TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {invoice.lines.map((l) => (
                <TableRow key={l.id}>
                  <TableCell className="py-2 text-sm font-medium text-foreground">
                    {l.description}
                  </TableCell>
                  <TableCell className="py-2 text-end text-sm tabular">{l.qty}</TableCell>
                  <TableCell className="py-2 text-end text-sm tabular text-muted-foreground">
                    {formatCurrency(l.unitPrice)}
                  </TableCell>
                  <TableCell className="py-2 text-end text-sm font-medium tabular">
                    {formatCurrency(l.qty * l.unitPrice)}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>

        {/* Totals */}
        <div className="mt-4 flex justify-end">
          <dl className="w-full max-w-xs space-y-1.5 text-sm">
            <div className="flex justify-between text-muted-foreground">
              <dt>Subtotal</dt>
              <dd className="tabular text-foreground">{formatCurrency(totals.subtotal)}</dd>
            </div>
            <div className="flex justify-between text-muted-foreground">
              <dt>Tax ({Math.round(TAX_RATE * 100)}%)</dt>
              <dd className="tabular text-foreground">{formatCurrency(totals.tax)}</dd>
            </div>
            {totals.discount > 0 && (
              <div className="flex justify-between text-muted-foreground">
                <dt>Discount</dt>
                <dd className="tabular text-[color:var(--accent-teal)]">
                  −{formatCurrency(totals.discount)}
                </dd>
              </div>
            )}
            <div className="mt-2 flex justify-between border-t pt-2">
              <dt className="text-sm font-semibold text-foreground">Grand Total</dt>
              <dd className="text-base font-bold tabular text-foreground">
                {formatCurrency(totals.total)}
              </dd>
            </div>
          </dl>
        </div>

        {/* Payment info */}
        {invoice.status === "Paid" && invoice.payment && (
          <div className="mt-6 rounded-lg border bg-[color:var(--accent-teal)]/5 p-4">
            <div className="mb-2 text-[11px] font-semibold uppercase tracking-wide text-muted-foreground">
              Payment
            </div>
            <div className="grid grid-cols-3 gap-3 text-xs">
              <div>
                <div className="text-muted-foreground">Method</div>
                <div className="mt-1">
                  <PaymentMethodBadge method={invoice.payment.method} />
                </div>
              </div>
              <div>
                <div className="text-muted-foreground">Paid Date</div>
                <div className="mt-1 font-medium tabular text-foreground">
                  {formatDate(invoice.payment.paidDate)}
                </div>
              </div>
              <div>
                <div className="text-muted-foreground">Transaction Ref</div>
                <div className="mt-1 font-medium tabular text-foreground">
                  {invoice.payment.transactionRef ?? "-"}
                </div>
              </div>
            </div>
          </div>
        )}

        {invoice.notes && (
          <div className="mt-6 rounded-lg border bg-muted/40 p-3">
            <div className="text-[11px] font-semibold uppercase tracking-wide text-muted-foreground">
              Notes
            </div>
            <p className="mt-1 text-sm text-foreground">{invoice.notes}</p>
          </div>
        )}
      </div>

      {/* Footer actions */}
      <div className="flex flex-wrap items-center justify-between gap-2 border-t bg-card p-4">
        <div className="flex items-center gap-1">
          <Button variant="ghost" size="sm" className="gap-2" onClick={() => onDownload(invoice)}>
            <Download className="h-4 w-4" /> Download PDF
          </Button>
          <Button variant="ghost" size="sm" className="gap-2" onClick={() => onPrint(invoice)}>
            <Printer className="h-4 w-4" /> Print
          </Button>
        </div>
        <div className="flex items-center gap-2">
          {canRemind && (
            <Button
              variant="outline"
              size="sm"
              className="gap-2"
              onClick={() => onSendReminder(invoice)}
            >
              <Send className="h-4 w-4" /> Send Reminder
            </Button>
          )}
          {canPay && (
            <Button size="sm" className="glow-primary gap-2" onClick={() => onMarkPaid(invoice)}>
              <CheckCircle2 className="h-4 w-4" /> Mark as Paid
            </Button>
          )}
        </div>
      </div>
    </>
  );
}
