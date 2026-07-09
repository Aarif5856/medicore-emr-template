import { useMemo } from "react";
import { format, parseISO } from "date-fns";
import { CalendarPlus, Mail, MessageSquare, Pencil, Phone, Star } from "lucide-react";

import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { cn } from "@/lib/utils";
import { AvailabilityBadge, SpecialtyBadge } from "@/components/doctors/badges";
import {
  doctorFullName,
  doctorInitials,
  formatDoctorDate,
  type Doctor,
} from "@/data/doctors";
import { generateInitialAppointments, type Appointment } from "@/data/appointments";

interface Props {
  doctor: Doctor | null;
  onOpenChange: (open: boolean) => void;
  onBook?: (d: Doctor) => void;
  onMessage?: (d: Doctor) => void;
  onEdit?: (d: Doctor) => void;
}

// Cached mock appointment data — same source as the /appointments page.
let CACHED_APPTS: Appointment[] | null = null;
function apptsFor(doctorId: string): Appointment[] {
  if (!CACHED_APPTS) CACHED_APPTS = generateInitialAppointments();
  const now = new Date();
  return CACHED_APPTS.filter(
    (a) =>
      a.doctorId === doctorId &&
      a.status !== "Cancelled" &&
      parseISO(a.start).getTime() >= now.getTime() - 24 * 3600 * 1000,
  )
    .sort((a, b) => a.start.localeCompare(b.start))
    .slice(0, 10);
}

export function DoctorProfileSheet({
  doctor,
  onOpenChange,
  onBook,
  onMessage,
  onEdit,
}: Props) {
  return (
    <Sheet open={doctor !== null} onOpenChange={onOpenChange}>
      <SheetContent
        side="right"
        className="flex w-full flex-col gap-0 p-0 sm:max-w-2xl"
      >
        {doctor && (
          <Body
            doctor={doctor}
            onBook={onBook ? () => onBook(doctor) : undefined}
            onMessage={onMessage ? () => onMessage(doctor) : undefined}
            onEdit={onEdit ? () => onEdit(doctor) : undefined}
          />
        )}
      </SheetContent>
    </Sheet>
  );
}

function Body({
  doctor,
  onBook,
  onMessage,
  onEdit,
}: {
  doctor: Doctor;
  onBook?: () => void;
  onMessage?: () => void;
  onEdit?: () => void;
}) {
  const upcoming = useMemo(() => apptsFor(doctor.id), [doctor.id]);

  return (
    <>
      <SheetHeader className="space-y-4 border-b bg-card p-6">
        <div className="flex items-start gap-4">
          <Avatar className="h-16 w-16">
            <AvatarFallback className="bg-primary/10 text-lg font-semibold text-primary">
              {doctorInitials(doctor)}
            </AvatarFallback>
          </Avatar>
          <div className="min-w-0 flex-1 space-y-1">
            <SheetTitle className="truncate text-xl">{doctorFullName(doctor)}</SheetTitle>
            <SheetDescription className="text-xs tabular">{doctor.id}</SheetDescription>
            <div className="flex flex-wrap items-center gap-2 pt-1">
              <SpecialtyBadge specialty={doctor.specialty} />
              <AvailabilityBadge status={doctor.availability} />
              <span className="inline-flex items-center gap-1 rounded-md border bg-card px-1.5 py-0.5 text-[11px] font-medium">
                <Star className="h-3 w-3 fill-warning text-warning" />
                {doctor.rating.toFixed(1)}
              </span>
            </div>
          </div>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <Chip label="Qualification" value={doctor.qualification} />
          <Chip label="Experience" value={`${doctor.experienceYears} yrs`} />
          <Chip label="Department" value={doctor.department} />
          <Chip label="Phone" value={doctor.phone} />
        </div>
      </SheetHeader>

      <div className="flex-1 overflow-y-auto p-6">
        <Tabs defaultValue="overview" className="space-y-4">
          <TabsList className="w-full justify-start bg-muted/40">
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="schedule">Schedule</TabsTrigger>
            <TabsTrigger value="appointments">Appointments</TabsTrigger>
            <TabsTrigger value="patients">Patients</TabsTrigger>
            <TabsTrigger value="reviews">Reviews</TabsTrigger>
          </TabsList>

          <TabsContent value="overview" className="space-y-4">
            <Section title="Biography">
              <p className="text-sm leading-relaxed text-foreground">{doctor.bio}</p>
            </Section>
            <Section title="Contact">
              <div className="grid grid-cols-1 gap-x-6 gap-y-3 sm:grid-cols-2">
                <InfoRow label="Phone" value={doctor.phone} />
                <InfoRow label="Email" value={doctor.email} />
                <InfoRow label="Department" value={doctor.department} />
                <InfoRow label="Specialty" value={doctor.specialty} />
              </div>
            </Section>
            <Section title="Qualifications & Certifications">
              <ul className="grid grid-cols-1 gap-2 sm:grid-cols-2">
                {doctor.certifications.map((c) => (
                  <li
                    key={c}
                    className="rounded-md border bg-card px-3 py-2 text-sm text-foreground"
                  >
                    {c}
                  </li>
                ))}
              </ul>
            </Section>
            <Section title="Languages Spoken">
              <div className="flex flex-wrap gap-1.5">
                {doctor.languages.map((l) => (
                  <span
                    key={l}
                    className="inline-flex items-center rounded-full bg-muted px-2 py-0.5 text-[11px] font-medium text-foreground"
                  >
                    {l}
                  </span>
                ))}
              </div>
            </Section>
          </TabsContent>

          <TabsContent value="schedule">
            <div className="overflow-hidden rounded-lg border bg-card">
              <Table>
                <TableHeader>
                  <TableRow className="border-b bg-muted/40 hover:bg-muted/40">
                    <TableHead className="h-9 text-[11px] font-semibold uppercase tracking-wide text-muted-foreground">
                      Day
                    </TableHead>
                    <TableHead className="h-9 text-[11px] font-semibold uppercase tracking-wide text-muted-foreground">
                      Hours
                    </TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {doctor.weeklySchedule.map((w) => (
                    <TableRow key={w.day}>
                      <TableCell className="py-2 text-sm font-medium text-foreground">
                        {w.day}
                      </TableCell>
                      <TableCell className="py-2 text-sm tabular text-muted-foreground">
                        {w.hours}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          </TabsContent>

          <TabsContent value="appointments">
            {upcoming.length === 0 ? (
              <div className="grid h-24 place-items-center rounded-lg border border-dashed bg-muted/30 text-sm text-muted-foreground">
                No upcoming appointments.
              </div>
            ) : (
              <div className="overflow-hidden rounded-lg border bg-card">
                <Table>
                  <TableHeader>
                    <TableRow className="border-b bg-muted/40 hover:bg-muted/40">
                      <TableHead className="h-9 text-[11px] font-semibold uppercase tracking-wide text-muted-foreground">
                        Date & Time
                      </TableHead>
                      <TableHead className="h-9 text-[11px] font-semibold uppercase tracking-wide text-muted-foreground">
                        Patient
                      </TableHead>
                      <TableHead className="h-9 text-[11px] font-semibold uppercase tracking-wide text-muted-foreground">
                        Reason
                      </TableHead>
                      <TableHead className="h-9 text-end text-[11px] font-semibold uppercase tracking-wide text-muted-foreground">
                        Status
                      </TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {upcoming.map((a) => (
                      <TableRow key={a.id}>
                        <TableCell className="py-2 text-sm tabular text-foreground">
                          {format(parseISO(a.start), "MMM d, HH:mm")}
                        </TableCell>
                        <TableCell className="py-2 text-sm text-foreground">
                          {a.patientName}
                        </TableCell>
                        <TableCell className="py-2 text-sm text-muted-foreground">
                          {a.reason ?? "—"}
                        </TableCell>
                        <TableCell className="py-2 text-end text-[11px] font-medium text-foreground">
                          {a.status}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            )}
          </TabsContent>

          <TabsContent value="patients">
            {doctor.recentPatients.length === 0 ? (
              <div className="grid h-24 place-items-center rounded-lg border border-dashed bg-muted/30 text-sm text-muted-foreground">
                No recent patients on record.
              </div>
            ) : (
              <div className="overflow-hidden rounded-lg border bg-card">
                <Table>
                  <TableHeader>
                    <TableRow className="border-b bg-muted/40 hover:bg-muted/40">
                      <TableHead className="h-9 text-[11px] font-semibold uppercase tracking-wide text-muted-foreground">
                        Patient
                      </TableHead>
                      <TableHead className="h-9 text-[11px] font-semibold uppercase tracking-wide text-muted-foreground">
                        Last Visit
                      </TableHead>
                      <TableHead className="h-9 text-[11px] font-semibold uppercase tracking-wide text-muted-foreground">
                        Reason
                      </TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {doctor.recentPatients.map((p) => (
                      <TableRow key={`${p.name}-${p.lastVisit}`}>
                        <TableCell className="py-2 text-sm font-medium text-foreground">
                          {p.name}
                        </TableCell>
                        <TableCell className="py-2 text-sm tabular text-muted-foreground">
                          {formatDoctorDate(p.lastVisit)}
                        </TableCell>
                        <TableCell className="py-2 text-sm text-muted-foreground">
                          {p.reason}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            )}
          </TabsContent>

          <TabsContent value="reviews">
            <div className="grid grid-cols-1 gap-3">
              {doctor.reviews.map((r) => (
                <div key={r.id} className="rounded-lg border bg-card p-3">
                  <div className="flex items-center justify-between">
                    <div className="text-sm font-medium text-foreground">{r.patient}</div>
                    <div className="flex items-center gap-1 text-[11px] text-muted-foreground">
                      {Array.from({ length: 5 }).map((_, i) => (
                        <Star
                          key={i}
                          className={cn(
                            "h-3 w-3",
                            i < r.rating
                              ? "fill-warning text-warning"
                              : "text-muted-foreground/40",
                          )}
                        />
                      ))}
                      <span className="ms-2 tabular">{formatDoctorDate(r.date)}</span>
                    </div>
                  </div>
                  <p className="mt-2 text-sm text-muted-foreground">{r.comment}</p>
                </div>
              ))}
              {doctor.reviews.length === 0 && (
                <div className="grid h-24 place-items-center rounded-lg border border-dashed bg-muted/30 text-sm text-muted-foreground">
                  No reviews yet.
                </div>
              )}
            </div>
          </TabsContent>
        </Tabs>
      </div>

      <div className="flex flex-wrap items-center justify-between gap-2 border-t bg-card p-4">
        <div className="flex items-center gap-1">
          <Button variant="ghost" size="sm" className="gap-2">
            <Phone className="h-4 w-4" /> Call
          </Button>
          <Button variant="ghost" size="sm" className="gap-2">
            <Mail className="h-4 w-4" /> Email
          </Button>
        </div>
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            className="gap-2"
            onClick={onMessage}
            disabled={!onMessage}
          >
            <MessageSquare className="h-4 w-4" /> Message
          </Button>
          <Button
            variant="outline"
            size="sm"
            className="gap-2"
            onClick={onEdit}
            disabled={!onEdit}
          >
            <Pencil className="h-4 w-4" /> Edit Profile
          </Button>
          <Button
            size="sm"
            className="gap-2 glow-primary"
            onClick={onBook}
            disabled={!onBook}
          >
            <CalendarPlus className="h-4 w-4" /> Book Appointment
          </Button>
        </div>
      </div>
    </>
  );
}

function Chip({ label, value }: { label: string; value: string }) {
  return (
    <span className="inline-flex items-center gap-1 rounded-md border bg-card px-2 py-0.5 text-[11px] font-medium text-foreground">
      <span className="text-muted-foreground">{label}:</span>
      {value}
    </span>
  );
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="rounded-lg border bg-card">
      <div className="border-b px-4 py-2 text-[11px] font-semibold uppercase tracking-wide text-muted-foreground">
        {title}
      </div>
      <div className="p-4">{children}</div>
    </div>
  );
}

function InfoRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="min-w-0">
      <dt className="text-[11px] font-medium text-muted-foreground">{label}</dt>
      <dd className="mt-0.5 text-sm text-foreground">{value}</dd>
    </div>
  );
}
