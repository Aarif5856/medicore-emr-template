import {
  AlertTriangle,
  Calendar,
  FlaskConical,
  Receipt,
  Users,
  type LucideIcon,
} from "lucide-react";
import type { NotificationItem, NotificationType } from "@/data/notifications";

export interface TypeVisual {
  Icon: LucideIcon;
  wrapClass: string; // circle bg + text color
  dotClass: string; // small unread dot
  label: string;
}

const BASE: Record<NotificationType, TypeVisual> = {
  appointment: {
    Icon: Calendar,
    wrapClass: "bg-primary/15 text-primary",
    dotClass: "bg-primary",
    label: "Appointment",
  },
  lab: {
    Icon: FlaskConical,
    wrapClass: "bg-[color:var(--accent-teal)]/15 text-[color:var(--accent-teal)]",
    dotClass: "bg-[color:var(--accent-teal)]",
    label: "Lab Result",
  },
  billing: {
    Icon: Receipt,
    wrapClass: "bg-warning/15 text-warning",
    dotClass: "bg-warning",
    label: "Billing",
  },
  system: {
    Icon: AlertTriangle,
    wrapClass: "bg-destructive/15 text-destructive",
    dotClass: "bg-destructive",
    label: "System",
  },
  staff: {
    Icon: Users,
    wrapClass: "bg-muted text-muted-foreground",
    dotClass: "bg-muted-foreground",
    label: "Staff",
  },
};

export function visualFor(n: NotificationItem): TypeVisual {
  if (n.critical) {
    return {
      ...BASE[n.type],
      Icon: AlertTriangle,
      wrapClass: "bg-destructive/15 text-destructive",
      dotClass: "bg-destructive",
    };
  }
  return BASE[n.type];
}
