import { useEffect, useState } from "react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
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
import { StockBar } from "@/components/pharmacy/badges";
import type { Medicine } from "@/data/pharmacy";

interface Props {
  medicine: Medicine | null;
  onOpenChange: (open: boolean) => void;
  onRestock: (id: string, addQty: number) => void;
}

export function RestockDialog({ medicine, onOpenChange, onRestock }: Props) {
  const [qty, setQty] = useState<number>(0);

  useEffect(() => {
    if (medicine) setQty(Math.max(medicine.reorderThreshold - medicine.stockQty, 50));
  }, [medicine]);

  if (!medicine) return null;

  const handleSubmit = () => {
    if (qty <= 0) return;
    onRestock(medicine.id, qty);
    toast.success(`Restocked ${medicine.name} (+${qty} ${medicine.unit})`);
    onOpenChange(false);
  };

  return (
    <Dialog open={medicine !== null} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-sm">
        <DialogHeader>
          <DialogTitle>Restock {medicine.name}</DialogTitle>
          <DialogDescription>
            Add quantity to the existing stock. Reorder threshold is {medicine.reorderThreshold}{" "}
            {medicine.unit}.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          <div className="rounded-lg border bg-muted/30 p-3">
            <div className="mb-1 text-[11px] font-medium uppercase tracking-wide text-muted-foreground">
              Current stock
            </div>
            <StockBar qty={medicine.stockQty} threshold={medicine.reorderThreshold} />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="qty">Add quantity</Label>
            <Input
              id="qty"
              type="number"
              min={1}
              value={qty}
              onChange={(e) => setQty(Number(e.target.value) || 0)}
            />
            <p className="text-[11px] text-muted-foreground">
              New stock will be{" "}
              <span className="font-medium text-foreground tabular">
                {(medicine.stockQty + qty).toLocaleString()}
              </span>{" "}
              {medicine.unit}
            </p>
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button className="glow-primary" onClick={handleSubmit} disabled={qty <= 0}>
            Restock
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
