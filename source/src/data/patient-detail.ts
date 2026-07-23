import type { LucideIcon } from "lucide-react";
import { Activity, Droplets, Gauge, HeartPulse, Thermometer, Weight } from "lucide-react";

import type { Patient } from "@/data/patients";

/* ---------- Types ---------- */

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

export interface Vital {
  label: string;
  value: string;
  unit?: string;
  icon: LucideIcon;
}

export type ApptStatus = "Completed" | "Upcoming" | "Cancelled";
export interface PatientAppointment {
  id: string;
  date: string;
  doctor: string;
  department: string;
  status: ApptStatus;
}

export type LabResultStatus = "Normal" | "Abnormal" | "Critical";
export interface PatientLab {
  id: string;
  test: string;
  date: string;
  status: LabResultStatus;
  note: string;
}

export type HistoryKind = "diagnosis" | "surgery" | "admission" | "vaccination" | "consultation";
export interface HistoryEvent {
  id: string;
  kind: HistoryKind;
  title: string;
  date: string;
  note: string;
}

export type InvoiceStatus = "Paid" | "Pending" | "Overdue";
export interface Invoice {
  id: string;
  date: string;
  amount: string;
  status: InvoiceStatus;
  description: string;
}

export interface DocFile {
  id: string;
  name: string;
  size: string;
  uploadedAt: string;
  kind: "pdf" | "image" | "doc";
}

export interface Medication {
  name: string;
  dosage: string;
  frequency: string;
}

/* ---------- Deterministic per-patient generators ---------- */

function hashId(id: string): number {
  let h = 0;
  for (let i = 0; i < id.length; i++) {
    h = (h * 31 + id.charCodeAt(i)) >>> 0;
  }
  return h;
}

function pick<T>(id: string, salt: number, list: readonly T[]): T {
  return list[(hashId(id) + salt) % list.length];
}

function dobFromAge(age: number, id: string): string {
  const now = new Date();
  const year = now.getFullYear() - age;
  const seed = hashId(id);
  const month = String(1 + (seed % 12)).padStart(2, "0");
  const day = String(1 + ((seed >> 3) % 27)).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

const ADDRESSES = [
  "142 Willow Lane, San Francisco, CA 94110",
  "88 Marlborough St, Boston, MA 02116",
  "27 Rue de Vaugirard, 75006 Paris",
  "1204 W 6th Ave, Vancouver, BC V6H 1A5",
  "56 Cavendish Square, London W1G 0PN",
  "312 East 51st St, New York, NY 10022",
  "9 Chome-1 Akasaka, Minato City, Tokyo 107-0052",
  "45 Gran Vía, 28013 Madrid",
  "78 Königsallee, 40212 Düsseldorf",
  "22 Collins St, Melbourne VIC 3000",
];

const MARITAL = ["Single", "Married", "Married", "Divorced", "Widowed"] as const;

const EMERGENCY_TITLES = ["Spouse", "Parent", "Sibling", "Child", "Partner"] as const;
const EMERGENCY_FIRST = [
  "Daniel",
  "Sara",
  "Michael",
  "Emma",
  "Lucas",
  "Olivia",
  "James",
  "Ava",
  "Noah",
  "Mia",
];

function emergencyContact(patient: Patient): { name: string; phone: string } {
  const seed = hashId(patient.id);
  const first = EMERGENCY_FIRST[seed % EMERGENCY_FIRST.length];
  const relation = EMERGENCY_TITLES[(seed >> 2) % EMERGENCY_TITLES.length];
  // Reuse patient last name for family members where plausible.
  const useFamilyName = ["Spouse", "Parent", "Sibling", "Child"].includes(relation);
  const last = useFamilyName
    ? patient.lastName
    : EMERGENCY_FIRST[(seed >> 4) % EMERGENCY_FIRST.length];
  const base = patient.phone.replace(/\d{4}$/, "");
  const suffix = String(2000 + (seed % 7999)).slice(-4);
  return { name: `${first} ${last} (${relation})`, phone: `${base}${suffix}` };
}

export function getBasicInfo(patient: Patient): BasicInfo {
  const emergency = emergencyContact(patient);
  return {
    dob: dobFromAge(patient.age, patient.id),
    gender: patient.gender,
    maritalStatus: patient.age < 22 ? "Single" : pick(patient.id, 1, MARITAL),
    address: pick(patient.id, 2, ADDRESSES),
    email: patient.email,
    phone: patient.phone,
    emergencyContact: emergency.name,
    emergencyPhone: emergency.phone,
  };
}

/* ---------- Vitals ---------- */

function clamp(n: number, min: number, max: number): number {
  return Math.min(max, Math.max(min, n));
}

export function getVitals(patient: Patient): Vital[] {
  const seed = hashId(patient.id);
  const critical = patient.status === "Critical";
  const treatment = patient.status === "Under Treatment";
  // Blood pressure — trend higher with age or Critical status.
  const sys = clamp(
    108 + (seed % 20) + (patient.age > 55 ? 12 : 0) + (critical ? 22 : 0),
    100,
    178,
  );
  const dia = clamp(70 + ((seed >> 2) % 12) + (critical ? 14 : 0), 62, 108);
  const hr = clamp(64 + ((seed >> 4) % 18) + (critical ? 22 : treatment ? 8 : 0), 52, 118);
  const spo2 = clamp(97 + ((seed >> 6) % 2) - (critical ? 5 : 0), 88, 99);
  const temp = (97.4 + ((seed >> 8) % 22) / 10 + (critical ? 1.8 : treatment ? 0.6 : 0)).toFixed(1);
  const rr = clamp(14 + ((seed >> 10) % 6) + (critical ? 6 : 0), 12, 26);
  const genderWeight = patient.gender === "Male" ? 78 : patient.gender === "Female" ? 63 : 70;
  const weight = clamp(genderWeight + ((seed >> 12) % 14) - 6, 45, 108);

  return [
    { label: "Blood Pressure", value: `${sys}/${dia}`, unit: "mmHg", icon: Gauge },
    { label: "Heart Rate", value: String(hr), unit: "bpm", icon: HeartPulse },
    { label: "SpO₂", value: String(spo2), unit: "%", icon: Droplets },
    { label: "Temperature", value: temp, unit: "°F", icon: Thermometer },
    { label: "Respiratory", value: String(rr), unit: "/min", icon: Activity },
    { label: "Weight", value: String(weight), unit: "kg", icon: Weight },
  ];
}

/* ---------- Allergies & Medications ---------- */

const ALLERGY_POOL = [
  "Penicillin",
  "Peanuts",
  "Latex",
  "Sulfa drugs",
  "Shellfish",
  "Aspirin",
  "Eggs",
  "Pollen",
];

const MEDICATION_POOL: Medication[] = [
  { name: "Lisinopril", dosage: "10 mg", frequency: "Once daily" },
  { name: "Metformin", dosage: "500 mg", frequency: "Twice daily" },
  { name: "Atorvastatin", dosage: "20 mg", frequency: "Nightly" },
  { name: "Amlodipine", dosage: "5 mg", frequency: "Once daily" },
  { name: "Levothyroxine", dosage: "50 mcg", frequency: "Morning" },
  { name: "Omeprazole", dosage: "20 mg", frequency: "Once daily" },
  { name: "Sertraline", dosage: "50 mg", frequency: "Morning" },
  { name: "Albuterol", dosage: "90 mcg", frequency: "As needed" },
];

export function getAllergies(patient: Patient): string[] {
  const seed = hashId(patient.id);
  const count = (seed % 3) + 1;
  const out: string[] = [];
  for (let i = 0; i < count; i++) {
    const item = ALLERGY_POOL[(seed + i * 3) % ALLERGY_POOL.length];
    if (!out.includes(item)) out.push(item);
  }
  return out;
}

export function getMedications(patient: Patient): Medication[] {
  const seed = hashId(patient.id);
  const count = patient.status === "Critical" ? 4 : patient.status === "Under Treatment" ? 3 : 2;
  const out: Medication[] = [];
  for (let i = 0; i < count; i++) {
    const item = MEDICATION_POOL[(seed + i * 5) % MEDICATION_POOL.length];
    if (!out.find((m) => m.name === item.name)) out.push(item);
  }
  return out;
}

/* ---------- Appointments ---------- */

const DEPARTMENTS = [
  "Cardiology",
  "Orthopedics",
  "Pediatrics",
  "Neurology",
  "General Med.",
  "Dermatology",
] as const;

function dateOffsetFromLastVisit(lastVisit: string, days: number): string {
  const d = new Date(lastVisit);
  d.setDate(d.getDate() + days);
  return d.toISOString().slice(0, 10);
}

export function getAppointments(patient: Patient): PatientAppointment[] {
  const seed = hashId(patient.id);
  const dept = pick(patient.id, 3, DEPARTMENTS);
  const secondDept = pick(patient.id, 7, DEPARTMENTS);
  const idBase = 1800 + (seed % 400);
  return [
    {
      id: `AP-${idBase + 5}`,
      date: dateOffsetFromLastVisit(patient.lastVisit, 21),
      doctor: patient.doctor,
      department: dept,
      status: "Upcoming",
    },
    {
      id: `AP-${idBase + 3}`,
      date: patient.lastVisit,
      doctor: patient.doctor,
      department: dept,
      status: "Completed",
    },
    {
      id: `AP-${idBase + 1}`,
      date: dateOffsetFromLastVisit(patient.lastVisit, -28),
      doctor: "Dr. Elena Reyes",
      department: secondDept,
      status: "Completed",
    },
    {
      id: `AP-${idBase - 4}`,
      date: dateOffsetFromLastVisit(patient.lastVisit, -70),
      doctor: "Dr. Kenji Nakamura",
      department: "Orthopedics",
      status: (seed & 1) === 0 ? "Cancelled" : "Completed",
    },
    {
      id: `AP-${idBase - 9}`,
      date: dateOffsetFromLastVisit(patient.lastVisit, -110),
      doctor: patient.doctor,
      department: dept,
      status: "Completed",
    },
  ];
}

/* ---------- Lab Results ---------- */

const LAB_TESTS: Array<{ test: string; note: string }> = [
  { test: "Complete Blood Count", note: "All parameters within range." },
  { test: "Lipid Panel", note: "LDL elevated at 162 mg/dL." },
  { test: "HbA1c", note: "5.4% - within target." },
  { test: "Thyroid Panel", note: "TSH 2.1 mIU/L." },
  { test: "Troponin I", note: "Elevated - flagged for review." },
  { test: "Basic Metabolic Panel", note: "Sodium and potassium normal." },
  { test: "Vitamin D", note: "Insufficient - supplementation advised." },
  { test: "Urinalysis", note: "No abnormalities detected." },
];

export function getLabs(patient: Patient): PatientLab[] {
  const seed = hashId(patient.id);
  const critical = patient.status === "Critical";
  const treatment = patient.status === "Under Treatment";
  const idBase = 8500 + (seed % 500);
  const items: PatientLab[] = [];
  for (let i = 0; i < 5; i++) {
    const t = LAB_TESTS[(seed + i * 7) % LAB_TESTS.length];
    let status: LabResultStatus = "Normal";
    if (critical && i === 0) status = "Critical";
    else if ((critical || treatment) && i === 1) status = "Abnormal";
    else if (i === 3 && (seed + i) % 3 === 0) status = "Abnormal";
    items.push({
      id: `L-${idBase + i * 3}`,
      test: t.test,
      date: dateOffsetFromLastVisit(patient.lastVisit, -i * 22),
      status,
      note: t.note,
    });
  }
  return items;
}

/* ---------- History ---------- */

const HISTORY_TEMPLATES: Array<Omit<HistoryEvent, "id" | "date">> = [
  {
    kind: "consultation",
    title: "Routine follow-up",
    note: "Ongoing management review; condition stable.",
  },
  {
    kind: "diagnosis",
    title: "Hypertension (Stage 1)",
    note: "Diagnosed after routine screening. Started Lisinopril.",
  },
  {
    kind: "vaccination",
    title: "Seasonal Influenza",
    note: "Quadrivalent vaccine, no adverse reactions.",
  },
  {
    kind: "surgery",
    title: "Laparoscopic procedure",
    note: "Uncomplicated procedure, discharged after 48h.",
  },
  {
    kind: "admission",
    title: "Acute admission",
    note: "3-day admission followed by conservative treatment.",
  },
  {
    kind: "consultation",
    title: "Specialist referral",
    note: "Referred for further evaluation and imaging.",
  },
];

export function getHistory(patient: Patient): HistoryEvent[] {
  const seed = hashId(patient.id);
  return HISTORY_TEMPLATES.slice(0, 5).map((h, i) => ({
    id: `H-${patient.id}-${i}`,
    ...h,
    date: dateOffsetFromLastVisit(patient.lastVisit, -(30 + i * 210 + (seed % 60))),
  }));
}

/* ---------- Invoices ---------- */

export function getInvoices(patient: Patient): Invoice[] {
  const seed = hashId(patient.id);
  const idBase = 29000 + (seed % 1500);
  const amounts = [248, 120, 92.5, 1420, 340];
  const descriptions = [
    "Cardiology consultation + ECG",
    "General consultation",
    "Thyroid panel",
    "Emergency room visit",
    "Follow-up consultation",
  ];
  const statuses: InvoiceStatus[] = ["Paid", "Paid", "Pending", "Overdue"];
  return amounts.map((amt, i) => ({
    id: `INV-${idBase + i * 17}`,
    date: dateOffsetFromLastVisit(patient.lastVisit, -i * 24),
    amount: `$${amt.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`,
    status: statuses[(seed + i) % statuses.length],
    description: descriptions[i % descriptions.length],
  }));
}

/* ---------- Documents ---------- */

export function getDocuments(patient: Patient): DocFile[] {
  return [
    {
      id: `D-${patient.id}-1`,
      name: "Insurance_Card.pdf",
      size: "412 KB",
      uploadedAt: dateOffsetFromLastVisit(patient.lastVisit, -320),
      kind: "pdf",
    },
    {
      id: `D-${patient.id}-2`,
      name: `ECG_${patient.lastVisit}.pdf`,
      size: "1.2 MB",
      uploadedAt: patient.lastVisit,
      kind: "pdf",
    },
    {
      id: `D-${patient.id}-3`,
      name: "Chest_Xray.jpg",
      size: "3.8 MB",
      uploadedAt: dateOffsetFromLastVisit(patient.lastVisit, -180),
      kind: "image",
    },
    {
      id: `D-${patient.id}-4`,
      name: "Discharge_Summary.docx",
      size: "88 KB",
      uploadedAt: dateOffsetFromLastVisit(patient.lastVisit, -420),
      kind: "doc",
    },
  ];
}
