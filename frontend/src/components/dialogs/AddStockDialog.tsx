import { useState, useEffect } from "react";
import { toast } from "sonner";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
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
import { adminApi } from "@/lib/backend-api";
import type { BloodGroup } from "@/types";

const bloodGroups: BloodGroup[] = ["A+", "A-", "B+", "B-", "AB+", "AB-", "O+", "O-"];

interface AddStockDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onCreated: () => void;
}

export function AddStockDialog({ open, onOpenChange, onCreated }: AddStockDialogProps) {
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState({
    blood_group: "" as string,
    units: "",
    expiry_date: "",
  });

  useEffect(() => {
    if (open) {
      setForm({ blood_group: "", units: "", expiry_date: "" });
    }
  }, [open]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.blood_group || !form.units || !form.expiry_date) {
      toast.error("Please fill all required fields.");
      return;
    }
    setLoading(true);
    try {
      await adminApi.addStock({
        blood_group: form.blood_group,
        units: Number(form.units),
        expiry_date: form.expiry_date,
      });
      toast.success("Stock added successfully!");
      setForm({ blood_group: "", units: "", expiry_date: "" });
      onOpenChange(false);
      onCreated();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Failed to add stock.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Add Blood Stock</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label>Blood Group *</Label>
            <Select value={form.blood_group} onValueChange={(v) => setForm((p) => ({ ...p, blood_group: v }))}>
              <SelectTrigger>
                <SelectValue placeholder="Select blood group" />
              </SelectTrigger>
              <SelectContent>
                {bloodGroups.map((bg) => (
                  <SelectItem key={bg} value={bg}>{bg}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-2">
            <Label htmlFor="units">Units *</Label>
            <Input
              id="units"
              type="number"
              min="1"
              value={form.units}
              onChange={(e) => setForm((p) => ({ ...p, units: e.target.value }))}
              placeholder="e.g. 10"
              required
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="expiry">Expiry Date *</Label>
            <Input
              id="expiry"
              type="date"
              value={form.expiry_date}
              onChange={(e) => setForm((p) => ({ ...p, expiry_date: e.target.value }))}
              required
            />
          </div>
          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
            <Button type="submit" disabled={loading}>
              {loading ? "Adding..." : "Add Stock"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
