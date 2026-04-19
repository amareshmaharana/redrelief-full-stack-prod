import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import type { BackendUser } from "@/lib/auth-session";
import { User, Phone, Mail, Shield, Calendar } from "lucide-react";

interface ViewUserDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  user: (BackendUser & { is_active?: boolean; is_verified?: boolean; date_joined?: string }) | null;
}

export function ViewUserDialog({ open, onOpenChange, user }: ViewUserDialogProps) {
  if (!user) return null;

  const fields = [
    { icon: User, label: "Full Name", value: user.full_name },
    { icon: Phone, label: "Mobile", value: user.mobile },
    { icon: Mail, label: "Email", value: user.email || "—" },
    { icon: Shield, label: "Role", value: user.role.charAt(0).toUpperCase() + user.role.slice(1) },
    { icon: Calendar, label: "Joined", value: user.date_joined ? new Date(user.date_joined).toLocaleDateString() : "—" },
  ];

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>User Details</DialogTitle>
        </DialogHeader>
        <div className="space-y-4">
          {/* Avatar */}
          <div className="flex items-center gap-4">
            <div className="h-14 w-14 rounded-full gradient-blood flex items-center justify-center text-xl font-bold text-primary-foreground">
              {user.full_name[0]}
            </div>
            <div>
              <p className="text-lg font-semibold text-foreground">{user.full_name}</p>
              <div className="flex gap-2 mt-1">
                <Badge variant={user.is_verified ? "default" : "secondary"} className="text-[10px]">
                  {user.is_verified ? "Verified" : "Pending"}
                </Badge>
                <Badge variant={user.is_active ? "default" : "destructive"} className="text-[10px]">
                  {user.is_active ? "Active" : "Inactive"}
                </Badge>
              </div>
            </div>
          </div>

          {/* Details */}
          <div className="rounded-lg border border-border divide-y divide-border">
            {fields.map((f) => (
              <div key={f.label} className="flex items-center gap-3 px-4 py-3">
                <f.icon className="h-4 w-4 text-muted-foreground shrink-0" />
                <div className="flex-1 min-w-0">
                  <p className="text-[11px] text-muted-foreground font-medium uppercase tracking-wider">{f.label}</p>
                  <p className="text-sm font-medium text-foreground truncate">{f.value}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
