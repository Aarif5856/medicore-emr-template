import { createFileRoute } from "@tanstack/react-router";
import { ComingSoon } from "@/components/coming-soon";

export const Route = createFileRoute("/_app/settings")({
  head: () => ({ meta: [{ title: "Settings — MediCore EMR" }] }),
  component: () => (
    <ComingSoon title="Settings" description="Workspace preferences, roles, and integrations." />
  ),
});
