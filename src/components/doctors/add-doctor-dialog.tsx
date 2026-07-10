import { useEffect } from "react";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import { z } from "zod";

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import {
  DEFAULT_WEEK_PRESETS,
  DOCTOR_SPECIALTIES,
  doctorFullName,
  type Doctor,
  type DoctorSpecialty,
} from "@/data/doctors";

const SCHEDULE_PRESETS = ["Morning", "Evening", "Night"] as const;
type SchedulePreset = (typeof SCHEDULE_PRESETS)[number];

const schema = z.object({
  firstName: z.string().min(1, "First name is required"),
  lastName: z.string().min(1, "Last name is required"),
  specialty: z.enum(DOCTOR_SPECIALTIES),
  qualification: z.string().min(1, "Qualification is required"),
  experienceYears: z.coerce.number().int().min(0).max(70),
  phone: z.string().min(4, "Phone is required"),
  email: z.string().email("Valid email required"),
  department: z.string().min(1, "Department is required"),
  schedulePreset: z.enum(SCHEDULE_PRESETS),
  bio: z.string().min(1, "Bio is required"),
});

type FormValues = z.infer<typeof schema>;

interface Props {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onCreate: (
    input: Omit<Doctor, "id" | "certifications" | "recentPatients" | "reviews">,
  ) => Doctor;
}

const defaults = (): FormValues => ({
  firstName: "",
  lastName: "",
  specialty: "General Medicine",
  qualification: "",
  experienceYears: 5,
  phone: "",
  email: "",
  department: "General Medicine",
  schedulePreset: "Morning",
  bio: "",
});

export function AddDoctorDialog({ open, onOpenChange, onCreate }: Props) {
  const form = useForm<FormValues>({
    resolver: zodResolver(schema),
    mode: "onBlur",
    defaultValues: defaults(),
  });

  useEffect(() => {
    if (open) form.reset(defaults());
  }, [open, form]);

  const onSubmit = (values: FormValues) => {
    const created = onCreate({
      firstName: values.firstName.trim(),
      lastName: values.lastName.trim(),
      specialty: values.specialty,
      department: values.department.trim(),
      qualification: values.qualification.trim(),
      experienceYears: values.experienceYears,
      rating: 4.5,
      languages: ["English"],
      phone: values.phone.trim(),
      email: values.email.trim(),
      bio: values.bio.trim(),
      availability: "Available",
      patientsThisMonth: 0,
      todaysAppointments: 0,
      weeklySchedule: DEFAULT_WEEK_PRESETS[values.schedulePreset satisfies SchedulePreset],
    });
    toast.success(`${doctorFullName(created)} added (${created.id})`);
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[92vh] max-w-2xl overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Add Doctor</DialogTitle>
          <DialogDescription>
            Add a new physician to the clinical directory.
          </DialogDescription>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            <section className="space-y-3">
              <SectionHeader>Identity</SectionHeader>
              <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                <FormField
                  control={form.control}
                  name="firstName"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>First name</FormLabel>
                      <FormControl>
                        <Input placeholder="Jane" className="h-9" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="lastName"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Last name</FormLabel>
                      <FormControl>
                        <Input placeholder="Doe" className="h-9" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="phone"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Phone</FormLabel>
                      <FormControl>
                        <Input placeholder="+1 (415) 555-0100" className="h-9" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="email"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Email</FormLabel>
                      <FormControl>
                        <Input
                          type="email"
                          placeholder="jane.doe@medicore.io"
                          className="h-9"
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
            </section>

            <section className="space-y-3">
              <SectionHeader>Clinical</SectionHeader>
              <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                <FormField
                  control={form.control}
                  name="specialty"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Specialty</FormLabel>
                      <Select
                        value={field.value}
                        onValueChange={(v) => field.onChange(v as DoctorSpecialty)}
                      >
                        <FormControl>
                          <SelectTrigger className="h-9">
                            <SelectValue />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {DOCTOR_SPECIALTIES.map((s) => (
                            <SelectItem key={s} value={s}>
                              {s}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="department"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Department</FormLabel>
                      <FormControl>
                        <Input className="h-9" placeholder="Cardiology" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="qualification"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Qualification</FormLabel>
                      <FormControl>
                        <Input className="h-9" placeholder="MD, FACC" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="experienceYears"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Years of experience</FormLabel>
                      <FormControl>
                        <Input type="number" className="h-9" min={0} max={70} {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="schedulePreset"
                  render={({ field }) => (
                    <FormItem className="md:col-span-2">
                      <FormLabel>Weekly schedule preset</FormLabel>
                      <Select
                        value={field.value}
                        onValueChange={(v) => field.onChange(v as SchedulePreset)}
                      >
                        <FormControl>
                          <SelectTrigger className="h-9">
                            <SelectValue />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {SCHEDULE_PRESETS.map((p) => (
                            <SelectItem key={p} value={p}>
                              {p} (default hours for a {p.toLowerCase()} shift)
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="bio"
                  render={({ field }) => (
                    <FormItem className="md:col-span-2">
                      <FormLabel>Bio</FormLabel>
                      <FormControl>
                        <Textarea
                          rows={3}
                          placeholder="Brief clinical background and areas of expertise."
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
            </section>

            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
                Cancel
              </Button>
              <Button type="submit" className="glow-primary">
                Add Doctor
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}

function SectionHeader({ children }: { children: React.ReactNode }) {
  return (
    <div className="text-[11px] font-semibold uppercase tracking-wide text-muted-foreground">
      {children}
    </div>
  );
}
