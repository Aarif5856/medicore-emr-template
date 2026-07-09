import { cn } from "@/lib/utils";
import type { DoctorAvailability, DoctorSpecialty } from "@/data/doctors";

const SPECIALTY_STYLES: Record<DoctorSpecialty, string> = {
  Cardiology: "bg-destructive/10 text-destructive",
  Orthopedics: "bg-primary/10 text-primary",
  Pediatrics: "bg-[color:var(--accent-teal)]/10 text-[color:var(--accent-teal)]",
  Neurology: "bg-warning/10 text-warning",
  "General Medicine": "bg-muted text-muted-foreground",
  Dermatology: "bg-primary/10 text-primary",
  Emergency: "bg-destructive/10 text-destructive",
  Radiology: "bg-[color:var(--accent-teal)]/10 text-[color:var(--accent-teal)]",
};

export function SpecialtyBadge({
  specialty,
  className,
}: {
  specialty: DoctorSpecialty;
  className?: string;
}) {
  return (
    <span
      className={cn(
        "inline-flex items-center rounded-full px-2 py-0.5 text-[11px] font-semibold",
        SPECIALTY_STYLES[specialty],
        className,
      )}
    >
      {specialty}
    </span>
  );
}

const AVAILABILITY_STYLES: Record<DoctorAvailability, { dot: string; text: string; bg: string }> = {
  Available: {
    dot: "bg-[color:var(--accent-teal)]",
    text: "text-[color:var(--accent-teal)]",
    bg: "bg-[color:var(--accent-teal)]/10",
  },
  "In Surgery": { dot: "bg-warning", text: "text-warning", bg: "bg-warning/10" },
  "Off Duty": { dot: "bg-muted-foreground", text: "text-muted-foreground", bg: "bg-muted" },
  "On Leave": { dot: "bg-destructive", text: "text-destructive", bg: "bg-destructive/10" },
};

export function AvailabilityBadge({
  status,
  className,
}: {
  status: DoctorAvailability;
  className?: string;
}) {
  const s = AVAILABILITY_STYLES[status];
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 rounded-full px-2 py-0.5 text-[11px] font-semibold",
        s.bg,
        s.text,
        className,
      )}
    >
      <span className={cn("h-1.5 w-1.5 rounded-full", s.dot)} />
      {status}
    </span>
  );
}
