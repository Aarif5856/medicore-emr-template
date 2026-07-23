import { PATIENTS } from "@/data/patients";
import { DOCTORS } from "@/data/appointments";

export type LabCategory =
  "Hematology" | "Biochemistry" | "Radiology" | "Microbiology" | "Pathology";

export type LabStatus = "Pending" | "In Progress" | "Completed" | "Critical";
export type LabPriority = "Routine" | "Urgent" | "STAT";
export type LabTestKind = "pathology" | "imaging";
export type ResultFlag = "Normal" | "High" | "Low";

export interface LabParameter {
  name: string;
  unit: string;
  refLow: number;
  refHigh: number;
}

export interface LabTestDefinition {
  name: string;
  category: LabCategory;
  kind: LabTestKind;
  parameters?: LabParameter[];
}

export interface LabParameterResult {
  name: string;
  value: number;
  unit: string;
  refLow: number;
  refHigh: number;
  flag: ResultFlag;
}

export interface LabResult {
  parameters?: LabParameterResult[];
  findings?: string;
}

export interface LabTest {
  id: string;
  patientId: string;
  patientName: string;
  testName: string;
  category: LabCategory;
  kind: LabTestKind;
  orderedById: string;
  orderedBy: string;
  orderedDate: string; // ISO
  completedDate?: string; // ISO
  status: LabStatus;
  priority: LabPriority;
  notes?: string;
  result?: LabResult;
}

export const LAB_CATEGORIES: LabCategory[] = [
  "Hematology",
  "Biochemistry",
  "Radiology",
  "Microbiology",
  "Pathology",
];

export const LAB_STATUSES: LabStatus[] = ["Pending", "In Progress", "Completed", "Critical"];

export const LAB_PRIORITIES: LabPriority[] = ["Routine", "Urgent", "STAT"];

export const CATEGORY_STYLES: Record<LabCategory, { dot: string; text: string; bg: string }> = {
  Hematology: {
    dot: "bg-destructive",
    text: "text-destructive",
    bg: "bg-destructive/10",
  },
  Biochemistry: {
    dot: "bg-primary",
    text: "text-primary",
    bg: "bg-primary/10",
  },
  Radiology: {
    dot: "bg-[color:var(--accent-teal)]",
    text: "text-[color:var(--accent-teal)]",
    bg: "bg-[color:var(--accent-teal)]/10",
  },
  Microbiology: {
    dot: "bg-warning",
    text: "text-warning",
    bg: "bg-warning/10",
  },
  Pathology: {
    dot: "bg-foreground",
    text: "text-foreground",
    bg: "bg-muted",
  },
};

// -------- Reference panels (realistic adult ranges) --------
export const TEST_DEFINITIONS: LabTestDefinition[] = [
  {
    name: "Complete Blood Count",
    category: "Hematology",
    kind: "pathology",
    parameters: [
      { name: "Hemoglobin", unit: "g/dL", refLow: 13.5, refHigh: 17.5 },
      { name: "WBC", unit: "10^3/µL", refLow: 4.5, refHigh: 11.0 },
      { name: "RBC", unit: "10^6/µL", refLow: 4.5, refHigh: 5.9 },
      { name: "Platelets", unit: "10^3/µL", refLow: 150, refHigh: 400 },
      { name: "Hematocrit", unit: "%", refLow: 41, refHigh: 53 },
    ],
  },
  {
    name: "Lipid Panel",
    category: "Biochemistry",
    kind: "pathology",
    parameters: [
      { name: "Total Cholesterol", unit: "mg/dL", refLow: 125, refHigh: 200 },
      { name: "LDL Cholesterol", unit: "mg/dL", refLow: 0, refHigh: 100 },
      { name: "HDL Cholesterol", unit: "mg/dL", refLow: 40, refHigh: 60 },
      { name: "Triglycerides", unit: "mg/dL", refLow: 0, refHigh: 150 },
    ],
  },
  {
    name: "Liver Function Test",
    category: "Biochemistry",
    kind: "pathology",
    parameters: [
      { name: "ALT", unit: "U/L", refLow: 7, refHigh: 56 },
      { name: "AST", unit: "U/L", refLow: 10, refHigh: 40 },
      { name: "ALP", unit: "U/L", refLow: 44, refHigh: 147 },
      { name: "Total Bilirubin", unit: "mg/dL", refLow: 0.1, refHigh: 1.2 },
      { name: "Albumin", unit: "g/dL", refLow: 3.4, refHigh: 5.4 },
    ],
  },
  {
    name: "Thyroid Panel",
    category: "Biochemistry",
    kind: "pathology",
    parameters: [
      { name: "TSH", unit: "mIU/L", refLow: 0.4, refHigh: 4.0 },
      { name: "Free T4", unit: "ng/dL", refLow: 0.8, refHigh: 1.8 },
      { name: "Free T3", unit: "pg/mL", refLow: 2.3, refHigh: 4.2 },
    ],
  },
  {
    name: "HbA1c",
    category: "Biochemistry",
    kind: "pathology",
    parameters: [{ name: "HbA1c", unit: "%", refLow: 4.0, refHigh: 5.6 }],
  },
  {
    name: "Urinalysis",
    category: "Microbiology",
    kind: "pathology",
    parameters: [
      { name: "pH", unit: "", refLow: 4.5, refHigh: 8.0 },
      { name: "Specific Gravity", unit: "", refLow: 1.005, refHigh: 1.03 },
      { name: "Protein", unit: "mg/dL", refLow: 0, refHigh: 14 },
      { name: "Glucose", unit: "mg/dL", refLow: 0, refHigh: 15 },
    ],
  },
  {
    name: "Blood Culture",
    category: "Microbiology",
    kind: "pathology",
    parameters: [{ name: "Colony Count", unit: "CFU/mL", refLow: 0, refHigh: 0 }],
  },
  {
    name: "Biopsy Histopathology",
    category: "Pathology",
    kind: "pathology",
    parameters: [
      { name: "Cellularity", unit: "%", refLow: 20, refHigh: 60 },
      { name: "Mitotic Index", unit: "/HPF", refLow: 0, refHigh: 5 },
    ],
  },
  { name: "X-Ray Chest", category: "Radiology", kind: "imaging" },
  { name: "MRI Brain", category: "Radiology", kind: "imaging" },
  { name: "CT Abdomen", category: "Radiology", kind: "imaging" },
  { name: "Ultrasound Abdomen", category: "Radiology", kind: "imaging" },
];

export function getTestDefinition(name: string): LabTestDefinition | undefined {
  return TEST_DEFINITIONS.find((t) => t.name === name);
}

export function flagFor(value: number, low: number, high: number): ResultFlag {
  if (value < low) return "Low";
  if (value > high) return "High";
  return "Normal";
}

// -------- Mock data generation --------
function isoDaysAgo(days: number, hour = 9, minute = 0): string {
  const d = new Date();
  d.setDate(d.getDate() - days);
  d.setHours(hour, minute, 0, 0);
  return d.toISOString();
}

function pick<T>(arr: readonly T[], i: number): T {
  return arr[i % arr.length];
}

function makeResult(def: LabTestDefinition, variant: number): LabResult {
  if (def.kind === "imaging") {
    const findingsByTest: Record<string, string[]> = {
      "X-Ray Chest": [
        "Lungs are clear. No focal consolidation, effusion, or pneumothorax. Cardiomediastinal silhouette is within normal limits. Osseous structures are unremarkable.",
        "Mild bilateral perihilar opacities. No focal consolidation. Heart size normal. Recommend clinical correlation.",
      ],
      "MRI Brain": [
        "No acute intracranial abnormality. Ventricles and sulci are age-appropriate. No mass, hemorrhage, or midline shift.",
        "Scattered T2/FLAIR hyperintensities in the subcortical white matter, nonspecific. No acute infarct on DWI.",
      ],
      "CT Abdomen": [
        "Liver, spleen, pancreas, and kidneys are unremarkable. No free fluid or free air. No suspicious lymphadenopathy.",
        "5 mm non-obstructing calculus in the right renal pelvis. Otherwise unremarkable abdomen and pelvis.",
      ],
      "Ultrasound Abdomen": [
        "Normal hepatic echotexture. Gallbladder without stones or wall thickening. Kidneys normal in size and echogenicity.",
        "Mild hepatic steatosis. Gallbladder unremarkable. No hydronephrosis.",
      ],
    };
    const options = findingsByTest[def.name] ?? ["Unremarkable study."];
    return { findings: pick(options, variant) };
  }
  const parameters: LabParameterResult[] = (def.parameters ?? []).map((p, idx) => {
    const range = p.refHigh - p.refLow;
    // Deterministic pseudo-random values based on variant + idx
    const seed = ((variant * 7 + idx * 13) % 100) / 100; // 0..1
    let value: number;
    // 15% chance high, 10% low, else normal-ish
    const bucket = (variant + idx) % 10;
    if (bucket === 0) value = p.refHigh + range * 0.35;
    else if (bucket === 1) value = Math.max(0, p.refLow - range * 0.2);
    else value = p.refLow + range * (0.2 + seed * 0.6);
    value = Math.round(value * 100) / 100;
    return {
      name: p.name,
      unit: p.unit,
      refLow: p.refLow,
      refHigh: p.refHigh,
      value,
      flag: flagFor(value, p.refLow, p.refHigh),
    };
  });
  return { parameters };
}

function generate(): LabTest[] {
  const tests: LabTest[] = [];
  const statusCycle: LabStatus[] = [
    "Completed",
    "Completed",
    "In Progress",
    "Pending",
    "Completed",
    "Critical",
    "Completed",
    "In Progress",
    "Pending",
    "Completed",
  ];
  const priorityCycle: LabPriority[] = ["Routine", "Routine", "Urgent", "STAT", "Routine"];

  for (let i = 0; i < 30; i++) {
    const patient = PATIENTS[i % PATIENTS.length];
    const def = TEST_DEFINITIONS[i % TEST_DEFINITIONS.length];
    const doctor = DOCTORS[i % DOCTORS.length];
    const status = statusCycle[i % statusCycle.length];
    const priority = priorityCycle[i % priorityCycle.length];
    const daysAgo = i < 24 ? i % 20 : 22 + (i % 15); // most this month, a few older
    const orderedDate = isoDaysAgo(daysAgo, 8 + (i % 8), (i * 7) % 60);
    const completed =
      status === "Completed" || status === "Critical"
        ? isoDaysAgo(Math.max(0, daysAgo - 1), 14 + (i % 5), (i * 11) % 60)
        : undefined;
    const result = status === "Completed" || status === "Critical" ? makeResult(def, i) : undefined;

    tests.push({
      id: `LAB-${(1001 + i).toString()}`,
      patientId: patient.id,
      patientName: `${patient.firstName} ${patient.lastName}`,
      testName: def.name,
      category: def.category,
      kind: def.kind,
      orderedById: doctor.id,
      orderedBy: doctor.name,
      orderedDate,
      completedDate: completed,
      status,
      priority,
      notes: i % 5 === 0 ? "Follow-up requested after result." : undefined,
      result,
    });
  }
  return tests;
}

export const LAB_TESTS_SEED: LabTest[] = generate();

export function nextLabTestId(existing: LabTest[]): string {
  const maxN = existing.reduce((max, t) => {
    const n = Number(t.id.split("-")[1]);
    return Number.isFinite(n) && n > max ? n : max;
  }, 1000);
  return `LAB-${maxN + 1}`;
}
