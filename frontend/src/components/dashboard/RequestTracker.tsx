import { cn } from '@/lib/utils';
import { Check } from 'lucide-react';

interface Step {
  label: string;
  description?: string;
}

interface RequestTrackerProps {
  steps: Step[];
  currentStep: number;
  className?: string;
}

export function RequestTracker({ steps, currentStep, className }: RequestTrackerProps) {
  return (
    <div className={cn('flex items-center', className)}>
      {steps.map((step, index) => {
        const isCompleted = index < currentStep;
        const isCurrent = index === currentStep;
        return (
          <div key={index} className="flex flex-1 items-center">
            <div className="flex flex-col items-center">
              <div
                className={cn(
                  'flex h-8 w-8 items-center justify-center rounded-full border-2 text-sm font-bold transition-colors',
                  isCompleted && 'border-success bg-success text-success-foreground',
                  isCurrent && 'border-primary bg-primary text-primary-foreground animate-pulse-gentle',
                  !isCompleted && !isCurrent && 'border-muted-foreground/30 text-muted-foreground'
                )}
              >
                {isCompleted ? <Check className="h-4 w-4" /> : index + 1}
              </div>
              <p className={cn('mt-1 text-xs font-medium', isCurrent ? 'text-primary' : 'text-muted-foreground')}>
                {step.label}
              </p>
            </div>
            {index < steps.length - 1 && (
              <div className={cn('mx-2 h-0.5 flex-1', isCompleted ? 'bg-success' : 'bg-border')} />
            )}
          </div>
        );
      })}
    </div>
  );
}
