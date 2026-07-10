import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { Download, Plus } from "lucide-react";

import { Breadcrumbs } from "@/components/breadcrumbs";
import { PageHeader } from "@/components/coming-soon";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import { PATIENTS_SUMMARY } from "@/data/patients";
import { PatientsTable } from "@/components/patients/patients-table";

export const Route = createFileRoute("/_app/patients/")({
  head: () => ({ meta: [{ title: "Patients · MediCore EMR" }] }),
  component: PatientsPage,
});

const TONE_STYLES: Record<string, string> = {
  primary: "bg-primary/10 text-primary",
  teal: "bg-[color:var(--accent-teal)]/10 text-[color:var(--accent-teal)]",
  warning: "bg-warning/10 text-warning",
  destructive: "bg-destructive/10 text-destructive",
};

function PatientsPage() {
  const navigate = useNavigate();

  return (
    <div className="space-y-6">
      <Breadcrumbs />
      <PageHeader
        title="Patients"
        description="Search, filter, and manage every patient record in your clinic."
        actions={
          <>
            <Button variant="outline" size="sm" className="gap-2">
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
            <Card key={s.label} className="card-glass p-4">
              <div className="flex items-center gap-3">
                {semantic && (
                  <span
                    aria-hidden
                    className={cn(
                      "h-2.5 w-2.5 shrink-0 rounded-full",
                      TONE_STYLES[s.tone].split(" ")[0],
                    )}
                  />
                )}
                <div className="min-w-0">
                  <div className="text-[11px] font-medium text-muted-foreground">{s.label}</div>
                  <div className="text-lg font-semibold text-foreground tabular">{s.value}</div>
                </div>
              </div>
            </Card>
          );
        })}
      </div>

      <PatientsTable />
    </div>
  );
}
