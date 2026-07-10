import { useMemo, useState } from "react";
import { createFileRoute } from "@tanstack/react-router";
import {
  endOfWeek,
  isSameDay,
  isWithinInterval,
  parseISO,
  startOfWeek,
} from "date-fns";
import { Plus } from "lucide-react";
import { toast } from "sonner";

import { Breadcrumbs } from "@/components/breadcrumbs";
import { PageHeader } from "@/components/coming-soon";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { MiniStatCard } from "@/components/ui/mini-stat-card";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { CalendarView } from "@/components/appointments/calendar-view";
import { AppointmentsListTable } from "@/components/appointments/appointments-list";
import { BookingDialog } from "@/components/appointments/booking-dialog";
import { RescheduleDialog } from "@/components/appointments/reschedule-dialog";
import { CancelAppointmentDialog } from "@/components/appointments/cancel-dialog";
import { AppointmentDetail } from "@/components/appointments/appointment-detail";
import {
  AppointmentsProvider,
  useAppointments,
} from "@/components/appointments/store";
import type { Appointment } from "@/data/appointments";

export const Route = createFileRoute("/_app/appointments")({
  head: () => ({ meta: [{ title: "Appointments · MediCore EMR" }] }),
  component: AppointmentsRoute,
});

function AppointmentsRoute() {
  return (
    <AppointmentsProvider>
      <AppointmentsPage />
    </AppointmentsProvider>
  );
}

const TONE_STYLES = {
  primary: "bg-primary",
  teal: "bg-[color:var(--accent-teal)]",
  warning: "bg-warning",
  destructive: "bg-destructive",
} as const;

function AppointmentsPage() {
  const { appointments, addAppointment, updateAppointment } = useAppointments();

  const [view, setView] = useState<"calendar" | "list">("calendar");
  const [bookingOpen, setBookingOpen] = useState(false);
  const [rescheduleTarget, setRescheduleTarget] = useState<Appointment | null>(null);
  const [cancelTarget, setCancelTarget] = useState<Appointment | null>(null);
  const [viewTarget, setViewTarget] = useState<Appointment | null>(null);

  const stats = useMemo(() => {
    const now = new Date();
    const weekStart = startOfWeek(now, { weekStartsOn: 1 });
    const weekEnd = endOfWeek(now, { weekStartsOn: 1 });
    let today = 0;
    let thisWeek = 0;
    let pending = 0;
    let cancelled = 0;
    for (const a of appointments) {
      const d = parseISO(a.start);
      if (isSameDay(d, now)) today++;
      if (isWithinInterval(d, { start: weekStart, end: weekEnd })) thisWeek++;
      if (a.status === "Pending") pending++;
      if (a.status === "Cancelled") cancelled++;
    }
    return [
      { label: "Today", value: today, tone: "primary" as const },
      { label: "This Week", value: thisWeek, tone: "teal" as const },
      { label: "Pending Confirmation", value: pending, tone: "warning" as const },
      { label: "Cancelled", value: cancelled, tone: "destructive" as const },
    ];
  }, [appointments]);

  const handleConfirm = (a: Appointment) => {
    updateAppointment(a.id, { status: "Confirmed" });
    toast.success(`Confirmed appointment for ${a.patientName}`);
  };

  return (
    <div className="space-y-6">
      <Breadcrumbs />
      <PageHeader
        title="Appointments"
        description="Schedule, review, and manage patient appointments across your clinic."
        actions={
          <Button
            size="sm"
            className="gap-2 glow-primary"
            onClick={() => setBookingOpen(true)}
          >
            <Plus className="h-4 w-4" /> New Appointment
          </Button>
        }
      />

      <div className="grid grid-cols-2 gap-3 md:grid-cols-4">
        {stats.map((s) => (
          <Card key={s.label} className="card-glass p-4">
            <div className="flex items-center gap-3">
              <span
                className={cn("h-2.5 w-2.5 shrink-0 rounded-full", TONE_STYLES[s.tone])}
              />
              <div className="min-w-0">
                <div className="text-[11px] font-medium text-muted-foreground">
                  {s.label}
                </div>
                <div className="text-lg font-semibold text-foreground tabular">
                  {s.value}
                </div>
              </div>
            </div>
          </Card>
        ))}
      </div>

      <Tabs value={view} onValueChange={(v) => setView(v as "calendar" | "list")}>
        <TabsList className="grid w-full max-w-xs grid-cols-2">
          <TabsTrigger value="calendar">Calendar</TabsTrigger>
          <TabsTrigger value="list">List</TabsTrigger>
        </TabsList>
      </Tabs>

      {view === "calendar" ? (
        <CalendarView
          appointments={appointments}
          onReschedule={setRescheduleTarget}
          onCancel={setCancelTarget}
          onConfirm={handleConfirm}
        />
      ) : (
        <AppointmentsListTable
          appointments={appointments}
          onView={setViewTarget}
          onReschedule={setRescheduleTarget}
          onCancel={setCancelTarget}
        />
      )}

      <BookingDialog
        open={bookingOpen}
        onOpenChange={setBookingOpen}
        appointments={appointments}
        onCreate={addAppointment}
      />

      <RescheduleDialog
        appointment={rescheduleTarget}
        onOpenChange={(o) => !o && setRescheduleTarget(null)}
        appointments={appointments}
        onSubmit={(id, startISO) => updateAppointment(id, { start: startISO })}
      />

      <CancelAppointmentDialog
        appointment={cancelTarget}
        onOpenChange={(o) => !o && setCancelTarget(null)}
        onConfirm={(id) => updateAppointment(id, { status: "Cancelled" })}
      />

      <Dialog
        open={viewTarget !== null}
        onOpenChange={(o) => !o && setViewTarget(null)}
      >
        <DialogContent className="max-w-md p-0">
          <DialogHeader className="sr-only">
            <DialogTitle>Appointment details</DialogTitle>
          </DialogHeader>
          {viewTarget && (
            <AppointmentDetail
              appointment={viewTarget}
              onReschedule={(a) => {
                setViewTarget(null);
                setRescheduleTarget(a);
              }}
              onCancel={(a) => {
                setViewTarget(null);
                setCancelTarget(a);
              }}
              onConfirm={(a) => {
                handleConfirm(a);
                setViewTarget(null);
              }}
            />
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
