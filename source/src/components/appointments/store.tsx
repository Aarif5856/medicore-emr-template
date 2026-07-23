import { createContext, useCallback, useContext, useMemo, useState, type ReactNode } from "react";

import {
  generateInitialAppointments,
  nextAppointmentId,
  type Appointment,
} from "@/data/appointments";

interface AppointmentsContextValue {
  appointments: Appointment[];
  addAppointment: (a: Omit<Appointment, "id">) => Appointment;
  updateAppointment: (id: string, patch: Partial<Appointment>) => void;
}

const AppointmentsContext = createContext<AppointmentsContextValue | null>(null);

export function AppointmentsProvider({ children }: { children: ReactNode }) {
  const [appointments, setAppointments] = useState<Appointment[]>(() =>
    generateInitialAppointments(),
  );

  const addAppointment = useCallback((a: Omit<Appointment, "id">) => {
    let created: Appointment = { id: "APT-0000", ...a };
    setAppointments((prev) => {
      const id = nextAppointmentId(prev);
      created = { id, ...a };
      return [...prev, created];
    });
    return created;
  }, []);

  const updateAppointment = useCallback((id: string, patch: Partial<Appointment>) => {
    setAppointments((prev) => prev.map((a) => (a.id === id ? { ...a, ...patch } : a)));
  }, []);

  const value = useMemo(
    () => ({ appointments, addAppointment, updateAppointment }),
    [appointments, addAppointment, updateAppointment],
  );

  return <AppointmentsContext.Provider value={value}>{children}</AppointmentsContext.Provider>;
}

export function useAppointments(): AppointmentsContextValue {
  const ctx = useContext(AppointmentsContext);
  if (!ctx) throw new Error("useAppointments must be used within AppointmentsProvider");
  return ctx;
}
