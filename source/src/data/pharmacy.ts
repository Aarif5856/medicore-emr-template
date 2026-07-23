export type MedicineCategory =
  "Analgesic" | "Antibiotic" | "Antidiabetic" | "Cardiac" | "Antihistamine" | "Supplement";

export type MedicineUnit = "tablets" | "bottles" | "vials" | "capsules" | "sachets";

export interface Medicine {
  id: string;
  name: string;
  genericName: string;
  category: MedicineCategory;
  stockQty: number;
  reorderThreshold: number;
  unit: MedicineUnit;
  price: number;
  expiryDate: string; // ISO
  supplier: string;
}

export const MEDICINE_CATEGORIES: MedicineCategory[] = [
  "Analgesic",
  "Antibiotic",
  "Antidiabetic",
  "Cardiac",
  "Antihistamine",
  "Supplement",
];

export const MEDICINE_UNITS: MedicineUnit[] = [
  "tablets",
  "bottles",
  "vials",
  "capsules",
  "sachets",
];

export const CATEGORY_DOT: Record<MedicineCategory, string> = {
  Analgesic: "bg-primary",
  Antibiotic: "bg-destructive",
  Antidiabetic: "bg-[color:var(--accent-teal)]",
  Cardiac: "bg-warning",
  Antihistamine: "bg-foreground/60",
  Supplement: "bg-muted-foreground",
};

const SUPPLIERS = [
  "MediSupply Co.",
  "PharmaCore Ltd.",
  "HealthPlus Distributors",
  "Global Meds Inc.",
  "CarePharm Wholesale",
];

function isoDaysFromNow(days: number): string {
  const d = new Date();
  d.setDate(d.getDate() + days);
  d.setHours(12, 0, 0, 0);
  return d.toISOString();
}

interface Seed {
  name: string;
  genericName: string;
  category: MedicineCategory;
  unit: MedicineUnit;
  price: number;
  stockQty: number;
  reorderThreshold: number;
  expiryDays: number;
}

const SEEDS: Seed[] = [
  {
    name: "Paracetamol 500mg",
    genericName: "Acetaminophen",
    category: "Analgesic",
    unit: "tablets",
    price: 0.15,
    stockQty: 1240,
    reorderThreshold: 300,
    expiryDays: 420,
  },
  {
    name: "Amoxicillin 250mg",
    genericName: "Amoxicillin",
    category: "Antibiotic",
    unit: "capsules",
    price: 0.62,
    stockQty: 88,
    reorderThreshold: 200,
    expiryDays: 180,
  },
  {
    name: "Metformin 500mg",
    genericName: "Metformin HCl",
    category: "Antidiabetic",
    unit: "tablets",
    price: 0.22,
    stockQty: 640,
    reorderThreshold: 250,
    expiryDays: 540,
  },
  {
    name: "Atorvastatin 20mg",
    genericName: "Atorvastatin",
    category: "Cardiac",
    unit: "tablets",
    price: 0.48,
    stockQty: 320,
    reorderThreshold: 200,
    expiryDays: 300,
  },
  {
    name: "Cetirizine 10mg",
    genericName: "Cetirizine HCl",
    category: "Antihistamine",
    unit: "tablets",
    price: 0.12,
    stockQty: 980,
    reorderThreshold: 300,
    expiryDays: 460,
  },
  {
    name: "Ibuprofen 400mg",
    genericName: "Ibuprofen",
    category: "Analgesic",
    unit: "tablets",
    price: 0.18,
    stockQty: 42,
    reorderThreshold: 250,
    expiryDays: 55,
  },
  {
    name: "Omeprazole 20mg",
    genericName: "Omeprazole",
    category: "Analgesic",
    unit: "capsules",
    price: 0.35,
    stockQty: 210,
    reorderThreshold: 150,
    expiryDays: 220,
  },
  {
    name: "Amlodipine 5mg",
    genericName: "Amlodipine Besylate",
    category: "Cardiac",
    unit: "tablets",
    price: 0.28,
    stockQty: 0,
    reorderThreshold: 150,
    expiryDays: 280,
  },
  {
    name: "Losartan 50mg",
    genericName: "Losartan Potassium",
    category: "Cardiac",
    unit: "tablets",
    price: 0.34,
    stockQty: 410,
    reorderThreshold: 180,
    expiryDays: 40,
  },
  {
    name: "Azithromycin 500mg",
    genericName: "Azithromycin",
    category: "Antibiotic",
    unit: "tablets",
    price: 1.2,
    stockQty: 150,
    reorderThreshold: 100,
    expiryDays: 210,
  },
  {
    name: "Ciprofloxacin 500mg",
    genericName: "Ciprofloxacin HCl",
    category: "Antibiotic",
    unit: "tablets",
    price: 0.55,
    stockQty: 68,
    reorderThreshold: 120,
    expiryDays: 165,
  },
  {
    name: "Insulin Glargine",
    genericName: "Insulin Glargine",
    category: "Antidiabetic",
    unit: "vials",
    price: 32.4,
    stockQty: 24,
    reorderThreshold: 15,
    expiryDays: 120,
  },
  {
    name: "Glimepiride 2mg",
    genericName: "Glimepiride",
    category: "Antidiabetic",
    unit: "tablets",
    price: 0.19,
    stockQty: 520,
    reorderThreshold: 200,
    expiryDays: 380,
  },
  {
    name: "Loratadine 10mg",
    genericName: "Loratadine",
    category: "Antihistamine",
    unit: "tablets",
    price: 0.14,
    stockQty: 780,
    reorderThreshold: 250,
    expiryDays: 500,
  },
  {
    name: "Diphenhydramine Syrup",
    genericName: "Diphenhydramine",
    category: "Antihistamine",
    unit: "bottles",
    price: 4.2,
    stockQty: 32,
    reorderThreshold: 20,
    expiryDays: 50,
  },
  {
    name: "Vitamin D3 1000IU",
    genericName: "Cholecalciferol",
    category: "Supplement",
    unit: "tablets",
    price: 0.08,
    stockQty: 1560,
    reorderThreshold: 400,
    expiryDays: 600,
  },
  {
    name: "Vitamin B12 Complex",
    genericName: "Cyanocobalamin",
    category: "Supplement",
    unit: "tablets",
    price: 0.1,
    stockQty: 1120,
    reorderThreshold: 300,
    expiryDays: 540,
  },
  {
    name: "Iron + Folic Acid",
    genericName: "Ferrous Sulfate + Folate",
    category: "Supplement",
    unit: "tablets",
    price: 0.09,
    stockQty: 0,
    reorderThreshold: 250,
    expiryDays: 340,
  },
  {
    name: "Aspirin 75mg",
    genericName: "Acetylsalicylic Acid",
    category: "Cardiac",
    unit: "tablets",
    price: 0.05,
    stockQty: 2100,
    reorderThreshold: 500,
    expiryDays: 480,
  },
  {
    name: "Naproxen 250mg",
    genericName: "Naproxen Sodium",
    category: "Analgesic",
    unit: "tablets",
    price: 0.21,
    stockQty: 340,
    reorderThreshold: 200,
    expiryDays: 260,
  },
  {
    name: "Diclofenac Gel",
    genericName: "Diclofenac Sodium",
    category: "Analgesic",
    unit: "bottles",
    price: 6.5,
    stockQty: 96,
    reorderThreshold: 40,
    expiryDays: 190,
  },
  {
    name: "Doxycycline 100mg",
    genericName: "Doxycycline Hyclate",
    category: "Antibiotic",
    unit: "capsules",
    price: 0.44,
    stockQty: 245,
    reorderThreshold: 150,
    expiryDays: 350,
  },
  {
    name: "Bisoprolol 5mg",
    genericName: "Bisoprolol Fumarate",
    category: "Cardiac",
    unit: "tablets",
    price: 0.26,
    stockQty: 380,
    reorderThreshold: 180,
    expiryDays: 45,
  },
  {
    name: "Fexofenadine 180mg",
    genericName: "Fexofenadine HCl",
    category: "Antihistamine",
    unit: "tablets",
    price: 0.3,
    stockQty: 0,
    reorderThreshold: 120,
    expiryDays: 400,
  },
  {
    name: "Multivitamin Complex",
    genericName: "Multivitamin",
    category: "Supplement",
    unit: "tablets",
    price: 0.16,
    stockQty: 890,
    reorderThreshold: 300,
    expiryDays: 520,
  },
];

export const MEDICINES_SEED: Medicine[] = SEEDS.map((s, i) => ({
  id: `MED-${(1001 + i).toString()}`,
  name: s.name,
  genericName: s.genericName,
  category: s.category,
  stockQty: s.stockQty,
  reorderThreshold: s.reorderThreshold,
  unit: s.unit,
  price: s.price,
  expiryDate: isoDaysFromNow(s.expiryDays),
  supplier: SUPPLIERS[i % SUPPLIERS.length],
}));

export function nextMedicineId(existing: Medicine[]): string {
  const max = existing.reduce((m, x) => {
    const n = Number(x.id.split("-")[1]);
    return Number.isFinite(n) && n > m ? n : m;
  }, 1000);
  return `MED-${max + 1}`;
}

export function daysUntil(iso: string): number {
  const d = new Date(iso).getTime();
  const now = Date.now();
  return Math.round((d - now) / 864e5);
}

export function stockLevel(
  m: Pick<Medicine, "stockQty" | "reorderThreshold">,
): "out" | "low" | "healthy" {
  if (m.stockQty <= 0) return "out";
  if (m.stockQty < m.reorderThreshold) return "low";
  return "healthy";
}

export function formatCurrency(n: number): string {
  return `$${n.toFixed(2)}`;
}

export function formatDate(iso: string): string {
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return iso;
  return d.toLocaleDateString("en-US", { year: "numeric", month: "short", day: "numeric" });
}
