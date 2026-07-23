import { PATIENTS } from "@/data/patients";
import { DOCTORS } from "@/data/appointments";
import { MEDICINES_SEED } from "@/data/pharmacy";

export type PrescriptionStatus = "Pending" | "Partially Dispensed" | "Dispensed" | "Cancelled";

export interface PrescriptionLine {
  id: string;
  medicineId: string;
  medicineName: string;
  dosage: string;
  frequency: string;
  duration: string;
  qty: number;
  dispensed: boolean;
}

export interface Prescription {
  id: string;
  patientId: string;
  patientName: string;
  doctorId: string;
  doctorName: string;
  date: string; // ISO
  status: PrescriptionStatus;
  notes?: string;
  lines: PrescriptionLine[];
}

export const PRESCRIPTION_STATUSES: PrescriptionStatus[] = [
  "Pending",
  "Partially Dispensed",
  "Dispensed",
  "Cancelled",
];

interface LineSeed {
  medIndex: number;
  dosage: string;
  frequency: string;
  duration: string;
  qty: number;
}

interface RxSeed {
  patientIndex: number;
  doctorIndex: number;
  daysAgo: number;
  status: PrescriptionStatus;
  lines: LineSeed[];
  notes?: string;
}

const SEEDS: RxSeed[] = [
  {
    patientIndex: 0,
    doctorIndex: 0,
    daysAgo: 0,
    status: "Pending",
    lines: [
      { medIndex: 0, dosage: "500mg", frequency: "TID", duration: "5 days", qty: 15 },
      { medIndex: 5, dosage: "400mg", frequency: "BID PRN", duration: "3 days", qty: 6 },
    ],
    notes: "Take after meals.",
  },
  {
    patientIndex: 1,
    doctorIndex: 1,
    daysAgo: 0,
    status: "Pending",
    lines: [
      { medIndex: 3, dosage: "20mg", frequency: "OD at night", duration: "30 days", qty: 30 },
      { medIndex: 18, dosage: "75mg", frequency: "OD", duration: "30 days", qty: 30 },
      { medIndex: 22, dosage: "5mg", frequency: "OD", duration: "30 days", qty: 30 },
    ],
  },
  {
    patientIndex: 2,
    doctorIndex: 2,
    daysAgo: 1,
    status: "Dispensed",
    lines: [
      { medIndex: 4, dosage: "10mg", frequency: "OD at night", duration: "10 days", qty: 10 },
    ],
  },
  {
    patientIndex: 3,
    doctorIndex: 3,
    daysAgo: 1,
    status: "Dispensed",
    lines: [{ medIndex: 9, dosage: "500mg", frequency: "OD", duration: "3 days", qty: 3 }],
    notes: "Complete full course.",
  },
  {
    patientIndex: 4,
    doctorIndex: 4,
    daysAgo: 2,
    status: "Partially Dispensed",
    lines: [
      { medIndex: 15, dosage: "1000 IU", frequency: "OD", duration: "60 days", qty: 60 },
      { medIndex: 17, dosage: "1 tab", frequency: "OD", duration: "30 days", qty: 30 },
    ],
  },
  {
    patientIndex: 5,
    doctorIndex: 0,
    daysAgo: 2,
    status: "Pending",
    lines: [
      { medIndex: 7, dosage: "5mg", frequency: "OD morning", duration: "30 days", qty: 30 },
      { medIndex: 8, dosage: "50mg", frequency: "OD", duration: "30 days", qty: 30 },
    ],
    notes: "Monitor blood pressure.",
  },
  {
    patientIndex: 6,
    doctorIndex: 0,
    daysAgo: 3,
    status: "Dispensed",
    lines: [{ medIndex: 19, dosage: "250mg", frequency: "BID PRN", duration: "5 days", qty: 10 }],
  },
  {
    patientIndex: 7,
    doctorIndex: 2,
    daysAgo: 4,
    status: "Dispensed",
    lines: [{ medIndex: 13, dosage: "10mg", frequency: "OD", duration: "14 days", qty: 14 }],
  },
  {
    patientIndex: 8,
    doctorIndex: 1,
    daysAgo: 5,
    status: "Partially Dispensed",
    lines: [
      { medIndex: 20, dosage: "Apply thin layer", frequency: "TID", duration: "7 days", qty: 1 },
      { medIndex: 5, dosage: "400mg", frequency: "TID", duration: "5 days", qty: 15 },
    ],
  },
  {
    patientIndex: 9,
    doctorIndex: 3,
    daysAgo: 6,
    status: "Cancelled",
    lines: [{ medIndex: 10, dosage: "500mg", frequency: "BID", duration: "7 days", qty: 14 }],
    notes: "Patient reported allergy - replaced with alternative.",
  },
  {
    patientIndex: 10,
    doctorIndex: 4,
    daysAgo: 7,
    status: "Dispensed",
    lines: [{ medIndex: 24, dosage: "1 tab", frequency: "OD", duration: "30 days", qty: 30 }],
  },
  {
    patientIndex: 11,
    doctorIndex: 0,
    daysAgo: 8,
    status: "Dispensed",
    lines: [
      { medIndex: 2, dosage: "500mg", frequency: "BID", duration: "30 days", qty: 60 },
      { medIndex: 12, dosage: "2mg", frequency: "OD morning", duration: "30 days", qty: 30 },
      { medIndex: 11, dosage: "20 units", frequency: "OD at bedtime", duration: "30 days", qty: 1 },
    ],
    notes: "Diabetes follow-up in 4 weeks.",
  },
  {
    patientIndex: 12,
    doctorIndex: 2,
    daysAgo: 9,
    status: "Dispensed",
    lines: [{ medIndex: 4, dosage: "10mg", frequency: "OD", duration: "30 days", qty: 30 }],
  },
  {
    patientIndex: 13,
    doctorIndex: 1,
    daysAgo: 10,
    status: "Dispensed",
    lines: [{ medIndex: 21, dosage: "100mg", frequency: "BID", duration: "7 days", qty: 14 }],
  },
  {
    patientIndex: 14,
    doctorIndex: 3,
    daysAgo: 12,
    status: "Dispensed",
    lines: [
      { medIndex: 16, dosage: "1 tab", frequency: "OD", duration: "30 days", qty: 30 },
      { medIndex: 15, dosage: "1000 IU", frequency: "OD", duration: "30 days", qty: 30 },
    ],
  },
];

function isoDaysAgo(days: number): string {
  const d = new Date();
  d.setDate(d.getDate() - days);
  d.setHours(10 + (days % 6), (days * 7) % 60, 0, 0);
  return d.toISOString();
}

function makeLines(seeds: LineSeed[], rxId: string): PrescriptionLine[] {
  return seeds.map((ls, li) => {
    const med = MEDICINES_SEED[ls.medIndex % MEDICINES_SEED.length];
    return {
      id: `${rxId}-L${li + 1}`,
      medicineId: med.id,
      medicineName: med.name,
      dosage: ls.dosage,
      frequency: ls.frequency,
      duration: ls.duration,
      qty: ls.qty,
      dispensed: false,
    };
  });
}

export const PRESCRIPTIONS_SEED: Prescription[] = SEEDS.map((s, i) => {
  const patient = PATIENTS[s.patientIndex % PATIENTS.length];
  const doctor = DOCTORS[s.doctorIndex % DOCTORS.length];
  const id = `RX-${(1001 + i).toString()}`;
  const lines = makeLines(s.lines, id);
  if (s.status === "Dispensed") lines.forEach((l) => (l.dispensed = true));
  if (s.status === "Partially Dispensed" && lines.length > 0) lines[0].dispensed = true;
  return {
    id,
    patientId: patient.id,
    patientName: `${patient.firstName} ${patient.lastName}`,
    doctorId: doctor.id,
    doctorName: doctor.name,
    date: isoDaysAgo(s.daysAgo),
    status: s.status,
    notes: s.notes,
    lines,
  };
});

export function nextPrescriptionId(existing: Prescription[]): string {
  const max = existing.reduce((m, x) => {
    const n = Number(x.id.split("-")[1]);
    return Number.isFinite(n) && n > m ? n : m;
  }, 1000);
  return `RX-${max + 1}`;
}
