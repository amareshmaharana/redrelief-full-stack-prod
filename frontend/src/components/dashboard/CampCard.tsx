import { Calendar, MapPin, Clock, Users } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { formatCampLocation } from '@/lib/camp-location';
import type { BloodCamp } from '@/types';
import { cn } from '@/lib/utils';

const statusStyles: Record<string, string> = {
  upcoming: 'bg-info/10 text-info border-info/20',
  ongoing: 'bg-success/10 text-success border-success/20',
  completed: 'bg-muted text-muted-foreground border-border',
  cancelled: 'bg-destructive/10 text-destructive border-destructive/20',
};

export function CampCard({
  camp,
  showRegister,
  showView,
  actionLabel,
  onRegister,
  onView,
}: {
  camp: BloodCamp;
  showRegister?: boolean;
  showView?: boolean;
  actionLabel?: string;
  onRegister?: (campId: string) => void;
  onView?: (campId: string) => void;
}) {
  const spotsLeft = camp.maxDonors - camp.registeredDonors;
  const fillPercent = (camp.registeredDonors / camp.maxDonors) * 100;
  const shouldShowAction = showRegister || showView;
  const label = actionLabel ?? (showView ? 'View' : 'Register to Donate');

  return (
    <Card className="group overflow-hidden border-border transition-all duration-300 hover:shadow-elevated hover:-translate-y-0.5">
      {/* Top accent */}
      <div className="h-1 gradient-blood" />
      <CardContent className="p-5 space-y-4">
        <div className="flex items-start justify-between gap-2">
          <h3 className="text-base font-bold text-foreground leading-tight tracking-tight">{camp.name}</h3>
          <Badge variant="outline" className={cn('text-[10px] font-semibold shrink-0', statusStyles[camp.status])}>
            {camp.status.charAt(0).toUpperCase() + camp.status.slice(1)}
          </Badge>
        </div>

        <div className="space-y-2.5">
          <div className="flex items-center gap-2.5 text-sm text-muted-foreground">
            <Calendar className="h-4 w-4 text-primary shrink-0" />
            <span>{camp.date}</span>
          </div>
          <div className="flex items-center gap-2.5 text-sm text-muted-foreground">
            <Clock className="h-4 w-4 text-primary shrink-0" />
            <span>{camp.startTime} – {camp.endTime}</span>
          </div>
          <div className="flex items-center gap-2.5 text-sm text-muted-foreground">
            <MapPin className="h-4 w-4 text-primary shrink-0" />
            <span className="line-clamp-1">{formatCampLocation(camp.address, camp.city, camp.state)}</span>
          </div>
        </div>

        {/* Progress */}
        <div className="space-y-2 pt-1">
          <div className="flex items-center justify-between text-xs">
            <span className="flex items-center gap-1.5 text-muted-foreground">
              <Users className="h-3.5 w-3.5" /> {camp.registeredDonors} / {camp.maxDonors}
            </span>
            <span className="font-semibold text-foreground">{Math.round(fillPercent)}%</span>
          </div>
          <div className="h-2 w-full overflow-hidden rounded-full bg-muted">
            <div
              className="h-full rounded-full gradient-blood transition-all duration-500"
              style={{ width: `${fillPercent}%` }}
            />
          </div>
          <p className="text-[11px] text-muted-foreground">
            {spotsLeft > 0 ? `${spotsLeft} spots remaining` : 'Fully booked'}
          </p>
        </div>

        {shouldShowAction && camp.status !== 'completed' && (
          <Button
            className="w-full mt-1"
            size="sm"
            onClick={() => (showView ? onView?.(camp.id) : onRegister?.(camp.id))}
          >
            {label}
          </Button>
        )}
      </CardContent>
    </Card>
  );
}
