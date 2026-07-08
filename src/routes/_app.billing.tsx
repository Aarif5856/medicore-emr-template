import { createFileRoute } from "@tanstack/react-router";
import { ComingSoon } from "@/components/coming-soon";

export const Route = createFileRoute("/_app/billing")({
  head: () => ({ meta: [{ title: "Billing & Invoices — MediCore EMR" }] }),
  component: () => (
    <ComingSoon title="Billing & Invoices" description="Charges, insurance claims, and payments." />
  ),
});
