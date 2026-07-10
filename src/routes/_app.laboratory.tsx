import { useMemo, useState } from "react";
import { createFileRoute } from "@tanstack/react-router";
import { Download, Plus } from "lucide-react";
import { toast } from "sonner";

import { Breadcrumbs } from "@/components/breadcrumbs";
import { PageHeader } from "@/components/coming-soon";
import { Button } from "@/components/ui/button";
import { MiniStatCard } from "@/components/ui/mini-stat-card";
import { LabProvider, useLab } from "@/components/laboratory/store";
import { LabTestsTable } from "@/components/laboratory/lab-tests-table";
import { ReportSheet } from "@/components/laboratory/report-sheet";
import { NewOrderDialog } from "@/components/laboratory/new-order-dialog";
import { UploadResultDialog } from "@/components/laboratory/upload-result-dialog";
import type { LabResult, LabTest } from "@/data/lab-tests";

export const Route = createFileRoute("/_app/laboratory")({
  head: () => ({ meta: [{ title: "Laboratory · MediCore EMR" }] }),
  component: LaboratoryRoute,
});

function LaboratoryRoute() {
  return (
    <LabProvider>
      <LaboratoryPage />
    </LabProvider>
  );
}

const TONE_STYLES = {
  primary: "bg-primary",
  teal: "bg-[color:var(--accent-teal)]",
  warning: "bg-warning",
  destructive: "bg-destructive",
} as const;

function LaboratoryPage() {
  const { tests, addTest, updateTest } = useLab();
  const [newOrderOpen, setNewOrderOpen] = useState(false);
  const [viewTarget, setViewTarget] = useState<LabTest | null>(null);
  const [uploadTarget, setUploadTarget] = useState<LabTest | null>(null);

  const stats = useMemo(() => {
    const today = new Date();
    const isToday = (iso?: string) => {
      if (!iso) return false;
      const d = new Date(iso);
      return (
        d.getFullYear() === today.getFullYear() &&
        d.getMonth() === today.getMonth() &&
        d.getDate() === today.getDate()
      );
    };
    let pending = 0;
    let completedToday = 0;
    let critical = 0;
    for (const t of tests) {
      if (t.status === "Pending" || t.status === "In Progress") pending++;
      if (t.status === "Completed" && isToday(t.completedDate)) completedToday++;
      if (t.status === "Critical") critical++;
    }
    return [
      { label: "Total Tests", value: "1,248", tone: "primary" as const },
      { label: "Pending", value: String(pending || 34), tone: "warning" as const },
      { label: "Completed Today", value: String(completedToday || 18), tone: "teal" as const },
      { label: "Critical Results", value: String(critical || 5), tone: "destructive" as const },
    ];
  }, [tests]);

  const handleView = (t: LabTest) => {
    // Always show latest data
    const fresh = tests.find((x) => x.id === t.id) ?? t;
    setViewTarget(fresh);
  };

  const handleUpload = (t: LabTest) => {
    setViewTarget(null);
    setUploadTarget(t);
  };

  const handleMarkCritical = (t: LabTest) => {
    const next = t.status === "Critical" ? "Completed" : "Critical";
    updateTest(t.id, { status: next });
    setViewTarget((prev) => (prev && prev.id === t.id ? { ...prev, status: next } : prev));
    toast.success(
      next === "Critical"
        ? `Marked ${t.id} as critical`
        : `Cleared critical flag on ${t.id}`,
    );
  };

  const handleCancel = (t: LabTest) => {
    updateTest(t.id, { status: "Pending" });
    toast.message(`Order ${t.id} cancelled`);
  };

  const handleUploadSubmit = (id: string, result: LabResult) => {
    updateTest(id, {
      status: "Completed",
      result,
      completedDate: new Date().toISOString(),
    });
  };

  const handleExport = () => {
    toast.success("Exporting lab report (demo)…");
  };

  return (
    <div className="space-y-6">
      <Breadcrumbs />
      <PageHeader
        title="Laboratory"
        description="Order tests, track progress, and review pathology and imaging results."
        actions={
          <>
            <Button variant="outline" size="sm" className="gap-2" onClick={handleExport}>
              <Download className="h-4 w-4" /> Export
            </Button>
            <Button
              size="sm"
              className="gap-2 glow-primary"
              onClick={() => setNewOrderOpen(true)}
            >
              <Plus className="h-4 w-4" /> New Lab Order
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

      <LabTestsTable
        tests={tests}
        onView={handleView}
        onUpload={handleUpload}
        onMarkCritical={handleMarkCritical}
        onCancel={handleCancel}
      />

      <ReportSheet
        test={viewTarget}
        onOpenChange={(o) => !o && setViewTarget(null)}
        onUpload={handleUpload}
        onMarkCritical={handleMarkCritical}
      />

      <NewOrderDialog
        open={newOrderOpen}
        onOpenChange={setNewOrderOpen}
        onCreate={addTest}
      />

      <UploadResultDialog
        test={uploadTarget}
        onOpenChange={(o) => !o && setUploadTarget(null)}
        onSubmit={handleUploadSubmit}
      />
    </div>
  );
}
