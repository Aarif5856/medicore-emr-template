import { useMemo, useRef, useState } from "react";
import { createFileRoute } from "@tanstack/react-router";
import { Download, Plus } from "lucide-react";
import { toast } from "sonner";

import { Breadcrumbs } from "@/components/breadcrumbs";
import { PageHeader } from "@/components/coming-soon";
import { Button } from "@/components/ui/button";
import { MiniStatCard } from "@/components/ui/mini-stat-card";
import { formatCurrency, totalsOf, type Invoice, type PaymentMethod } from "@/data/invoices";
import { BillingProvider, useBilling } from "@/components/billing/store";
import { InvoicesTable } from "@/components/billing/invoices-table";
import { InvoiceSheet } from "@/components/billing/invoice-sheet";
import { NewInvoiceDialog } from "@/components/billing/new-invoice-dialog";
import { MarkPaidDialog } from "@/components/billing/mark-paid-dialog";
import { RevenueMiniChart } from "@/components/billing/revenue-mini-chart";

export const Route = createFileRoute("/_app/billing")({
  head: () => ({ meta: [{ title: "Billing & Invoices · MediCore EMR" }] }),
  component: BillingRoute,
});

function BillingRoute() {
  return (
    <BillingProvider>
      <BillingPage />
    </BillingProvider>
  );
}

function isSameMonth(iso: string): boolean {
  const d = new Date(iso);
  const n = new Date();
  return d.getFullYear() === n.getFullYear() && d.getMonth() === n.getMonth();
}

function BillingPage() {
  const { invoices, addInvoice, markPaid, cancelInvoice } = useBilling();
  const [newOpen, setNewOpen] = useState(false);
  const [viewTarget, setViewTarget] = useState<Invoice | null>(null);
  const [payTarget, setPayTarget] = useState<Invoice | null>(null);
  const exportRef = useRef<(() => void) | null>(null);

  const stats = useMemo(() => {
    let revenueThisMonth = 0;
    let outstanding = 0;
    let paidCount = 0;
    let overdueCount = 0;
    for (const inv of invoices) {
      const total = totalsOf(inv).total;
      if (inv.status === "Paid") {
        paidCount++;
        if (inv.payment && isSameMonth(inv.payment.paidDate)) {
          revenueThisMonth += total;
        }
      }
      if (inv.status === "Pending" || inv.status === "Overdue") {
        outstanding += total;
      }
      if (inv.status === "Overdue") overdueCount++;
    }
    // Blend seed baseline with live data for a realistic-looking KPI.
    return [
      {
        label: "Revenue (Month)",
        value: formatCurrency(128450 + revenueThisMonth),
        tone: "primary" as const,
      },
      {
        label: "Outstanding",
        value: formatCurrency(Math.max(18340, outstanding)),
        tone: "warning" as const,
      },
      {
        label: "Paid Invoices",
        value: String(214 + paidCount),
        tone: "teal" as const,
      },
      {
        label: "Overdue",
        value: String(Math.max(9, overdueCount)),
        tone: "destructive" as const,
      },
    ];
  }, [invoices]);

  const handleView = (inv: Invoice) => {
    const fresh = invoices.find((x) => x.id === inv.id) ?? inv;
    setViewTarget(fresh);
  };

  const handleSendReminder = (inv: Invoice) => {
    toast.success(`Reminder sent for ${inv.id} to ${inv.patientName}`);
  };

  const handleMarkPaid = (inv: Invoice) => {
    setViewTarget(null);
    setPayTarget(inv);
  };

  const handleConfirmPaid = (method: PaymentMethod, txnRef?: string) => {
    if (!payTarget) return;
    markPaid(payTarget.id, {
      method,
      paidDate: new Date().toISOString(),
      transactionRef: txnRef,
    });
    toast.success(`${payTarget.id} marked as paid`);
    setPayTarget(null);
  };

  const handleCancel = (inv: Invoice) => {
    cancelInvoice(inv.id);
    toast.message(`Invoice ${inv.id} cancelled`);
    setViewTarget((prev) => (prev && prev.id === inv.id ? { ...prev, status: "Cancelled" } : prev));
  };

  const handleExport = () => exportRef.current?.();
  const handleDownload = (inv: Invoice) => toast.success(`Downloading ${inv.id}.pdf (demo)…`);
  const handlePrint = (inv: Invoice) => toast.success(`Printing ${inv.id} (demo)…`);

  return (
    <div className="space-y-6">
      <Breadcrumbs />
      <PageHeader
        title="Billing & Invoices"
        description="Issue invoices, track payments, and follow up on overdue balances."
        actions={
          <>
            <Button variant="outline" size="sm" className="gap-2" onClick={handleExport}>
              <Download className="h-4 w-4" /> Export
            </Button>
            <Button size="sm" className="gap-2 glow-primary" onClick={() => setNewOpen(true)}>
              <Plus className="h-4 w-4" /> New Invoice
            </Button>
          </>
        }
      />

      <div className="grid grid-cols-1 gap-3 lg:grid-cols-4">
        <div className="grid grid-cols-2 gap-3 lg:col-span-3 lg:grid-cols-4">
          {stats.map((s) => (
            <MiniStatCard
              key={s.label}
              label={s.label}
              value={s.value}
              tone={s.tone}
              title={
                s.label === "Revenue (Month)"
                  ? `Total Revenue (This Month): ${s.value}`
                  : `${s.label}: ${s.value}`
              }
            />
          ))}
        </div>
        <div className="lg:col-span-1">
          <RevenueMiniChart />
        </div>
      </div>

      <InvoicesTable
        invoices={invoices}
        onView={handleView}
        onSendReminder={handleSendReminder}
        onMarkPaid={handleMarkPaid}
        onCancel={handleCancel}
        exportRef={exportRef}
      />

      <InvoiceSheet
        invoice={viewTarget}
        onOpenChange={(o) => !o && setViewTarget(null)}
        onSendReminder={handleSendReminder}
        onMarkPaid={handleMarkPaid}
        onDownload={handleDownload}
        onPrint={handlePrint}
      />

      <NewInvoiceDialog open={newOpen} onOpenChange={setNewOpen} onCreate={addInvoice} />

      <MarkPaidDialog
        open={payTarget !== null}
        invoiceId={payTarget?.id}
        onOpenChange={(o) => !o && setPayTarget(null)}
        onConfirm={handleConfirmPaid}
      />
    </div>
  );
}
