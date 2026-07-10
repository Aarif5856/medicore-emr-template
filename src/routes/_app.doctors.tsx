import { useMemo, useState } from "react";
import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { Download, LayoutGrid, List, Plus, Search } from "lucide-react";
import { toast } from "sonner";

import { Breadcrumbs } from "@/components/breadcrumbs";
import { PageHeader } from "@/components/coming-soon";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { MiniStatCard } from "@/components/ui/mini-stat-card";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { cn } from "@/lib/utils";
import { AddDoctorDialog } from "@/components/doctors/add-doctor-dialog";
import { AvailabilityBadge, SpecialtyBadge } from "@/components/doctors/badges";
import { DoctorCard } from "@/components/doctors/doctor-card";
import { DoctorProfileSheet } from "@/components/doctors/profile-sheet";
import { useDoctors } from "@/components/doctors/store";
import {
  DOCTOR_AVAILABILITIES,
  DOCTOR_SPECIALTIES,
  doctorFullName,
  doctorInitials,
  type Doctor,
  type DoctorAvailability,
  type DoctorSpecialty,
} from "@/data/doctors";

export const Route = createFileRoute("/_app/doctors")({
  head: () => ({ meta: [{ title: "Doctors · MediCore EMR" }] }),
  component: DoctorsPage,
});


const ALL = "__all__";

function DoctorsPage() {
  const navigate = useNavigate();
  const { doctors, addDoctor } = useDoctors();
  const [addOpen, setAddOpen] = useState(false);
  const [view, setView] = useState<"grid" | "table">("grid");
  const [tab, setTab] = useState<"All" | DoctorSpecialty>("All");
  const [q, setQ] = useState("");
  const [avail, setAvail] = useState<DoctorAvailability | typeof ALL>(ALL);
  const [target, setTarget] = useState<Doctor | null>(null);

  const stats = useMemo(() => {
    const total = doctors.length;
    const available = doctors.filter((d) => d.availability === "Available").length;
    const onLeave = doctors.filter((d) => d.availability === "On Leave").length;
    const inSurgery = doctors.filter((d) => d.availability === "In Surgery").length;
    return [
      { label: "Total Doctors", value: String(total), tone: "primary" as const },
      { label: "Available Now", value: String(available), tone: "teal" as const },
      { label: "On Leave", value: String(onLeave), tone: "destructive" as const },
      { label: "In Surgery", value: String(inSurgery), tone: "warning" as const },
    ];
  }, [doctors]);

  const specialtyCounts = useMemo(() => {
    const counts = new Map<DoctorSpecialty, number>();
    for (const d of doctors) counts.set(d.specialty, (counts.get(d.specialty) ?? 0) + 1);
    return counts;
  }, [doctors]);

  const activeSpecialties = useMemo(
    () => DOCTOR_SPECIALTIES.filter((s) => (specialtyCounts.get(s) ?? 0) > 0),
    [specialtyCounts],
  );

  const filtered = useMemo(() => {
    const needle = q.trim().toLowerCase();
    return doctors.filter((d) => {
      if (tab !== "All" && d.specialty !== tab) return false;
      if (avail !== ALL && d.availability !== avail) return false;
      if (!needle) return true;
      return (
        doctorFullName(d).toLowerCase().includes(needle) ||
        d.specialty.toLowerCase().includes(needle) ||
        d.qualification.toLowerCase().includes(needle) ||
        d.department.toLowerCase().includes(needle)
      );
    });
  }, [doctors, tab, avail, q]);

  const handleView = (d: Doctor) => {
    setTarget(doctors.find((x) => x.id === d.id) ?? d);
  };

  const handleMessage = (d: Doctor) => {
    if (d.staffId) {
      navigate({ to: "/messages", search: { staffId: d.staffId } });
    } else {
      toast("No linked staff record - open Messages directly.");
      navigate({ to: "/messages", search: {} });
    }
  };

  const handleBook = (d: Doctor) => {
    setTarget(null);
    toast.success(`Opening appointment booking for ${doctorFullName(d)}…`);
    navigate({ to: "/appointments" });
  };

  const handleEdit = () => {
    toast("Edit doctor is a demo action in this template.");
  };

  const handleExport = () => {
    toast.success("Exporting doctor directory (demo)…");
  };

  return (
    <div className="space-y-6">
      <Breadcrumbs />
      <PageHeader
        title="Doctors"
        description="Physician directory, specialties, and schedules."
        actions={
          <>
            <Button variant="outline" size="sm" className="gap-2" onClick={handleExport}>
              <Download className="h-4 w-4" /> Export
            </Button>
            <Button
              size="sm"
              className="gap-2 glow-primary"
              onClick={() => setAddOpen(true)}
            >
              <Plus className="h-4 w-4" /> Add Doctor
            </Button>
          </>
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

      <Tabs
        value={tab}
        onValueChange={(v) => setTab(v as "All" | DoctorSpecialty)}
      >
        <TabsList className="flex w-full flex-wrap justify-start gap-1 bg-muted/40">
          <TabsTrigger value="All" className="gap-1.5">
            All <Count n={doctors.length} />
          </TabsTrigger>
          {activeSpecialties.map((s) => (
            <TabsTrigger key={s} value={s} className="gap-1.5">
              {s} <Count n={specialtyCounts.get(s) ?? 0} />
            </TabsTrigger>
          ))}
        </TabsList>
      </Tabs>

      <div className="flex flex-wrap items-center gap-2">
        <div className="relative min-w-[220px] flex-1">
          <Search className="pointer-events-none absolute start-2.5 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            value={q}
            onChange={(e) => setQ(e.target.value)}
            placeholder="Search by name, specialty, department…"
            className="h-9 ps-8"
          />
        </div>
        <Select
          value={avail}
          onValueChange={(v) => setAvail(v as DoctorAvailability | typeof ALL)}
        >
          <SelectTrigger className="h-9 w-[170px]">
            <SelectValue placeholder="Availability" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value={ALL}>All availability</SelectItem>
            {DOCTOR_AVAILABILITIES.map((a) => (
              <SelectItem key={a} value={a}>
                {a}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        <div className="flex items-center rounded-md border bg-card p-0.5">
          <Button
            size="sm"
            variant={view === "grid" ? "default" : "ghost"}
            className="h-8 gap-1.5 px-2"
            onClick={() => setView("grid")}
          >
            <LayoutGrid className="h-4 w-4" /> Grid
          </Button>
          <Button
            size="sm"
            variant={view === "table" ? "default" : "ghost"}
            className="h-8 gap-1.5 px-2"
            onClick={() => setView("table")}
          >
            <List className="h-4 w-4" /> Table
          </Button>
        </div>
      </div>

      {filtered.length === 0 ? (
        <Card className="card-glass grid h-40 place-items-center text-sm text-muted-foreground">
          No doctors match the current filters.
        </Card>
      ) : view === "grid" ? (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {filtered.map((d) => (
            <DoctorCard key={d.id} doctor={d} onView={handleView} />
          ))}
        </div>
      ) : (
        <div className="overflow-hidden rounded-lg border bg-card">
          <Table>
            <TableHeader>
              <TableRow className="border-b bg-muted/40 hover:bg-muted/40">
                <TableHead className="h-10 text-[11px] font-semibold uppercase tracking-wide text-muted-foreground">
                  Doctor
                </TableHead>
                <TableHead className="h-10 text-[11px] font-semibold uppercase tracking-wide text-muted-foreground">
                  Specialty
                </TableHead>
                <TableHead className="h-10 text-[11px] font-semibold uppercase tracking-wide text-muted-foreground">
                  Qualification
                </TableHead>
                <TableHead className="h-10 text-[11px] font-semibold uppercase tracking-wide text-muted-foreground">
                  Experience
                </TableHead>
                <TableHead className="h-10 text-[11px] font-semibold uppercase tracking-wide text-muted-foreground">
                  Availability
                </TableHead>
                <TableHead className="h-10 text-end text-[11px] font-semibold uppercase tracking-wide text-muted-foreground">
                  Action
                </TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filtered.map((d) => (
                <TableRow key={d.id}>
                  <TableCell className="py-2">
                    <div className="flex items-center gap-2">
                      <Avatar className="h-8 w-8">
                        <AvatarFallback className="bg-primary/10 text-[11px] font-semibold text-primary">
                          {doctorInitials(d)}
                        </AvatarFallback>
                      </Avatar>
                      <div className="min-w-0">
                        <div className="truncate text-sm font-medium text-foreground">
                          {doctorFullName(d)}
                        </div>
                        <div className="text-[11px] text-muted-foreground">{d.id}</div>
                      </div>
                    </div>
                  </TableCell>
                  <TableCell className="py-2">
                    <SpecialtyBadge specialty={d.specialty} />
                  </TableCell>
                  <TableCell className="py-2 text-sm text-muted-foreground">
                    {d.qualification}
                  </TableCell>
                  <TableCell className="py-2 text-sm tabular text-foreground">
                    {d.experienceYears} yrs
                  </TableCell>
                  <TableCell className="py-2">
                    <AvailabilityBadge status={d.availability} />
                  </TableCell>
                  <TableCell className="py-2 text-end">
                    <Button size="sm" variant="outline" onClick={() => handleView(d)}>
                      View
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      )}

      <DoctorProfileSheet
        doctor={target}
        onOpenChange={(o) => !o && setTarget(null)}
        onBook={handleBook}
        onMessage={handleMessage}
        onEdit={handleEdit}
      />

      <AddDoctorDialog open={addOpen} onOpenChange={setAddOpen} onCreate={addDoctor} />
    </div>
  );
}

function Count({ n }: { n: number }) {
  return (
    <span className="inline-flex h-4 min-w-[18px] items-center justify-center rounded-full bg-background px-1 text-[10px] font-semibold tabular text-muted-foreground">
      {n}
    </span>
  );
}
