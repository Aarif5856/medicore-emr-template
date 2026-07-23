import { createContext, useCallback, useContext, useMemo, useState, type ReactNode } from "react";

import {
  INVOICES_SEED,
  isOverdue,
  nextInvoiceId,
  type Invoice,
  type InvoicePayment,
} from "@/data/invoices";

interface BillingContextValue {
  invoices: Invoice[];
  addInvoice: (i: Omit<Invoice, "id">) => Invoice;
  updateInvoice: (id: string, patch: Partial<Invoice>) => void;
  markPaid: (id: string, payment: InvoicePayment) => void;
  cancelInvoice: (id: string) => void;
}

const BillingContext = createContext<BillingContextValue | null>(null);

function normalize(inv: Invoice): Invoice {
  // auto-promote Pending -> Overdue when past due
  if (inv.status === "Pending" && isOverdue(inv)) {
    return { ...inv, status: "Overdue" };
  }
  return inv;
}

export function BillingProvider({ children }: { children: ReactNode }) {
  const [invoices, setInvoices] = useState<Invoice[]>(() => INVOICES_SEED.map(normalize));

  const addInvoice = useCallback((i: Omit<Invoice, "id">) => {
    let created: Invoice = { id: "INV-0000", ...i };
    setInvoices((prev) => {
      const id = nextInvoiceId(prev);
      created = normalize({ id, ...i });
      return [created, ...prev];
    });
    return created;
  }, []);

  const updateInvoice = useCallback((id: string, patch: Partial<Invoice>) => {
    setInvoices((prev) =>
      prev.map((inv) => (inv.id === id ? normalize({ ...inv, ...patch }) : inv)),
    );
  }, []);

  const markPaid = useCallback((id: string, payment: InvoicePayment) => {
    setInvoices((prev) =>
      prev.map((inv) => (inv.id === id ? { ...inv, status: "Paid", payment } : inv)),
    );
  }, []);

  const cancelInvoice = useCallback((id: string) => {
    setInvoices((prev) =>
      prev.map((inv) => (inv.id === id ? { ...inv, status: "Cancelled" } : inv)),
    );
  }, []);

  const value = useMemo<BillingContextValue>(
    () => ({ invoices, addInvoice, updateInvoice, markPaid, cancelInvoice }),
    [invoices, addInvoice, updateInvoice, markPaid, cancelInvoice],
  );

  return <BillingContext.Provider value={value}>{children}</BillingContext.Provider>;
}

export function useBilling(): BillingContextValue {
  const ctx = useContext(BillingContext);
  if (!ctx) throw new Error("useBilling must be used within BillingProvider");
  return ctx;
}
