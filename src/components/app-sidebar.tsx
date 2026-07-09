import { Link, useRouterState } from "@tanstack/react-router";
import {
  LayoutDashboard,
  Users,
  Stethoscope,
  CalendarDays,
  FlaskConical,
  Pill,
  Receipt,
  UserCog,
  MessageSquare,
  Bell,
  Settings,
  Plus,
} from "lucide-react";
import type { LucideIcon } from "lucide-react";

import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  useSidebar,
} from "@/components/ui/sidebar";
import { useDirection } from "@/hooks/use-direction";

type NavItem = { title: string; url: string; icon: LucideIcon };
type NavSection = { label: string; items: NavItem[] };

const NAV: NavSection[] = [
  {
    label: "Main",
    items: [{ title: "Dashboard", url: "/dashboard", icon: LayoutDashboard }],
  },
  {
    label: "Clinical",
    items: [
      { title: "Patients", url: "/patients", icon: Users },
      { title: "Doctors", url: "/doctors", icon: Stethoscope },
      { title: "Appointments", url: "/appointments", icon: CalendarDays },
      { title: "Laboratory", url: "/laboratory", icon: FlaskConical },
      { title: "Pharmacy", url: "/pharmacy", icon: Pill },
    ],
  },
  {
    label: "Finance",
    items: [{ title: "Billing & Invoices", url: "/billing", icon: Receipt }],
  },
  {
    label: "Management",
    items: [
      { title: "Staff", url: "/staff", icon: UserCog },
      { title: "Messages", url: "/messages", icon: MessageSquare },
      { title: "Notifications", url: "/notifications", icon: Bell },
    ],
  },
  {
    label: "System",
    items: [{ title: "Settings", url: "/settings", icon: Settings }],
  },
];

export function AppSidebar() {
  const { state } = useSidebar();
  const { direction } = useDirection();
  const collapsed = state === "collapsed";
  const pathname = useRouterState({ select: (r) => r.location.pathname });

  return (
    <Sidebar collapsible="icon" side={direction === "rtl" ? "right" : "left"}>
      <SidebarHeader className="border-b">
        <div className="flex h-14 items-center gap-2.5 px-2">
          <div className="grid h-9 w-9 shrink-0 place-items-center rounded-lg bg-primary text-primary-foreground glow-primary">
            <Plus className="h-5 w-5" strokeWidth={2.5} />
          </div>
          {!collapsed && (
            <div className="min-w-0 leading-tight">
              <div className="truncate text-sm font-semibold text-foreground">MediCore</div>
              <div className="truncate text-[11px] font-medium tracking-wide text-muted-foreground">
                EMR ADMIN
              </div>
            </div>
          )}
        </div>
      </SidebarHeader>

      <SidebarContent className="gap-1 pt-2">
        {NAV.map((section) => (
          <SidebarGroup key={section.label}>
            {!collapsed && (
              <SidebarGroupLabel className="text-[10px] font-semibold uppercase tracking-[0.08em] text-muted-foreground/80">
                {section.label}
              </SidebarGroupLabel>
            )}
            <SidebarGroupContent>
              <SidebarMenu>
                {section.items.map((item) => {
                  const active =
                    pathname === item.url || pathname.startsWith(item.url + "/");
                  return (
                    <SidebarMenuItem key={item.url}>
                      <SidebarMenuButton
                        asChild
                        isActive={active}
                        tooltip={item.title}
                        className="relative h-9 rounded-md data-[active=true]:bg-sidebar-accent data-[active=true]:text-sidebar-accent-foreground data-[active=true]:font-medium"
                      >
                        <Link to={item.url} className="flex items-center gap-3">
                          {active && (
                            <span className="absolute left-0 top-1/2 h-5 w-[3px] -translate-y-1/2 rounded-r bg-primary" />
                          )}
                          <item.icon className="h-4 w-4 shrink-0" />
                          <span className="truncate">{item.title}</span>
                        </Link>
                      </SidebarMenuButton>
                    </SidebarMenuItem>
                  );
                })}
              </SidebarMenu>
            </SidebarGroupContent>
          </SidebarGroup>
        ))}
      </SidebarContent>
    </Sidebar>
  );
}
