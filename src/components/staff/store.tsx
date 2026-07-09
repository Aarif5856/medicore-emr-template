import { createContext, useCallback, useContext, useMemo, useState, type ReactNode } from "react";
import { STAFF, type StaffMember } from "@/data/staff";

interface StaffCtx {
  staff: StaffMember[];
  addStaff: (input: Omit<StaffMember, "id" | "weeklyShifts" | "attendance" | "documents"> & {
    weeklyShifts?: StaffMember["weeklyShifts"];
    attendance?: StaffMember["attendance"];
    documents?: StaffMember["documents"];
  }) => StaffMember;
  updateStaff: (id: string, patch: Partial<StaffMember>) => void;
}

const Ctx = createContext<StaffCtx | null>(null);

export function StaffProvider({ children }: { children: ReactNode }) {
  const [staff, setStaff] = useState<StaffMember[]>(() => STAFF);

  const addStaff = useCallback<StaffCtx["addStaff"]>((input) => {
    let created!: StaffMember;
    setStaff((prev) => {
      const nextIdx = prev.length + 1;
      const id = `EMP-${String(nextIdx).padStart(4, "0")}`;
      created = {
        id,
        weeklyShifts: input.weeklyShifts ?? [],
        attendance: input.attendance ?? [],
        documents: input.documents ?? [],
        ...input,
      } as StaffMember;
      return [created, ...prev];
    });
    return created;
  }, []);

  const updateStaff = useCallback<StaffCtx["updateStaff"]>((id, patch) => {
    setStaff((prev) => prev.map((s) => (s.id === id ? { ...s, ...patch } : s)));
  }, []);

  const value = useMemo(() => ({ staff, addStaff, updateStaff }), [staff, addStaff, updateStaff]);
  return <Ctx.Provider value={value}>{children}</Ctx.Provider>;
}

export function useStaff(): StaffCtx {
  const v = useContext(Ctx);
  if (!v) throw new Error("useStaff must be used within StaffProvider");
  return v;
}
