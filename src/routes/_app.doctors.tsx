import { createFileRoute } from "@tanstack/react-router";
import { ComingSoon } from "@/components/coming-soon";

export const Route = createFileRoute("/_app/doctors")({
  head: () => ({ meta: [{ title: "Doctors — MediCore EMR" }] }),
  component: () => (
    <ComingSoon title="Doctors" description="Physician directory, specialties, and schedules." />
  ),
});
