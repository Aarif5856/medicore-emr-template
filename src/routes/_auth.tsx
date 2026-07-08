import { Outlet, createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/_auth")({
  component: AuthLayout,
});

function AuthLayout() {
  return (
    <div className="relative flex min-h-screen items-center justify-center bg-background px-4 py-10">
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 bg-[radial-gradient(60%_50%_at_50%_0%,var(--color-primary)/0.12,transparent_70%)]"
      />
      <div className="relative w-full max-w-md">
        <Outlet />
      </div>
    </div>
  );
}
