import { createFileRoute } from "@tanstack/react-router";
import { ComingSoon } from "@/components/coming-soon";

export const Route = createFileRoute("/_app/laboratory")({
  head: () => ({ meta: [{ title: "Laboratory — MediCore EMR" }] }),
  component: () => (
    <ComingSoon title="Laboratory" description="Lab orders, results, and specimen tracking." />
  ),
});
