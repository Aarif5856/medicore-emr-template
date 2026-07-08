import { createFileRoute } from "@tanstack/react-router";
import { ComingSoon } from "@/components/coming-soon";

export const Route = createFileRoute("/_app/staff")({
  head: () => ({ meta: [{ title: "Staff — MediCore EMR" }] }),
  component: () => (
    <ComingSoon title="Staff" description="Non-clinical personnel, roles, and shifts." />
  ),
});
