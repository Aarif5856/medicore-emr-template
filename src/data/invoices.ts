import { PATIENTS } from "@/data/patients";

export type InvoiceStatus = "Paid" | "Pending" | "Overdue" | "Cancelled";
export type InvoiceService = "Consultation" | "Procedure" | "Lab Test" | "Pharmacy";
export type PaymentMethod = "Cash" | "Card" | "Insurance";

export interface InvoiceLine {
  id: string;
  description: string;
  qty: number;
  unitPrice: number;
}

export interface InvoicePayment {
  method: PaymentMethod;
  paidDate: string; // ISO
  transactionRef?: string;
}

export interface Invoice {
  id: string; // INV-1001
  patientId: string;
  patientName: string;
  service: InvoiceService;
  issueDate: string; // ISO
  dueDate: string; // ISO
  status: InvoiceStatus;
  lines: InvoiceLine[];
  discount: number; // absolute currency amount
  payment?: InvoicePayment;
  notes?: string;
}

export const INVOICE_STATUSES: InvoiceStatus[] = [
  "Paid",
  "Pending",
  "Overdue",
  "Cancelled",
];

export const INVOICE_SERVICES: InvoiceService[] = [
  "Consultation",
  "Procedure",
  "Lab Test",
  "Pharmacy",
];

export const PAYMENT_METHODS: PaymentMethod[] = ["Cash", "Card", "Insurance"];

export const TAX_RATE = 0.05;

/* ---------- helpers ---------- */

export function isoDaysFromNow(days: number): string {
  const d = new Date();
  d.setDate(d.getDate() + days);
  d.setHours(12, 0, 0, 0);
  return d.toISOString();
}

export function subtotalOf(lines: InvoiceLine[]): number {
  return lines.reduce((s, l) => s + l.qty * l.unitPrice, 0);
}

export function totalsOf(invoice: Pick<Invoice, "lines" | "discount">): {
  subtotal: number;
  tax: number;
  discount: number;
  total: number;
} {
  const subtotal = subtotalOf(invoice.lines);
  const tax = +(subtotal * TAX_RATE).toFixed(2);
  const discount = invoice.discount || 0;
  const total = +(subtotal + tax - discount).toFixed(2);
  return { subtotal: +subtotal.toFixed(2), tax, discount, total };
}

export function formatCurrency(n: number): string {
  return n.toLocaleString("en-US", {
    style: "currency",
    currency: "USD",
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });
}

export function formatDate(iso: string): string {
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return iso;
  return d.toLocaleDateString("en-US", {
    year: "numeric",
    month: "short",
    day: "numeric",
  });
}

export function isOverdue(inv: Pick<Invoice, "status" | "dueDate">): boolean {
  if (inv.status !== "Pending" && inv.status !== "Overdue") return false;
  return new Date(inv.dueDate).getTime() < Date.now();
}

export function nextInvoiceId(existing: Invoice[]): string {
  const max = existing.reduce((m, x) => {
    const n = Number(x.id.split("-")[1]);
    return Number.isFinite(n) && n > m ? n : m;
  }, 1000);
  return `INV-${max + 1}`;
}

/* ---------- seed data ---------- */

interface LineTemplate {
  description: string;
  qty: number;
  unitPrice: number;
}

const LINES_BY_SERVICE: Record<InvoiceService, LineTemplate[][]> = {
  Consultation: [
    [
      { description: "General Consultation", qty: 1, unitPrice: 120 },
      { description: "Vital Signs Assessment", qty: 1, unitPrice: 25 },
    ],
    [
      { description: "Specialist Consultation — Cardiology", qty: 1, unitPrice: 220 },
      { description: "ECG Interpretation", qty: 1, unitPrice: 55 },
    ],
    [
      { description: "Follow-up Consultation", qty: 1, unitPrice: 80 },
    ],
    [
      { description: "Pediatric Consultation", qty: 1, unitPrice: 140 },
      { description: "Growth Assessment", qty: 1, unitPrice: 40 },
      { description: "Immunization Record Review", qty: 1, unitPrice: 20 },
    ],
  ],
  Procedure: [
    [
      { description: "Minor Wound Suturing", qty: 1, unitPrice: 180 },
      { description: "Local Anesthesia", qty: 1, unitPrice: 45 },
      { description: "Sterile Dressing Kit", qty: 1, unitPrice: 22 },
    ],
    [
      { description: "IV Fluid Therapy — 1L Saline", qty: 2, unitPrice: 65 },
      { description: "Cannulation & Setup", qty: 1, unitPrice: 40 },
    ],
    [
      { description: "Nebulization Session", qty: 3, unitPrice: 35 },
      { description: "Salbutamol Ampoule", qty: 3, unitPrice: 8 },
    ],
    [
      { description: "Cast Application — Forearm", qty: 1, unitPrice: 260 },
      { description: "Post-procedure X-Ray", qty: 1, unitPrice: 90 },
    ],
  ],
  "Lab Test": [
    [
      { description: "Complete Blood Count (CBC)", qty: 1, unitPrice: 45 },
      { description: "Erythrocyte Sedimentation Rate", qty: 1, unitPrice: 20 },
    ],
    [
      { description: "Lipid Panel", qty: 1, unitPrice: 65 },
      { description: "Fasting Blood Glucose", qty: 1, unitPrice: 18 },
      { description: "HbA1c", qty: 1, unitPrice: 42 },
    ],
    [
      { description: "Thyroid Function Panel (T3, T4, TSH)", qty: 1, unitPrice: 95 },
    ],
    [
      { description: "Urine Analysis — Routine", qty: 1, unitPrice: 22 },
      { description: "Urine Culture & Sensitivity", qty: 1, unitPrice: 55 },
    ],
  ],
  Pharmacy: [
    [
      { description: "Amoxicillin 250mg", qty: 21, unitPrice: 0.62 },
      { description: "Paracetamol 500mg", qty: 20, unitPrice: 0.15 },
      { description: "Cetirizine 10mg", qty: 10, unitPrice: 0.12 },
    ],
    [
      { description: "Metformin 500mg", qty: 60, unitPrice: 0.22 },
      { description: "Atorvastatin 20mg", qty: 30, unitPrice: 0.48 },
    ],
    [
      { description: "Insulin Glargine (vial)", qty: 2, unitPrice: 32.4 },
      { description: "Alcohol Swabs (box)", qty: 1, unitPrice: 8.5 },
      { description: "Insulin Syringes", qty: 30, unitPrice: 0.35 },
    ],
    [
      { description: "Azithromycin 500mg", qty: 6, unitPrice: 1.2 },
      { description: "Ibuprofen 400mg", qty: 20, unitPrice: 0.18 },
    ],
  ],
};

interface SeedRow {
  service: InvoiceService;
  lineIdx: number;
  patientIdx: number;
  issueDaysAgo: number;
  dueOffsetDays: number; // relative to issue date
  status: InvoiceStatus;
  discount?: number;
  method?: PaymentMethod;
}

const SEED: SeedRow[] = [
  { service: "Consultation", lineIdx: 0, patientIdx: 0, issueDaysAgo: 2, dueOffsetDays: 14, status: "Paid", method: "Card" },
  { service: "Procedure", lineIdx: 0, patientIdx: 1, issueDaysAgo: 5, dueOffsetDays: 14, status: "Pending" },
  { service: "Lab Test", lineIdx: 1, patientIdx: 2, issueDaysAgo: 1, dueOffsetDays: 14, status: "Paid", method: "Insurance" },
  { service: "Pharmacy", lineIdx: 0, patientIdx: 3, issueDaysAgo: 40, dueOffsetDays: 14, status: "Overdue" },
  { service: "Consultation", lineIdx: 1, patientIdx: 4, issueDaysAgo: 3, dueOffsetDays: 14, status: "Paid", method: "Cash", discount: 20 },
  { service: "Procedure", lineIdx: 1, patientIdx: 5, issueDaysAgo: 6, dueOffsetDays: 14, status: "Pending" },
  { service: "Lab Test", lineIdx: 2, patientIdx: 6, issueDaysAgo: 8, dueOffsetDays: 14, status: "Paid", method: "Card" },
  { service: "Pharmacy", lineIdx: 1, patientIdx: 7, issueDaysAgo: 30, dueOffsetDays: 14, status: "Overdue" },
  { service: "Consultation", lineIdx: 2, patientIdx: 8, issueDaysAgo: 4, dueOffsetDays: 14, status: "Cancelled" },
  { service: "Procedure", lineIdx: 2, patientIdx: 9, issueDaysAgo: 10, dueOffsetDays: 14, status: "Paid", method: "Insurance" },
  { service: "Lab Test", lineIdx: 3, patientIdx: 10, issueDaysAgo: 2, dueOffsetDays: 14, status: "Pending" },
  { service: "Pharmacy", lineIdx: 2, patientIdx: 11, issueDaysAgo: 12, dueOffsetDays: 14, status: "Paid", method: "Card", discount: 5 },
  { service: "Consultation", lineIdx: 3, patientIdx: 12, issueDaysAgo: 7, dueOffsetDays: 14, status: "Paid", method: "Cash" },
  { service: "Procedure", lineIdx: 3, patientIdx: 13, issueDaysAgo: 45, dueOffsetDays: 14, status: "Overdue" },
  { service: "Lab Test", lineIdx: 0, patientIdx: 14, issueDaysAgo: 9, dueOffsetDays: 14, status: "Paid", method: "Insurance" },
  { service: "Pharmacy", lineIdx: 3, patientIdx: 15, issueDaysAgo: 3, dueOffsetDays: 14, status: "Pending" },
  { service: "Consultation", lineIdx: 0, patientIdx: 16, issueDaysAgo: 11, dueOffsetDays: 14, status: "Paid", method: "Card" },
  { service: "Procedure", lineIdx: 0, patientIdx: 17, issueDaysAgo: 14, dueOffsetDays: 14, status: "Paid", method: "Insurance" },
  { service: "Lab Test", lineIdx: 1, patientIdx: 18, issueDaysAgo: 60, dueOffsetDays: 14, status: "Overdue" },
  { service: "Pharmacy", lineIdx: 0, patientIdx: 19, issueDaysAgo: 5, dueOffsetDays: 14, status: "Cancelled" },
  { service: "Consultation", lineIdx: 1, patientIdx: 20, issueDaysAgo: 15, dueOffsetDays: 14, status: "Paid", method: "Card" },
  { service: "Procedure", lineIdx: 1, patientIdx: 21, issueDaysAgo: 6, dueOffsetDays: 14, status: "Pending" },
  { service: "Lab Test", lineIdx: 2, patientIdx: 22, issueDaysAgo: 20, dueOffsetDays: 14, status: "Paid", method: "Cash" },
  { service: "Pharmacy", lineIdx: 1, patientIdx: 23, issueDaysAgo: 22, dueOffsetDays: 14, status: "Paid", method: "Card" },
  { service: "Consultation", lineIdx: 2, patientIdx: 24, issueDaysAgo: 1, dueOffsetDays: 14, status: "Pending" },
  { service: "Procedure", lineIdx: 2, patientIdx: 0, issueDaysAgo: 18, dueOffsetDays: 14, status: "Paid", method: "Insurance", discount: 40 },
  { service: "Lab Test", lineIdx: 3, patientIdx: 5, issueDaysAgo: 50, dueOffsetDays: 14, status: "Overdue" },
  { service: "Pharmacy", lineIdx: 2, patientIdx: 8, issueDaysAgo: 25, dueOffsetDays: 14, status: "Paid", method: "Cash" },
  { service: "Consultation", lineIdx: 3, patientIdx: 11, issueDaysAgo: 4, dueOffsetDays: 14, status: "Paid", method: "Card" },
  { service: "Procedure", lineIdx: 3, patientIdx: 19, issueDaysAgo: 2, dueOffsetDays: 14, status: "Pending" },
];

function makeLines(template: LineTemplate[], invoiceId: string): InvoiceLine[] {
  return template.map((l, i) => ({
    id: `${invoiceId}-L${i + 1}`,
    description: l.description,
    qty: l.qty,
    unitPrice: l.unitPrice,
  }));
}

export const INVOICES_SEED: Invoice[] = SEED.map((row, i) => {
  const id = `INV-${1001 + i}`;
  const patient = PATIENTS[row.patientIdx % PATIENTS.length]!;
  const issueDate = isoDaysFromNow(-row.issueDaysAgo);
  const dueDate = isoDaysFromNow(-row.issueDaysAgo + row.dueOffsetDays);
  const template = LINES_BY_SERVICE[row.service][row.lineIdx % LINES_BY_SERVICE[row.service].length]!;
  const lines = makeLines(template, id);
  const payment: InvoicePayment | undefined =
    row.status === "Paid"
      ? {
          method: row.method ?? "Card",
          paidDate: isoDaysFromNow(-Math.max(0, row.issueDaysAgo - 1)),
          transactionRef: `TXN-${(100000 + i * 137).toString().slice(0, 6)}`,
        }
      : undefined;

  return {
    id,
    patientId: patient.id,
    patientName: `${patient.firstName} ${patient.lastName}`,
    service: row.service,
    issueDate,
    dueDate,
    status: row.status,
    lines,
    discount: row.discount ?? 0,
    payment,
  };
});

/* ---------- monthly revenue trend for mini chart ---------- */

export interface RevenueTrendPoint {
  month: string;
  revenue: number; // dollars (thousands)
}

export const REVENUE_TREND_6M: RevenueTrendPoint[] = [
  { month: "Feb", revenue: 96 },
  { month: "Mar", revenue: 104 },
  { month: "Apr", revenue: 112 },
  { month: "May", revenue: 118 },
  { month: "Jun", revenue: 124 },
  { month: "Jul", revenue: 128 },
];
