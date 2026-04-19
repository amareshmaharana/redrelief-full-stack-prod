import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { Check, X, AlertTriangle, Droplets, Heart, Shield } from 'lucide-react';

interface Props {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

const criteria = [
  { label: 'Age between 18–65 years', ok: true },
  { label: 'Weight at least 50 kg (110 lbs)', ok: true },
  { label: 'Hemoglobin level ≥ 12.5 g/dL', ok: true },
  { label: 'No tattoo or piercing in last 6 months', ok: true },
  { label: 'Not pregnant or breastfeeding', ok: true },
  { label: 'No major surgery in last 6 months', ok: true },
];

const restrictions = [
  'Active infection or fever',
  'Under medication for chronic illness',
  'History of Hepatitis B/C or HIV',
  'Recent alcohol consumption (48 hrs)',
];

export function EligibilityGuideDialog({ open, onOpenChange }: Props) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-[calc(100vw-2rem)] sm:max-w-2xl max-h-[85vh] overflow-y-auto p-0 gap-0 border-0 rounded-lg">
        {/* Header */}
        <div className="relative bg-gradient-to-br from-primary to-primary/80 p-6 sm:p-8 text-primary-foreground">
          <div className="flex items-center gap-3 mb-2">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary-foreground/20">
              <Shield className="h-5 w-5" />
            </div>
            <DialogHeader className="space-y-0 text-left">
              <DialogTitle className="text-xl sm:text-2xl font-bold text-primary-foreground">
                Eligibility Guide
              </DialogTitle>
            </DialogHeader>
          </div>
          <DialogDescription className="text-primary-foreground/80 mt-2">
            Check if you meet the requirements to donate blood and save lives.
          </DialogDescription>
        </div>

        <div className="p-6 sm:p-8 space-y-8">
          {/* Basic Requirements */}
          <div>
            <div className="flex items-center gap-2 mb-4">
              <Heart className="h-5 w-5 text-primary" />
              <h3 className="font-semibold text-foreground text-lg">Basic Requirements</h3>
            </div>
            <div className="grid gap-3">
              {criteria.map((item) => (
                <div
                  key={item.label}
                  className="flex items-center gap-3 rounded-xl bg-accent/50 border border-border p-3.5 transition-colors hover:bg-accent"
                >
                  <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-success/10 text-success">
                    <Check className="h-4 w-4" />
                  </div>
                  <span className="text-sm text-foreground">{item.label}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Temporary Restrictions */}
          <div>
            <div className="flex items-center gap-2 mb-4">
              <AlertTriangle className="h-5 w-5 text-warning" />
              <h3 className="font-semibold text-foreground text-lg">Temporary Restrictions</h3>
            </div>
            <div className="grid gap-3">
              {restrictions.map((item) => (
                <div
                  key={item}
                  className="flex items-center gap-3 rounded-xl bg-warning/5 border border-warning/20 p-3.5"
                >
                  <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-warning/10 text-warning">
                    <X className="h-4 w-4" />
                  </div>
                  <span className="text-sm text-foreground">{item}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Info box */}
          <div className="rounded-xl bg-info/5 border border-info/20 p-5">
            <div className="flex items-start gap-3">
              <Droplets className="h-5 w-5 text-info mt-0.5 shrink-0" />
              <div>
                <p className="font-medium text-foreground text-sm">Important Note</p>
                <p className="text-sm text-muted-foreground mt-1">
                  Final eligibility is determined by a medical professional at the donation site.
                  This guide is for general reference only.
                </p>
              </div>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
