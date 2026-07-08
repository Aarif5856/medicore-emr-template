import { useMemo } from "react";
import { format } from "date-fns";

import { cn } from "@/lib/utils";
import { TIME_SLOTS, type Appointment } from "@/data/appointments";
import { getBookedSlots } from "@/data/appointments";

interface Props {
  appointments: Appointment[];
  doctorId?: string;
  date?: Date;
  value?: string; // "HH:mm"
  onChange: (slot: string) => void;
  ignoreAppointmentId?: string;
}

export function TimeSlotGrid({
  appointments,
  doctorId,
  date,
  value,
  onChange,
  ignoreAppointmentId,
}: Props) {
  const booked = useMemo(() => {
    if (!doctorId || !date) return new Set<string>();
    return getBookedSlots(appointments, doctorId, date, ignoreAppointmentId);
  }, [appointments, doctorId, date, ignoreAppointmentId]);

  const disabledAll = !doctorId || !date;

  return (
    <div className="space-y-2">
      <div className="grid grid-cols-4 gap-1.5 sm:grid-cols-6">
        {TIME_SLOTS.map((slot) => {
          const isBooked = booked.has(slot);
          const isSelected = value === slot;
          const disabled = disabledAll || isBooked;
          return (
            <button
              key={slot}
              type="button"
              disabled={disabled}
              onClick={() => onChange(slot)}
              className={cn(
                "rounded-md border px-2 py-1.5 text-[11px] font-semibold tabular transition-colors",
                isSelected
                  ? "border-primary bg-primary text-primary-foreground glow-primary"
                  : disabled
                    ? "cursor-not-allowed border-border/50 bg-muted/40 text-muted-foreground/50 line-through"
                    : "border-border bg-card text-foreground hover:border-primary/60 hover:bg-primary/5",
              )}
              title={
                isBooked
                  ? "Slot unavailable"
                  : disabledAll
                    ? "Select a doctor and date first"
                    : format(new Date(`2000-01-01T${slot}`), "h:mm a")
              }
            >
              {slot}
            </button>
          );
        })}
      </div>
      {disabledAll && (
        <p className="text-[11px] text-muted-foreground">
          Select a doctor and date to see available slots.
        </p>
      )}
    </div>
  );
}
