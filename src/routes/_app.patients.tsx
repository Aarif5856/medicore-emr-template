import { createFileRoute } from "@tanstack/react-router";
import { ComingSoon } from "@/components/coming-soon";

export const Route = createFileRoute("/_app/patients")({
  head: () => ({ meta: [{ title: "Patients — MediCore EMR" }] }),
  component: () => (
    <ComingSoon title="Patients" description="Manage patient records, demographics, and medical history." />
  ),
});
