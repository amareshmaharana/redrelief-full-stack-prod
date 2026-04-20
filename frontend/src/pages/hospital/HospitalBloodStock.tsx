import { Card, CardContent } from "@/components/ui/card";
import { AlertTriangle, CheckCircle, Pencil, Trash2 } from "lucide-react";
import { BrandLoader } from "@/components/ui/BrandLoader";
import { useMinLoader } from "@/hooks/useMinLoader";
import { hospitalApi, mapStock } from "@/lib/backend-api";
import { useState, useEffect } from "react";
import { toast } from "sonner";
import type { BloodStock } from "@/types";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

const bloodGroups = ["A+", "A-", "B+", "B-", "AB+", "AB-", "O+", "O-"] as const;

export default function HospitalBloodStock() {
  const [stockList, setStockList] = useState<BloodStock[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [form, setForm] = useState({
    blood_group: "",
    units: "1",
    expiry_date: "",
  });

  const loadStock = async () => {
    setLoading(true);
    try {
      const data = await hospitalApi.stock();
      setStockList(data.map(mapStock));
    } catch (error) {
      const message = error instanceof Error ? error.message : "Failed to load stock.";
      toast.error(message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    void loadStock();
    const intervalId = window.setInterval(() => {
      void loadStock();
    }, 30000);

    return () => {
      window.clearInterval(intervalId);
    };
  }, []);

  const resetForm = () => {
    setForm({ blood_group: "", units: "1", expiry_date: "" });
    setEditingId(null);
  };

  const startEdit = (item: BloodStock) => {
    setEditingId(item.id);
    setForm({
      blood_group: item.bloodGroup,
      units: String(item.units),
      expiry_date: item.expiryDate,
    });
  };

  const submitForm = async (event: React.FormEvent) => {
    event.preventDefault();
    if (!form.blood_group || !form.expiry_date) {
      toast.error("Blood group and expiry date are required.");
      return;
    }

    const units = Number(form.units);
    if (Number.isNaN(units) || units < 1) {
      toast.error("Units must be at least 1.");
      return;
    }

    setSaving(true);
    try {
      if (editingId) {
        await hospitalApi.updateStock(Number(editingId), {
          blood_group: form.blood_group,
          units,
          expiry_date: form.expiry_date,
        });
        toast.success("Stock updated.");
      } else {
        await hospitalApi.addStock({
          blood_group: form.blood_group,
          units,
          expiry_date: form.expiry_date,
        });
        toast.success("Stock added.");
      }
      resetForm();
      await loadStock();
    } catch (error) {
      const message = error instanceof Error ? error.message : "Unable to save stock.";
      toast.error(message);
    } finally {
      setSaving(false);
    }
  };

  const removeStock = async (id: string) => {
    setDeletingId(id);
    try {
      await hospitalApi.deleteStock(Number(id));
      if (editingId === id) {
        resetForm();
      }
      toast.success("Stock deleted.");
      await loadStock();
    } catch (error) {
      const message = error instanceof Error ? error.message : "Unable to delete stock.";
      toast.error(message);
    } finally {
      setDeletingId(null);
    }
  };

  const showLoader = useMinLoader(loading);
  if (showLoader)
    return <BrandLoader message="Loading stock..." fullScreen={false} />;

  const totalUnits = stockList.reduce((a, s) => a + s.units, 0);
  const lowStock = stockList.filter((s) => s.units < 10);

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-foreground tracking-tight">
            Blood Stock
          </h1>
          <p className="text-sm text-muted-foreground mt-1">
            View current blood availability across all groups
          </p>
        </div>
        {lowStock.length > 0 && (
          <div className="flex items-center gap-2 rounded-xl bg-destructive/5 border border-destructive/20 px-4 py-2">
            <AlertTriangle className="h-4 w-4 text-destructive" />
            <span className="text-sm font-medium text-destructive">
              {lowStock.length} group(s) low stock
            </span>
          </div>
        )}
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
        <div className="rounded-xl border border-border bg-card p-4 text-center">
          <p className="text-2xl font-bold text-primary tracking-tight">
            {totalUnits}
          </p>
          <p className="text-xs text-muted-foreground font-medium mt-1">
            Total Units
          </p>
        </div>
        <div className="rounded-xl border border-border bg-card p-4 text-center">
          <p className="text-2xl font-bold text-success tracking-tight">
            {stockList.filter((s) => s.units >= 10).length}
          </p>
          <p className="text-xs text-muted-foreground font-medium mt-1">
            Well Stocked
          </p>
        </div>
        <div className="rounded-xl border border-border bg-card p-4 text-center">
          <p className="text-2xl font-bold text-destructive tracking-tight">
            {lowStock.length}
          </p>
          <p className="text-xs text-muted-foreground font-medium mt-1">
            Low Stock
          </p>
        </div>
      </div>

      <Card>
        <CardContent className="p-5">
          <form className="grid gap-4 sm:grid-cols-4" onSubmit={submitForm}>
            <div className="space-y-2">
              <Label>Blood Group</Label>
              <Select
                value={form.blood_group}
                onValueChange={(value) => setForm((prev) => ({ ...prev, blood_group: value }))}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select" />
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
              <Label>Units</Label>
              <Input
                min={1}
                type="number"
                value={form.units}
                onChange={(event) => setForm((prev) => ({ ...prev, units: event.target.value }))}
              />
            </div>

            <div className="space-y-2">
              <Label>Expiry Date</Label>
              <Input
                type="date"
                value={form.expiry_date}
                onChange={(event) => setForm((prev) => ({ ...prev, expiry_date: event.target.value }))}
              />
            </div>

            <div className="flex items-end gap-2">
              <Button disabled={saving} type="submit">
                {saving ? "Saving..." : editingId ? "Update Stock" : "Add Stock"}
              </Button>
              {editingId && (
                <Button type="button" variant="outline" onClick={resetForm}>
                  Cancel
                </Button>
              )}
            </div>
          </form>
        </CardContent>
      </Card>

      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        {stockList.map((s) => {
          const isLow = s.units < 10;
          return (
            <Card
              key={s.id}
              className={`overflow-hidden ${isLow ? "border-destructive/30" : "border-border"}`}
            >
              <CardContent className="p-5 text-center">
                <div className="inline-flex h-14 w-14 items-center justify-center rounded-full gradient-blood text-sm font-bold text-primary-foreground mb-3">
                  {s.bloodGroup}
                </div>
                <p className="text-3xl font-bold text-foreground tracking-tight">
                  {s.units}
                </p>
                <p className="text-xs text-muted-foreground font-semibold uppercase tracking-wider mt-1">
                  units
                </p>
                <div className="mt-3 flex items-center justify-center gap-1">
                  {isLow ? (
                    <span className="inline-flex items-center gap-1 text-xs font-bold text-destructive">
                      <AlertTriangle className="h-3.5 w-3.5" /> Low Stock
                    </span>
                  ) : (
                    <span className="inline-flex items-center gap-1 text-xs font-bold text-success">
                      <CheckCircle className="h-3.5 w-3.5" /> Available
                    </span>
                  )}
                </div>
                <p className="text-[10px] text-muted-foreground mt-2">
                  Expires: {s.expiryDate}
                </p>
                <div className="mt-3 flex justify-center gap-2">
                  <Button size="sm" type="button" variant="outline" onClick={() => startEdit(s)}>
                    <Pencil className="h-3.5 w-3.5" />
                  </Button>
                  <Button
                    size="sm"
                    type="button"
                    variant="destructive"
                    disabled={deletingId === s.id}
                    onClick={() => {
                      void removeStock(s.id);
                    }}
                  >
                    <Trash2 className="h-3.5 w-3.5" />
                  </Button>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>
    </div>
  );
}
