export type StaffRole = "Doctor" | "Nurse" | "Admin" | "Support";
export type StaffStatus = "Active" | "On Leave" | "Inactive";
export type Shift = "Morning" | "Evening" | "Night";
export type StaffGender = "Male" | "Female" | "Other";

export const STAFF_ROLES: StaffRole[] = ["Doctor", "Nurse", "Admin", "Support"];
export const STAFF_STATUSES: StaffStatus[] = ["Active", "On Leave", "Inactive"];
export const SHIFTS: Shift[] = ["Morning", "Evening", "Night"];

export const STAFF_DEPARTMENTS = [
  "General Medicine",
  "Cardiology",
  "Pediatrics",
  "Orthopedics",
  "Dermatology",
  "Neurology",
  "Emergency",
  "Radiology",
  "Pharmacy",
  "Administration",
  "Housekeeping",
  "IT & Records",
] as const;
export type StaffDepartment = (typeof STAFF_DEPARTMENTS)[number];

export interface StaffAttendanceRow {
  date: string; // ISO
  checkIn: string; // HH:mm
  checkOut: string; // HH:mm
  status: "Present" | "Late" | "Absent";
}

export interface WeeklyShift {
  day: "Mon" | "Tue" | "Wed" | "Thu" | "Fri" | "Sat" | "Sun";
  shift: Shift | "Off";
  hours: string; // e.g. "08:00 – 16:00"
}

export interface StaffDocument {
  id: string;
  name: string;
  kind: "ID Proof" | "Certificate" | "Contract" | "License";
  size: string; // e.g. "1.2 MB"
}

export interface StaffMember {
  id: string; // EMP-0001
  firstName: string;
  lastName: string;
  role: StaffRole;
  department: StaffDepartment;
  phone: string;
  email: string;
  joinedDate: string; // ISO
  shift: Shift;
  status: StaffStatus;
  gender: StaffGender;
  dob: string; // ISO
  address: string;
  emergencyContactName: string;
  emergencyContactPhone: string;
  reportingManagerId?: string;
  qualification?: string;
  weeklyShifts: WeeklyShift[];
  attendance: StaffAttendanceRow[];
  documents: StaffDocument[];
}

const WEEK_MORNING: WeeklyShift[] = [
  { day: "Mon", shift: "Morning", hours: "08:00 – 16:00" },
  { day: "Tue", shift: "Morning", hours: "08:00 – 16:00" },
  { day: "Wed", shift: "Morning", hours: "08:00 – 16:00" },
  { day: "Thu", shift: "Morning", hours: "08:00 – 16:00" },
  { day: "Fri", shift: "Morning", hours: "08:00 – 16:00" },
  { day: "Sat", shift: "Off", hours: "-" },
  { day: "Sun", shift: "Off", hours: "-" },
];

const WEEK_EVENING: WeeklyShift[] = [
  { day: "Mon", shift: "Evening", hours: "14:00 – 22:00" },
  { day: "Tue", shift: "Evening", hours: "14:00 – 22:00" },
  { day: "Wed", shift: "Off", hours: "-" },
  { day: "Thu", shift: "Evening", hours: "14:00 – 22:00" },
  { day: "Fri", shift: "Evening", hours: "14:00 – 22:00" },
  { day: "Sat", shift: "Evening", hours: "14:00 – 22:00" },
  { day: "Sun", shift: "Off", hours: "-" },
];

const WEEK_NIGHT: WeeklyShift[] = [
  { day: "Mon", shift: "Night", hours: "22:00 – 06:00" },
  { day: "Tue", shift: "Night", hours: "22:00 – 06:00" },
  { day: "Wed", shift: "Night", hours: "22:00 – 06:00" },
  { day: "Thu", shift: "Off", hours: "-" },
  { day: "Fri", shift: "Off", hours: "-" },
  { day: "Sat", shift: "Night", hours: "22:00 – 06:00" },
  { day: "Sun", shift: "Night", hours: "22:00 – 06:00" },
];

function weekFor(shift: Shift): WeeklyShift[] {
  if (shift === "Morning") return WEEK_MORNING;
  if (shift === "Evening") return WEEK_EVENING;
  return WEEK_NIGHT;
}

function daysAgoIso(n: number): string {
  const d = new Date();
  d.setDate(d.getDate() - n);
  return d.toISOString();
}

function makeAttendance(shift: Shift): StaffAttendanceRow[] {
  const times: Record<Shift, [string, string]> = {
    Morning: ["08:02", "16:05"],
    Evening: ["14:03", "22:07"],
    Night: ["22:04", "06:02"],
  };
  const [ci, co] = times[shift];
  const rows: StaffAttendanceRow[] = [];
  for (let i = 1; i <= 10; i++) {
    let status: StaffAttendanceRow["status"] = "Present";
    if (i === 3) status = "Late";
    if (i === 7) status = "Absent";
    rows.push({
      date: daysAgoIso(i),
      checkIn: status === "Absent" ? "-" : ci,
      checkOut: status === "Absent" ? "-" : co,
      status,
    });
  }
  return rows;
}

function docsFor(role: StaffRole): StaffDocument[] {
  const base: StaffDocument[] = [
    { id: "D1", name: "National ID.pdf", kind: "ID Proof", size: "1.1 MB" },
    { id: "D2", name: "Employment Contract.pdf", kind: "Contract", size: "342 KB" },
  ];
  if (role === "Doctor")
    base.push(
      { id: "D3", name: "MBBS Certificate.pdf", kind: "Certificate", size: "1.9 MB" },
      { id: "D4", name: "Medical License.pdf", kind: "License", size: "820 KB" },
    );
  if (role === "Nurse")
    base.push({ id: "D3", name: "Nursing Diploma.pdf", kind: "Certificate", size: "1.3 MB" });
  return base;
}

type Seed = {
  firstName: string;
  lastName: string;
  role: StaffRole;
  department: StaffDepartment;
  phone: string;
  email: string;
  joinedDate: string;
  shift: Shift;
  status: StaffStatus;
  gender: StaffGender;
  dob: string;
  address: string;
  emergencyContactName: string;
  emergencyContactPhone: string;
  reportingManagerId?: string;
  qualification?: string;
};

const SEEDS: Seed[] = [
  // Doctors (keep IDs aligned so managers exist first)
  {
    firstName: "Aisha",
    lastName: "Patel",
    role: "Doctor",
    department: "Cardiology",
    phone: "+1 (415) 555-0101",
    email: "aisha.patel@medicore.io",
    joinedDate: "2019-03-11",
    shift: "Morning",
    status: "Active",
    gender: "Female",
    dob: "1982-07-22",
    address: "144 Bay St, San Francisco, CA",
    emergencyContactName: "Rohan Patel",
    emergencyContactPhone: "+1 (415) 555-1101",
    qualification: "MD, FACC – Cardiology",
  },
  {
    firstName: "Kenji",
    lastName: "Nakamura",
    role: "Doctor",
    department: "Orthopedics",
    phone: "+1 (415) 555-0102",
    email: "kenji.nakamura@medicore.io",
    joinedDate: "2020-08-04",
    shift: "Morning",
    status: "Active",
    gender: "Male",
    dob: "1978-11-02",
    address: "22 Pine Ave, San Francisco, CA",
    emergencyContactName: "Yuki Nakamura",
    emergencyContactPhone: "+1 (415) 555-1102",
    qualification: "MS Orthopedics, MCh",
  },
  {
    firstName: "Elena",
    lastName: "Reyes",
    role: "Doctor",
    department: "Pediatrics",
    phone: "+1 (415) 555-0103",
    email: "elena.reyes@medicore.io",
    joinedDate: "2018-01-19",
    shift: "Morning",
    status: "Active",
    gender: "Female",
    dob: "1980-04-30",
    address: "9 Fell St, San Francisco, CA",
    emergencyContactName: "Luis Reyes",
    emergencyContactPhone: "+1 (415) 555-1103",
    qualification: "MD Pediatrics",
  },
  {
    firstName: "Omar",
    lastName: "Hassan",
    role: "Doctor",
    department: "Neurology",
    phone: "+1 (415) 555-0104",
    email: "omar.hassan@medicore.io",
    joinedDate: "2017-06-25",
    shift: "Evening",
    status: "Active",
    gender: "Male",
    dob: "1975-09-14",
    address: "301 Divisadero, San Francisco, CA",
    emergencyContactName: "Layla Hassan",
    emergencyContactPhone: "+1 (415) 555-1104",
    qualification: "DM Neurology",
  },
  {
    firstName: "Marta",
    lastName: "Kowalski",
    role: "Doctor",
    department: "Dermatology",
    phone: "+1 (415) 555-0105",
    email: "marta.kowalski@medicore.io",
    joinedDate: "2021-02-08",
    shift: "Morning",
    status: "On Leave",
    gender: "Female",
    dob: "1985-12-05",
    address: "18 Clay St, San Francisco, CA",
    emergencyContactName: "Piotr Kowalski",
    emergencyContactPhone: "+1 (415) 555-1105",
    qualification: "MD Dermatology",
  },
  {
    firstName: "Sam",
    lastName: "Rivera",
    role: "Doctor",
    department: "General Medicine",
    phone: "+1 (415) 555-0106",
    email: "sam.rivera@medicore.io",
    joinedDate: "2016-10-01",
    shift: "Morning",
    status: "Active",
    gender: "Male",
    dob: "1972-03-17",
    address: "77 Market St, San Francisco, CA",
    emergencyContactName: "Ana Rivera",
    emergencyContactPhone: "+1 (415) 555-1106",
    qualification: "MD Internal Medicine",
  },
  {
    firstName: "Priya",
    lastName: "Shah",
    role: "Doctor",
    department: "Emergency",
    phone: "+1 (415) 555-0107",
    email: "priya.shah@medicore.io",
    joinedDate: "2022-05-14",
    shift: "Night",
    status: "Active",
    gender: "Female",
    dob: "1988-06-09",
    address: "14 Oak St, San Francisco, CA",
    emergencyContactName: "Neel Shah",
    emergencyContactPhone: "+1 (415) 555-1107",
    qualification: "MD Emergency Medicine",
  },
  {
    firstName: "Thomas",
    lastName: "Berger",
    role: "Doctor",
    department: "Radiology",
    phone: "+1 (415) 555-0108",
    email: "thomas.berger@medicore.io",
    joinedDate: "2019-11-22",
    shift: "Morning",
    status: "Active",
    gender: "Male",
    dob: "1979-01-27",
    address: "500 Van Ness, San Francisco, CA",
    emergencyContactName: "Julia Berger",
    emergencyContactPhone: "+1 (415) 555-1108",
    qualification: "MD Radiology, FRCR",
  },

  // Nurses
  {
    firstName: "Grace",
    lastName: "Okoye",
    role: "Nurse",
    department: "Cardiology",
    phone: "+1 (415) 555-0201",
    email: "grace.okoye@medicore.io",
    joinedDate: "2020-04-06",
    shift: "Morning",
    status: "Active",
    gender: "Female",
    dob: "1990-05-11",
    address: "220 Mission St, SF",
    emergencyContactName: "Chidi Okoye",
    emergencyContactPhone: "+1 (415) 555-1201",
    reportingManagerId: "EMP-0001",
    qualification: "BSN, RN",
  },
  {
    firstName: "Hannah",
    lastName: "Fischer",
    role: "Nurse",
    department: "Emergency",
    phone: "+1 (415) 555-0202",
    email: "hannah.fischer@medicore.io",
    joinedDate: "2021-09-13",
    shift: "Night",
    status: "Active",
    gender: "Female",
    dob: "1993-02-18",
    address: "42 Grove St, SF",
    emergencyContactName: "Karl Fischer",
    emergencyContactPhone: "+1 (415) 555-1202",
    reportingManagerId: "EMP-0007",
    qualification: "BSN, RN",
  },
  {
    firstName: "Isabella",
    lastName: "Rossi",
    role: "Nurse",
    department: "Pediatrics",
    phone: "+1 (415) 555-0203",
    email: "isabella.rossi@medicore.io",
    joinedDate: "2019-07-08",
    shift: "Morning",
    status: "Active",
    gender: "Female",
    dob: "1989-08-24",
    address: "9 Green St, SF",
    emergencyContactName: "Marco Rossi",
    emergencyContactPhone: "+1 (415) 555-1203",
    reportingManagerId: "EMP-0003",
    qualification: "BSN, RN, IBCLC",
  },
  {
    firstName: "Chloé",
    lastName: "Dubois",
    role: "Nurse",
    department: "Neurology",
    phone: "+1 (415) 555-0204",
    email: "chloe.dubois@medicore.io",
    joinedDate: "2022-01-15",
    shift: "Evening",
    status: "Active",
    gender: "Female",
    dob: "1994-10-30",
    address: "111 Hayes St, SF",
    emergencyContactName: "Julien Dubois",
    emergencyContactPhone: "+1 (415) 555-1204",
    reportingManagerId: "EMP-0004",
    qualification: "BSN, RN",
  },
  {
    firstName: "Layla",
    lastName: "Al-Farsi",
    role: "Nurse",
    department: "General Medicine",
    phone: "+1 (415) 555-0205",
    email: "layla.alfarsi@medicore.io",
    joinedDate: "2020-12-01",
    shift: "Evening",
    status: "On Leave",
    gender: "Female",
    dob: "1991-03-08",
    address: "60 Post St, SF",
    emergencyContactName: "Yousef Al-Farsi",
    emergencyContactPhone: "+1 (415) 555-1205",
    reportingManagerId: "EMP-0006",
    qualification: "BSN, RN",
  },
  {
    firstName: "Samuel",
    lastName: "Nyongo",
    role: "Nurse",
    department: "Orthopedics",
    phone: "+1 (415) 555-0206",
    email: "samuel.nyongo@medicore.io",
    joinedDate: "2018-05-20",
    shift: "Morning",
    status: "Active",
    gender: "Male",
    dob: "1987-06-14",
    address: "77 Folsom, SF",
    emergencyContactName: "Amina Nyongo",
    emergencyContactPhone: "+1 (415) 555-1206",
    reportingManagerId: "EMP-0002",
    qualification: "BSN, RN",
  },
  {
    firstName: "Yuki",
    lastName: "Tanaka",
    role: "Nurse",
    department: "Emergency",
    phone: "+1 (415) 555-0207",
    email: "yuki.tanaka@medicore.io",
    joinedDate: "2021-03-30",
    shift: "Night",
    status: "Active",
    gender: "Female",
    dob: "1992-09-19",
    address: "3 Turk St, SF",
    emergencyContactName: "Haruto Tanaka",
    emergencyContactPhone: "+1 (415) 555-1207",
    reportingManagerId: "EMP-0007",
    qualification: "BSN, RN",
  },
  {
    firstName: "Rita",
    lastName: "Alvarez",
    role: "Nurse",
    department: "Dermatology",
    phone: "+1 (415) 555-0208",
    email: "rita.alvarez@medicore.io",
    joinedDate: "2019-10-11",
    shift: "Morning",
    status: "Active",
    gender: "Female",
    dob: "1988-01-23",
    address: "24 Ellis St, SF",
    emergencyContactName: "Diego Alvarez",
    emergencyContactPhone: "+1 (415) 555-1208",
    reportingManagerId: "EMP-0005",
    qualification: "BSN, RN",
  },
  {
    firstName: "Kai",
    lastName: "Andersen",
    role: "Nurse",
    department: "Cardiology",
    phone: "+1 (415) 555-0209",
    email: "kai.andersen@medicore.io",
    joinedDate: "2023-01-09",
    shift: "Evening",
    status: "Active",
    gender: "Male",
    dob: "1996-12-02",
    address: "88 Beale St, SF",
    emergencyContactName: "Freja Andersen",
    emergencyContactPhone: "+1 (415) 555-1209",
    reportingManagerId: "EMP-0001",
    qualification: "BSN, RN",
  },
  {
    firstName: "Sofia",
    lastName: "Costa",
    role: "Nurse",
    department: "Pediatrics",
    phone: "+1 (415) 555-0210",
    email: "sofia.costa@medicore.io",
    joinedDate: "2022-06-27",
    shift: "Morning",
    status: "Active",
    gender: "Female",
    dob: "1993-04-04",
    address: "15 Larkin St, SF",
    emergencyContactName: "Rafael Costa",
    emergencyContactPhone: "+1 (415) 555-1210",
    reportingManagerId: "EMP-0003",
    qualification: "BSN, RN",
  },
  {
    firstName: "Mateo",
    lastName: "Silva",
    role: "Nurse",
    department: "Radiology",
    phone: "+1 (415) 555-0211",
    email: "mateo.silva@medicore.io",
    joinedDate: "2020-02-17",
    shift: "Morning",
    status: "Active",
    gender: "Male",
    dob: "1989-11-12",
    address: "44 6th St, SF",
    emergencyContactName: "Lucia Silva",
    emergencyContactPhone: "+1 (415) 555-1211",
    reportingManagerId: "EMP-0008",
    qualification: "BSN, RN, Radiography",
  },

  // Admin
  {
    firstName: "Nadia",
    lastName: "Petrov",
    role: "Admin",
    department: "Administration",
    phone: "+1 (415) 555-0301",
    email: "nadia.petrov@medicore.io",
    joinedDate: "2017-08-14",
    shift: "Morning",
    status: "Active",
    gender: "Female",
    dob: "1984-05-27",
    address: "1 Front St, SF",
    emergencyContactName: "Ivan Petrov",
    emergencyContactPhone: "+1 (415) 555-1301",
  },
  {
    firstName: "David",
    lastName: "Chen",
    role: "Admin",
    department: "IT & Records",
    phone: "+1 (415) 555-0302",
    email: "david.chen@medicore.io",
    joinedDate: "2019-05-06",
    shift: "Morning",
    status: "Active",
    gender: "Male",
    dob: "1986-07-16",
    address: "222 2nd St, SF",
    emergencyContactName: "Mei Chen",
    emergencyContactPhone: "+1 (415) 555-1302",
    reportingManagerId: "EMP-0019",
  },
  {
    firstName: "Fatima",
    lastName: "Ibrahim",
    role: "Admin",
    department: "Pharmacy",
    phone: "+1 (415) 555-0303",
    email: "fatima.ibrahim@medicore.io",
    joinedDate: "2021-11-19",
    shift: "Morning",
    status: "Active",
    gender: "Female",
    dob: "1990-08-08",
    address: "9 Howard St, SF",
    emergencyContactName: "Ahmed Ibrahim",
    emergencyContactPhone: "+1 (415) 555-1303",
    reportingManagerId: "EMP-0019",
  },
  {
    firstName: "Lucas",
    lastName: "Weber",
    role: "Admin",
    department: "Administration",
    phone: "+1 (415) 555-0304",
    email: "lucas.weber@medicore.io",
    joinedDate: "2022-04-01",
    shift: "Evening",
    status: "Active",
    gender: "Male",
    dob: "1994-02-22",
    address: "60 Spear St, SF",
    emergencyContactName: "Anna Weber",
    emergencyContactPhone: "+1 (415) 555-1304",
    reportingManagerId: "EMP-0019",
  },
  {
    firstName: "Emma",
    lastName: "Johansson",
    role: "Admin",
    department: "Administration",
    phone: "+1 (415) 555-0305",
    email: "emma.johansson@medicore.io",
    joinedDate: "2018-09-12",
    shift: "Morning",
    status: "Inactive",
    gender: "Female",
    dob: "1985-10-11",
    address: "10 California St, SF",
    emergencyContactName: "Erik Johansson",
    emergencyContactPhone: "+1 (415) 555-1305",
    reportingManagerId: "EMP-0019",
  },

  // Support
  {
    firstName: "Miguel",
    lastName: "Torres",
    role: "Support",
    department: "Housekeeping",
    phone: "+1 (415) 555-0401",
    email: "miguel.torres@medicore.io",
    joinedDate: "2020-07-03",
    shift: "Morning",
    status: "Active",
    gender: "Male",
    dob: "1987-03-19",
    address: "77 Ellis St, SF",
    emergencyContactName: "Rosa Torres",
    emergencyContactPhone: "+1 (415) 555-1401",
  },
  {
    firstName: "Aditi",
    lastName: "Verma",
    role: "Support",
    department: "Housekeeping",
    phone: "+1 (415) 555-0402",
    email: "aditi.verma@medicore.io",
    joinedDate: "2021-02-18",
    shift: "Evening",
    status: "Active",
    gender: "Female",
    dob: "1989-06-25",
    address: "11 Sutter St, SF",
    emergencyContactName: "Rajesh Verma",
    emergencyContactPhone: "+1 (415) 555-1402",
  },
  {
    firstName: "Benjamin",
    lastName: "Cole",
    role: "Support",
    department: "IT & Records",
    phone: "+1 (415) 555-0403",
    email: "benjamin.cole@medicore.io",
    joinedDate: "2022-08-09",
    shift: "Morning",
    status: "Active",
    gender: "Male",
    dob: "1995-11-14",
    address: "45 Kearny St, SF",
    emergencyContactName: "Sarah Cole",
    emergencyContactPhone: "+1 (415) 555-1403",
    reportingManagerId: "EMP-0020",
  },
  {
    firstName: "Zara",
    lastName: "Malik",
    role: "Support",
    department: "Pharmacy",
    phone: "+1 (415) 555-0404",
    email: "zara.malik@medicore.io",
    joinedDate: "2023-03-21",
    shift: "Morning",
    status: "Active",
    gender: "Female",
    dob: "1997-01-30",
    address: "3 Battery St, SF",
    emergencyContactName: "Bilal Malik",
    emergencyContactPhone: "+1 (415) 555-1404",
    reportingManagerId: "EMP-0021",
  },
  {
    firstName: "Noah",
    lastName: "Williams",
    role: "Support",
    department: "Emergency",
    phone: "+1 (415) 555-0405",
    email: "noah.williams@medicore.io",
    joinedDate: "2020-11-05",
    shift: "Night",
    status: "On Leave",
    gender: "Male",
    dob: "1991-04-07",
    address: "70 Bush St, SF",
    emergencyContactName: "Emily Williams",
    emergencyContactPhone: "+1 (415) 555-1405",
  },
  {
    firstName: "Sana",
    lastName: "Rahman",
    role: "Support",
    department: "Radiology",
    phone: "+1 (415) 555-0406",
    email: "sana.rahman@medicore.io",
    joinedDate: "2021-06-11",
    shift: "Morning",
    status: "Active",
    gender: "Female",
    dob: "1992-09-02",
    address: "20 Sansome St, SF",
    emergencyContactName: "Imran Rahman",
    emergencyContactPhone: "+1 (415) 555-1406",
    reportingManagerId: "EMP-0008",
  },
  {
    firstName: "Diego",
    lastName: "Morales",
    role: "Support",
    department: "General Medicine",
    phone: "+1 (415) 555-0407",
    email: "diego.morales@medicore.io",
    joinedDate: "2019-04-22",
    shift: "Evening",
    status: "Active",
    gender: "Male",
    dob: "1988-12-15",
    address: "6 Powell St, SF",
    emergencyContactName: "Elena Morales",
    emergencyContactPhone: "+1 (415) 555-1407",
  },
];

export const STAFF: StaffMember[] = SEEDS.map((s, i) => {
  const id = `EMP-${String(i + 1).padStart(4, "0")}`;
  return {
    id,
    ...s,
    weeklyShifts: weekFor(s.shift),
    attendance: makeAttendance(s.shift),
    documents: docsFor(s.role),
  };
});

export function fullName(s: Pick<StaffMember, "firstName" | "lastName">): string {
  return `${s.firstName} ${s.lastName}`;
}

export function initialsOf(s: Pick<StaffMember, "firstName" | "lastName">): string {
  return `${s.firstName[0] ?? ""}${s.lastName[0] ?? ""}`.toUpperCase();
}

export function formatStaffDate(iso: string): string {
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return iso;
  return d.toLocaleDateString("en-US", { year: "numeric", month: "short", day: "numeric" });
}
