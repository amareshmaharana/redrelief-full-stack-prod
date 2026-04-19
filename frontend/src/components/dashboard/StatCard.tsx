import { cn } from '@/lib/utils';
import type { LucideIcon } from 'lucide-react';
import { TrendingUp, TrendingDown } from 'lucide-react';

interface StatCardProps {
  title: string;
  value: string | number;
  icon: LucideIcon;
  trend?: string;
  trendUp?: boolean;
  className?: string;
  iconClassName?: string;
}

export function StatCard({ title, value, icon: Icon, trend, trendUp, className, iconClassName }: StatCardProps) {
  return (
    <div className={cn('group relative overflow-hidden rounded-2xl border border-border bg-card p-5 transition-all duration-300 hover:shadow-elevated hover:-translate-y-0.5', className)}>
      <div className="flex items-start justify-between">
        <div className="space-y-1">
          <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">{title}</p>
          <p className="text-3xl font-bold text-foreground tracking-tight">{value}</p>
          {trend && (
            <div className={cn('flex items-center gap-1 text-xs font-medium', trendUp ? 'text-success' : 'text-destructive')}>
              {trendUp ? <TrendingUp className="h-3 w-3" /> : <TrendingDown className="h-3 w-3" />}
              {trend}
            </div>
          )}
        </div>
        <div className={cn('rounded-2xl p-3 transition-colors', iconClassName ?? 'bg-primary/10 group-hover:bg-primary/15')}>
          <Icon className={cn('h-6 w-6', iconClassName ? 'text-primary-foreground' : 'text-primary')} />
        </div>
      </div>
      {/* Decorative accent */}
      <div className="absolute bottom-0 left-0 h-1 w-full bg-gradient-to-r from-primary/0 via-primary/20 to-primary/0 opacity-0 group-hover:opacity-100 transition-opacity" />
    </div>
  );
}
