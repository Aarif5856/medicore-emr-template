import { createFileRoute } from "@tanstack/react-router";
import { Download } from "lucide-react";

import { Breadcrumbs } from "@/components/breadcrumbs";
import { PageHeader } from "@/components/coming-soon";
import { Button } from "@/components/ui/button";
import { STAT_CARDS } from "@/data/dashboard";
import { StatCard } from "@/components/dashboard/stat-card";
import { VisitsChart } from "@/components/dashboard/visits-chart";
import { DepartmentChart } from "@/components/dashboard/department-chart";
import { AppointmentsList } from "@/components/dashboard/appointments-list";
import { DemographicsCard } from "@/components/dashboard/demographics-card";
import { LabResultsCard } from "@/components/dashboard/lab-results-card";
import { RevenueChart } from "@/components/dashboard/revenue-chart";
import { DoctorAvailability } from "@/components/dashboard/doctor-availability";

export const Route = createFileRoute("/_app/dashboard")({
  head: () => ({ meta: [{ title: "Dashboard · MediCore EMR" }] }),
  component: DashboardPage,
});

function DashboardPage() {
  return (
    <div className="space-y-6">
      <Breadcrumbs />
      <PageHeader
        title="Dashboard"
        description="Real-time overview of clinical operations and revenue."
        actions={
          <Button variant="outline" size="sm" className="gap-2">
            <Download className="h-4 w-4" />
            Download Report
          </Button>
        }
      />

      {/* Bento grid - 12 cols on md+, single column on mobile */}
      <div className="grid grid-cols-1 gap-4 md:grid-cols-12">
        {/* Row 1 - KPI stats */}
        {STAT_CARDS.map((s) => (
          <div key={s.id} className="md:col-span-6 xl:col-span-3">
            <StatCard data={s} />
          </div>
        ))}

        {/* Row 2 */}
        <div className="md:col-span-12 xl:col-span-8">
          <VisitsChart />
        </div>
        <div className="md:col-span-12 xl:col-span-4">
          <DepartmentChart />
        </div>

        {/* Row 3 */}
        <div className="md:col-span-12 xl:col-span-4">
          <AppointmentsList />
        </div>
        <div className="md:col-span-6 xl:col-span-4">
          <DemographicsCard />
        </div>
        <div className="md:col-span-6 xl:col-span-4">
          <LabResultsCard />
        </div>

        {/* Row 4 */}
        <div className="md:col-span-12 xl:col-span-6">
          <RevenueChart />
        </div>
        <div className="md:col-span-12 xl:col-span-6">
          <DoctorAvailability />
        </div>
      </div>
    </div>
  );
}
