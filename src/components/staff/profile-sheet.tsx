import { useState } from "react";
import { FileText, Mail, MessageSquare, Pencil, Phone } from "lucide-react";

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
import {
  formatStaffDate,
  fullName,
  initialsOf,
  type StaffMember,
} from "@/data/staff";
import {
  AttendanceBadge,
  RoleBadge,
  ShiftBadge,
  StatusBadge,
} from "@/components/staff/badges";
import { AddStaffDialog } from "@/components/staff/add-staff-dialog";

interface Props {
  staff: StaffMember | null;
  allStaff: StaffMember[];
  managers?: StaffMember[];
  onOpenChange: (open: boolean) => void;
  onEditSubmit?: (id: string, patch: Partial<StaffMember>) => void;
  onMessage?: (s: StaffMember) => void;
}

export function StaffProfileSheet({
  staff,
  allStaff,
  managers,
  onOpenChange,
  onEditSubmit,
  onMessage,
}: Props) {
  const [editOpen, setEditOpen] = useState(false);
  const derivedManagers =
    managers ?? allStaff.filter((s) => s.role === "Doctor" || s.role === "Admin");

  return (
    <>
      <Sheet open={staff !== null} onOpenChange={onOpenChange}>
        <SheetContent
          side="right"
          className="flex w-full flex-col gap-0 p-0 sm:max-w-2xl"
        >
          {staff && (
            <ProfileBody
              staff={staff}
              allStaff={allStaff}
              onEdit={() => setEditOpen(true)}
              onMessage={onMessage ? () => onMessage(staff) : undefined}
            />
          )}
        </SheetContent>
      </Sheet>

      <AddStaffDialog
        open={editOpen}
        onOpenChange={setEditOpen}
        managers={derivedManagers}
        initialValue={staff}
        onSave={(id, patch) => {
          onEditSubmit?.(id, patch);
          setEditOpen(false);
          onOpenChange(false);
        }}
      />
    </>
  );
}

function ProfileBody({
  staff,
  allStaff,
  onEdit,
  onMessage,
}: {
  staff: StaffMember;
  allStaff: StaffMember[];
  onEdit: () => void;
  onMessage?: () => void;
}) {
  const manager = allStaff.find((s) => s.id === staff.reportingManagerId);
  return (
    <>
      <SheetHeader className="space-y-4 border-b bg-card p-6">
        <div className="flex items-start gap-4">
          <Avatar className="h-16 w-16">
            <AvatarFallback className="bg-primary/10 text-lg font-semibold text-primary">
              {initialsOf(staff)}
            </AvatarFallback>
          </Avatar>
          <div className="min-w-0 flex-1 space-y-1">
            <SheetTitle className="truncate text-xl">{fullName(staff)}</SheetTitle>
            <SheetDescription className="text-xs tabular">
              {staff.id}
            </SheetDescription>
            <div className="flex flex-wrap items-center gap-2 pt-1">
              <RoleBadge role={staff.role} />
              <StatusBadge status={staff.status} />
            </div>
          </div>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <Chip label="Department" value={staff.department} />
          <ShiftBadge shift={staff.shift} />
          <Chip label="Phone" value={staff.phone} />
        </div>
      </SheetHeader>

      <div className="flex-1 overflow-y-auto p-6">
        <Tabs defaultValue="overview" className="space-y-4">
          <TabsList className="w-full justify-start bg-muted/40">
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="schedule">Schedule</TabsTrigger>
            <TabsTrigger value="attendance">Attendance</TabsTrigger>
            <TabsTrigger value="documents">Documents</TabsTrigger>
          </TabsList>

          <TabsContent value="overview" className="space-y-4">
            <Section title="Personal Information">
              <InfoRow label="Date of Birth" value={formatStaffDate(staff.dob)} />
              <InfoRow label="Gender" value={staff.gender} />
              <InfoRow label="Phone" value={staff.phone} />
              <InfoRow label="Email" value={staff.email} />
              <InfoRow label="Address" value={staff.address} full />
              <InfoRow
                label="Emergency Contact"
                value={`${staff.emergencyContactName} · ${staff.emergencyContactPhone}`}
                full
              />
            </Section>
            <Section title="Employment">
              <InfoRow label="Employee ID" value={staff.id} />
              <InfoRow label="Joined" value={formatStaffDate(staff.joinedDate)} />
              <InfoRow label="Department" value={staff.department} />
              <InfoRow label="Shift" value={staff.shift} />
              <InfoRow
                label="Reporting Manager"
                value={manager ? `${fullName(manager)} · ${manager.id}` : "—"}
                full
              />
              {(staff.role === "Doctor" || staff.role === "Nurse") && (
                <InfoRow
                  label="Qualification"
                  value={staff.qualification ?? "—"}
                  full
                />
              )}
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
                      Shift
                    </TableHead>
                    <TableHead className="h-9 text-[11px] font-semibold uppercase tracking-wide text-muted-foreground">
                      Hours
                    </TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {staff.weeklyShifts.map((w) => (
                    <TableRow key={w.day}>
                      <TableCell className="py-2 text-sm font-medium text-foreground">
                        {w.day}
                      </TableCell>
                      <TableCell className="py-2 text-sm">
                        {w.shift === "Off" ? (
                          <span className="text-muted-foreground">Off</span>
                        ) : (
                          <ShiftBadge shift={w.shift} />
                        )}
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

          <TabsContent value="attendance">
            <div className="overflow-hidden rounded-lg border bg-card">
              <Table>
                <TableHeader>
                  <TableRow className="border-b bg-muted/40 hover:bg-muted/40">
                    <TableHead className="h-9 text-[11px] font-semibold uppercase tracking-wide text-muted-foreground">
                      Date
                    </TableHead>
                    <TableHead className="h-9 text-[11px] font-semibold uppercase tracking-wide text-muted-foreground">
                      Check-in
                    </TableHead>
                    <TableHead className="h-9 text-[11px] font-semibold uppercase tracking-wide text-muted-foreground">
                      Check-out
                    </TableHead>
                    <TableHead className="h-9 text-end text-[11px] font-semibold uppercase tracking-wide text-muted-foreground">
                      Status
                    </TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {staff.attendance.map((a) => (
                    <TableRow key={a.date}>
                      <TableCell className="py-2 text-sm text-foreground tabular">
                        {formatStaffDate(a.date)}
                      </TableCell>
                      <TableCell className="py-2 text-sm tabular text-foreground">
                        {a.checkIn}
                      </TableCell>
                      <TableCell className="py-2 text-sm tabular text-foreground">
                        {a.checkOut}
                      </TableCell>
                      <TableCell className="py-2 text-end">
                        <AttendanceBadge status={a.status} />
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          </TabsContent>

          <TabsContent value="documents">
            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
              {staff.documents.map((d) => (
                <div
                  key={d.id}
                  className="flex items-start gap-3 rounded-lg border bg-card p-3"
                >
                  <div className="grid h-10 w-10 place-items-center rounded-md bg-primary/10 text-primary">
                    <FileText className="h-5 w-5" />
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="truncate text-sm font-medium text-foreground">
                      {d.name}
                    </div>
                    <div className="text-[11px] text-muted-foreground">
                      {d.kind} · {d.size}
                    </div>
                  </div>
                </div>
              ))}
              {staff.documents.length === 0 && (
                <div className="col-span-full grid h-24 place-items-center rounded-lg border border-dashed bg-muted/30 text-sm text-muted-foreground">
                  No documents uploaded.
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
          <Button size="sm" className="gap-2" onClick={onEdit}>
            <Pencil className="h-4 w-4" /> Edit Profile
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
      <dl className="grid grid-cols-1 gap-x-6 gap-y-3 p-4 sm:grid-cols-2">
        {children}
      </dl>
    </div>
  );
}

function InfoRow({
  label,
  value,
  full,
}: {
  label: string;
  value: string;
  full?: boolean;
}) {
  return (
    <div className={cn("min-w-0", full && "sm:col-span-2")}>
      <dt className="text-[11px] font-medium text-muted-foreground">{label}</dt>
      <dd className="mt-0.5 text-sm text-foreground">{value}</dd>
    </div>
  );
}
