import { createFileRoute } from "@tanstack/react-router";
import { ComingSoon } from "@/components/coming-soon";

export const Route = createFileRoute("/_app/pharmacy")({
  head: () => ({ meta: [{ title: "Pharmacy — MediCore EMR" }] }),
  component: () => (
    <ComingSoon title="Pharmacy" description="Prescriptions, dispensing, and drug inventory." />
  ),
});
