export type NotificationType =
  | "appointment"
  | "lab"
  | "billing"
  | "system"
  | "staff";

export type NotificationTone = "primary" | "teal" | "warning" | "destructive" | "muted";

export interface NotificationItem {
  id: string;
  type: NotificationType;
  title: string;
  description: string;
  at: string; // ISO
  read: boolean;
  href?: string; // click destination (path)
  patientId?: string;
  critical?: boolean;
}

// Fixed "now" for stable relative timestamps in mocks
const NOW = new Date("2026-07-09T10:30:00Z").getTime();
const min = (n: number) => new Date(NOW - n * 60_000).toISOString();
const hr = (n: number) => min(n * 60);
const day = (n: number) => min(n * 60 * 24);

export const NOTIFICATIONS_SEED: NotificationItem[] = [
  {
    id: "N-0001",
    type: "appointment",
    title: "New appointment booked",
    description: "Grace Okoye booked a consultation with Dr. Aisha Patel for tomorrow, 10:00 AM.",
    at: min(4),
    read: false,
    href: "/appointments",
  },
  {
    id: "N-0002",
    type: "lab",
    title: "Critical lab result",
    description: "Marcus Johnson - CBC shows platelets 42 × 10⁹/L (critical low). Review immediately.",
    at: min(12),
    read: false,
    href: "/laboratory",
    patientId: "PT-0002",
    critical: true,
  },
  {
    id: "N-0003",
    type: "billing",
    title: "Invoice overdue",
    description: "Invoice INV-2041 for Hannah Fischer is 6 days overdue ($2,340.00).",
    at: min(35),
    read: false,
    href: "/billing",
  },
  {
    id: "N-0004",
    type: "system",
    title: "Low stock alert",
    description: "Amoxicillin 500mg pharmacy stock below reorder threshold (14 units remaining).",
    at: min(52),
    read: false,
    href: "/pharmacy",
  },
  {
    id: "N-0005",
    type: "appointment",
    title: "Appointment cancelled",
    description: "David Kim cancelled his 3:30 PM follow-up with Dr. Kenji Nakamura.",
    at: hr(2),
    read: false,
    href: "/appointments",
  },
  {
    id: "N-0006",
    type: "lab",
    title: "Lab results ready",
    description: "Lipid panel for Amelia Chen is ready for review.",
    at: hr(3),
    read: true,
    href: "/laboratory",
    patientId: "PT-0001",
  },
  {
    id: "N-0007",
    type: "billing",
    title: "Payment received",
    description: "Sofia Alvarez paid invoice INV-2038 in full ($480.00).",
    at: hr(4),
    read: true,
    href: "/billing",
  },
  {
    id: "N-0008",
    type: "staff",
    title: "Shift swap request",
    description: "Nurse Priya Menon requested to swap Friday night shift with Nurse Léa Dubois.",
    at: hr(5),
    read: false,
    href: "/staff",
  },
  {
    id: "N-0009",
    type: "appointment",
    title: "Appointment reminder sent",
    description: "SMS reminders sent to 14 patients scheduled for tomorrow.",
    at: hr(6),
    read: true,
    href: "/appointments",
  },
  {
    id: "N-0010",
    type: "system",
    title: "Scheduled maintenance",
    description: "Backup and index maintenance will run tonight from 02:00–02:30. Expect brief slowdowns.",
    at: hr(8),
    read: false,
  },
  {
    id: "N-0011",
    type: "lab",
    title: "New lab order",
    description: "Dr. Rahul Verma ordered HbA1c for Ethan Walker.",
    at: hr(10),
    read: true,
    href: "/laboratory",
  },
  {
    id: "N-0012",
    type: "billing",
    title: "Insurance claim approved",
    description: "Aetna approved claim CLM-9832 for $1,200.00.",
    at: hr(12),
    read: true,
    href: "/billing",
  },
  {
    id: "N-0013",
    type: "appointment",
    title: "No-show recorded",
    description: "Patient Liam O'Connor did not attend the 9:00 AM appointment.",
    at: day(1),
    read: true,
    href: "/appointments",
  },
  {
    id: "N-0014",
    type: "system",
    title: "Low stock alert",
    description: "Surgical gloves (M) below reorder threshold (2 boxes remaining).",
    at: day(1),
    read: false,
    href: "/pharmacy",
  },
  {
    id: "N-0015",
    type: "staff",
    title: "New staff onboarded",
    description: "Dr. Naomi Bright joined Pediatrics. Profile created.",
    at: day(1),
    read: true,
    href: "/staff",
  },
  {
    id: "N-0016",
    type: "lab",
    title: "Critical lab result",
    description: "Isabella Rossi - Troponin I elevated at 0.42 ng/mL. Cardiology notified.",
    at: day(1),
    read: true,
    href: "/laboratory",
    critical: true,
  },
  {
    id: "N-0017",
    type: "appointment",
    title: "Rescheduled appointment",
    description: "Noah Patel moved his consultation from Thursday to Monday, 11:15 AM.",
    at: day(2),
    read: true,
    href: "/appointments",
  },
  {
    id: "N-0018",
    type: "billing",
    title: "Invoice overdue",
    description: "Invoice INV-2019 for Oliver Bennett is 12 days overdue ($860.00).",
    at: day(2),
    read: false,
    href: "/billing",
  },
  {
    id: "N-0019",
    type: "system",
    title: "Backup completed",
    description: "Nightly database backup completed successfully (2.4 GB).",
    at: day(2),
    read: true,
  },
  {
    id: "N-0020",
    type: "staff",
    title: "Leave request submitted",
    description: "Nurse Chen Wei submitted leave request for July 20–24.",
    at: day(3),
    read: true,
    href: "/staff",
  },
  {
    id: "N-0021",
    type: "appointment",
    title: "New appointment booked",
    description: "Sophia Martinez booked a dermatology consultation for July 15.",
    at: day(3),
    read: true,
    href: "/appointments",
  },
  {
    id: "N-0022",
    type: "lab",
    title: "Lab results ready",
    description: "Thyroid panel for James Wilson is ready for review.",
    at: day(3),
    read: true,
    href: "/laboratory",
  },
  {
    id: "N-0023",
    type: "billing",
    title: "Payment received",
    description: "Emma Thompson paid invoice INV-2027 ($320.00).",
    at: day(4),
    read: true,
    href: "/billing",
  },
  {
    id: "N-0024",
    type: "system",
    title: "New device registered",
    description: "ECG machine (ECG-08) added to Cardiology inventory.",
    at: day(4),
    read: true,
  },
  {
    id: "N-0025",
    type: "staff",
    title: "Certification expiring",
    description: "Nurse Aditi Rao's BLS certification expires in 30 days.",
    at: day(5),
    read: true,
    href: "/staff",
  },
  {
    id: "N-0026",
    type: "appointment",
    title: "Bulk appointments confirmed",
    description: "22 appointments confirmed for next week's cardiology clinic.",
    at: day(5),
    read: true,
    href: "/appointments",
  },
  {
    id: "N-0027",
    type: "system",
    title: "Security update",
    description: "Two-factor authentication enforced for all administrator accounts.",
    at: day(6),
    read: true,
  },
  {
    id: "N-0028",
    type: "billing",
    title: "Refund processed",
    description: "Refund of $150.00 issued to Ava Robinson for INV-2011.",
    at: day(6),
    read: true,
    href: "/billing",
  },
];

export function relativeNotificationTime(iso: string): string {
  const t = new Date(iso).getTime();
  const diff = NOW - t;
  const m = Math.max(1, Math.round(diff / 60_000));
  if (m < 60) return `${m}m ago`;
  const h = Math.round(m / 60);
  if (h < 24) return `${h}h ago`;
  const d = Math.round(h / 24);
  if (d === 1) return "Yesterday";
  if (d < 7) return `${d}d ago`;
  return new Date(iso).toLocaleDateString("en-US", { month: "short", day: "numeric" });
}
