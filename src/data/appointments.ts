import {
  addDays,
  eachDayOfInterval,
  endOfMonth,
  format,
  parseISO,
  setHours,
  setMinutes,
  startOfDay,
  startOfMonth,
} from "date-fns";

import { PATIENTS } from "@/data/patients";

export type AppointmentStatus = "Confirmed" | "Pending" | "Cancelled" | "Completed";
export type AppointmentType = "In-person" | "Telemedicine";

export interface Appointment {
  id: string;
  patientId: string;
  patientName: string;
  doctorId: string;
  doctorName: string;
  department: string;
  start: string; // ISO
  durationMin: number;
  status: AppointmentStatus;
  type: AppointmentType;
  reason?: string;
}

export interface Doctor {
  id: string;
  name: string;
  department: string;
}

export const DEPARTMENTS = [
  "General Medicine",
  "Cardiology",
  "Pediatrics",
  "Orthopedics",
  "Dermatology",
  "Neurology",
] as const;
export type Department = (typeof DEPARTMENTS)[number];

export const DOCTORS: Doctor[] = [
  { id: "DR-01", name: "Dr. Aisha Patel", department: "Cardiology" },
  { id: "DR-02", name: "Dr. Kenji Nakamura", department: "Orthopedics" },
  { id: "DR-03", name: "Dr. Elena Reyes", department: "Pediatrics" },
  { id: "DR-04", name: "Dr. Omar Hassan", department: "Neurology" },
  { id: "DR-05", name: "Dr. Marta Kowalski", department: "Dermatology" },
  { id: "DR-06", name: "Dr. Sam Rivera", department: "General Medicine" },
];

export const APPOINTMENT_STATUSES: AppointmentStatus[] = [
  "Confirmed",
  "Pending",
  "Cancelled",
  "Completed",
];

const REASONS = [
  "Routine check-up",
  "Follow-up consultation",
  "Lab results review",
  "Vaccination",
  "Post-op follow-up",
  "Prescription refill",
  "Cardiac evaluation",
  "Skin rash consultation",
  "Physical therapy assessment",
  "Chronic pain management",
];

export const HOURS_START = 8;
export const HOURS_END = 18;

const TIME_SLOTS_LOCAL: Array<[number, number]> = [];
for (let h = HOURS_START; h < HOURS_END; h++) {
  TIME_SLOTS_LOCAL.push([h, 0]);
  TIME_SLOTS_LOCAL.push([h, 30]);
}

export const TIME_SLOTS: string[] = TIME_SLOTS_LOCAL.map(
  ([h, m]) => `${String(h).padStart(2, "0")}:${String(m).padStart(2, "0")}`,
);

// Deterministic pseudo-random for consistent mock data across renders
function seeded(n: number): number {
  const x = Math.sin(n * 9301 + 49297) * 233280;
  return x - Math.floor(x);
}

export function generateInitialAppointments(reference: Date = new Date()): Appointment[] {
  const monthStart = startOfMonth(reference);
  const monthEnd = endOfMonth(reference);
  // Extend by 10 days on each side for week-view continuity across month boundaries
  const days = eachDayOfInterval({
    start: addDays(monthStart, -10),
    end: addDays(monthEnd, 10),
  });
  const appts: Appointment[] = [];
  const today = startOfDay(reference);
  let counter = 1;

  for (const day of days) {
    const dow = day.getDay();
    const isWeekend = dow === 0 || dow === 6;
    const seed = day.getFullYear() * 10000 + (day.getMonth() + 1) * 100 + day.getDate();
    const count = isWeekend ? Math.floor(seeded(seed) * 2) : 3 + Math.floor(seeded(seed + 1) * 4);
    const used = new Set<string>();

    for (let i = 0; i < count; i++) {
      let attempts = 0;
      let slotIndex = 0;
      let doctorIndex = 0;
      let key = "";
      do {
        slotIndex = Math.floor(seeded(seed + i * 7 + attempts) * TIME_SLOTS_LOCAL.length);
        doctorIndex = Math.floor(seeded(seed + i * 11 + attempts + 3) * DOCTORS.length);
        key = `${slotIndex}-${doctorIndex}`;
        attempts++;
      } while (used.has(key) && attempts < 12);
      if (used.has(key)) continue;
      used.add(key);

      const [h, m] = TIME_SLOTS_LOCAL[slotIndex];
      const start = setMinutes(setHours(startOfDay(day), h), m);
      const duration = [30, 45, 60][Math.floor(seeded(seed + i * 13) * 3)];

      const patient = PATIENTS[(counter * 7) % PATIENTS.length];
      const doctor = DOCTORS[doctorIndex];
      const reason = REASONS[(counter * 3) % REASONS.length];

      const dayDiff = Math.round(
        (startOfDay(day).getTime() - today.getTime()) / (24 * 3600 * 1000),
      );
      let status: AppointmentStatus;
      if (dayDiff < 0) {
        status = seeded(seed + i * 17) < 0.15 ? "Cancelled" : "Completed";
      } else if (dayDiff === 0) {
        const r = seeded(seed + i * 19);
        if (r < 0.5) status = "Confirmed";
        else if (r < 0.8) status = "Pending";
        else status = "Completed";
      } else {
        const r = seeded(seed + i * 23);
        status = r < 0.7 ? "Confirmed" : r < 0.95 ? "Pending" : "Cancelled";
      }

      const type: AppointmentType =
        seeded(seed + i * 29) < 0.75 ? "In-person" : "Telemedicine";

      appts.push({
        id: `APT-${String(counter).padStart(4, "0")}`,
        patientId: patient.id,
        patientName: `${patient.firstName} ${patient.lastName}`,
        doctorId: doctor.id,
        doctorName: doctor.name,
        department: doctor.department,
        start: start.toISOString(),
        durationMin: duration,
        status,
        type,
        reason,
      });
      counter++;
    }
  }
  return appts;
}

export function nextAppointmentId(existing: Appointment[]): string {
  const nums = existing
    .map((a) => Number(a.id.replace("APT-", "")))
    .filter((n) => !Number.isNaN(n));
  const max = nums.length ? Math.max(...nums) : 0;
  return `APT-${String(max + 1).padStart(4, "0")}`;
}

export function getBookedSlots(
  appointments: Appointment[],
  doctorId: string,
  date: Date,
  ignoreId?: string,
): Set<string> {
  const key = format(date, "yyyy-MM-dd");
  const set = new Set<string>();
  for (const a of appointments) {
    if (a.doctorId !== doctorId) continue;
    if (a.status === "Cancelled") continue;
    if (ignoreId && a.id === ignoreId) continue;
    const d = parseISO(a.start);
    if (format(d, "yyyy-MM-dd") !== key) continue;
    set.add(format(d, "HH:mm"));
  }
  return set;
}
