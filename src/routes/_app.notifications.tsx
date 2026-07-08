import { createFileRoute } from "@tanstack/react-router";
import { ComingSoon } from "@/components/coming-soon";

export const Route = createFileRoute("/_app/notifications")({
  head: () => ({ meta: [{ title: "Notifications — MediCore EMR" }] }),
  component: () => (
    <ComingSoon title="Notifications" description="System alerts, reminders, and activity." />
  ),
});
