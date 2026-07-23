import { createContext, useCallback, useContext, useMemo, useState, type ReactNode } from "react";

import { DEFAULT_WEEK_PRESETS, DOCTORS, nextDoctorId, type Doctor } from "@/data/doctors";

type NewDoctorInput = Omit<
  Doctor,
  "id" | "weeklySchedule" | "certifications" | "recentPatients" | "reviews"
> & {
  weeklySchedule?: Doctor["weeklySchedule"];
};

interface DoctorsCtx {
  doctors: Doctor[];
  addDoctor: (input: NewDoctorInput) => Doctor;
  updateDoctor: (id: string, patch: Partial<Doctor>) => void;
}

const Ctx = createContext<DoctorsCtx | null>(null);

export function DoctorsProvider({ children }: { children: ReactNode }) {
  const [doctors, setDoctors] = useState<Doctor[]>(() => DOCTORS);

  const addDoctor = useCallback<DoctorsCtx["addDoctor"]>((input) => {
    let created!: Doctor;
    setDoctors((prev) => {
      const id = nextDoctorId(prev);
      created = {
        id,
        weeklySchedule: input.weeklySchedule ?? DEFAULT_WEEK_PRESETS.Morning,
        certifications: ["Board Certified", input.qualification],
        recentPatients: [],
        reviews: [],
        ...input,
      };
      return [created, ...prev];
    });
    return created;
  }, []);

  const updateDoctor = useCallback<DoctorsCtx["updateDoctor"]>((id, patch) => {
    setDoctors((prev) => prev.map((d) => (d.id === id ? { ...d, ...patch } : d)));
  }, []);

  const value = useMemo(
    () => ({ doctors, addDoctor, updateDoctor }),
    [doctors, addDoctor, updateDoctor],
  );
  return <Ctx.Provider value={value}>{children}</Ctx.Provider>;
}

export function useDoctors(): DoctorsCtx {
  const v = useContext(Ctx);
  if (!v) throw new Error("useDoctors must be used within DoctorsProvider");
  return v;
}
