import { Briefcase, CalendarDays, Star, Users } from "lucide-react";

import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { AvailabilityBadge, SpecialtyBadge } from "@/components/doctors/badges";
import { doctorFullName, doctorInitials, type Doctor } from "@/data/doctors";

interface Props {
  doctor: Doctor;
  onView: (d: Doctor) => void;
}

export function DoctorCard({ doctor, onView }: Props) {
  return (
    <Card className="card-glass flex h-full flex-col gap-4 p-5 transition-shadow hover:shadow-md">
      <div className="flex items-start gap-3">
        <Avatar className="h-14 w-14 shrink-0">
          <AvatarFallback className="bg-primary/10 text-base font-semibold text-primary">
            {doctorInitials(doctor)}
          </AvatarFallback>
        </Avatar>
        <div className="min-w-0 flex-1 space-y-1">
          <div className="truncate text-sm font-semibold text-foreground">
            {doctorFullName(doctor)}
          </div>
          <div className="truncate text-[11px] text-muted-foreground">{doctor.id}</div>
          <div className="flex flex-wrap items-center gap-1.5 pt-1">
            <SpecialtyBadge specialty={doctor.specialty} />
            <AvailabilityBadge status={doctor.availability} />
          </div>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-2 text-[11px]">
        <MetaRow icon={<Briefcase className="h-3.5 w-3.5" />} label={doctor.qualification} />
        <MetaRow
          icon={<Star className="h-3.5 w-3.5 fill-warning text-warning" />}
          label={`${doctor.rating.toFixed(1)} rating`}
        />
        <MetaRow
          icon={<Users className="h-3.5 w-3.5" />}
          label={`${doctor.patientsThisMonth} patients / mo`}
        />
        <MetaRow
          icon={<CalendarDays className="h-3.5 w-3.5" />}
          label={`${doctor.todaysAppointments} today`}
        />
      </div>

      <div className="mt-auto flex items-center justify-between border-t pt-3">
        <span className="text-[11px] text-muted-foreground">
          {doctor.experienceYears} yrs experience
        </span>
        <Button size="sm" variant="outline" onClick={() => onView(doctor)}>
          View Profile
        </Button>
      </div>
    </Card>
  );
}

function MetaRow({ icon, label }: { icon: React.ReactNode; label: string }) {
  return (
    <div className="flex min-w-0 items-center gap-1.5 text-muted-foreground">
      <span className="shrink-0 text-primary/80">{icon}</span>
      <span className="truncate text-foreground">{label}</span>
    </div>
  );
}
