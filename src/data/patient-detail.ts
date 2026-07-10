import type { LucideIcon } from "lucide-react";
import {
  Activity,
  Droplets,
  Gauge,
  HeartPulse,
  Thermometer,
  Weight,
} from "lucide-react";

/* ---------- Basic profile info ---------- */
export interface BasicInfo {
  dob: string;
  gender: string;
  maritalStatus: string;
  address: string;
  email: string;
  phone: string;
  emergencyContact: string;
  emergencyPhone: string;
}

export const BASIC_INFO: BasicInfo = {
  dob: "1990-03-14",
  gender: "Female",
  maritalStatus: "Married",
  address: "142 Willow Lane, San Francisco, CA 94110",
  email: "amelia.chen@mail.com",
  phone: "+1 415 555 0132",
  emergencyContact: "Daniel Chen (Spouse)",
  emergencyPhone: "+1 415 555 0201",
};

/* ---------- Vital signs ---------- */
export interface Vital {
  label: string;
  value: string;
  unit?: string;
  icon: LucideIcon;
}

export const VITALS: Vital[] = [
  { label: "Blood Pressure", value: "120/80", unit: "mmHg", icon: Gauge },
  { label: "Heart Rate",     value: "72",     unit: "bpm",  icon: HeartPulse },
  { label: "SpO₂",           value: "98",     unit: "%",    icon: Droplets },
  { label: "Temperature",    value: "98.6",   unit: "°F",   icon: Thermometer },
  { label: "Respiratory",    value: "16",     unit: "/min", icon: Activity },
  { label: "Weight",         value: "62",     unit: "kg",   icon: Weight },
];

/* ---------- Allergies & Medications ---------- */
export const ALLERGIES: string[] = ["Penicillin", "Peanuts"];

export interface Medication {
  name: string;
  dosage: string;
  frequency: string;
}

export const MEDICATIONS: Medication[] = [
  { name: "Lisinopril", dosage: "10 mg", frequency: "Once daily" },
  { name: "Metformin",  dosage: "500 mg", frequency: "Twice daily" },
  { name: "Atorvastatin", dosage: "20 mg", frequency: "Nightly" },
];

/* ---------- Appointments ---------- */
export type ApptStatus = "Completed" | "Upcoming" | "Cancelled";
export interface PatientAppointment {
  id: string;
  date: string;
  doctor: string;
  department: string;
  status: ApptStatus;
}

export const PATIENT_APPOINTMENTS: PatientAppointment[] = [
  { id: "AP-2081", date: "2026-07-18", doctor: "Dr. Aisha Patel",   department: "Cardiology",   status: "Upcoming" },
  { id: "AP-2044", date: "2026-06-24", doctor: "Dr. Aisha Patel",   department: "Cardiology",   status: "Completed" },
  { id: "AP-1998", date: "2026-05-30", doctor: "Dr. Elena Reyes",   department: "General Med.", status: "Completed" },
  { id: "AP-1932", date: "2026-04-11", doctor: "Dr. Kenji Nakamura",department: "Orthopedics",  status: "Cancelled" },
  { id: "AP-1877", date: "2026-03-02", doctor: "Dr. Aisha Patel",   department: "Cardiology",   status: "Completed" },
];

/* ---------- Lab Results ---------- */
export type LabResultStatus = "Normal" | "Abnormal" | "Critical";
export interface PatientLab {
  id: string;
  test: string;
  date: string;
  status: LabResultStatus;
  note: string;
}

export const PATIENT_LABS: PatientLab[] = [
  { id: "L-9024", test: "Complete Blood Count", date: "2026-06-24", status: "Normal",   note: "All parameters within range." },
  { id: "L-8987", test: "Lipid Panel",          date: "2026-06-24", status: "Abnormal", note: "LDL elevated at 162 mg/dL." },
  { id: "L-8813", test: "HbA1c",                date: "2026-05-30", status: "Normal",   note: "5.4% - within target." },
  { id: "L-8702", test: "Thyroid Panel",        date: "2026-05-04", status: "Normal",   note: "TSH 2.1 mIU/L." },
  { id: "L-8551", test: "Troponin I",           date: "2026-04-11", status: "Critical", note: "Elevated - flagged for review." },
];

/* ---------- Medical History Timeline ---------- */
export type HistoryKind = "diagnosis" | "surgery" | "admission" | "vaccination" | "consultation";
export interface HistoryEvent {
  id: string;
  kind: HistoryKind;
  title: string;
  date: string;
  note: string;
}

export const MEDICAL_HISTORY: HistoryEvent[] = [
  { id: "H-1", kind: "consultation", title: "Cardiology follow-up",      date: "2026-06-24", note: "Continued hypertension management. BP well controlled." },
  { id: "H-2", kind: "diagnosis",    title: "Hypertension (Stage 1)",    date: "2025-11-08", note: "Diagnosed after routine screening. Started Lisinopril." },
  { id: "H-3", kind: "vaccination",  title: "Seasonal Influenza",        date: "2025-10-02", note: "Quadrivalent vaccine, no adverse reactions." },
  { id: "H-4", kind: "surgery",      title: "Laparoscopic Cholecystectomy", date: "2023-05-14", note: "Uncomplicated procedure, discharged after 48h." },
  { id: "H-5", kind: "admission",    title: "Acute appendicitis",        date: "2019-08-21", note: "3-day admission followed by appendectomy." },
];

/* ---------- Billing ---------- */
export type InvoiceStatus = "Paid" | "Pending" | "Overdue";
export interface Invoice {
  id: string;
  date: string;
  amount: string;
  status: InvoiceStatus;
  description: string;
}

export const INVOICES: Invoice[] = [
  { id: "INV-30291", date: "2026-06-24", amount: "$248.00",  status: "Paid",    description: "Cardiology consultation + ECG" },
  { id: "INV-30187", date: "2026-05-30", amount: "$120.00",  status: "Paid",    description: "General consultation" },
  { id: "INV-30122", date: "2026-05-04", amount: "$92.50",   status: "Pending", description: "Thyroid panel" },
  { id: "INV-29998", date: "2026-04-11", amount: "$1,420.00",status: "Overdue", description: "Emergency room visit" },
];

/* ---------- Documents ---------- */
export interface DocFile {
  id: string;
  name: string;
  size: string;
  uploadedAt: string;
  kind: "pdf" | "image" | "doc";
}

export const DOCUMENTS: DocFile[] = [
  { id: "D-1", name: "Insurance_Card.pdf",      size: "412 KB", uploadedAt: "2026-01-08", kind: "pdf" },
  { id: "D-2", name: "ECG_2026-06-24.pdf",      size: "1.2 MB", uploadedAt: "2026-06-24", kind: "pdf" },
  { id: "D-3", name: "Chest_Xray_2025.jpg",     size: "3.8 MB", uploadedAt: "2025-11-08", kind: "image" },
  { id: "D-4", name: "Discharge_Summary.docx",  size: "88 KB",  uploadedAt: "2023-05-16", kind: "doc" },
];
