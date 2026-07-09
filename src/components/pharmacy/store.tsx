import {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useState,
  type ReactNode,
} from "react";

import { MEDICINES_SEED, nextMedicineId, type Medicine } from "@/data/pharmacy";
import {
  PRESCRIPTIONS_SEED,
  type Prescription,
  type PrescriptionStatus,
} from "@/data/prescriptions";

interface PharmacyContextValue {
  medicines: Medicine[];
  addMedicine: (m: Omit<Medicine, "id">) => Medicine;
  updateMedicine: (id: string, patch: Partial<Medicine>) => void;
  deleteMedicine: (id: string) => void;
  restockMedicine: (id: string, addQty: number) => void;

  prescriptions: Prescription[];
  updatePrescription: (id: string, patch: Partial<Prescription>) => void;
  dispensePrescription: (id: string) => void;
  cancelPrescription: (id: string) => void;
}

const PharmacyContext = createContext<PharmacyContextValue | null>(null);

function computeStatus(rx: Prescription): PrescriptionStatus {
  if (rx.status === "Cancelled") return "Cancelled";
  const dispensedCount = rx.lines.filter((l) => l.dispensed).length;
  if (dispensedCount === 0) return "Pending";
  if (dispensedCount === rx.lines.length) return "Dispensed";
  return "Partially Dispensed";
}

export function PharmacyProvider({ children }: { children: ReactNode }) {
  const [medicines, setMedicines] = useState<Medicine[]>(() => MEDICINES_SEED);
  const [prescriptions, setPrescriptions] = useState<Prescription[]>(
    () => PRESCRIPTIONS_SEED,
  );

  const addMedicine = useCallback((m: Omit<Medicine, "id">) => {
    let created: Medicine = { id: "MED-0000", ...m };
    setMedicines((prev) => {
      const id = nextMedicineId(prev);
      created = { id, ...m };
      return [created, ...prev];
    });
    return created;
  }, []);

  const updateMedicine = useCallback((id: string, patch: Partial<Medicine>) => {
    setMedicines((prev) => prev.map((m) => (m.id === id ? { ...m, ...patch } : m)));
  }, []);

  const deleteMedicine = useCallback((id: string) => {
    setMedicines((prev) => prev.filter((m) => m.id !== id));
  }, []);

  const restockMedicine = useCallback((id: string, addQty: number) => {
    setMedicines((prev) =>
      prev.map((m) => (m.id === id ? { ...m, stockQty: m.stockQty + addQty } : m)),
    );
  }, []);

  const updatePrescription = useCallback((id: string, patch: Partial<Prescription>) => {
    setPrescriptions((prev) =>
      prev.map((rx) => {
        if (rx.id !== id) return rx;
        const next = { ...rx, ...patch };
        next.status = computeStatus(next);
        return next;
      }),
    );
  }, []);

  const dispensePrescription = useCallback((id: string) => {
    setPrescriptions((prev) =>
      prev.map((rx) => {
        if (rx.id !== id) return rx;
        const next: Prescription = {
          ...rx,
          lines: rx.lines.map((l) => ({ ...l, dispensed: true })),
          status: "Dispensed",
        };
        return next;
      }),
    );
    // decrement stock
    setMedicines((prevMeds) => {
      const rx = prescriptions.find((r) => r.id === id);
      if (!rx) return prevMeds;
      const consumed = new Map<string, number>();
      for (const l of rx.lines) {
        if (!l.dispensed) {
          consumed.set(l.medicineId, (consumed.get(l.medicineId) ?? 0) + l.qty);
        }
      }
      return prevMeds.map((m) => {
        const q = consumed.get(m.id);
        if (!q) return m;
        return { ...m, stockQty: Math.max(0, m.stockQty - q) };
      });
    });
  }, [prescriptions]);

  const cancelPrescription = useCallback((id: string) => {
    setPrescriptions((prev) =>
      prev.map((rx) => (rx.id === id ? { ...rx, status: "Cancelled" } : rx)),
    );
  }, []);

  const value = useMemo<PharmacyContextValue>(
    () => ({
      medicines,
      addMedicine,
      updateMedicine,
      deleteMedicine,
      restockMedicine,
      prescriptions,
      updatePrescription,
      dispensePrescription,
      cancelPrescription,
    }),
    [
      medicines,
      addMedicine,
      updateMedicine,
      deleteMedicine,
      restockMedicine,
      prescriptions,
      updatePrescription,
      dispensePrescription,
      cancelPrescription,
    ],
  );

  return (
    <PharmacyContext.Provider value={value}>{children}</PharmacyContext.Provider>
  );
}

export function usePharmacy(): PharmacyContextValue {
  const ctx = useContext(PharmacyContext);
  if (!ctx) throw new Error("usePharmacy must be used within PharmacyProvider");
  return ctx;
}
