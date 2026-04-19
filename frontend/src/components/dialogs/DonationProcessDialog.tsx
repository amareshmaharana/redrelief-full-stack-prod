import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { ClipboardCheck, Droplets, Heart, Clock, Activity, Stethoscope } from 'lucide-react';

interface Props {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

const steps = [
  {
    icon: ClipboardCheck,
    title: 'Registration',
    description: 'Fill out a donor registration form with your personal and medical history details.',
    duration: '5-10 min',
  },
  {
    icon: Stethoscope,
    title: 'Health Screening',
    description: 'A mini-physical checks your blood pressure, pulse, temperature, and hemoglobin level.',
    duration: '10-15 min',
  },
  {
    icon: Droplets,
    title: 'Blood Donation',
    description: 'A sterile needle is used to collect approximately 450 mL (one unit) of blood.',
    duration: '8-12 min',
  },
  {
    icon: Heart,
    title: 'Refreshment & Rest',
    description: 'Relax in the canteen area, enjoy light snacks and drinks to help your body recover.',
    duration: '15-20 min',
  },
];

const tips = [
  'Drink plenty of water before your appointment',
  'Eat a healthy meal 2-3 hours before donating',
  'Get a good night\'s sleep the night before',
  'Avoid heavy exercise for 24 hours after donation',
  'Keep the bandage on for at least 4 hours',
];

export function DonationProcessDialog({ open, onOpenChange }: Props) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-[calc(100vw-2rem)] sm:max-w-2xl max-h-[85vh] overflow-y-auto p-0 gap-0 border-0 rounded-lg">
        {/* Header */}
        <div className="relative bg-gradient-to-br from-primary to-primary/80 p-6 sm:p-8 text-primary-foreground">
          <div className="flex items-center gap-3 mb-2">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary-foreground/20">
              <Activity className="h-5 w-5" />
            </div>
            <DialogHeader className="space-y-0 text-left">
              <DialogTitle className="text-xl sm:text-2xl font-bold text-primary-foreground">
                Donation Process
              </DialogTitle>
            </DialogHeader>
          </div>
          <DialogDescription className="text-primary-foreground/80 mt-2">
            Here's what to expect when you donate blood — it's safe, simple, and takes under an hour.
          </DialogDescription>
        </div>

        <div className="p-6 sm:p-8 space-y-8">
          {/* Steps */}
          <div className="relative">
            {/* Connecting line */}
            <div className="absolute left-[23px] top-10 bottom-10 w-0.5 bg-border" />

            <div className="space-y-6">
              {steps.map((step, index) => (
                <div key={step.title} className="relative flex gap-4">
                  <div className="relative z-10 flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-primary text-primary-foreground shadow-md">
                    <step.icon className="h-5 w-5" />
                  </div>
                  <div className="flex-1 rounded-xl border border-border bg-card p-4 shadow-sm">
                    <div className="flex items-center justify-between mb-1">
                      <h4 className="font-semibold text-foreground">
                        Step {index + 1}: {step.title}
                      </h4>
                      <span className="flex items-center gap-1 text-xs text-muted-foreground bg-muted px-2 py-1 rounded-full">
                        <Clock className="h-3 w-3" />
                        {step.duration}
                      </span>
                    </div>
                    <p className="text-sm text-muted-foreground">{step.description}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Tips */}
          <div className="rounded-xl bg-accent/50 border border-border p-5">
            <h4 className="font-semibold text-foreground mb-3">💡 Tips for a Great Experience</h4>
            <ul className="space-y-2">
              {tips.map((tip) => (
                <li key={tip} className="flex items-start gap-2 text-sm text-muted-foreground">
                  <span className="mt-1.5 h-1.5 w-1.5 rounded-full bg-primary shrink-0" />
                  {tip}
                </li>
              ))}
            </ul>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
