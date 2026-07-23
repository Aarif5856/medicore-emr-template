import type { LucideIcon } from "lucide-react";
import { Users, CalendarCheck, DollarSign, Stethoscope } from "lucide-react";

/* ---------------- KPI stat cards ---------------- */

export type Trend = { value: string; direction: "up" | "down" | "flat"; label: string };

export interface StatCardData {
  id: string;
  label: string;
  value: string;
  icon: LucideIcon;
  tone: "primary" | "teal" | "warning" | "destructive" | "neutral";
  trend?: Trend;
  meta?: string;
  sparkline?: number[];
  href?: string;
  linkLabel?: string;
}

export const STAT_CARDS: StatCardData[] = [
  {
    id: "patients",
    label: "Total Patients",
    value: "2,847",
    icon: Users,
    tone: "primary",
    trend: { value: "+12.5%", direction: "up", label: "vs last month" },
    href: "/patients",
    linkLabel: "view patients",
  },
  {
    id: "appointments",
    label: "Appointments Today",
    value: "48",
    icon: CalendarCheck,
    tone: "neutral",
    meta: "6 pending confirmation",
    href: "/appointments",
    linkLabel: "view appointments",
  },
  {
    id: "revenue",
    label: "Revenue (This Month)",
    value: "$128,450",
    icon: DollarSign,
    tone: "teal",
    trend: { value: "+8.2%", direction: "up", label: "vs last month" },
    sparkline: [42, 48, 44, 52, 58, 55, 63, 61, 70, 68, 74, 82],
    href: "/billing",
    linkLabel: "view billing",
  },
  {
    id: "doctors",
    label: "Available Doctors",
    value: "24",
    icon: Stethoscope,
    tone: "neutral",
    meta: "3 on leave",
    href: "/doctors",
    linkLabel: "view doctors",
  },
];

/* ---------------- Visits chart ---------------- */

export interface VisitsPoint {
  label: string;
  inPatient: number;
  outPatient: number;
}

export const VISITS_MONTHLY: VisitsPoint[] = [
  { label: "Jan", inPatient: 320, outPatient: 640 },
  { label: "Feb", inPatient: 280, outPatient: 720 },
  { label: "Mar", inPatient: 360, outPatient: 810 },
  { label: "Apr", inPatient: 410, outPatient: 780 },
  { label: "May", inPatient: 390, outPatient: 860 },
  { label: "Jun", inPatient: 450, outPatient: 920 },
  { label: "Jul", inPatient: 470, outPatient: 980 },
  { label: "Aug", inPatient: 500, outPatient: 1040 },
  { label: "Sep", inPatient: 480, outPatient: 1010 },
  { label: "Oct", inPatient: 530, outPatient: 1120 },
  { label: "Nov", inPatient: 560, outPatient: 1180 },
  { label: "Dec", inPatient: 610, outPatient: 1260 },
];

export const VISITS_WEEKLY: VisitsPoint[] = [
  { label: "W1", inPatient: 118, outPatient: 242 },
  { label: "W2", inPatient: 132, outPatient: 268 },
  { label: "W3", inPatient: 124, outPatient: 254 },
  { label: "W4", inPatient: 141, outPatient: 289 },
  { label: "W5", inPatient: 137, outPatient: 296 },
  { label: "W6", inPatient: 149, outPatient: 312 },
  { label: "W7", inPatient: 143, outPatient: 305 },
  { label: "W8", inPatient: 158, outPatient: 327 },
  { label: "W9", inPatient: 152, outPatient: 318 },
  { label: "W10", inPatient: 164, outPatient: 341 },
  { label: "W11", inPatient: 171, outPatient: 356 },
  { label: "W12", inPatient: 168, outPatient: 372 },
];

export const VISITS_YEARLY: VisitsPoint[] = [
  { label: "2022", inPatient: 4280, outPatient: 9640 },
  { label: "2023", inPatient: 4720, outPatient: 10480 },
  { label: "2024", inPatient: 5140, outPatient: 11320 },
  { label: "2025", inPatient: 5580, outPatient: 12470 },
  { label: "2026", inPatient: 5960, outPatient: 13210 },
];

export type VisitsRange = "Weekly" | "Monthly" | "Yearly";
export const VISITS_RANGES: VisitsRange[] = ["Weekly", "Monthly", "Yearly"];

export const VISITS_BY_RANGE: Record<VisitsRange, VisitsPoint[]> = {
  Weekly: VISITS_WEEKLY,
  Monthly: VISITS_MONTHLY,
  Yearly: VISITS_YEARLY,
};

export const VISITS_RANGE_UNIT: Record<VisitsRange, string> = {
  Weekly: "12 weeks",
  Monthly: "12 months",
  Yearly: "5 years",
};

/* ---------------- Departments ---------------- */

export interface DepartmentSlice {
  name: string;
  value: number; // percent
  count: number;
  colorVar: string; // css var
}

export const DEPARTMENTS: DepartmentSlice[] = [
  { name: "Cardiology", value: 32, count: 154, colorVar: "var(--chart-1)" },
  { name: "Orthopedics", value: 24, count: 116, colorVar: "var(--chart-2)" },
  { name: "Pediatrics", value: 18, count: 87, colorVar: "var(--chart-3)" },
  { name: "Neurology", value: 14, count: 68, colorVar: "var(--chart-4)" },
  { name: "Other", value: 12, count: 58, colorVar: "var(--chart-5)" },
];

/* ---------------- Today's appointments ---------------- */

export type AppointmentStatus = "Confirmed" | "Pending" | "Cancelled";

export interface AppointmentRow {
  id: string;
  patient: string;
  doctor: string;
  time: string;
  status: AppointmentStatus;
}

export const TODAYS_APPOINTMENTS: AppointmentRow[] = [
  { id: "a1", patient: "Amelia Chen", doctor: "Dr. Patel", time: "09:00", status: "Confirmed" },
  { id: "a2", patient: "Marcus Johnson", doctor: "Dr. Nakamura", time: "10:15", status: "Pending" },
  { id: "a3", patient: "Sofia Rodríguez", doctor: "Dr. Reyes", time: "11:30", status: "Confirmed" },
  { id: "a4", patient: "Liam O'Connor", doctor: "Dr. Hassan", time: "13:00", status: "Cancelled" },
  { id: "a5", patient: "Priya Sharma", doctor: "Dr. Kowalski", time: "14:45", status: "Confirmed" },
];

/* ---------------- Demographics ---------------- */

export interface GenderSlice {
  name: string;
  value: number;
  colorVar: string;
}

export const GENDER_SPLIT: GenderSlice[] = [
  { name: "Female", value: 51, colorVar: "var(--chart-1)" },
  { name: "Male", value: 46, colorVar: "var(--chart-2)" },
  { name: "Other", value: 3, colorVar: "var(--chart-3)" },
];

export interface AgeGroup {
  label: string;
  value: number; // percent
}

export const AGE_GROUPS: AgeGroup[] = [
  { label: "0–17", value: 18 },
  { label: "18–35", value: 32 },
  { label: "36–55", value: 28 },
  { label: "55+", value: 22 },
];

/* ---------------- Lab results ---------------- */

export type LabStatus = "Normal" | "Abnormal" | "Critical";

export interface LabResult {
  id: string;
  test: string;
  patient: string;
  status: LabStatus;
  when: string;
}

export const LAB_RESULTS: LabResult[] = [
  {
    id: "l1",
    test: "Complete Blood Count",
    patient: "Amelia Chen",
    status: "Normal",
    when: "12m ago",
  },
  { id: "l2", test: "Lipid Panel", patient: "David Kim", status: "Abnormal", when: "48m ago" },
  { id: "l3", test: "Troponin I", patient: "Rita Alvarez", status: "Critical", when: "1h ago" },
  { id: "l4", test: "HbA1c", patient: "Noah Bennett", status: "Normal", when: "3h ago" },
];

/* ---------------- Revenue breakdown ---------------- */

export interface RevenuePoint {
  month: string;
  consultations: number;
  procedures: number;
  pharmacy: number;
  lab: number;
}

export const REVENUE_BREAKDOWN: RevenuePoint[] = [
  { month: "Jul", consultations: 32, procedures: 41, pharmacy: 18, lab: 14 },
  { month: "Aug", consultations: 34, procedures: 39, pharmacy: 20, lab: 15 },
  { month: "Sep", consultations: 36, procedures: 44, pharmacy: 22, lab: 16 },
  { month: "Oct", consultations: 40, procedures: 46, pharmacy: 21, lab: 18 },
  { month: "Nov", consultations: 42, procedures: 50, pharmacy: 24, lab: 19 },
  { month: "Dec", consultations: 46, procedures: 54, pharmacy: 26, lab: 22 },
];

/* ---------------- Doctor availability ---------------- */

export type DoctorStatus = "Available" | "In surgery" | "Off";

export interface DoctorRow {
  id: string;
  name: string;
  specialty: string;
  hours: string;
  status: DoctorStatus;
}

export const DOCTOR_AVAILABILITY: DoctorRow[] = [
  {
    id: "d1",
    name: "Dr. Aisha Patel",
    specialty: "Cardiology",
    hours: "09:00 – 17:00",
    status: "Available",
  },
  {
    id: "d2",
    name: "Dr. Kenji Nakamura",
    specialty: "Orthopedics",
    hours: "08:00 – 16:00",
    status: "In surgery",
  },
  {
    id: "d3",
    name: "Dr. Elena Reyes",
    specialty: "Pediatrics",
    hours: "10:00 – 18:00",
    status: "Available",
  },
  { id: "d4", name: "Dr. Omar Hassan", specialty: "Neurology", hours: "-", status: "Off" },
  {
    id: "d5",
    name: "Dr. Marta Kowalski",
    specialty: "General Medicine",
    hours: "09:00 – 15:00",
    status: "Available",
  },
];

/* ---------------- Alert strip counts ---------------- */

export const DASHBOARD_ALERTS = {
  criticalLabResults: 3,
  overdueInvoices: 9,
} as const;
