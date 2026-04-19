import { useMemo } from "react";
import { Link } from "react-router-dom";
import { Building2, Heart, Lock, Droplets, Shield, ArrowRight } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { cn } from "@/lib/utils";
import type { UserRole } from "@/types";

const roleCards: Array<{
  role: UserRole;
  label: string;
  description: string;
  icon: React.ComponentType<{ className?: string }>;
  gradient: string;
}> = [
  {
    role: "donor",
    label: "Donor",
    description: "Save lives through nearby camps and donation tracking.",
    icon: Heart,
    gradient: "from-emerald-600 via-emerald-500 to-teal-500",
  },
  {
    role: "recipient",
    label: "Recipient",
    description: "Request blood and track availability with confidence.",
    icon: Droplets,
    gradient: "from-blue-600 via-indigo-600 to-violet-500",
  },
  {
    role: "hospital",
    label: "Hospital",
    description: "Manage stock and review urgent blood requests.",
    icon: Shield,
    gradient: "from-amber-500 via-orange-500 to-red-500",
  },
  {
    role: "clinic",
    label: "Clinic",
    description: "Maintain local inventory and submit requests quickly.",
    icon: Building2,
    gradient: "from-rose-500 via-red-500 to-red-600",
  },
  {
    role: "admin",
    label: "Admin",
    description: "Oversee users, camps, requests, and overall operations.",
    icon: Lock,
    gradient: "from-slate-700 via-rose-700 to-red-700",
  },
];

export function RoleAccessChooser({
  mode,
  role,
  onRoleChange,
}: {
  mode: "login" | "register";
  role: string;
  onRoleChange: (role: string) => void;
}) {
  const chosen = useMemo(() => roleCards.find((item) => item.role === role) ?? roleCards[0], [role]);
  const selectedLabel = role === "auto" ? "Auto Detect" : chosen.label;

  return (
    <Card className="overflow-hidden border-border shadow-elevated">
      <div className="h-1 gradient-blood" />
      <CardContent className="space-y-5 p-5 sm:p-6">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.22em] text-muted-foreground">
            Choose your access role
          </p>
          <h2 className="mt-2 text-xl font-bold text-foreground sm:text-2xl">
            {mode === "register" ? `Register as ${selectedLabel}` : `Login as ${selectedLabel}`}
          </h2>
          <p className="mt-2 text-sm text-muted-foreground">
            {mode === "login"
              ? "Auto Detect is the default. Use your account email/mobile and role will be detected automatically."
              : "Pick the role from the dropdown card. Then continue with the matching register flow."}
          </p>
        </div>

        <div className="rounded-2xl border bg-card p-4 shadow-sm">
          <div className="space-y-2">
            <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Role selector</p>
            <Select value={role} onValueChange={onRoleChange}>
              <SelectTrigger className="h-12 rounded-xl">
                <SelectValue placeholder="Select a role" />
              </SelectTrigger>
              <SelectContent>
                {mode === "login" && <SelectItem value="auto">Auto Detect</SelectItem>}
                {roleCards.map((item) => (
                  <SelectItem key={item.role} value={item.role}>
                    {item.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div
            className={cn(
              "mt-4 rounded-2xl border border-transparent p-4 text-white shadow-lg",
              role === "auto" ? "bg-gradient-to-br from-slate-700 via-slate-600 to-slate-500" : `bg-gradient-to-br ${chosen.gradient}`,
            )}
          >
            <div className="flex items-start justify-between gap-3">
              <div>
                <p className="text-xs font-semibold uppercase tracking-wider text-white/80">Selected role</p>
                <h3 className="mt-1 text-xl font-bold">{selectedLabel}</h3>
                <p className="mt-2 text-sm leading-6 text-white/90">
                  {role === "auto"
                    ? "Best for email login. The system checks your account and picks your role automatically."
                    : chosen.description}
                </p>
              </div>
              {role !== "auto" && (
                <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-white/15 text-white">
                  <chosen.icon className="h-5 w-5" />
                </span>
              )}
            </div>
          </div>
        </div>

        <div className="rounded-2xl border border-dashed border-border bg-muted/30 p-4">
          <p className="text-sm font-semibold text-foreground">
            {mode === "register" ? "Ready to create your account?" : "Ready to sign in?"}
          </p>
          <p className="mt-1 text-xs text-muted-foreground">
            The selected role will shape the form fields and the page heading.
          </p>
          <div className="mt-4 flex flex-col gap-3 sm:flex-row">
            <Button asChild className="w-full sm:flex-1">
              <Link to={`/${mode}/form?role=${role}`}>
                {mode === "register" ? `Register as ${selectedLabel}` : `Login as ${selectedLabel}`}
                <ArrowRight className="ml-2 h-4 w-4" />
              </Link>
            </Button>
            <Button asChild variant="outline" className="w-full sm:flex-1">
              <Link to={`/${mode === "register" ? "login" : "register"}?role=${role}`}>
                {mode === "register" ? "Go to Login" : "Go to Register"}
              </Link>
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
