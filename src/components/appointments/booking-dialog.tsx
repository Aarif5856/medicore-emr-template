import { useEffect, useMemo, useState } from "react";
import { format, setHours, setMinutes, startOfDay } from "date-fns";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import { z } from "zod";
import { CalendarIcon, Check, ChevronsUpDown } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command";
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
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { cn } from "@/lib/utils";
import { PATIENTS } from "@/data/patients";
import {
  DEPARTMENTS,
  DOCTORS,
  type Appointment,
  type AppointmentType,
} from "@/data/appointments";
import { TimeSlotGrid } from "@/components/appointments/time-slot-grid";

const schema = z.object({
  patientId: z.string().min(1, "Patient is required"),
  department: z.string().min(1, "Department is required"),
  doctorId: z.string().min(1, "Doctor is required"),
  date: z.date({ required_error: "Date is required" }),
  timeSlot: z.string().min(1, "Time slot is required"),
  type: z.enum(["In-person", "Telemedicine"]),
  reason: z.string().max(500).optional(),
});

type FormValues = z.infer<typeof schema>;

interface Props {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  appointments: Appointment[];
  onCreate: (a: Omit<Appointment, "id">) => Appointment;
}

export function BookingDialog({ open, onOpenChange, appointments, onCreate }: Props) {
  const form = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: {
      patientId: "",
      department: "",
      doctorId: "",
      date: undefined as unknown as Date,
      timeSlot: "",
      type: "In-person",
      reason: "",
    },
  });

  useEffect(() => {
    if (!open) form.reset();
  }, [open, form]);

  const department = form.watch("department");
  const doctorId = form.watch("doctorId");
  const date = form.watch("date");

  const filteredDoctors = useMemo(
    () => (department ? DOCTORS.filter((d) => d.department === department) : DOCTORS),
    [department],
  );

  const onSubmit = (values: FormValues) => {
    const patient = PATIENTS.find((p) => p.id === values.patientId);
    const doctor = DOCTORS.find((d) => d.id === values.doctorId);
    if (!patient || !doctor) return;
    const [h, m] = values.timeSlot.split(":").map(Number);
    const start = setMinutes(setHours(startOfDay(values.date), h), m);
    onCreate({
      patientId: patient.id,
      patientName: `${patient.firstName} ${patient.lastName}`,
      doctorId: doctor.id,
      doctorName: doctor.name,
      department: doctor.department,
      start: start.toISOString(),
      durationMin: 30,
      status: "Confirmed",
      type: values.type,
      reason: values.reason?.trim() || undefined,
    });
    toast.success(
      `Appointment booked for ${patient.firstName} ${patient.lastName} on ${format(start, "MMM d")} at ${values.timeSlot}`,
    );
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[90vh] max-w-2xl overflow-y-auto">
        <DialogHeader>
          <DialogTitle>New Appointment</DialogTitle>
          <DialogDescription>
            Book a new appointment. Time slots already booked for the selected doctor and
            date appear disabled.
          </DialogDescription>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-5">
            <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
              <FormField
                control={form.control}
                name="patientId"
                render={({ field }) => (
                  <FormItem className="md:col-span-2">
                    <FormLabel>Patient</FormLabel>
                    <PatientCombobox value={field.value} onChange={field.onChange} />
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
                    <Select
                      value={field.value}
                      onValueChange={(v) => {
                        field.onChange(v);
                        form.setValue("doctorId", "");
                        form.setValue("timeSlot", "");
                      }}
                    >
                      <FormControl>
                        <SelectTrigger className="h-9">
                          <SelectValue placeholder="Select department" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {DEPARTMENTS.map((d) => (
                          <SelectItem key={d} value={d}>
                            {d}
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
                name="doctorId"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Doctor</FormLabel>
                    <Select
                      value={field.value}
                      onValueChange={(v) => {
                        field.onChange(v);
                        form.setValue("timeSlot", "");
                      }}
                    >
                      <FormControl>
                        <SelectTrigger className="h-9">
                          <SelectValue placeholder="Select doctor" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {filteredDoctors.map((d) => (
                          <SelectItem key={d.id} value={d.id}>
                            {d.name}
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
                name="date"
                render={({ field }) => (
                  <FormItem className="flex flex-col">
                    <FormLabel>Date</FormLabel>
                    <Popover>
                      <PopoverTrigger asChild>
                        <FormControl>
                          <Button
                            variant="outline"
                            className={cn(
                              "h-9 justify-start gap-2 text-left font-normal",
                              !field.value && "text-muted-foreground",
                            )}
                          >
                            <CalendarIcon className="h-4 w-4" />
                            {field.value ? format(field.value, "PPP") : "Pick a date"}
                          </Button>
                        </FormControl>
                      </PopoverTrigger>
                      <PopoverContent className="w-auto p-0" align="start">
                        <Calendar
                          mode="single"
                          selected={field.value}
                          onSelect={(d) => {
                            field.onChange(d);
                            form.setValue("timeSlot", "");
                          }}
                          initialFocus
                          className={cn("p-3 pointer-events-auto")}
                        />
                      </PopoverContent>
                    </Popover>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="type"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Appointment type</FormLabel>
                    <FormControl>
                      <RadioGroup
                        value={field.value}
                        onValueChange={(v) => field.onChange(v as AppointmentType)}
                        className="flex gap-2"
                      >
                        {(["In-person", "Telemedicine"] as const).map((t) => (
                          <label
                            key={t}
                            className={cn(
                              "flex flex-1 cursor-pointer items-center gap-2 rounded-md border bg-card px-3 py-2 text-sm font-medium transition-colors hover:border-primary/60",
                              field.value === t && "border-primary bg-primary/5",
                            )}
                          >
                            <RadioGroupItem value={t} className="sr-only" />
                            {t}
                          </label>
                        ))}
                      </RadioGroup>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <FormField
              control={form.control}
              name="timeSlot"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Time slot</FormLabel>
                  <FormControl>
                    <TimeSlotGrid
                      appointments={appointments}
                      doctorId={doctorId || undefined}
                      date={date}
                      value={field.value}
                      onChange={field.onChange}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="reason"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Reason for visit</FormLabel>
                  <FormControl>
                    <Textarea
                      placeholder="Describe the reason for visit (optional)"
                      rows={3}
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
                Cancel
              </Button>
              <Button type="submit" className="glow-primary">
                Book appointment
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}

function PatientCombobox({
  value,
  onChange,
}: {
  value: string;
  onChange: (id: string) => void;
}) {
  const [open, setOpen] = useState(false);
  const selected = PATIENTS.find((p) => p.id === value);
  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          type="button"
          variant="outline"
          role="combobox"
          className={cn(
            "h-9 w-full justify-between font-normal",
            !value && "text-muted-foreground",
          )}
        >
          {selected
            ? `${selected.firstName} ${selected.lastName} · ${selected.id}`
            : "Search and select patient…"}
          <ChevronsUpDown className="h-4 w-4 opacity-50" />
        </Button>
      </PopoverTrigger>
      <PopoverContent
        className="w-[--radix-popover-trigger-width] p-0"
        align="start"
      >
        <Command>
          <CommandInput placeholder="Search patients…" />
          <CommandList>
            <CommandEmpty>No patient found.</CommandEmpty>
            <CommandGroup>
              {PATIENTS.map((p) => (
                <CommandItem
                  key={p.id}
                  value={`${p.firstName} ${p.lastName} ${p.id}`}
                  onSelect={() => {
                    onChange(p.id);
                    setOpen(false);
                  }}
                >
                  <Check
                    className={cn(
                      "mr-2 h-4 w-4",
                      value === p.id ? "opacity-100" : "opacity-0",
                    )}
                  />
                  <div className="min-w-0 flex-1">
                    <div className="truncate text-sm">
                      {p.firstName} {p.lastName}
                    </div>
                    <div className="text-[10px] text-muted-foreground tabular">
                      {p.id} · {p.phone}
                    </div>
                  </div>
                </CommandItem>
              ))}
            </CommandGroup>
          </CommandList>
        </Command>
      </PopoverContent>
    </Popover>
  );
}
