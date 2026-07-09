import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import {
  Activity,
  Calendar,
  CalendarPlus,
  Download,
  FileText,
  FlaskConical,
  HeartPulse,
  Image as ImageIcon,
  Mail,
  MapPin,
  Phone,
  Pencil,
  Pill,
  Scissors,
  Stethoscope,
  Syringe,
  User,
} from "lucide-react";
import type { LucideIcon } from "lucide-react";

import { Breadcrumbs } from "@/components/breadcrumbs";
import { PageHeader } from "@/components/coming-soon";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
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
import {
  formatDate,
  initials,
  PatientStatusBadge,
} from "@/components/patients/status-badge";
import { getPatientById, PATIENTS } from "@/data/patients";
import {
  ALLERGIES,
  BASIC_INFO,
  DOCUMENTS,
  INVOICES,
  MEDICAL_HISTORY,
  MEDICATIONS,
  PATIENT_APPOINTMENTS,
  PATIENT_LABS,
  VITALS,
  type ApptStatus,
  type HistoryKind,
  type InvoiceStatus,
  type LabResultStatus,
} from "@/data/patient-detail";

export const Route = createFileRoute("/_app/patients/$patientId")({
  head: () => ({ meta: [{ title: "Patient Profile — MediCore EMR" }] }),
  component: PatientProfilePage,
});

function PatientProfilePage() {
  const { patientId } = Route.useParams();
  const navigate = useNavigate();
  const patient = getPatientById(patientId) ?? PATIENTS[0];

  return (
    <div className="space-y-6">
      <Breadcrumbs />
      <PageHeader
        title="Patient Profile"
        description="Full medical record and clinical history."
        actions={
          <Button variant="ghost" size="sm" onClick={() => navigate({ to: "/patients" })}>
            Back to list
          </Button>
        }
      />

      {/* Header card */}
      <Card className="card-glass">
        <CardContent className="p-5">
          <div className="grid grid-cols-1 gap-5 md:grid-cols-[auto_minmax(0,1fr)_auto] md:items-center">
            <Avatar className="h-16 w-16 md:h-20 md:w-20">
              <AvatarFallback className="bg-primary/10 text-lg font-semibold text-primary">
                {initials(patient.firstName, patient.lastName)}
              </AvatarFallback>
            </Avatar>

            <div className="min-w-0 space-y-2">
              <div className="flex flex-wrap items-center gap-3">
                <h2 className="truncate text-xl font-semibold text-foreground">
                  {patient.firstName} {patient.lastName}
                </h2>
                <PatientStatusBadge status={patient.status} />
              </div>
              <div className="text-xs text-muted-foreground tabular">
                Patient ID · {patient.id}
              </div>
              <div className="flex flex-wrap gap-2 pt-1">
                <InfoChip icon={User} label={`${patient.age} yrs · ${patient.gender}`} />
                <InfoChip icon={HeartPulse} label={`Blood ${patient.bloodGroup}`} />
                <InfoChip icon={Phone} label={patient.phone} />
                <InfoChip icon={Stethoscope} label={patient.doctor} />
              </div>
            </div>

            <div className="flex flex-wrap gap-2 md:flex-nowrap md:justify-end">
              <Button variant="outline" size="sm" className="gap-2">
                <Pencil className="h-4 w-4" /> Edit Profile
              </Button>
              <Button size="sm" className="gap-2 glow-primary">
                <CalendarPlus className="h-4 w-4" /> New Appointment
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Tabs */}
      <Tabs defaultValue="overview" className="space-y-4">
        <div className="overflow-x-auto">
          <TabsList className="inline-flex">
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="appointments">Appointments</TabsTrigger>
            <TabsTrigger value="labs">Lab Results</TabsTrigger>
            <TabsTrigger value="history">Medical History</TabsTrigger>
            <TabsTrigger value="billing">Billing</TabsTrigger>
            <TabsTrigger value="documents">Documents</TabsTrigger>
          </TabsList>
        </div>

        <TabsContent value="overview" className="space-y-4">
          <OverviewTab />
        </TabsContent>
        <TabsContent value="appointments">
          <AppointmentsTab />
        </TabsContent>
        <TabsContent value="labs">
          <LabsTab />
        </TabsContent>
        <TabsContent value="history">
          <HistoryTab />
        </TabsContent>
        <TabsContent value="billing">
          <BillingTab />
        </TabsContent>
        <TabsContent value="documents">
          <DocumentsTab />
        </TabsContent>
      </Tabs>
    </div>
  );
}

/* ---------------- Sub components ---------------- */

function InfoChip({ icon: Icon, label }: { icon: LucideIcon; label: string }) {
  return (
    <span className="inline-flex items-center gap-1.5 rounded-full border bg-background/60 px-2.5 py-1 text-[11px] font-medium text-muted-foreground">
      <Icon className="h-3.5 w-3.5" />
      <span className="text-foreground">{label}</span>
    </span>
  );
}

function OverviewTab() {
  return (
    <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
      {/* Basic Info */}
      <Card className="card-glass">
        <CardHeader className="pb-2">
          <CardTitle className="text-base">Basic Information</CardTitle>
        </CardHeader>
        <CardContent>
          <dl className="grid grid-cols-1 gap-x-6 gap-y-3 sm:grid-cols-2">
            <InfoRow icon={Calendar} label="Date of Birth" value={formatDate(BASIC_INFO.dob)} />
            <InfoRow icon={User} label="Gender" value={BASIC_INFO.gender} />
            <InfoRow icon={User} label="Marital Status" value={BASIC_INFO.maritalStatus} />
            <InfoRow icon={Phone} label="Phone" value={BASIC_INFO.phone} />
            <InfoRow icon={Mail} label="Email" value={BASIC_INFO.email} />
            <InfoRow icon={MapPin} label="Address" value={BASIC_INFO.address} className="sm:col-span-2" />
            <InfoRow
              icon={User}
              label="Emergency Contact"
              value={`${BASIC_INFO.emergencyContact} · ${BASIC_INFO.emergencyPhone}`}
              className="sm:col-span-2"
            />
          </dl>
        </CardContent>
      </Card>

      {/* Vitals */}
      <Card className="card-glass">
        <CardHeader className="pb-2">
          <CardTitle className="text-base">Vital Signs</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 gap-2 sm:grid-cols-3">
            {VITALS.map((v) => (
              <div
                key={v.label}
                className="rounded-lg border bg-background/60 p-3 transition-colors hover:bg-muted/50"
              >
                <div className="flex items-center gap-2 text-primary">
                  <v.icon className="h-4 w-4" />
                  <span className="text-[10px] font-semibold uppercase tracking-wide text-muted-foreground">
                    {v.label}
                  </span>
                </div>
                <div className="mt-2 flex items-baseline gap-1">
                  <span className="text-lg font-semibold text-foreground tabular">{v.value}</span>
                  {v.unit && (
                    <span className="text-[11px] text-muted-foreground">{v.unit}</span>
                  )}
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Allergies */}
      <Card className="card-glass">
        <CardHeader className="pb-2">
          <CardTitle className="text-base">Allergies</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-wrap gap-2">
            {ALLERGIES.map((a) => (
              <span
                key={a}
                className="inline-flex items-center gap-1.5 rounded-full bg-destructive/10 px-2.5 py-1 text-xs font-medium text-destructive"
              >
                <span className="h-1.5 w-1.5 rounded-full bg-destructive" aria-hidden />
                {a}
              </span>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Medications */}
      <Card className="card-glass">
        <CardHeader className="pb-2">
          <CardTitle className="text-base">Current Medications</CardTitle>
        </CardHeader>
        <CardContent className="p-2">
          <ul className="divide-y divide-border">
            {MEDICATIONS.map((m) => (
              <li key={m.name} className="flex items-center gap-3 rounded-md px-2 py-2.5">
                <div className="grid h-8 w-8 shrink-0 place-items-center rounded-md bg-primary/10 text-primary">
                  <Pill className="h-4 w-4" />
                </div>
                <div className="min-w-0 flex-1">
                  <div className="truncate text-sm font-medium text-foreground">{m.name}</div>
                  <div className="truncate text-[11px] text-muted-foreground">{m.frequency}</div>
                </div>
                <span className="rounded-md border bg-background px-2 py-0.5 text-[11px] font-semibold text-foreground tabular">
                  {m.dosage}
                </span>
              </li>
            ))}
          </ul>
        </CardContent>
      </Card>
    </div>
  );
}

function InfoRow({
  icon: Icon,
  label,
  value,
  className,
}: {
  icon: LucideIcon;
  label: string;
  value: string;
  className?: string;
}) {
  return (
    <div className={cn("min-w-0", className)}>
      <dt className="flex items-center gap-1.5 text-[11px] font-medium uppercase tracking-wide text-muted-foreground">
        <Icon className="h-3.5 w-3.5" /> {label}
      </dt>
      <dd className="mt-1 text-sm text-foreground">{value}</dd>
    </div>
  );
}

const APPT_STATUS_STYLES: Record<ApptStatus, string> = {
  Upcoming: "bg-primary/10 text-primary",
  Completed: "bg-[color:var(--accent-teal)]/10 text-[color:var(--accent-teal)]",
  Cancelled: "bg-destructive/10 text-destructive",
};

function AppointmentsTab() {
  return (
    <Card className="card-glass overflow-hidden">
      <div className="overflow-x-auto">
        <Table>
          <TableHeader>
            <TableRow className="bg-muted/40 hover:bg-muted/40">
              <TableHead>Date</TableHead>
              <TableHead>Doctor</TableHead>
              <TableHead>Department</TableHead>
              <TableHead>Ref</TableHead>
              <TableHead className="text-end">Status</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {PATIENT_APPOINTMENTS.map((a) => (
              <TableRow key={a.id}>
                <TableCell className="whitespace-nowrap text-sm text-muted-foreground tabular">
                  {formatDate(a.date)}
                </TableCell>
                <TableCell className="whitespace-nowrap text-sm text-foreground">{a.doctor}</TableCell>
                <TableCell className="whitespace-nowrap text-sm text-muted-foreground">{a.department}</TableCell>
                <TableCell className="whitespace-nowrap text-xs text-muted-foreground tabular">{a.id}</TableCell>
                <TableCell className="text-end">
                  <span className={cn("rounded-full px-2 py-0.5 text-[11px] font-semibold", APPT_STATUS_STYLES[a.status])}>
                    {a.status}
                  </span>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </Card>
  );
}

const LAB_STATUS_STYLES: Record<LabResultStatus, string> = {
  Normal: "bg-[color:var(--accent-teal)]/10 text-[color:var(--accent-teal)]",
  Abnormal: "bg-warning/10 text-warning",
  Critical: "bg-destructive/10 text-destructive",
};

function LabsTab() {
  return (
    <Card className="card-glass">
      <CardContent className="p-2">
        <ul className="divide-y divide-border">
          {PATIENT_LABS.map((r) => (
            <li key={r.id} className="flex items-center gap-3 rounded-md px-3 py-3">
              <div className="grid h-9 w-9 shrink-0 place-items-center rounded-md bg-primary/10 text-primary">
                <FlaskConical className="h-4 w-4" />
              </div>
              <div className="min-w-0 flex-1">
                <div className="flex items-center gap-2">
                  <span className="truncate text-sm font-medium text-foreground">{r.test}</span>
                  <span className={cn("shrink-0 rounded-full px-2 py-0.5 text-[10px] font-semibold", LAB_STATUS_STYLES[r.status])}>
                    {r.status}
                  </span>
                </div>
                <div className="truncate text-[11px] text-muted-foreground">
                  {formatDate(r.date)} · {r.note}
                </div>
              </div>
              <Button variant="ghost" size="icon" className="h-8 w-8" aria-label={`Download ${r.test} PDF`}>
                <Download className="h-4 w-4" />
              </Button>
            </li>
          ))}
        </ul>
      </CardContent>
    </Card>
  );
}

const HISTORY_ICONS: Record<HistoryKind, LucideIcon> = {
  diagnosis: Stethoscope,
  surgery: Scissors,
  admission: Activity,
  vaccination: Syringe,
  consultation: HeartPulse,
};

function HistoryTab() {
  return (
    <Card className="card-glass">
      <CardContent className="p-6">
        <ol className="relative space-y-6 border-s border-border ps-6">
          {MEDICAL_HISTORY.map((e) => {
            const Icon = HISTORY_ICONS[e.kind];
            return (
              <li key={e.id} className="relative">
                <span className="absolute -left-[34px] top-0 grid h-8 w-8 place-items-center rounded-full border bg-background text-primary">
                  <Icon className="h-4 w-4" />
                </span>
                <div className="flex flex-wrap items-baseline gap-2">
                  <h4 className="text-sm font-semibold text-foreground">{e.title}</h4>
                  <span className="text-[11px] uppercase tracking-wide text-muted-foreground">
                    {e.kind}
                  </span>
                  <time className="ms-auto text-xs text-muted-foreground tabular">
                    {formatDate(e.date)}
                  </time>
                </div>
                <p className="mt-1 text-xs text-muted-foreground">{e.note}</p>
              </li>
            );
          })}
        </ol>
      </CardContent>
    </Card>
  );
}

const INVOICE_STATUS_STYLES: Record<InvoiceStatus, string> = {
  Paid: "bg-[color:var(--accent-teal)]/10 text-[color:var(--accent-teal)]",
  Pending: "bg-warning/10 text-warning",
  Overdue: "bg-destructive/10 text-destructive",
};

function BillingTab() {
  return (
    <Card className="card-glass overflow-hidden">
      <div className="overflow-x-auto">
        <Table>
          <TableHeader>
            <TableRow className="bg-muted/40 hover:bg-muted/40">
              <TableHead>Invoice #</TableHead>
              <TableHead>Date</TableHead>
              <TableHead>Description</TableHead>
              <TableHead className="text-end">Amount</TableHead>
              <TableHead className="text-end">Status</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {INVOICES.map((i) => (
              <TableRow key={i.id}>
                <TableCell className="whitespace-nowrap text-xs font-medium text-foreground tabular">{i.id}</TableCell>
                <TableCell className="whitespace-nowrap text-sm text-muted-foreground tabular">{formatDate(i.date)}</TableCell>
                <TableCell className="text-sm text-foreground">{i.description}</TableCell>
                <TableCell className="whitespace-nowrap text-end text-sm font-semibold text-foreground tabular">{i.amount}</TableCell>
                <TableCell className="text-end">
                  <span className={cn("rounded-full px-2 py-0.5 text-[11px] font-semibold", INVOICE_STATUS_STYLES[i.status])}>
                    {i.status}
                  </span>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </Card>
  );
}

const DOC_ICONS: Record<"pdf" | "image" | "doc", LucideIcon> = {
  pdf: FileText,
  image: ImageIcon,
  doc: FileText,
};
const DOC_TONES: Record<"pdf" | "image" | "doc", string> = {
  pdf: "bg-destructive/10 text-destructive",
  image: "bg-primary/10 text-primary",
  doc: "bg-[color:var(--accent-teal)]/10 text-[color:var(--accent-teal)]",
};

function DocumentsTab() {
  return (
    <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-4">
      {DOCUMENTS.map((d) => {
        const Icon = DOC_ICONS[d.kind];
        return (
          <Card key={d.id} className="card-glass p-4 transition-colors hover:bg-muted/40">
            <div className={cn("mb-3 grid h-10 w-10 place-items-center rounded-lg", DOC_TONES[d.kind])}>
              <Icon className="h-5 w-5" />
            </div>
            <div className="truncate text-sm font-medium text-foreground" title={d.name}>
              {d.name}
            </div>
            <div className="mt-1 text-[11px] text-muted-foreground tabular">
              {d.size} · {formatDate(d.uploadedAt)}
            </div>
          </Card>
        );
      })}
    </div>
  );
}
