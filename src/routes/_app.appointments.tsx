import { createFileRoute } from "@tanstack/react-router";
import { ComingSoon } from "@/components/coming-soon";

export const Route = createFileRoute("/_app/appointments")({
  head: () => ({ meta: [{ title: "Appointments — MediCore EMR" }] }),
  component: () => (
    <ComingSoon title="Appointments" description="Scheduling, calendar views, and visit tracking." />
  ),
});
