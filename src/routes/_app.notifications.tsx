import { useMemo, useState } from "react";
import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { BellOff, CheckCheck, MoreHorizontal } from "lucide-react";
import { toast } from "sonner";

import { Breadcrumbs } from "@/components/breadcrumbs";
import { PageHeader } from "@/components/coming-soon";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { cn } from "@/lib/utils";
import { useNotifications } from "@/components/notifications/store";
import { visualFor } from "@/components/notifications/visuals";
import {
  relativeNotificationTime,
  type NotificationItem,
  type NotificationType,
} from "@/data/notifications";

export const Route = createFileRoute("/_app/notifications")({
  head: () => ({
    meta: [
      { title: "Notifications — MediCore EMR" },
      {
        name: "description",
        content: "System alerts, reminders, and clinic activity in one feed.",
      },
    ],
  }),
  component: NotificationsPage,
});

type Filter = "all" | "unread" | "appointment" | "lab" | "billing" | "system";

const FILTERS: Array<{ value: Filter; label: string; match: (n: NotificationItem) => boolean }> = [
  { value: "all", label: "All", match: () => true },
  { value: "unread", label: "Unread", match: (n) => !n.read },
  { value: "appointment", label: "Appointments", match: (n) => n.type === "appointment" },
  { value: "lab", label: "Lab Results", match: (n) => n.type === "lab" },
  { value: "billing", label: "Billing", match: (n) => n.type === "billing" },
  { value: "system", label: "System", match: (n) => n.type === "system" || n.type === "staff" },
];

function NotificationsPage() {
  const navigate = useNavigate();
  const { notifications, markRead, toggleRead, dismiss, markAllRead } = useNotifications();
  const [filter, setFilter] = useState<Filter>("all");

  const counts = useMemo(() => {
    const c: Record<Filter, number> = {
      all: notifications.length,
      unread: 0,
      appointment: 0,
      lab: 0,
      billing: 0,
      system: 0,
    };
    for (const n of notifications) {
      if (!n.read) c.unread += 1;
      if (n.type === "appointment") c.appointment += 1;
      else if (n.type === "lab") c.lab += 1;
      else if (n.type === "billing") c.billing += 1;
      else c.system += 1; // system + staff bucket
    }
    return c;
  }, [notifications]);

  const filtered = useMemo(() => {
    const spec = FILTERS.find((f) => f.value === filter) ?? FILTERS[0];
    return notifications.filter(spec.match);
  }, [notifications, filter]);

  const handleClick = (n: NotificationItem) => {
    if (!n.read) markRead(n.id);
    if (n.patientId) {
      navigate({ to: "/patients/$patientId", params: { patientId: n.patientId } });
      return;
    }
    if (n.href) {
      // narrow union of allowed hrefs to satisfy typed router
      switch (n.href) {
        case "/appointments":
          navigate({ to: "/appointments" });
          break;
        case "/laboratory":
          navigate({ to: "/laboratory" });
          break;
        case "/billing":
          navigate({ to: "/billing" });
          break;
        case "/pharmacy":
          navigate({ to: "/pharmacy" });
          break;
        case "/staff":
          navigate({ to: "/staff" });
          break;
        default:
          break;
      }
    }
  };

  const handleMarkAll = () => {
    markAllRead();
    toast.success("All notifications marked as read");
  };

  return (
    <div className="space-y-6">
      <Breadcrumbs />
      <PageHeader
        title="Notifications"
        description="System alerts, reminders, and activity across the clinic."
        actions={
          <Button
            variant="outline"
            size="sm"
            className="gap-2"
            onClick={handleMarkAll}
            disabled={counts.unread === 0}
          >
            <CheckCheck className="h-4 w-4" /> Mark all as read
          </Button>
        }
      />

      <Tabs value={filter} onValueChange={(v) => setFilter(v as Filter)}>
        <TabsList className="flex w-full flex-wrap justify-start gap-1 bg-muted/40 p-1">
          {FILTERS.map((f) => (
            <TabsTrigger key={f.value} value={f.value} className="gap-2 text-xs">
              {f.label}
              <span
                className={cn(
                  "grid h-5 min-w-[20px] place-items-center rounded-full px-1.5 text-[10px] font-semibold tabular",
                  filter === f.value
                    ? "bg-primary/15 text-primary"
                    : "bg-muted text-muted-foreground",
                )}
              >
                {counts[f.value]}
              </span>
            </TabsTrigger>
          ))}
        </TabsList>
      </Tabs>

      <Card className="card-glass overflow-hidden p-0">
        {filtered.length === 0 ? (
          <div className="flex flex-col items-center justify-center gap-3 px-6 py-16 text-center">
            <div className="grid h-12 w-12 place-items-center rounded-xl bg-muted text-muted-foreground">
              <BellOff className="h-6 w-6" />
            </div>
            <p className="text-sm text-muted-foreground">No notifications here</p>
          </div>
        ) : (
          <ul className="divide-y divide-border/60">
            {filtered.map((n) => {
              const v = visualFor(n);
              const Icon = v.Icon;
              return (
                <li key={n.id}>
                  <div
                    className={cn(
                      "group relative grid grid-cols-[auto_minmax(0,1fr)_auto] items-start gap-3 px-4 py-3 transition-colors sm:gap-4 sm:px-5",
                      !n.read && "bg-primary/[0.04]",
                      "hover:bg-muted/40",
                    )}
                  >
                    {!n.read && (
                      <span
                        aria-hidden
                        className={cn(
                          "absolute start-1.5 top-1/2 h-2 w-2 -translate-y-1/2 rounded-full",
                          v.dotClass,
                        )}
                      />
                    )}
                    <button
                      type="button"
                      onClick={() => handleClick(n)}
                      className="contents text-start"
                    >
                      <span
                        className={cn(
                          "grid h-10 w-10 shrink-0 place-items-center rounded-full",
                          v.wrapClass,
                        )}
                      >
                        <Icon className="h-5 w-5" />
                      </span>
                      <div className="min-w-0">
                        <div className="flex flex-wrap items-center gap-2">
                          <span
                            className={cn(
                              "truncate text-sm",
                              n.read ? "font-medium text-foreground/80" : "font-semibold text-foreground",
                            )}
                          >
                            {n.title}
                          </span>
                          {n.critical && (
                            <span className="rounded-full bg-destructive/15 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-destructive">
                              Critical
                            </span>
                          )}
                        </div>
                        <p className="mt-0.5 line-clamp-2 text-xs text-muted-foreground">
                          {n.description}
                        </p>
                        <div className="mt-1 text-[11px] tabular-nums text-muted-foreground">
                          {relativeNotificationTime(n.at)}
                        </div>
                      </div>
                    </button>
                    <div className="flex items-center">
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-8 w-8 text-muted-foreground hover:text-foreground"
                            aria-label="Notification actions"
                          >
                            <MoreHorizontal className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end" className="w-44">
                          <DropdownMenuItem onClick={() => toggleRead(n.id)}>
                            {n.read ? "Mark as unread" : "Mark as read"}
                          </DropdownMenuItem>
                          <DropdownMenuItem
                            className="text-destructive focus:text-destructive"
                            onClick={() => {
                              dismiss(n.id);
                              toast.success("Notification dismissed");
                            }}
                          >
                            Dismiss
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </div>
                  </div>
                </li>
              );
            })}
          </ul>
        )}
      </Card>
    </div>
  );
}

// Keep unused type export referenced to avoid tree-shake churn if imported elsewhere later.
export type { NotificationType };
