import { useEffect, useState } from "react";
import { format, parseISO, setHours, setMinutes, startOfDay } from "date-fns";
import { toast } from "sonner";
import { CalendarIcon } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { cn } from "@/lib/utils";
import { TimeSlotGrid } from "@/components/appointments/time-slot-grid";
import type { Appointment } from "@/data/appointments";

interface Props {
  appointment: Appointment | null;
  onOpenChange: (open: boolean) => void;
  appointments: Appointment[];
  onSubmit: (id: string, startISO: string) => void;
}

export function RescheduleDialog({
  appointment,
  onOpenChange,
  appointments,
  onSubmit,
}: Props) {
  const [date, setDate] = useState<Date | undefined>();
  const [slot, setSlot] = useState<string>("");

  useEffect(() => {
    if (appointment) {
      const d = parseISO(appointment.start);
      setDate(d);
      setSlot(format(d, "HH:mm"));
    } else {
      setDate(undefined);
      setSlot("");
    }
  }, [appointment]);

  const open = appointment !== null;

  const handleSubmit = () => {
    if (!appointment || !date || !slot) return;
    const [h, m] = slot.split(":").map(Number);
    const start = setMinutes(setHours(startOfDay(date), h), m);
    onSubmit(appointment.id, start.toISOString());
    toast.success(
      `${appointment.patientName}'s appointment moved to ${format(start, "MMM d")} at ${slot}`,
    );
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>Reschedule appointment</DialogTitle>
          <DialogDescription>
            {appointment
              ? `Choose a new date and time for ${appointment.patientName}.`
              : null}
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          <div className="space-y-1.5">
            <Label>Date</Label>
            <Popover>
              <PopoverTrigger asChild>
                <Button
                  variant="outline"
                  className={cn(
                    "h-9 w-full justify-start gap-2 text-left font-normal",
                    !date && "text-muted-foreground",
                  )}
                >
                  <CalendarIcon className="h-4 w-4" />
                  {date ? format(date, "PPP") : "Pick a date"}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0" align="start">
                <Calendar
                  mode="single"
                  selected={date}
                  onSelect={(d) => {
                    setDate(d);
                    setSlot("");
                  }}
                  initialFocus
                  className={cn("p-3 pointer-events-auto")}
                />
              </PopoverContent>
            </Popover>
          </div>

          <div className="space-y-1.5">
            <Label>Time slot</Label>
            <TimeSlotGrid
              appointments={appointments}
              doctorId={appointment?.doctorId}
              date={date}
              value={slot}
              onChange={setSlot}
              ignoreAppointmentId={appointment?.id}
            />
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button className="glow-primary" onClick={handleSubmit} disabled={!date || !slot}>
            Confirm reschedule
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
