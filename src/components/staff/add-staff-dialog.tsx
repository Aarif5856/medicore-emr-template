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
  SHIFTS,
  STAFF_DEPARTMENTS,
  STAFF_ROLES,
  fullName,
  type Shift,
  type StaffDepartment,
  type StaffGender,
  type StaffMember,
  type StaffRole,
} from "@/data/staff";

const schema = z.object({
  firstName: z.string().min(1, "First name is required"),
  lastName: z.string().min(1, "Last name is required"),
  dob: z.string().min(1, "Date of birth is required"),
  gender: z.enum(["Male", "Female", "Other"]),
  phone: z.string().min(4, "Phone is required"),
  email: z.string().email("Valid email required"),
  address: z.string().min(1, "Address is required"),
  role: z.enum(["Doctor", "Nurse", "Admin", "Support"]),
  department: z.string().min(1, "Department is required"),
  shift: z.enum(["Morning", "Evening", "Night"]),
  joinedDate: z.string().min(1, "Joining date is required"),
  reportingManagerId: z.string().optional(),
  qualification: z.string().optional(),
});

type FormValues = z.infer<typeof schema>;

interface Props {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  managers: StaffMember[];
  initialValue?: StaffMember | null;
  onCreate?: (
    input: Omit<StaffMember, "id" | "weeklyShifts" | "attendance" | "documents">,
  ) => StaffMember;
  onSave?: (id: string, patch: Partial<StaffMember>) => void;
}

const NONE = "__none__";

const toDateInput = (iso: string): string => {
  if (!iso) return "";
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return iso.slice(0, 10);
  return d.toISOString().slice(0, 10);
};

const emptyDefaults = (): FormValues => ({
  firstName: "",
  lastName: "",
  dob: "",
  gender: "Male",
  phone: "",
  email: "",
  address: "",
  role: "Nurse",
  department: "General Medicine",
  shift: "Morning",
  joinedDate: new Date().toISOString().slice(0, 10),
  reportingManagerId: undefined,
  qualification: "",
});

const fromStaff = (s: StaffMember): FormValues => ({
  firstName: s.firstName,
  lastName: s.lastName,
  dob: toDateInput(s.dob),
  gender: s.gender,
  phone: s.phone,
  email: s.email,
  address: s.address,
  role: s.role,
  department: s.department,
  shift: s.shift,
  joinedDate: toDateInput(s.joinedDate),
  reportingManagerId: s.reportingManagerId,
  qualification: s.qualification ?? "",
});

export function AddStaffDialog({
  open,
  onOpenChange,
  managers,
  initialValue,
  onCreate,
  onSave,
}: Props) {
  const isEdit = !!initialValue;
  const form = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: initialValue ? fromStaff(initialValue) : emptyDefaults(),
  });

  useEffect(() => {
    if (open) {
      form.reset(initialValue ? fromStaff(initialValue) : emptyDefaults());
    }
  }, [open, initialValue, form]);

  const role = form.watch("role");
  const showQualification = role === "Doctor" || role === "Nurse";

  const onSubmit = (values: FormValues) => {
    const managerId =
      values.reportingManagerId && values.reportingManagerId !== NONE
        ? values.reportingManagerId
        : undefined;
    const qualification = showQualification
      ? values.qualification?.trim() || undefined
      : undefined;

    if (isEdit && initialValue && onSave) {
      onSave(initialValue.id, {
        firstName: values.firstName.trim(),
        lastName: values.lastName.trim(),
        role: values.role,
        department: values.department as StaffDepartment,
        phone: values.phone.trim(),
        email: values.email.trim(),
        joinedDate: new Date(values.joinedDate).toISOString(),
        shift: values.shift,
        gender: values.gender,
        dob: new Date(values.dob).toISOString(),
        address: values.address.trim(),
        reportingManagerId: managerId,
        qualification,
      });
      toast.success("Staff profile updated");
      onOpenChange(false);
      return;
    }

    if (onCreate) {
      const created = onCreate({
        firstName: values.firstName.trim(),
        lastName: values.lastName.trim(),
        role: values.role,
        department: values.department as StaffDepartment,
        phone: values.phone.trim(),
        email: values.email.trim(),
        joinedDate: new Date(values.joinedDate).toISOString(),
        shift: values.shift,
        status: "Active",
        gender: values.gender,
        dob: new Date(values.dob).toISOString(),
        address: values.address.trim(),
        emergencyContactName: "-",
        emergencyContactPhone: "-",
        reportingManagerId: managerId,
        qualification,
      });
      toast.success(`${fullName(created)} added to staff (${created.id})`);
      onOpenChange(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[92vh] max-w-2xl overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{isEdit ? "Edit Staff Member" : "Add Staff Member"}</DialogTitle>
          <DialogDescription>
            {isEdit
              ? "Update this staff member's personal and employment details."
              : "Create a new staff record with personal and employment details."}
          </DialogDescription>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            {/* Personal */}
            <section className="space-y-3">
              <SectionHeader>Personal Information</SectionHeader>
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
                  name="dob"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Date of birth</FormLabel>
                      <FormControl>
                        <Input type="date" className="h-9" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="gender"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Gender</FormLabel>
                      <Select
                        value={field.value}
                        onValueChange={(v) => field.onChange(v as StaffGender)}
                      >
                        <FormControl>
                          <SelectTrigger className="h-9">
                            <SelectValue />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="Male">Male</SelectItem>
                          <SelectItem value="Female">Female</SelectItem>
                          <SelectItem value="Other">Other</SelectItem>
                        </SelectContent>
                      </Select>
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
                <FormField
                  control={form.control}
                  name="address"
                  render={({ field }) => (
                    <FormItem className="md:col-span-2">
                      <FormLabel>Address</FormLabel>
                      <FormControl>
                        <Textarea
                          placeholder="Street, City, State"
                          rows={2}
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
            </section>

            {/* Employment */}
            <section className="space-y-3">
              <SectionHeader>Employment Details</SectionHeader>
              <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                <FormField
                  control={form.control}
                  name="role"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Role</FormLabel>
                      <Select
                        value={field.value}
                        onValueChange={(v) => field.onChange(v as StaffRole)}
                      >
                        <FormControl>
                          <SelectTrigger className="h-9">
                            <SelectValue />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {STAFF_ROLES.map((r) => (
                            <SelectItem key={r} value={r}>
                              {r}
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
                      <Select value={field.value} onValueChange={field.onChange}>
                        <FormControl>
                          <SelectTrigger className="h-9">
                            <SelectValue />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {STAFF_DEPARTMENTS.map((d) => (
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
                  name="shift"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Shift</FormLabel>
                      <Select
                        value={field.value}
                        onValueChange={(v) => field.onChange(v as Shift)}
                      >
                        <FormControl>
                          <SelectTrigger className="h-9">
                            <SelectValue />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {SHIFTS.map((s) => (
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
                  name="joinedDate"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Joining date</FormLabel>
                      <FormControl>
                        <Input type="date" className="h-9" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="reportingManagerId"
                  render={({ field }) => (
                    <FormItem className="md:col-span-2">
                      <FormLabel>Reporting manager</FormLabel>
                      <Select
                        value={field.value ?? NONE}
                        onValueChange={(v) =>
                          field.onChange(v === NONE ? undefined : v)
                        }
                      >
                        <FormControl>
                          <SelectTrigger className="h-9">
                            <SelectValue placeholder="Select manager" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value={NONE}>None</SelectItem>
                          {managers.map((m) => (
                            <SelectItem key={m.id} value={m.id}>
                              {fullName(m)} · {m.id}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
            </section>

            {/* Qualification (conditional) */}
            {showQualification && (
              <section className="space-y-3">
                <SectionHeader>Qualification</SectionHeader>
                <FormField
                  control={form.control}
                  name="qualification"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>
                        {role === "Doctor" ? "Specialization & Credentials" : "Nursing Credentials"}
                      </FormLabel>
                      <FormControl>
                        <Input
                          placeholder={
                            role === "Doctor"
                              ? "MD, Specialty - e.g. MD Cardiology, FACC"
                              : "BSN, RN"
                          }
                          className="h-9"
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </section>
            )}

            <DialogFooter>
              <Button
                type="button"
                variant="outline"
                onClick={() => onOpenChange(false)}
              >
                Cancel
              </Button>
              <Button type="submit" className="glow-primary">
                {isEdit ? "Save Changes" : "Add Staff Member"}
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
