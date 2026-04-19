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
import { Textarea } from "@/components/ui/textarea";
import type { BloodCamp } from "@/types";

interface EditCampDialogProps {
  open: boolean;
  camp: BloodCamp | null;
  onOpenChange: (open: boolean) => void;
  onSubmit: (payload: { camp_name: string; location: string; date: string; description: string }) => Promise<void>;
}

export function EditCampDialog({ open, camp, onOpenChange, onSubmit }: EditCampDialogProps) {
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState({
    camp_name: "",
    location: "",
    date: "",
    description: "",
  });

  useEffect(() => {
    if (!open || !camp) {
      return;
    }

    setForm({
      camp_name: camp.name,
      location: camp.address,
      date: camp.date,
      description: camp.description ?? "",
    });
  }, [open, camp]);

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();

    if (!form.camp_name || !form.location || !form.date) {
      toast.error("Please fill all required fields.");
      return;
    }

    setSaving(true);
    try {
      await onSubmit({
        camp_name: form.camp_name,
        location: form.location,
        date: form.date,
        description: form.description,
      });
      onOpenChange(false);
    } catch (error) {
      const message = error instanceof Error ? error.message : "Unable to update camp.";
      toast.error(message);
    } finally {
      setSaving(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Edit Camp</DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="edit-camp-name">Camp Name *</Label>
            <Input
              id="edit-camp-name"
              value={form.camp_name}
              onChange={(event) => setForm((prev) => ({ ...prev, camp_name: event.target.value }))}
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="edit-camp-location">Location *</Label>
            <Input
              id="edit-camp-location"
              value={form.location}
              onChange={(event) => setForm((prev) => ({ ...prev, location: event.target.value }))}
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="edit-camp-date">Date *</Label>
            <Input
              id="edit-camp-date"
              type="date"
              value={form.date}
              onChange={(event) => setForm((prev) => ({ ...prev, date: event.target.value }))}
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="edit-camp-description">Description</Label>
            <Textarea
              id="edit-camp-description"
              value={form.description}
              onChange={(event) => setForm((prev) => ({ ...prev, description: event.target.value }))}
              rows={3}
            />
          </div>

          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)} disabled={saving}>
              Cancel
            </Button>
            <Button type="submit" disabled={saving || !camp}>
              {saving ? "Saving..." : "Save Changes"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
