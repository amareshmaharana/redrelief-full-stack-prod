import { cn } from '@/lib/utils';
import type { BloodGroup } from '@/types';

const groupColors: Record<BloodGroup, string> = {
  'A+': 'bg-primary/10 text-primary border-primary/20',
  'A-': 'bg-primary/10 text-primary border-primary/20',
  'B+': 'bg-info/10 text-info border-info/20',
  'B-': 'bg-info/10 text-info border-info/20',
  'AB+': 'bg-warning/10 text-warning border-warning/20',
  'AB-': 'bg-warning/10 text-warning border-warning/20',
  'O+': 'bg-success/10 text-success border-success/20',
  'O-': 'bg-success/10 text-success border-success/20',
};

export function BloodGroupTag({ group, className }: { group: BloodGroup; className?: string }) {
  return (
    <span className={cn('inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-bold', groupColors[group], className)}>
      {group}
    </span>
  );
}
