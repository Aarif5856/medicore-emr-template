import { createContext, useCallback, useContext, useMemo, useState, type ReactNode } from "react";

import { LAB_TESTS_SEED, nextLabTestId, type LabTest } from "@/data/lab-tests";

interface LabContextValue {
  tests: LabTest[];
  addTest: (t: Omit<LabTest, "id">) => LabTest;
  updateTest: (id: string, patch: Partial<LabTest>) => void;
}

const LabContext = createContext<LabContextValue | null>(null);

export function LabProvider({ children }: { children: ReactNode }) {
  const [tests, setTests] = useState<LabTest[]>(() => LAB_TESTS_SEED);

  const addTest = useCallback((t: Omit<LabTest, "id">) => {
    let created: LabTest = { id: "LAB-0000", ...t };
    setTests((prev) => {
      const id = nextLabTestId(prev);
      created = { id, ...t };
      return [created, ...prev];
    });
    return created;
  }, []);

  const updateTest = useCallback((id: string, patch: Partial<LabTest>) => {
    setTests((prev) => prev.map((t) => (t.id === id ? { ...t, ...patch } : t)));
  }, []);

  const value = useMemo(() => ({ tests, addTest, updateTest }), [tests, addTest, updateTest]);

  return <LabContext.Provider value={value}>{children}</LabContext.Provider>;
}

export function useLab(): LabContextValue {
  const ctx = useContext(LabContext);
  if (!ctx) throw new Error("useLab must be used within LabProvider");
  return ctx;
}
