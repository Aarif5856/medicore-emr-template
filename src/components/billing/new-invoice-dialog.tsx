import { useEffect, useMemo, useState } from "react";
import { useFieldArray, useForm, useWatch } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { format } from "date-fns";
import {
  CalendarIcon,
  Check,
  ChevronsUpDown,
  Plus,
  Trash2,
} from "lucide-react";
import { toast } from "sonner";

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
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
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
  INVOICE_SERVICES,
  TAX_RATE,
  formatCurrency,
  isoDaysFromNow,
  type Invoice,
  type InvoiceService,
} from "@/data/invoices";

const lineSchema = z.object({
  description: z.string().min(1, "Description required"),
  qty: z.coerce.number().min(1, "Qty ≥ 1"),
  unitPrice: z.coerce.number().min(0, "Price ≥ 0"),
});

const schema = z.object({
  patientId: z.string().min(1, "Patient is required"),
  service: z.enum(["Consultation", "Procedure", "Lab Test", "Pharmacy"]),
  issueDate: z.string().min(1, "Issue date required"),
  dueDate: z.string().min(1, "Due date required"),
  discount: z.coerce.number().min(0).default(0),
  notes: z.string().max(500).optional(),
  lines: z.array(lineSchema).min(1, "At least one line item required"),
});

type FormInputValues = z.input<typeof schema>;
type FormSubmitValues = z.output<typeof schema>;

type LineFieldError = {
  description?: { message?: string };
  qty?: { message?: string };
  unitPrice?: { message?: string };
};

type LineInputValue = FormInputValues["lines"][number];

interface Props {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onCreate: (i: Omit<Invoice, "id">) => Invoice;
}

export function NewInvoiceDialog({ open, onOpenChange, onCreate }: Props) {
  const form = useForm<FormInputValues, undefined, FormSubmitValues>({
    resolver: zodResolver(schema),
    defaultValues: {
      patientId: "",
      service: "Consultation",
      issueDate: isoDaysFromNow(0),
      dueDate: isoDaysFromNow(14),
      discount: 0,
      notes: "",
      lines: [{ description: "", qty: 1, unitPrice: 0 }],
    },
  });

  const { fields, append, remove } = useFieldArray({
    control: form.control,
    name: "lines",
  });

  useEffect(() => {
    if (!open) {
      form.reset({
        patientId: "",
        service: "Consultation",
        issueDate: isoDaysFromNow(0),
        dueDate: isoDaysFromNow(14),
        discount: 0,
        notes: "",
        lines: [{ description: "", qty: 1, unitPrice: 0 }],
      });
    }
  }, [open, form]);

  const watchedLines = useWatch({ control: form.control, name: "lines" }) ?? [];
  const watchedPatientId = useWatch({ control: form.control, name: "patientId" }) ?? "";
  const watchedService =
    useWatch({ control: form.control, name: "service" }) ?? "Consultation";
  const watchedIssueDate = useWatch({ control: form.control, name: "issueDate" }) ?? "";
  const watchedDueDate = useWatch({ control: form.control, name: "dueDate" }) ?? "";
  const watchedDiscount = useWatch({ control: form.control, name: "discount" }) ?? 0;
  const lineItemsMessage =
    typeof form.formState.errors.lines?.message === "string"
      ? form.formState.errors.lines.message
      : undefined;

  const totals = useMemo(() => {
    const subtotal = (watchedLines ?? []).reduce((s, l) => {
      const qty = Number(l.qty) || 0;
      const price = Number(l.unitPrice) || 0;
      return s + qty * price;
    }, 0);
    const tax = +(subtotal * TAX_RATE).toFixed(2);
    const discount = Number(watchedDiscount) || 0;
    const total = +(subtotal + tax - discount).toFixed(2);
    return { subtotal: +subtotal.toFixed(2), tax, discount, total };
  }, [watchedLines, watchedDiscount]);

  const onSubmit = (values: FormSubmitValues) => {
    const patient = PATIENTS.find((p) => p.id === values.patientId);
    if (!patient) return;
    const created = onCreate({
      patientId: patient.id,
      patientName: `${patient.firstName} ${patient.lastName}`,
      service: values.service,
      issueDate: values.issueDate,
      dueDate: values.dueDate,
      status: "Pending",
      discount: Number(values.discount) || 0,
      notes: values.notes?.trim() || undefined,
      lines: values.lines.map((l, i) => ({
        id: `L-${i + 1}`,
        description: l.description.trim(),
        qty: Number(l.qty),
        unitPrice: Number(l.unitPrice),
      })),
    });
    toast.success(`Invoice ${created.id} created for ${patient.firstName} ${patient.lastName}`);
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[92vh] max-w-2xl overflow-y-auto">
        <DialogHeader>
          <DialogTitle>New Invoice</DialogTitle>
          <DialogDescription>
            Add line items, apply optional discount, and issue the invoice.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-5">
          <div className="space-y-2">
            <Label>Patient</Label>
            <PatientCombobox
              value={watchedPatientId}
              onChange={(patientId) => {
                form.setValue("patientId", patientId, { shouldValidate: true });
              }}
            />
            {form.formState.errors.patientId?.message && (
              <p className="text-[0.8rem] font-medium text-destructive">
                {form.formState.errors.patientId.message}
              </p>
            )}
          </div>

          <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
            <div className="space-y-2">
              <Label>Service Type</Label>
              <Select
                value={watchedService}
                onValueChange={(v) => {
                  form.setValue("service", v as InvoiceService, { shouldValidate: true });
                }}
              >
                <SelectTrigger className="h-9">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {INVOICE_SERVICES.map((s) => (
                    <SelectItem key={s} value={s}>
                      {s}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {form.formState.errors.service?.message && (
                <p className="text-[0.8rem] font-medium text-destructive">
                  {form.formState.errors.service.message}
                </p>
              )}
            </div>

            <div className="space-y-2">
              <Label>Issue Date</Label>
              <DatePickerField
                value={watchedIssueDate}
                onChange={(iso) => {
                  form.setValue("issueDate", iso, { shouldValidate: true });
                }}
              />
              {form.formState.errors.issueDate?.message && (
                <p className="text-[0.8rem] font-medium text-destructive">
                  {form.formState.errors.issueDate.message}
                </p>
              )}
            </div>

            <div className="space-y-2">
              <Label>Due Date</Label>
              <DatePickerField
                value={watchedDueDate}
                onChange={(iso) => {
                  form.setValue("dueDate", iso, { shouldValidate: true });
                }}
              />
              {form.formState.errors.dueDate?.message && (
                <p className="text-[0.8rem] font-medium text-destructive">
                  {form.formState.errors.dueDate.message}
                </p>
              )}
            </div>
          </div>

          {/* Line items */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium">Line Items</span>
              <Button
                type="button"
                variant="outline"
                size="sm"
                className="h-8 gap-1"
                onClick={() => append({ description: "", qty: 1, unitPrice: 0 })}
              >
                <Plus className="h-3.5 w-3.5" /> Add Line
              </Button>
            </div>

            <div className="space-y-2 rounded-lg border bg-card p-2">
              {fields.length === 0 ? (
                <div className="rounded-md border border-dashed bg-muted/30 px-3 py-6 text-center text-sm text-muted-foreground">
                  No line items added.
                </div>
              ) : (
                fields.map((f, i) => {
                  const lineValue: LineInputValue = watchedLines[i] ?? {
                    description: "",
                    qty: 1,
                    unitPrice: 0,
                  };
                  const lineError = Array.isArray(form.formState.errors.lines)
                    ? (form.formState.errors.lines[i] as LineFieldError | undefined)
                    : undefined;
                  return (
                  <div
                    key={f.id}
                    className="grid grid-cols-12 items-start gap-2"
                  >
                    <div className="col-span-6 space-y-2">
                      <Input
                        placeholder="Description"
                        className="h-9"
                        value={lineValue.description ?? ""}
                        onChange={(event) => {
                          form.setValue(`lines.${i}.description`, event.target.value, {
                            shouldDirty: true,
                            shouldValidate: false,
                          });
                        }}
                      />
                      {lineError?.description?.message && (
                        <p className="text-[0.8rem] font-medium text-destructive">
                          {lineError.description.message}
                        </p>
                      )}
                    </div>
                    <div className="col-span-2 space-y-2">
                      <Input
                        type="number"
                        min={1}
                        placeholder="Qty"
                        className="h-9 tabular"
                        value={lineValue.qty ?? ""}
                        onChange={(event) => {
                          form.setValue(`lines.${i}.qty`, event.target.valueAsNumber, {
                            shouldDirty: true,
                            shouldValidate: false,
                          });
                        }}
                      />
                      {lineError?.qty?.message && (
                        <p className="text-[0.8rem] font-medium text-destructive">
                          {lineError.qty.message}
                        </p>
                      )}
                    </div>
                    <div className="col-span-3 space-y-2">
                      <Input
                        type="number"
                        min={0}
                        step="0.01"
                        placeholder="Unit price"
                        className="h-9 tabular"
                        value={lineValue.unitPrice ?? ""}
                        onChange={(event) => {
                          form.setValue(`lines.${i}.unitPrice`, event.target.valueAsNumber, {
                            shouldDirty: true,
                            shouldValidate: false,
                          });
                        }}
                      />
                      {lineError?.unitPrice?.message && (
                        <p className="text-[0.8rem] font-medium text-destructive">
                          {lineError.unitPrice.message}
                        </p>
                      )}
                    </div>
                    <div className="col-span-1 flex justify-end">
                      <Button
                        type="button"
                        variant="ghost"
                        size="icon"
                        className="h-9 w-9 text-muted-foreground hover:text-destructive"
                        onClick={() => remove(i)}
                        aria-label="Remove line"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                  );
                })
              )}
            </div>

            {lineItemsMessage && (
              <p className="text-[11px] text-destructive">{lineItemsMessage}</p>
            )}
          </div>

          {/* Totals + discount */}
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
            <div className="space-y-2">
              <Label>Discount ($)</Label>
              <Input
                type="number"
                min={0}
                step="0.01"
                className="h-9 tabular"
                {...form.register("discount")}
              />
              {form.formState.errors.discount?.message && (
                <p className="text-[0.8rem] font-medium text-destructive">
                  {form.formState.errors.discount.message}
                </p>
              )}
            </div>

            <div className="rounded-lg border bg-muted/30 p-3 text-sm">
              <dl className="space-y-1">
                <div className="flex justify-between text-muted-foreground">
                  <dt>Subtotal</dt>
                  <dd className="tabular text-foreground">
                    {formatCurrency(totals.subtotal)}
                  </dd>
                </div>
                <div className="flex justify-between text-muted-foreground">
                  <dt>Tax ({Math.round(TAX_RATE * 100)}%)</dt>
                  <dd className="tabular text-foreground">
                    {formatCurrency(totals.tax)}
                  </dd>
                </div>
                {totals.discount > 0 && (
                  <div className="flex justify-between text-muted-foreground">
                    <dt>Discount</dt>
                    <dd className="tabular text-[color:var(--accent-teal)]">
                      −{formatCurrency(totals.discount)}
                    </dd>
                  </div>
                )}
                <div className="mt-1 flex justify-between border-t pt-1.5">
                  <dt className="font-semibold text-foreground">Total</dt>
                  <dd className="font-bold tabular text-foreground">
                    {formatCurrency(totals.total)}
                  </dd>
                </div>
              </dl>
            </div>
          </div>

          <div className="space-y-2">
            <Label>Notes</Label>
            <Textarea
              placeholder="Optional notes for the patient"
              rows={2}
              {...form.register("notes")}
            />
            {form.formState.errors.notes?.message && (
              <p className="text-[0.8rem] font-medium text-destructive">
                {form.formState.errors.notes.message}
              </p>
            )}
          </div>

          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
            >
              Cancel
            </Button>
            <Button type="submit" className="glow-primary">
              Create Invoice
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}

function DatePickerField({
  value,
  onChange,
}: {
  value: string;
  onChange: (iso: string) => void;
}) {
  const date = value ? new Date(value) : undefined;
  return (
    <Popover>
      <PopoverTrigger asChild>
        <Button
          type="button"
          variant="outline"
          className={cn(
            "h-9 w-full justify-start text-start font-normal",
            !value && "text-muted-foreground",
          )}
        >
          <CalendarIcon className="me-2 h-4 w-4" />
          {date ? format(date, "PP") : "Pick a date"}
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-auto p-0" align="start">
        <Calendar
          mode="single"
          selected={date}
          onSelect={(d) => d && onChange(d.toISOString())}
          initialFocus
          className={cn("p-3 pointer-events-auto")}
        />
      </PopoverContent>
    </Popover>
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
                      "me-2 h-4 w-4",
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
