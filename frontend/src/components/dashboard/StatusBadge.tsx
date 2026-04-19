import { cn } from '@/lib/utils';
import type { RequestStatus, DonationStatus } from '@/types';

type AnyStatus = RequestStatus | DonationStatus;

const statusConfig: Record<AnyStatus, { label: string; className: string }> = {
  pending: { label: 'Pending', className: 'bg-warning/10 text-warning border-warning/20' },
  approved: { label: 'Approved', className: 'bg-success/10 text-success border-success/20' },
  rejected: { label: 'Rejected', className: 'bg-destructive/10 text-destructive border-destructive/20' },
  fulfilled: { label: 'Fulfilled', className: 'bg-info/10 text-info border-info/20' },
  completed: { label: 'Completed', className: 'bg-success/10 text-success border-success/20' },
};

export function StatusBadge({ status, className }: { status: AnyStatus; className?: string }) {
  const config = statusConfig[status];
  return (
    <span className={cn('inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold', config.className, className)}>
      {config.label}
    </span>
  );
}
