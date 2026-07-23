import { useEffect, useMemo, useState } from "react";
import { toast } from "sonner";
import { UploadCloud } from "lucide-react";

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
import { Textarea } from "@/components/ui/textarea";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  flagFor,
  getTestDefinition,
  type LabParameterResult,
  type LabResult,
  type LabTest,
} from "@/data/lab-tests";

interface Props {
  test: LabTest | null;
  onOpenChange: (open: boolean) => void;
  onSubmit: (id: string, result: LabResult) => void;
}

export function UploadResultDialog({ test, onOpenChange, onSubmit }: Props) {
  const def = test ? getTestDefinition(test.testName) : undefined;

  const initialValues = useMemo(() => {
    const map: Record<string, string> = {};
    if (test?.result?.parameters) {
      for (const p of test.result.parameters) map[p.name] = String(p.value);
    } else if (def?.parameters) {
      for (const p of def.parameters) map[p.name] = "";
    }
    return map;
  }, [test, def]);

  const [values, setValues] = useState<Record<string, string>>(initialValues);
  const [findings, setFindings] = useState<string>(test?.result?.findings ?? "");

  useEffect(() => {
    setValues(initialValues);
    setFindings(test?.result?.findings ?? "");
  }, [initialValues, test]);

  if (!test || !def) {
    return (
      <Dialog open={test !== null} onOpenChange={onOpenChange}>
        <DialogContent />
      </Dialog>
    );
  }

  const handleSave = () => {
    if (def.kind === "pathology") {
      const parameters: LabParameterResult[] = (def.parameters ?? []).map((p) => {
        const raw = values[p.name] ?? "";
        const num = Number(raw);
        const value = Number.isFinite(num) ? num : 0;
        return {
          name: p.name,
          unit: p.unit,
          refLow: p.refLow,
          refHigh: p.refHigh,
          value,
          flag: flagFor(value, p.refLow, p.refHigh),
        };
      });
      onSubmit(test.id, { parameters });
    } else {
      onSubmit(test.id, { findings: findings.trim() });
    }
    toast.success(`Result saved for ${test.patientName} - ${test.testName}`);
    onOpenChange(false);
  };

  return (
    <Dialog open={test !== null} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[90vh] max-w-2xl overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Upload Result - {test.testName}</DialogTitle>
          <DialogDescription>
            {test.id} · {test.patientName}
          </DialogDescription>
        </DialogHeader>

        {def.kind === "pathology" ? (
          <div className="overflow-hidden rounded-lg border bg-card">
            <Table>
              <TableHeader>
                <TableRow className="border-b bg-muted/40 hover:bg-muted/40">
                  <TableHead className="h-9 text-[11px] font-semibold uppercase tracking-wide text-muted-foreground">
                    Parameter
                  </TableHead>
                  <TableHead className="h-9 text-[11px] font-semibold uppercase tracking-wide text-muted-foreground">
                    Value
                  </TableHead>
                  <TableHead className="h-9 text-[11px] font-semibold uppercase tracking-wide text-muted-foreground">
                    Unit
                  </TableHead>
                  <TableHead className="h-9 text-[11px] font-semibold uppercase tracking-wide text-muted-foreground">
                    Reference
                  </TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {(def.parameters ?? []).map((p) => (
                  <TableRow key={p.name}>
                    <TableCell className="py-2 text-sm font-medium text-foreground">
                      {p.name}
                    </TableCell>
                    <TableCell className="py-2">
                      <Input
                        type="number"
                        step="any"
                        value={values[p.name] ?? ""}
                        onChange={(e) => setValues((v) => ({ ...v, [p.name]: e.target.value }))}
                        className="h-8 w-28 tabular"
                        placeholder="-"
                      />
                    </TableCell>
                    <TableCell className="py-2 text-xs text-muted-foreground">
                      {p.unit || "-"}
                    </TableCell>
                    <TableCell className="py-2 text-xs tabular text-muted-foreground">
                      {p.refLow}–{p.refHigh}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        ) : (
          <div className="space-y-4">
            <div>
              <Label htmlFor="findings">Findings</Label>
              <Textarea
                id="findings"
                value={findings}
                onChange={(e) => setFindings(e.target.value)}
                rows={5}
                placeholder="Describe the radiologist's findings…"
                className="mt-1.5"
              />
            </div>
            <div>
              <Label>Attach scan</Label>
              <div className="mt-1.5 grid h-40 place-items-center rounded-lg border-2 border-dashed bg-muted/30 text-muted-foreground transition-colors hover:border-primary/60 hover:bg-primary/5">
                <div className="flex flex-col items-center gap-2">
                  <UploadCloud className="h-8 w-8 opacity-70" />
                  <span className="text-sm font-medium">
                    Drop scan image here or click to browse
                  </span>
                  <span className="text-[11px]">PNG, JPG, DICOM up to 25MB</span>
                </div>
              </div>
            </div>
          </div>
        )}

        <DialogFooter>
          <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button type="button" onClick={handleSave} className="glow-primary">
            Save Result
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
