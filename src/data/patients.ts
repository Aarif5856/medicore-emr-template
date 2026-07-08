export type PatientStatus = "Stable" | "Under Treatment" | "Critical" | "Discharged";
export type Gender = "Male" | "Female" | "Other";
export type BloodGroup = "A+" | "A-" | "B+" | "B-" | "AB+" | "AB-" | "O+" | "O-";

export interface Patient {
  id: string; // e.g. PT-0001
  firstName: string;
  lastName: string;
  gender: Gender;
  age: number;
  bloodGroup: BloodGroup;
  phone: string;
  email: string;
  lastVisit: string; // ISO date
  doctor: string;
  status: PatientStatus;
}

export const PATIENTS_SUMMARY = [
  { label: "Total", value: "2,847", tone: "primary" as const },
  { label: "New this month", value: "128", tone: "teal" as const },
  { label: "Admitted", value: "43", tone: "warning" as const },
  { label: "Critical", value: "7", tone: "destructive" as const },
];

export const PATIENTS: Patient[] = [
  { id: "PT-0001", firstName: "Amelia",  lastName: "Chen",       gender: "Female", age: 34, bloodGroup: "O+",  phone: "+1 415 555 0132", email: "amelia.chen@mail.com",    lastVisit: "2026-06-24", doctor: "Dr. Aisha Patel",     status: "Stable" },
  { id: "PT-0002", firstName: "Marcus",  lastName: "Johnson",    gender: "Male",   age: 52, bloodGroup: "A+",  phone: "+1 415 555 0148", email: "marcus.j@mail.com",       lastVisit: "2026-06-30", doctor: "Dr. Kenji Nakamura",  status: "Under Treatment" },
  { id: "PT-0003", firstName: "Sofia",   lastName: "Rodríguez",  gender: "Female", age: 27, bloodGroup: "B+",  phone: "+34 91 555 0111", email: "sofia.r@mail.com",        lastVisit: "2026-07-01", doctor: "Dr. Elena Reyes",     status: "Stable" },
  { id: "PT-0004", firstName: "Liam",    lastName: "O'Connor",   gender: "Male",   age: 41, bloodGroup: "AB+", phone: "+353 1 555 0102", email: "liam.oc@mail.com",        lastVisit: "2026-05-19", doctor: "Dr. Omar Hassan",     status: "Discharged" },
  { id: "PT-0005", firstName: "Priya",   lastName: "Sharma",     gender: "Female", age: 38, bloodGroup: "O-",  phone: "+91 22 555 0187", email: "priya.s@mail.com",        lastVisit: "2026-07-05", doctor: "Dr. Marta Kowalski",  status: "Stable" },
  { id: "PT-0006", firstName: "David",   lastName: "Kim",        gender: "Male",   age: 63, bloodGroup: "A-",  phone: "+82 2 555 0173",  email: "david.kim@mail.com",      lastVisit: "2026-07-02", doctor: "Dr. Aisha Patel",     status: "Critical" },
  { id: "PT-0007", firstName: "Rita",    lastName: "Alvarez",    gender: "Female", age: 58, bloodGroup: "B-",  phone: "+52 55 555 0159", email: "rita.a@mail.com",         lastVisit: "2026-07-06", doctor: "Dr. Aisha Patel",     status: "Critical" },
  { id: "PT-0008", firstName: "Noah",    lastName: "Bennett",    gender: "Male",   age: 29, bloodGroup: "O+",  phone: "+1 617 555 0144", email: "noah.b@mail.com",         lastVisit: "2026-06-11", doctor: "Dr. Elena Reyes",     status: "Stable" },
  { id: "PT-0009", firstName: "Isabella",lastName: "Rossi",      gender: "Female", age: 45, bloodGroup: "AB-", phone: "+39 06 555 0122", email: "isabella.r@mail.com",     lastVisit: "2026-06-22", doctor: "Dr. Kenji Nakamura",  status: "Under Treatment" },
  { id: "PT-0010", firstName: "Ahmed",   lastName: "El-Sayed",   gender: "Male",   age: 36, bloodGroup: "A+",  phone: "+20 2 555 0166",  email: "ahmed.e@mail.com",        lastVisit: "2026-05-30", doctor: "Dr. Omar Hassan",     status: "Discharged" },
  { id: "PT-0011", firstName: "Chloé",   lastName: "Dubois",     gender: "Female", age: 31, bloodGroup: "O+",  phone: "+33 1 555 0138",  email: "chloe.d@mail.com",        lastVisit: "2026-07-04", doctor: "Dr. Marta Kowalski",  status: "Stable" },
  { id: "PT-0012", firstName: "Ethan",   lastName: "Wallace",    gender: "Male",   age: 47, bloodGroup: "B+",  phone: "+61 2 555 0191",  email: "ethan.w@mail.com",        lastVisit: "2026-06-17", doctor: "Dr. Aisha Patel",     status: "Under Treatment" },
  { id: "PT-0013", firstName: "Hannah",  lastName: "Fischer",    gender: "Female", age: 24, bloodGroup: "A-",  phone: "+49 30 555 0155", email: "hannah.f@mail.com",       lastVisit: "2026-07-03", doctor: "Dr. Elena Reyes",     status: "Stable" },
  { id: "PT-0014", firstName: "Yuki",    lastName: "Tanaka",     gender: "Female", age: 39, bloodGroup: "O+",  phone: "+81 3 555 0129",  email: "yuki.t@mail.com",         lastVisit: "2026-06-28", doctor: "Dr. Kenji Nakamura",  status: "Under Treatment" },
  { id: "PT-0015", firstName: "Samuel",  lastName: "Nyongo",     gender: "Male",   age: 55, bloodGroup: "AB+", phone: "+254 20 555 0177",email: "samuel.n@mail.com",       lastVisit: "2026-05-25", doctor: "Dr. Omar Hassan",     status: "Discharged" },
  { id: "PT-0016", firstName: "Elena",   lastName: "Petrova",    gender: "Female", age: 42, bloodGroup: "B-",  phone: "+7 495 555 0163", email: "elena.p@mail.com",        lastVisit: "2026-07-05", doctor: "Dr. Marta Kowalski",  status: "Stable" },
  { id: "PT-0017", firstName: "Miguel",  lastName: "Santos",     gender: "Male",   age: 33, bloodGroup: "O-",  phone: "+55 11 555 0104", email: "miguel.s@mail.com",       lastVisit: "2026-06-15", doctor: "Dr. Aisha Patel",     status: "Stable" },
  { id: "PT-0018", firstName: "Layla",   lastName: "Al-Farsi",   gender: "Female", age: 28, bloodGroup: "A+",  phone: "+971 4 555 0182", email: "layla.af@mail.com",       lastVisit: "2026-07-06", doctor: "Dr. Elena Reyes",     status: "Under Treatment" },
  { id: "PT-0019", firstName: "Oliver",  lastName: "Thompson",   gender: "Male",   age: 66, bloodGroup: "AB-", phone: "+44 20 555 0197", email: "oliver.t@mail.com",       lastVisit: "2026-07-01", doctor: "Dr. Aisha Patel",     status: "Critical" },
  { id: "PT-0020", firstName: "Aria",    lastName: "Nakamura",   gender: "Female", age: 19, bloodGroup: "O+",  phone: "+1 213 555 0118", email: "aria.n@mail.com",         lastVisit: "2026-06-08", doctor: "Dr. Elena Reyes",     status: "Discharged" },
  { id: "PT-0021", firstName: "Jonas",   lastName: "Lindqvist",  gender: "Male",   age: 44, bloodGroup: "B+",  phone: "+46 8 555 0176",  email: "jonas.l@mail.com",        lastVisit: "2026-06-19", doctor: "Dr. Kenji Nakamura",  status: "Under Treatment" },
  { id: "PT-0022", firstName: "Grace",   lastName: "Okoye",      gender: "Female", age: 30, bloodGroup: "A+",  phone: "+234 1 555 0149", email: "grace.o@mail.com",        lastVisit: "2026-07-04", doctor: "Dr. Marta Kowalski",  status: "Stable" },
  { id: "PT-0023", firstName: "Tomás",   lastName: "Herrera",    gender: "Male",   age: 37, bloodGroup: "O+",  phone: "+54 11 555 0193", email: "tomas.h@mail.com",        lastVisit: "2026-06-26", doctor: "Dr. Omar Hassan",     status: "Stable" },
  { id: "PT-0024", firstName: "Nora",    lastName: "Ibrahim",    gender: "Female", age: 51, bloodGroup: "AB+", phone: "+90 212 555 0107",email: "nora.i@mail.com",         lastVisit: "2026-06-30", doctor: "Dr. Aisha Patel",     status: "Under Treatment" },
  { id: "PT-0025", firstName: "Kai",     lastName: "Andersen",   gender: "Other",  age: 26, bloodGroup: "O-",  phone: "+45 33 555 0111", email: "kai.a@mail.com",          lastVisit: "2026-07-05", doctor: "Dr. Elena Reyes",     status: "Stable" },
];

export function getPatientById(id: string): Patient | undefined {
  return PATIENTS.find((p) => p.id === id);
}
