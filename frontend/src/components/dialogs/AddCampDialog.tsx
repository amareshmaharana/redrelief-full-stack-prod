import { useState } from "react";
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
import { Textarea } from "@/components/ui/textarea";
import { adminApi } from "@/lib/backend-api";

interface AddCampDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onCreated: () => void;
}

export function AddCampDialog({ open, onOpenChange, onCreated }: AddCampDialogProps) {
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState({
    camp_name: "",
    location: "",
    date: "",
    description: "",
  });

  const update = (field: string, value: string) =>
    setForm((prev) => ({ ...prev, [field]: value }));

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.camp_name || !form.location || !form.date) {
      toast.error("Please fill all required fields.");
      return;
    }
    setLoading(true);
    try {
      await adminApi.createCamp(form);
      toast.success("Camp created successfully!");
      setForm({ camp_name: "", location: "", date: "", description: "" });
      onOpenChange(false);
      onCreated();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Failed to create camp.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Add New Camp</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="camp_name">Camp Name *</Label>
            <Input
              id="camp_name"
              value={form.camp_name}
              onChange={(e) => update("camp_name", e.target.value)}
              placeholder="e.g. City Blood Drive"
              required
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="location">Location *</Label>
            <Input
              id="location"
              value={form.location}
              onChange={(e) => update("location", e.target.value)}
              placeholder="e.g. Community Hall, MG Road"
              required
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="date">Date *</Label>
            <Input
              id="date"
              type="date"
              value={form.date}
              onChange={(e) => update("date", e.target.value)}
              required
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="description">Description</Label>
            <Textarea
              id="description"
              value={form.description}
              onChange={(e) => update("description", e.target.value)}
              placeholder="Camp details, timings, etc."
              rows={3}
            />
          </div>
          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
            <Button type="submit" disabled={loading}>
              {loading ? "Creating..." : "Create Camp"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
