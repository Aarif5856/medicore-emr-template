import { useMemo, useState } from "react";
import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { Download, Plus } from "lucide-react";
import { toast } from "sonner";

import { Breadcrumbs } from "@/components/breadcrumbs";
import { PageHeader } from "@/components/coming-soon";
import { Button } from "@/components/ui/button";
import { MiniStatCard } from "@/components/ui/mini-stat-card";
import { useStaff } from "@/components/staff/store";
import { StaffTable } from "@/components/staff/staff-table";
import { StaffProfileSheet } from "@/components/staff/profile-sheet";
import { AddStaffDialog } from "@/components/staff/add-staff-dialog";
import { fullName, type StaffMember } from "@/data/staff";

export const Route = createFileRoute("/_app/staff")({
  head: () => ({ meta: [{ title: "Staff · MediCore EMR" }] }),
  component: StaffPage,
});


function StaffPage() {
  const navigate = useNavigate();
  const { staff, addStaff, updateStaff } = useStaff();
  const [addOpen, setAddOpen] = useState(false);
  const [viewTarget, setViewTarget] = useState<StaffMember | null>(null);

  const stats = useMemo(() => {
    const total = staff.length;
    const doctors = staff.filter((s) => s.role === "Doctor").length;
    const nurses = staff.filter((s) => s.role === "Nurse").length;
    const onLeave = staff.filter((s) => s.status === "On Leave").length;
    return [
      { label: "Total Staff", value: String(total || 86), tone: "primary" as const },
      { label: "Doctors", value: String(doctors || 24), tone: "teal" as const },
      { label: "Nurses", value: String(nurses || 38), tone: "primary" as const },
      { label: "On Leave", value: String(onLeave || 5), tone: "warning" as const },
    ];
  }, [staff]);

  const managers = useMemo(
    () => staff.filter((s) => s.role === "Doctor" || s.role === "Admin"),
    [staff],
  );

  const handleView = (s: StaffMember) => {
    const fresh = staff.find((x) => x.id === s.id) ?? s;
    setViewTarget(fresh);
  };

  const handleEdit = (s: StaffMember) => {
    // Row-level "Edit" opens the profile sheet; the sheet's "Edit Profile" button opens the edit form.
    handleView(s);
  };

  const handleEditSubmit = (id: string, patch: Partial<StaffMember>) => {
    updateStaff(id, patch);
    setViewTarget((prev) => (prev && prev.id === id ? { ...prev, ...patch } : prev));
  };

  const handleMessage = (s: StaffMember) => {
    navigate({ to: "/messages", search: { staffId: s.id } });
  };

  const handleDeactivate = (s: StaffMember) => {
    const next = s.status === "Inactive" ? "Active" : "Inactive";
    updateStaff(s.id, { status: next });
    setViewTarget((prev) => (prev && prev.id === s.id ? { ...prev, status: next } : prev));
    toast.success(
      next === "Inactive"
        ? `${fullName(s)} deactivated`
        : `${fullName(s)} reactivated`,
    );
  };

  const handleExport = () => {
    toast.success("Exporting staff directory (demo)…");
  };

  return (
    <div className="space-y-6">
      <Breadcrumbs />
      <PageHeader
        title="Staff"
        description="Manage doctors, nurses, admin, and support personnel across departments."
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
              <Plus className="h-4 w-4" /> Add Staff Member
            </Button>
          </>
        }
      />

      <div className="grid grid-cols-2 gap-3 md:grid-cols-4">
        {stats.map((s) => (
          <MiniStatCard
            key={s.label}
            label={s.label}
            value={s.value}
            tone={s.tone}
          />
        ))}
      </div>

      <StaffTable
        staff={staff}
        onView={handleView}
        onEdit={handleEdit}
        onDeactivate={handleDeactivate}
      />

      <StaffProfileSheet
        staff={viewTarget}
        allStaff={staff}
        managers={managers}
        onOpenChange={(o) => !o && setViewTarget(null)}
        onEditSubmit={handleEditSubmit}
        onMessage={handleMessage}
      />

      <AddStaffDialog
        open={addOpen}
        onOpenChange={setAddOpen}
        managers={managers}
        onCreate={addStaff}
      />
    </div>
  );
}
