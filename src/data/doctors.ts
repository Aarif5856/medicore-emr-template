import { DOCTORS as APPT_DOCTORS } from "@/data/appointments";

export const DOCTOR_SPECIALTIES = [
  "Cardiology",
  "Orthopedics",
  "Pediatrics",
  "Neurology",
  "General Medicine",
  "Dermatology",
  "Emergency",
  "Radiology",
] as const;
export type DoctorSpecialty = (typeof DOCTOR_SPECIALTIES)[number];

export type DoctorAvailability = "Available" | "In Surgery" | "Off Duty" | "On Leave";
export const DOCTOR_AVAILABILITIES: DoctorAvailability[] = [
  "Available",
  "In Surgery",
  "Off Duty",
  "On Leave",
];

export interface DoctorWeeklySlot {
  day: "Mon" | "Tue" | "Wed" | "Thu" | "Fri" | "Sat" | "Sun";
  hours: string; // e.g. "08:00 – 16:00" or "Off"
}

export interface DoctorReview {
  id: string;
  patient: string;
  rating: number; // 1..5
  date: string; // ISO
  comment: string;
}

export interface RecentPatient {
  name: string;
  lastVisit: string; // ISO
  reason: string;
}

export interface Doctor {
  id: string; // DR-01
  staffId?: string; // link back to Staff module (EMP-xxxx)
  firstName: string;
  lastName: string;
  specialty: DoctorSpecialty;
  department: string;
  qualification: string;
  experienceYears: number;
  rating: number; // 1..5, one decimal
  languages: string[];
  phone: string;
  email: string;
  bio: string;
  availability: DoctorAvailability;
  patientsThisMonth: number;
  todaysAppointments: number;
  weeklySchedule: DoctorWeeklySlot[];
  certifications: string[];
  recentPatients: RecentPatient[];
  reviews: DoctorReview[];
}

const DEFAULT_WEEK_MORNING: DoctorWeeklySlot[] = [
  { day: "Mon", hours: "08:00 – 16:00" },
  { day: "Tue", hours: "08:00 – 16:00" },
  { day: "Wed", hours: "08:00 – 16:00" },
  { day: "Thu", hours: "08:00 – 16:00" },
  { day: "Fri", hours: "08:00 – 16:00" },
  { day: "Sat", hours: "Off" },
  { day: "Sun", hours: "Off" },
];

const DEFAULT_WEEK_EVENING: DoctorWeeklySlot[] = [
  { day: "Mon", hours: "14:00 – 22:00" },
  { day: "Tue", hours: "14:00 – 22:00" },
  { day: "Wed", hours: "Off" },
  { day: "Thu", hours: "14:00 – 22:00" },
  { day: "Fri", hours: "14:00 – 22:00" },
  { day: "Sat", hours: "10:00 – 18:00" },
  { day: "Sun", hours: "Off" },
];

const DEFAULT_WEEK_NIGHT: DoctorWeeklySlot[] = [
  { day: "Mon", hours: "22:00 – 06:00" },
  { day: "Tue", hours: "22:00 – 06:00" },
  { day: "Wed", hours: "22:00 – 06:00" },
  { day: "Thu", hours: "Off" },
  { day: "Fri", hours: "Off" },
  { day: "Sat", hours: "22:00 – 06:00" },
  { day: "Sun", hours: "22:00 – 06:00" },
];

export const DEFAULT_WEEK_PRESETS = {
  Morning: DEFAULT_WEEK_MORNING,
  Evening: DEFAULT_WEEK_EVENING,
  Night: DEFAULT_WEEK_NIGHT,
} as const;

type Seed = Omit<Doctor, "weeklySchedule" | "certifications" | "recentPatients" | "reviews"> & {
  week?: DoctorWeeklySlot[];
};

const SEEDS: Seed[] = [
  {
    id: "DR-01",
    staffId: "EMP-0001",
    firstName: "Aisha",
    lastName: "Patel",
    specialty: "Cardiology",
    department: "Cardiology",
    qualification: "MD, FACC",
    experienceYears: 14,
    rating: 4.9,
    languages: ["English", "Hindi", "Gujarati"],
    phone: "+1 (415) 555-0101",
    email: "aisha.patel@medicore.io",
    bio: "Interventional cardiologist with 14+ years of experience in complex coronary interventions, structural heart disease, and preventive cardiology.",
    availability: "Available",
    patientsThisMonth: 128,
    todaysAppointments: 8,
  },
  {
    id: "DR-02",
    staffId: "EMP-0002",
    firstName: "Kenji",
    lastName: "Nakamura",
    specialty: "Orthopedics",
    department: "Orthopedics",
    qualification: "MS Orthopedics, MCh",
    experienceYears: 12,
    rating: 4.7,
    languages: ["English", "Japanese"],
    phone: "+1 (415) 555-0102",
    email: "kenji.nakamura@medicore.io",
    bio: "Orthopedic surgeon specializing in joint replacement, sports medicine, and minimally invasive spine procedures.",
    availability: "In Surgery",
    patientsThisMonth: 94,
    todaysAppointments: 3,
  },
  {
    id: "DR-03",
    staffId: "EMP-0003",
    firstName: "Elena",
    lastName: "Reyes",
    specialty: "Pediatrics",
    department: "Pediatrics",
    qualification: "MD Pediatrics",
    experienceYears: 15,
    rating: 4.9,
    languages: ["English", "Spanish"],
    phone: "+1 (415) 555-0103",
    email: "elena.reyes@medicore.io",
    bio: "Board-certified pediatrician focused on adolescent care, developmental milestones, and childhood chronic conditions.",
    availability: "Available",
    patientsThisMonth: 142,
    todaysAppointments: 10,
  },
  {
    id: "DR-04",
    staffId: "EMP-0004",
    firstName: "Omar",
    lastName: "Hassan",
    specialty: "Neurology",
    department: "Neurology",
    qualification: "DM Neurology",
    experienceYears: 18,
    rating: 4.8,
    languages: ["English", "Arabic", "French"],
    phone: "+1 (415) 555-0104",
    email: "omar.hassan@medicore.io",
    bio: "Neurologist with expertise in stroke care, epilepsy, and movement disorders. Runs a weekly headache clinic.",
    availability: "Available",
    patientsThisMonth: 87,
    todaysAppointments: 6,
    week: DEFAULT_WEEK_EVENING,
  },
  {
    id: "DR-05",
    staffId: "EMP-0005",
    firstName: "Marta",
    lastName: "Kowalski",
    specialty: "Dermatology",
    department: "Dermatology",
    qualification: "MD Dermatology",
    experienceYears: 9,
    rating: 4.6,
    languages: ["English", "Polish"],
    phone: "+1 (415) 555-0105",
    email: "marta.kowalski@medicore.io",
    bio: "Medical and cosmetic dermatologist. Special interest in inflammatory skin conditions and skin cancer screening.",
    availability: "On Leave",
    patientsThisMonth: 61,
    todaysAppointments: 0,
  },
  {
    id: "DR-06",
    staffId: "EMP-0006",
    firstName: "Sam",
    lastName: "Rivera",
    specialty: "General Medicine",
    department: "General Medicine",
    qualification: "MD Internal Medicine",
    experienceYears: 20,
    rating: 4.8,
    languages: ["English", "Spanish"],
    phone: "+1 (415) 555-0106",
    email: "sam.rivera@medicore.io",
    bio: "Primary care internist. Manages chronic disease panels including diabetes, hypertension, and preventive screening.",
    availability: "Available",
    patientsThisMonth: 156,
    todaysAppointments: 12,
  },
  {
    id: "DR-07",
    staffId: "EMP-0007",
    firstName: "Priya",
    lastName: "Shah",
    specialty: "Emergency",
    department: "Emergency",
    qualification: "MD Emergency Medicine",
    experienceYears: 8,
    rating: 4.7,
    languages: ["English", "Hindi"],
    phone: "+1 (415) 555-0107",
    email: "priya.shah@medicore.io",
    bio: "Emergency physician trained in trauma resuscitation, critical care, and point-of-care ultrasound.",
    availability: "Off Duty",
    patientsThisMonth: 210,
    todaysAppointments: 0,
    week: DEFAULT_WEEK_NIGHT,
  },
  {
    id: "DR-08",
    staffId: "EMP-0008",
    firstName: "Thomas",
    lastName: "Berger",
    specialty: "Radiology",
    department: "Radiology",
    qualification: "MD Radiology, FRCR",
    experienceYears: 13,
    rating: 4.7,
    languages: ["English", "German"],
    phone: "+1 (415) 555-0108",
    email: "thomas.berger@medicore.io",
    bio: "Diagnostic radiologist with subspecialty focus in musculoskeletal and neuro imaging.",
    availability: "Available",
    patientsThisMonth: 74,
    todaysAppointments: 4,
  },
  {
    id: "DR-09",
    firstName: "Nina",
    lastName: "Ito",
    specialty: "Cardiology",
    department: "Cardiology",
    qualification: "MD, FACC",
    experienceYears: 7,
    rating: 4.6,
    languages: ["English", "Japanese"],
    phone: "+1 (415) 555-0109",
    email: "nina.ito@medicore.io",
    bio: "Non-invasive cardiologist with a focus on echocardiography and heart failure management.",
    availability: "Available",
    patientsThisMonth: 88,
    todaysAppointments: 7,
  },
  {
    id: "DR-10",
    firstName: "Julian",
    lastName: "Weiss",
    specialty: "Orthopedics",
    department: "Orthopedics",
    qualification: "MS Orthopedics",
    experienceYears: 10,
    rating: 4.5,
    languages: ["English", "German"],
    phone: "+1 (415) 555-0110",
    email: "julian.weiss@medicore.io",
    bio: "Orthopedic surgeon focused on sports injuries and arthroscopic shoulder & knee repair.",
    availability: "In Surgery",
    patientsThisMonth: 71,
    todaysAppointments: 2,
  },
  {
    id: "DR-11",
    firstName: "Amara",
    lastName: "Okafor",
    specialty: "Pediatrics",
    department: "Pediatrics",
    qualification: "MD Pediatrics, IBCLC",
    experienceYears: 11,
    rating: 4.8,
    languages: ["English", "Igbo"],
    phone: "+1 (415) 555-0111",
    email: "amara.okafor@medicore.io",
    bio: "Pediatrician and lactation consultant with strong newborn and infant care experience.",
    availability: "Available",
    patientsThisMonth: 118,
    todaysAppointments: 9,
  },
  {
    id: "DR-12",
    firstName: "Marcus",
    lastName: "Hall",
    specialty: "Neurology",
    department: "Neurology",
    qualification: "MD, PhD Neuroscience",
    experienceYears: 16,
    rating: 4.9,
    languages: ["English"],
    phone: "+1 (415) 555-0112",
    email: "marcus.hall@medicore.io",
    bio: "Cognitive neurologist with an academic practice in memory disorders and neurodegenerative disease.",
    availability: "Available",
    patientsThisMonth: 62,
    todaysAppointments: 5,
  },
  {
    id: "DR-13",
    firstName: "Sofia",
    lastName: "Marino",
    specialty: "Dermatology",
    department: "Dermatology",
    qualification: "MD Dermatology",
    experienceYears: 6,
    rating: 4.5,
    languages: ["English", "Italian"],
    phone: "+1 (415) 555-0113",
    email: "sofia.marino@medicore.io",
    bio: "Dermatologist with interest in pediatric dermatology and pigmented lesion evaluation.",
    availability: "Available",
    patientsThisMonth: 79,
    todaysAppointments: 8,
  },
  {
    id: "DR-14",
    firstName: "Daniel",
    lastName: "Kim",
    specialty: "Emergency",
    department: "Emergency",
    qualification: "MD Emergency Medicine",
    experienceYears: 9,
    rating: 4.6,
    languages: ["English", "Korean"],
    phone: "+1 (415) 555-0114",
    email: "daniel.kim@medicore.io",
    bio: "Emergency physician with critical care fellowship. Team leader for the resuscitation bay.",
    availability: "Off Duty",
    patientsThisMonth: 188,
    todaysAppointments: 0,
    week: DEFAULT_WEEK_NIGHT,
  },
  {
    id: "DR-15",
    firstName: "Ravi",
    lastName: "Menon",
    specialty: "General Medicine",
    department: "General Medicine",
    qualification: "MD Internal Medicine",
    experienceYears: 12,
    rating: 4.7,
    languages: ["English", "Hindi", "Malayalam"],
    phone: "+1 (415) 555-0115",
    email: "ravi.menon@medicore.io",
    bio: "Internist and hospitalist. Primary care across chronic disease management and preventive medicine.",
    availability: "Available",
    patientsThisMonth: 133,
    todaysAppointments: 11,
  },
];

const REVIEW_SNIPPETS: Array<Omit<DoctorReview, "id">> = [
  { patient: "M. Cortez", rating: 5, date: "2026-06-14", comment: "Took time to explain every step. Never felt rushed." },
  { patient: "R. Ito", rating: 5, date: "2026-06-02", comment: "Clear, warm, and very thorough. Highly recommend." },
  { patient: "J. Bello", rating: 4, date: "2026-05-19", comment: "Wait was a bit long but the consultation was excellent." },
  { patient: "L. Anders", rating: 5, date: "2026-05-08", comment: "Best specialist I've seen at this clinic." },
];

const RECENT_PATIENTS: Array<Omit<RecentPatient, "lastVisit"> & { offsetDays: number }> = [
  { name: "Michael Cortez", reason: "Chest pain follow-up", offsetDays: 1 },
  { name: "Priya Ramanathan", reason: "Annual physical", offsetDays: 3 },
  { name: "Jerome Bello", reason: "Prescription refill", offsetDays: 5 },
  { name: "Sara Nguyen", reason: "Lab results review", offsetDays: 8 },
];

function certsFor(qualification: string): string[] {
  const base = ["Board Certified", qualification];
  return Array.from(new Set(base));
}

function reviewsFor(id: string): DoctorReview[] {
  return REVIEW_SNIPPETS.map((r, i) => ({ ...r, id: `${id}-RV-${i + 1}` }));
}

function recentFor(): RecentPatient[] {
  const today = new Date();
  return RECENT_PATIENTS.map(({ offsetDays, ...rest }) => {
    const d = new Date(today);
    d.setDate(d.getDate() - offsetDays);
    return { ...rest, lastVisit: d.toISOString() };
  });
}

export const DOCTORS: Doctor[] = SEEDS.map((s) => ({
  ...s,
  weeklySchedule: s.week ?? DEFAULT_WEEK_MORNING,
  certifications: certsFor(s.qualification),
  recentPatients: recentFor(),
  reviews: reviewsFor(s.id),
}));

export function doctorFullName(d: Pick<Doctor, "firstName" | "lastName">): string {
  return `Dr. ${d.firstName} ${d.lastName}`;
}

export function doctorInitials(d: Pick<Doctor, "firstName" | "lastName">): string {
  return `${d.firstName[0] ?? ""}${d.lastName[0] ?? ""}`.toUpperCase();
}

export function formatDoctorDate(iso: string): string {
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return iso;
  return d.toLocaleDateString("en-US", { year: "numeric", month: "short", day: "numeric" });
}

export function nextDoctorId(existing: Doctor[]): string {
  const nums = existing
    .map((d) => Number(d.id.replace("DR-", "")))
    .filter((n) => !Number.isNaN(n));
  const max = nums.length ? Math.max(...nums) : 0;
  return `DR-${String(max + 1).padStart(2, "0")}`;
}

// Sanity check: make sure DR-01..DR-06 stay aligned with appointment doctors so
// the profile "Appointments" tab can filter mock appointments by doctorId.
export const _APPT_DOCTOR_IDS = APPT_DOCTORS.map((d) => d.id);
