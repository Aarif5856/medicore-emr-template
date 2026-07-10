import { useRef } from "react";
import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { Download, Plus } from "lucide-react";

import { Breadcrumbs } from "@/components/breadcrumbs";
import { PageHeader } from "@/components/coming-soon";
import { Button } from "@/components/ui/button";
import { MiniStatCard } from "@/components/ui/mini-stat-card";
import { PATIENTS_SUMMARY } from "@/data/patients";
import { PatientsTable } from "@/components/patients/patients-table";

export const Route = createFileRoute("/_app/patients/")({
  head: () => ({ meta: [{ title: "Patients · MediCore EMR" }] }),
  component: PatientsPage,
});


function PatientsPage() {
  const navigate = useNavigate();
  const exportRef = useRef<(() => void) | null>(null);

  return (
    <div className="space-y-6">
      <Breadcrumbs />
      <PageHeader
        title="Patients"
        description="Search, filter, and manage every patient record in your clinic."
        actions={
          <>
            <Button
              variant="outline"
              size="sm"
              className="gap-2"
              onClick={() => exportRef.current?.()}
            >
              <Download className="h-4 w-4" /> Export
            </Button>
            <Button
              size="sm"
              className="gap-2 glow-primary"
              onClick={() => navigate({ to: "/patients/new" })}
            >
              <Plus className="h-4 w-4" /> Add Patient
            </Button>
          </>
        }
      />

      {/* Summary strip */}
      <div className="grid grid-cols-2 gap-3 md:grid-cols-4">
        {PATIENTS_SUMMARY.map((s) => {
          const semantic = s.tone === "warning" || s.tone === "destructive";
          return (
            <MiniStatCard
              key={s.label}
              label={s.label}
              value={s.value}
              tone={s.tone}
              showDot={semantic}
            />
          );
        })}
      </div>

      <PatientsTable exportRef={exportRef} />
    </div>
  );
}

