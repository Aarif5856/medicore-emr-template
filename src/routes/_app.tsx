import { Outlet, createFileRoute } from "@tanstack/react-router";

import { SidebarInset, SidebarProvider } from "@/components/ui/sidebar";
import { AppSidebar } from "@/components/app-sidebar";
import { AppHeader } from "@/components/app-header";
import { StaffProvider } from "@/components/staff/store";
import { NotificationsProvider } from "@/components/notifications/store";

export const Route = createFileRoute("/_app")({
  component: AppLayout,
});

function AppLayout() {
  return (
    <StaffProvider>
      <NotificationsProvider>
        <SidebarProvider
          style={
            {
              "--sidebar-width": "16.25rem", // 260px
              "--sidebar-width-icon": "4.5rem", // 72px
            } as React.CSSProperties
          }
        >
          <AppSidebar />
          <SidebarInset className="min-w-0 bg-background">
            <AppHeader />
            <main className="mx-auto w-full max-w-[1600px] flex-1 p-6">
              <Outlet />
            </main>
          </SidebarInset>
        </SidebarProvider>
      </NotificationsProvider>
    </StaffProvider>
  );
}
