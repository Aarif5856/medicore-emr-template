import { cn } from "@/lib/utils";
import type { InvoiceService, InvoiceStatus, PaymentMethod } from "@/data/invoices";

const STATUS_STYLES: Record<InvoiceStatus, string> = {
  Paid: "bg-[color:var(--accent-teal)]/10 text-[color:var(--accent-teal)]",
  Pending: "bg-warning/10 text-warning",
  Overdue: "bg-destructive/10 text-destructive",
  Cancelled: "bg-muted text-muted-foreground",
};

export function InvoiceStatusBadge({
  status,
  className,
}: {
  status: InvoiceStatus;
  className?: string;
}) {
  return (
    <span
      className={cn(
        "inline-flex items-center rounded-full px-2 py-0.5 text-[11px] font-semibold",
        STATUS_STYLES[status],
        className,
      )}
    >
      {status}
    </span>
  );
}

const SERVICE_DOT: Record<InvoiceService, string> = {
  Consultation: "bg-primary",
  Procedure: "bg-warning",
  "Lab Test": "bg-[color:var(--accent-teal)]",
  Pharmacy: "bg-foreground/60",
};

export function ServiceBadge({
  service,
  className,
}: {
  service: InvoiceService;
  className?: string;
}) {
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 rounded-md border bg-card px-1.5 py-0.5 text-[11px] font-medium text-foreground",
        className,
      )}
    >
      <span className={cn("h-1.5 w-1.5 rounded-full", SERVICE_DOT[service])} />
      {service}
    </span>
  );
}

const METHOD_STYLES: Record<PaymentMethod, string> = {
  Cash: "bg-warning/10 text-warning",
  Card: "bg-primary/10 text-primary",
  Insurance: "bg-[color:var(--accent-teal)]/10 text-[color:var(--accent-teal)]",
};

export function PaymentMethodBadge({ method }: { method: PaymentMethod }) {
  return (
    <span
      className={cn(
        "inline-flex items-center rounded-full px-2 py-0.5 text-[11px] font-semibold",
        METHOD_STYLES[method],
      )}
    >
      {method}
    </span>
  );
}

export function initialsFromName(name: string): string {
  const parts = name.trim().split(/\s+/);
  return `${parts[0]?.[0] ?? ""}${parts[1]?.[0] ?? ""}`.toUpperCase();
}
