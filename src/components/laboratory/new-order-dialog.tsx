import { useEffect, useMemo, useState } from "react";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import { z } from "zod";
import { Check, ChevronsUpDown } from "lucide-react";

import { Button } from "@/components/ui/button";
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
import { DOCTORS } from "@/data/appointments";
import {
  LAB_CATEGORIES,
  LAB_PRIORITIES,
  TEST_DEFINITIONS,
  getTestDefinition,
  type LabCategory,
  type LabPriority,
  type LabTest,
} from "@/data/lab-tests";

const schema = z.object({
  patientId: z.string().min(1, "Patient is required"),
  testName: z.string().min(1, "Test is required"),
  category: z.enum([
    "Hematology",
    "Biochemistry",
    "Radiology",
    "Microbiology",
    "Pathology",
  ]),
  doctorId: z.string().min(1, "Ordering doctor is required"),
  priority: z.enum(["Routine", "Urgent", "STAT"]),
  notes: z.string().max(500).optional(),
});

type FormValues = z.infer<typeof schema>;

interface Props {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onCreate: (t: Omit<LabTest, "id">) => LabTest;
}

export function NewOrderDialog({ open, onOpenChange, onCreate }: Props) {
  const form = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: {
      patientId: "",
      testName: "",
      category: "Hematology",
      doctorId: "",
      priority: "Routine",
      notes: "",
    },
  });

  useEffect(() => {
    if (!open) form.reset();
  }, [open, form]);

  const testName = form.watch("testName");

  // Auto-fill category when test changes
  useEffect(() => {
    const def = getTestDefinition(testName);
    if (def) form.setValue("category", def.category);
  }, [testName, form]);

  const onSubmit = (values: FormValues) => {
    const patient = PATIENTS.find((p) => p.id === values.patientId);
    const doctor = DOCTORS.find((d) => d.id === values.doctorId);
    const def = getTestDefinition(values.testName);
    if (!patient || !doctor || !def) return;
    onCreate({
      patientId: patient.id,
      patientName: `${patient.firstName} ${patient.lastName}`,
      testName: def.name,
      category: values.category,
      kind: def.kind,
      orderedById: doctor.id,
      orderedBy: doctor.name,
      orderedDate: new Date().toISOString(),
      status: "Pending",
      priority: values.priority,
      notes: values.notes?.trim() || undefined,
    });
    toast.success(
      `Lab order created for ${patient.firstName} ${patient.lastName} — ${def.name}`,
    );
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[90vh] max-w-xl overflow-y-auto">
        <DialogHeader>
          <DialogTitle>New Lab Order</DialogTitle>
          <DialogDescription>
            Order a new lab test. Reference panels are attached automatically once
            results are entered.
          </DialogDescription>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-5">
            <FormField
              control={form.control}
              name="patientId"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Patient</FormLabel>
                  <PatientCombobox value={field.value} onChange={field.onChange} />
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
              <FormField
                control={form.control}
                name="testName"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Test</FormLabel>
                    <TestCombobox value={field.value} onChange={field.onChange} />
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="category"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Category</FormLabel>
                    <Select
                      value={field.value}
                      onValueChange={(v) => field.onChange(v as LabCategory)}
                    >
                      <FormControl>
                        <SelectTrigger className="h-9">
                          <SelectValue placeholder="Select category" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {LAB_CATEGORIES.map((c) => (
                          <SelectItem key={c} value={c}>
                            {c}
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
                    <FormLabel>Ordering doctor</FormLabel>
                    <Select value={field.value} onValueChange={field.onChange}>
                      <FormControl>
                        <SelectTrigger className="h-9">
                          <SelectValue placeholder="Select doctor" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {DOCTORS.map((d) => (
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
                name="priority"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Priority</FormLabel>
                    <FormControl>
                      <RadioGroup
                        value={field.value}
                        onValueChange={(v) => field.onChange(v as LabPriority)}
                        className="flex gap-2"
                      >
                        {LAB_PRIORITIES.map((p) => (
                          <label
                            key={p}
                            className={cn(
                              "flex flex-1 cursor-pointer items-center justify-center rounded-md border bg-card px-3 py-2 text-sm font-medium transition-colors hover:border-primary/60",
                              field.value === p && "border-primary bg-primary/5",
                            )}
                          >
                            <RadioGroupItem value={p} className="sr-only" />
                            {p}
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
              name="notes"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Notes</FormLabel>
                  <FormControl>
                    <Textarea
                      placeholder="Additional clinical notes (optional)"
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
                Create order
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
      <PopoverContent className="w-[--radix-popover-trigger-width] p-0" align="start">
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

function TestCombobox({
  value,
  onChange,
}: {
  value: string;
  onChange: (name: string) => void;
}) {
  const [open, setOpen] = useState(false);
  const grouped = useMemo(() => {
    const map = new Map<LabCategory, typeof TEST_DEFINITIONS>();
    for (const t of TEST_DEFINITIONS) {
      const list = map.get(t.category) ?? [];
      list.push(t);
      map.set(t.category, list);
    }
    return Array.from(map.entries());
  }, []);

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
          {value || "Search test…"}
          <ChevronsUpDown className="h-4 w-4 opacity-50" />
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-[--radix-popover-trigger-width] p-0" align="start">
        <Command>
          <CommandInput placeholder="Search tests…" />
          <CommandList>
            <CommandEmpty>No test found.</CommandEmpty>
            {grouped.map(([cat, list]) => (
              <CommandGroup key={cat} heading={cat}>
                {list.map((t) => (
                  <CommandItem
                    key={t.name}
                    value={t.name}
                    onSelect={() => {
                      onChange(t.name);
                      setOpen(false);
                    }}
                  >
                    <Check
                      className={cn(
                        "mr-2 h-4 w-4",
                        value === t.name ? "opacity-100" : "opacity-0",
                      )}
                    />
                    <span className="text-sm">{t.name}</span>
                  </CommandItem>
                ))}
              </CommandGroup>
            ))}
          </CommandList>
        </Command>
      </PopoverContent>
    </Popover>
  );
}
