import { useEffect } from "react";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import { z } from "zod";
import { format } from "date-fns";
import { CalendarIcon } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
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
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { cn } from "@/lib/utils";
import {
  MEDICINE_CATEGORIES,
  MEDICINE_UNITS,
  type Medicine,
  type MedicineCategory,
  type MedicineUnit,
} from "@/data/pharmacy";

const SUPPLIERS = [
  "MediSupply Co.",
  "PharmaCore Ltd.",
  "HealthPlus Distributors",
  "Global Meds Inc.",
  "CarePharm Wholesale",
];

const schema = z.object({
  name: z.string().min(2, "Name is required"),
  genericName: z.string().min(2, "Generic name is required"),
  category: z.enum([
    "Analgesic",
    "Antibiotic",
    "Antidiabetic",
    "Cardiac",
    "Antihistamine",
    "Supplement",
  ]),
  stockQty: z.coerce.number().int().min(0, "Must be ≥ 0"),
  reorderThreshold: z.coerce.number().int().min(0, "Must be ≥ 0"),
  unit: z.enum(["tablets", "bottles", "vials", "capsules", "sachets"]),
  price: z.coerce.number().min(0, "Must be ≥ 0"),
  expiryDate: z.date({ required_error: "Expiry date is required" }),
  supplier: z.string().min(2, "Supplier is required"),
});

type FormValues = z.infer<typeof schema>;

interface Props {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  editing: Medicine | null;
  onCreate: (m: Omit<Medicine, "id">) => Medicine;
  onUpdate: (id: string, patch: Partial<Medicine>) => void;
}

export function AddMedicineDialog({
  open,
  onOpenChange,
  editing,
  onCreate,
  onUpdate,
}: Props) {
  const form = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: {
      name: "",
      genericName: "",
      category: "Analgesic",
      stockQty: 0,
      reorderThreshold: 50,
      unit: "tablets",
      price: 0,
      expiryDate: new Date(Date.now() + 365 * 864e5),
      supplier: SUPPLIERS[0],
    },
  });

  useEffect(() => {
    if (!open) return;
    if (editing) {
      form.reset({
        name: editing.name,
        genericName: editing.genericName,
        category: editing.category,
        stockQty: editing.stockQty,
        reorderThreshold: editing.reorderThreshold,
        unit: editing.unit,
        price: editing.price,
        expiryDate: new Date(editing.expiryDate),
        supplier: editing.supplier,
      });
    } else {
      form.reset({
        name: "",
        genericName: "",
        category: "Analgesic",
        stockQty: 0,
        reorderThreshold: 50,
        unit: "tablets",
        price: 0,
        expiryDate: new Date(Date.now() + 365 * 864e5),
        supplier: SUPPLIERS[0],
      });
    }
  }, [open, editing, form]);

  const onSubmit = (values: FormValues) => {
    const payload = {
      name: values.name.trim(),
      genericName: values.genericName.trim(),
      category: values.category,
      stockQty: values.stockQty,
      reorderThreshold: values.reorderThreshold,
      unit: values.unit,
      price: values.price,
      expiryDate: values.expiryDate.toISOString(),
      supplier: values.supplier,
    };
    if (editing) {
      onUpdate(editing.id, payload);
      toast.success(`Updated ${payload.name}`);
    } else {
      onCreate(payload);
      toast.success(`Added ${payload.name} to inventory`);
    }
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[90vh] max-w-xl overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{editing ? "Edit Medicine" : "Add Medicine"}</DialogTitle>
          <DialogDescription>
            {editing
              ? "Update the medicine details."
              : "Register a new medicine in the pharmacy inventory."}
          </DialogDescription>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-5">
            <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
              <FormField
                control={form.control}
                name="name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Name</FormLabel>
                    <FormControl>
                      <Input placeholder="e.g. Paracetamol 500mg" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="genericName"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Generic name</FormLabel>
                    <FormControl>
                      <Input placeholder="e.g. Acetaminophen" {...field} />
                    </FormControl>
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
                      onValueChange={(v) => field.onChange(v as MedicineCategory)}
                    >
                      <FormControl>
                        <SelectTrigger className="h-9">
                          <SelectValue placeholder="Category" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {MEDICINE_CATEGORIES.map((c) => (
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
                name="unit"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Unit</FormLabel>
                    <Select
                      value={field.value}
                      onValueChange={(v) => field.onChange(v as MedicineUnit)}
                    >
                      <FormControl>
                        <SelectTrigger className="h-9">
                          <SelectValue placeholder="Unit" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {MEDICINE_UNITS.map((u) => (
                          <SelectItem key={u} value={u} className="capitalize">
                            {u}
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
                name="stockQty"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Stock quantity</FormLabel>
                    <FormControl>
                      <Input type="number" min={0} {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="reorderThreshold"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Reorder threshold</FormLabel>
                    <FormControl>
                      <Input type="number" min={0} {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="price"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Price per unit</FormLabel>
                    <FormControl>
                      <Input type="number" min={0} step="0.01" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="expiryDate"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Expiry date</FormLabel>
                    <Popover>
                      <PopoverTrigger asChild>
                        <FormControl>
                          <Button
                            variant="outline"
                            className={cn(
                              "h-9 w-full justify-start text-start font-normal",
                              !field.value && "text-muted-foreground",
                            )}
                          >
                            <CalendarIcon className="me-2 h-4 w-4" />
                            {field.value ? format(field.value, "PPP") : "Pick a date"}
                          </Button>
                        </FormControl>
                      </PopoverTrigger>
                      <PopoverContent className="w-auto p-0" align="start">
                        <Calendar
                          mode="single"
                          selected={field.value}
                          onSelect={field.onChange}
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
                name="supplier"
                render={({ field }) => (
                  <FormItem className="md:col-span-2">
                    <FormLabel>Supplier</FormLabel>
                    <FormControl>
                      <Input placeholder="Supplier name" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
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
                {editing ? "Save changes" : "Add medicine"}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
