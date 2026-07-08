import type { ReactNode } from "react";
import { addMinutes, format, parseISO } from "date-fns";
import { Building2, CalendarClock, Check, Stethoscope, User, Video, X } from "lucide-react";

import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { cn } from "@/lib/utils";
import { initials } from "@/components/patients/status-badge";
import { AppointmentStatusBadge } from "@/components/appointments/status-badge";
import type { Appointment } from "@/data/appointments";

interface Props {
  appointment: Appointment;
  onReschedule: (a: Appointment) => void;
  onCancel: (a: Appointment) => void;
  onConfirm: (a: Appointment) => void;
}

export function AppointmentDetail({ appointment, onReschedule, onCancel, onConfirm }: Props) {
  const startD = parseISO(appointment.start);
  const endD = addMinutes(startD, appointment.durationMin);
  const [first = "", last = ""] = appointment.patientName.split(" ");
  const isCancelled = appointment.status === "Cancelled";
  const isCompleted = appointment.status === "Completed";

  return (
    <div className="space-y-3 p-4">
      <div className="flex items-start gap-3">
        <Avatar className="h-10 w-10">
          <AvatarFallback className="bg-primary/10 text-xs font-semibold text-primary">
            {initials(first, last)}
          </AvatarFallback>
        </Avatar>
        <div className="min-w-0 flex-1">
          <div
            className={cn(
              "truncate text-sm font-semibold text-foreground",
              isCancelled && "line-through",
            )}
          >
            {appointment.patientName}
          </div>
          <div className="text-[11px] text-muted-foreground tabular">
            {appointment.patientId} · {appointment.id}
          </div>
        </div>
        <AppointmentStatusBadge status={appointment.status} />
      </div>

      <Separator />

      <div className="space-y-1.5 text-xs">
        <Row
          icon={<CalendarClock className="h-3.5 w-3.5" />}
          label={`${format(startD, "EEE, MMM d")} · ${format(startD, "HH:mm")}–${format(endD, "HH:mm")}`}
        />
        <Row icon={<Stethoscope className="h-3.5 w-3.5" />} label={appointment.doctorName} />
        <Row icon={<Building2 className="h-3.5 w-3.5" />} label={appointment.department} />
        <Row
          icon={
            appointment.type === "Telemedicine" ? (
              <Video className="h-3.5 w-3.5" />
            ) : (
              <User className="h-3.5 w-3.5" />
            )
          }
          label={appointment.type}
        />
      </div>

      {appointment.reason && (
        <div className="rounded-md bg-muted/50 px-2.5 py-2 text-[11px] text-muted-foreground">
          <span className="font-semibold text-foreground">Reason: </span>
          {appointment.reason}
        </div>
      )}

      {!isCompleted && !isCancelled && (
        <>
          <Separator />
          <div className="flex flex-wrap items-center gap-2">
            {appointment.status === "Pending" && (
              <Button
                size="sm"
                className="h-8 flex-1 gap-1"
                onClick={() => onConfirm(appointment)}
              >
                <Check className="h-3.5 w-3.5" /> Confirm
              </Button>
            )}
            <Button
              size="sm"
              variant="outline"
              className="h-8 flex-1"
              onClick={() => onReschedule(appointment)}
            >
              Reschedule
            </Button>
            <Button
              size="sm"
              variant="ghost"
              className="h-8 flex-1 text-destructive hover:bg-destructive/10 hover:text-destructive"
              onClick={() => onCancel(appointment)}
            >
              <X className="h-3.5 w-3.5" /> Cancel
            </Button>
          </div>
        </>
      )}
    </div>
  );
}

function Row({ icon, label }: { icon: ReactNode; label: string }) {
  return (
    <div className="flex items-center gap-2 text-foreground">
      <span className="grid h-6 w-6 shrink-0 place-items-center rounded-md bg-muted/60 text-muted-foreground">
        {icon}
      </span>
      <span className="truncate">{label}</span>
    </div>
  );
}
