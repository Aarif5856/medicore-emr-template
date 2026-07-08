import { createFileRoute } from "@tanstack/react-router";
import { ComingSoon } from "@/components/coming-soon";

export const Route = createFileRoute("/_app/messages")({
  head: () => ({ meta: [{ title: "Messages — MediCore EMR" }] }),
  component: () => (
    <ComingSoon title="Messages" description="Internal messaging between clinicians and staff." />
  ),
});
