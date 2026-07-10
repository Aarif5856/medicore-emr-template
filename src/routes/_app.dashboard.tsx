import { createFileRoute } from "@tanstack/react-router";
import { CalendarPlus, Download, UserPlus } from "lucide-react";
import { toast } from "sonner";
import { useState } from "react";

import { Breadcrumbs } from "@/components/breadcrumbs";
import { PageHeader } from "@/components/coming-soon";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { ErrorState } from "@/components/ui/error-state";
import { STAT_CARDS, VISITS_MONTHLY, DASHBOARD_ALERTS } from "@/data/dashboard";
import { StatCard } from "@/components/dashboard/stat-card";
import { VisitsChart } from "@/components/dashboard/visits-chart";
import { DepartmentChart } from "@/components/dashboard/department-chart";
import { AppointmentsList } from "@/components/dashboard/appointments-list";
import { DemographicsCard } from "@/components/dashboard/demographics-card";
import { LabResultsCard } from "@/components/dashboard/lab-results-card";
import { RevenueChart } from "@/components/dashboard/revenue-chart";
import { DoctorAvailability } from "@/components/dashboard/doctor-availability";
import { useMockQuery } from "@/lib/mock-query";
import { BookingDialog } from "@/components/appointments/booking-dialog";
import { AppointmentsProvider, useAppointments } from "@/components/appointments/store";
import { Link } from "@tanstack/react-router";
import { X, AlertTriangle } from "lucide-react";


function handleDownloadReport() {
  const kpiSection = "KPI Summary\r\n" +
    "Metric,Value,Trend,Note\r\n" +
    STAT_CARDS.map((s) => {
      const trend = s.trend ? `${s.trend.direction === "up" ? "+" : s.trend.direction === "down" ? "-" : ""}${s.trend.value} ${s.trend.label}` : "";
      const note = s.meta ?? "";
      const esc = (v: string) => (/[",\r\n]/.test(v) ? `"${v.replace(/"/g, '""')}"` : v);
      return [s.label, s.value, trend, note].map(esc).join(",");
    }).join("\r\n");

  const visitsSection = "Visits by Month (last 12)\r\n" +
    "Month,In-patient,Out-patient\r\n" +
    VISITS_MONTHLY.map((p) => `${p.label},${p.inPatient},${p.outPatient}`).join("\r\n");

  const csv = `\uFEFFMediCore Dashboard Report\r\nGenerated,${new Date().toISOString()}\r\n\r\n${kpiSection}\r\n\r\n${visitsSection}\r\n`;
  const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = "medicore-dashboard-report.csv";
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  setTimeout(() => URL.revokeObjectURL(url), 1000);
  toast.success("Report downloaded");
}


export const Route = createFileRoute("/_app/dashboard")({
  head: () => ({ meta: [{ title: "Dashboard · MediCore EMR" }] }),
  component: DashboardPage,
});

function KpiSkeletonCard() {
  return (
    <Card className="card-glass overflow-hidden">
      <CardContent className="space-y-4 p-5">
        <div className="flex items-start justify-between gap-3">
          <Skeleton className="h-10 w-10 rounded-lg" />
          <Skeleton className="h-5 w-14 rounded-full" />
        </div>
        <div className="space-y-2">
          <Skeleton className="h-3 w-24" />
          <Skeleton className="h-7 w-28" />
          <Skeleton className="h-2.5 w-32" />
        </div>
      </CardContent>
    </Card>
  );
}

function KpiRow() {
  const { data, isLoading, isError, refetch } = useMockQuery(STAT_CARDS);

  if (isLoading) {
    return (
      <div className="md:col-span-12" aria-hidden>
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-4">
          {Array.from({ length: 4 }).map((_, i) => (
            <KpiSkeletonCard key={i} />
          ))}
        </div>
      </div>
    );
  }

  if (isError) {
    return (
      <div className="md:col-span-12">
        <Card className="card-glass">
          <CardContent className="p-2">
            <ErrorState
              compact
              title="Couldn't load KPIs"
              description="We couldn't load the summary metrics. Try again."
              onRetry={refetch}
            />
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <>
      {(data ?? []).map((s) => (
        <div key={s.id} className="md:col-span-6 xl:col-span-3">
          <StatCard data={s} />
        </div>
      ))}
    </>
  );
}

function DashboardPage() {
  return (
    <div className="space-y-6">
      <Breadcrumbs />
      <PageHeader
        title="Dashboard"
        description="Real-time overview of clinical operations and revenue."
        actions={
          <Button variant="outline" size="sm" className="gap-2" onClick={handleDownloadReport}>
            <Download className="h-4 w-4" />
            Download Report
          </Button>
        }
      />

      {/* Bento grid - 12 cols on md+, single column on mobile */}
      <div className="grid grid-cols-1 gap-4 md:grid-cols-12">
        {/* Row 1 - KPI stats */}
        <KpiRow />

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
