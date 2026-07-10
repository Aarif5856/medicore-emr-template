import { useMemo, useState } from "react";
import { createFileRoute } from "@tanstack/react-router";
import { Plus } from "lucide-react";
import { toast } from "sonner";

import { Breadcrumbs } from "@/components/breadcrumbs";
import { PageHeader } from "@/components/coming-soon";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { cn } from "@/lib/utils";
import { PharmacyProvider, usePharmacy } from "@/components/pharmacy/store";
import { InventoryTable } from "@/components/pharmacy/inventory-table";
import { PrescriptionsTable } from "@/components/pharmacy/prescriptions-table";
import { AddMedicineDialog } from "@/components/pharmacy/add-medicine-dialog";
import { RestockDialog } from "@/components/pharmacy/restock-dialog";
import { PrescriptionSheet } from "@/components/pharmacy/prescription-sheet";
import { daysUntil, type Medicine } from "@/data/pharmacy";
import type { Prescription } from "@/data/prescriptions";

export const Route = createFileRoute("/_app/pharmacy")({
  head: () => ({ meta: [{ title: "Pharmacy · MediCore EMR" }] }),
  component: PharmacyRoute,
});

function PharmacyRoute() {
  return (
    <PharmacyProvider>
      <PharmacyPage />
    </PharmacyProvider>
  );
}

const TONE_STYLES = {
  primary: "bg-primary",
  teal: "bg-[color:var(--accent-teal)]",
  warning: "bg-warning",
  destructive: "bg-destructive",
} as const;

type Tone = keyof typeof TONE_STYLES;

interface Stat {
  label: string;
  value: string;
  tone: Tone;
}

function PharmacyPage() {
  const {
    medicines,
    addMedicine,
    updateMedicine,
    deleteMedicine,
    restockMedicine,
    prescriptions,
    updatePrescription,
    dispensePrescription,
    cancelPrescription,
  } = usePharmacy();

  const [tab, setTab] = useState<"inventory" | "prescriptions">("inventory");

  const [addOpen, setAddOpen] = useState(false);
  const [editingMed, setEditingMed] = useState<Medicine | null>(null);
  const [restockTarget, setRestockTarget] = useState<Medicine | null>(null);
  const [viewRx, setViewRx] = useState<Prescription | null>(null);

  const invStats = useMemo<Stat[]>(() => {
    let low = 0;
    let out = 0;
    let expiring = 0;
    for (const m of medicines) {
      if (m.stockQty <= 0) out++;
      else if (m.stockQty < m.reorderThreshold) low++;
      if (daysUntil(m.expiryDate) <= 60) expiring++;
    }
    return [
      { label: "Total Medicines", value: "486", tone: "primary" },
      { label: "Low Stock", value: String(low || 14), tone: "warning" },
      { label: "Out of Stock", value: String(out || 3), tone: "destructive" },
      { label: "Expiring Soon", value: String(expiring || 8), tone: "warning" },
    ];
  }, [medicines]);

  const rxStats = useMemo<Stat[]>(() => {
    const today = new Date();
    let pending = 0;
    let dispensedToday = 0;
    for (const rx of prescriptions) {
      if (rx.status === "Pending" || rx.status === "Partially Dispensed") pending++;
      if (rx.status === "Dispensed") {
        const d = new Date(rx.date);
        if (
          d.getFullYear() === today.getFullYear() &&
          d.getMonth() === today.getMonth() &&
          d.getDate() === today.getDate()
        )
          dispensedToday++;
      }
    }
    return [
      { label: "Total Prescriptions", value: "342", tone: "primary" },
      { label: "Pending Dispense", value: String(pending || 9), tone: "warning" },
      {
        label: "Dispensed Today",
        value: String(dispensedToday || 21),
        tone: "teal",
      },
    ];
  }, [prescriptions]);

  const stats = tab === "inventory" ? invStats : rxStats;

  const handleEditMedicine = (m: Medicine) => {
    setEditingMed(m);
    setAddOpen(true);
  };

  const handleDeleteMedicine = (m: Medicine) => {
    deleteMedicine(m.id);
    toast.success(`Removed ${m.name} from inventory`);
  };

  const handleDispenseRx = (rx: Prescription) => {
    dispensePrescription(rx.id);
    toast.success(`Dispensed prescription ${rx.id}`);
    setViewRx((prev) =>
      prev && prev.id === rx.id
        ? {
            ...prev,
            status: "Dispensed",
            lines: prev.lines.map((l) => ({ ...l, dispensed: true })),
          }
        : prev,
    );
  };

  const handleCancelRx = (rx: Prescription) => {
    cancelPrescription(rx.id);
    toast.message(`Prescription ${rx.id} cancelled`);
    setViewRx((prev) =>
      prev && prev.id === rx.id ? { ...prev, status: "Cancelled" } : prev,
    );
  };

  return (
    <div className="space-y-6">
      <Breadcrumbs />
      <PageHeader
        title="Pharmacy"
        description="Manage medicine inventory, restocking, and prescription dispensing."
        actions={
          tab === "inventory" ? (
            <Button
              size="sm"
              className="gap-2 glow-primary"
              onClick={() => {
                setEditingMed(null);
                setAddOpen(true);
              }}
            >
              <Plus className="h-4 w-4" /> Add Medicine
            </Button>
          ) : null
        }
      />

      <Tabs
        value={tab}
        onValueChange={(v) => setTab(v as "inventory" | "prescriptions")}
      >
        <TabsList className="grid w-full max-w-sm grid-cols-2">
          <TabsTrigger value="inventory">Inventory</TabsTrigger>
          <TabsTrigger value="prescriptions">Prescriptions</TabsTrigger>
        </TabsList>
      </Tabs>

      <div
        className={cn(
          "grid gap-3",
          stats.length === 4
            ? "grid-cols-2 md:grid-cols-4"
            : "grid-cols-1 sm:grid-cols-3",
        )}
      >
        {stats.map((s) => (
          <MiniStatCard
            key={s.label}
            label={s.label}
            value={s.value}
            tone={s.tone}
          />
        ))}
      </div>

      {tab === "inventory" ? (
        <InventoryTable
          medicines={medicines}
          onEdit={handleEditMedicine}
          onRestock={setRestockTarget}
          onDelete={handleDeleteMedicine}
        />
      ) : (
        <PrescriptionsTable
          prescriptions={prescriptions}
          onView={setViewRx}
          onDispense={handleDispenseRx}
          onCancel={handleCancelRx}
        />
      )}

      <AddMedicineDialog
        open={addOpen}
        onOpenChange={(o) => {
          setAddOpen(o);
          if (!o) setEditingMed(null);
        }}
        editing={editingMed}
        onCreate={addMedicine}
        onUpdate={updateMedicine}
      />

      <RestockDialog
        medicine={restockTarget}
        onOpenChange={(o) => !o && setRestockTarget(null)}
        onRestock={restockMedicine}
      />

      <PrescriptionSheet
        prescription={viewRx}
        medicines={medicines}
        onOpenChange={(o) => !o && setViewRx(null)}
        onDispense={handleDispenseRx}
        onUpdateNotes={(id, notes) => updatePrescription(id, { notes })}
      />
    </div>
  );
}
