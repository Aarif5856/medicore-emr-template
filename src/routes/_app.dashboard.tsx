import { createFileRoute } from "@tanstack/react-router";
import { ComingSoon } from "@/components/coming-soon";

export const Route = createFileRoute("/_app/dashboard")({
  head: () => ({ meta: [{ title: "Dashboard — MediCore EMR" }] }),
  component: () => (
    <ComingSoon
      title="Dashboard"
      description="Overview of appointments, vitals, revenue, and clinical KPIs."
    />
  ),
});
