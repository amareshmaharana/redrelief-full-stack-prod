import { useEffect, useState } from "react";
import { toast } from "sonner";

import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import type { BloodGroup, BloodStock } from "@/types";

const bloodGroups: BloodGroup[] = ["A+", "A-", "B+", "B-", "AB+", "AB-", "O+", "O-"];

interface EditStockDialogProps {
  open: boolean;
  stock: BloodStock | null;
  onOpenChange: (open: boolean) => void;
  onSubmit: (payload: { blood_group: string; units: number; expiry_date: string }) => Promise<void>;
}

export function EditStockDialog({ open, stock, onOpenChange, onSubmit }: EditStockDialogProps) {
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState({
    blood_group: "" as string,
    units: "",
    expiry_date: "",
  });

  useEffect(() => {
    if (!open || !stock) {
      return;
    }

    setForm({
      blood_group: stock.bloodGroup,
      units: String(stock.units),
      expiry_date: stock.expiryDate,
    });
  }, [open, stock]);

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();

    if (!form.blood_group || !form.units || !form.expiry_date) {
      toast.error("Please fill all required fields.");
      return;
    }

    const unitsNumber = Number(form.units);
    if (!Number.isFinite(unitsNumber) || unitsNumber < 1) {
      toast.error("Units must be at least 1.");
      return;
    }

    setSaving(true);
    try {
      await onSubmit({
        blood_group: form.blood_group,
        units: unitsNumber,
        expiry_date: form.expiry_date,
      });
      onOpenChange(false);
    } catch (error) {
      const message = error instanceof Error ? error.message : "Unable to update stock.";
      toast.error(message);
    } finally {
      setSaving(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Edit Blood Stock</DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label>Blood Group *</Label>
            <Select
              value={form.blood_group}
              onValueChange={(value) => setForm((prev) => ({ ...prev, blood_group: value }))}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select blood group" />
              </SelectTrigger>
              <SelectContent>
                {bloodGroups.map((group) => (
                  <SelectItem key={group} value={group}>
                    {group}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="edit-stock-units">Units *</Label>
            <Input
              id="edit-stock-units"
              type="number"
              min="1"
              value={form.units}
              onChange={(event) => setForm((prev) => ({ ...prev, units: event.target.value }))}
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="edit-stock-expiry">Expiry Date *</Label>
            <Input
              id="edit-stock-expiry"
              type="date"
              value={form.expiry_date}
              onChange={(event) => setForm((prev) => ({ ...prev, expiry_date: event.target.value }))}
              required
            />
          </div>

          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)} disabled={saving}>
              Cancel
            </Button>
            <Button type="submit" disabled={saving || !stock}>
              {saving ? "Saving..." : "Save Changes"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
