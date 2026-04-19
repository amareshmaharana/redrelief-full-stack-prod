import { useEffect, useState } from "react";
import { Link, useSearchParams } from "react-router-dom";
import { motion } from "framer-motion";

import { RoleAccessChooser } from "@/components/public/RoleAccessChooser";
import type { UserRole } from "@/types";

export default function Register() {
  const [searchParams] = useSearchParams();
  const [role, setRole] = useState<UserRole>("donor");

  useEffect(() => {
    const roleParam = searchParams.get("role") as UserRole | null;
    if (roleParam) {
      setRole(roleParam);
    }
  }, [searchParams]);

  const handleRoleChange = (nextRole: string) => {
    setRole(nextRole as UserRole);
  };

  return (
    <div className="min-h-screen bg-background px-4 py-8 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-4xl space-y-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="rounded-3xl border border-border bg-card p-6 shadow-card sm:p-8"
        >
          <div className="text-center space-y-2">
            <Link to="/" className="inline-flex items-center gap-2 text-foreground">
              <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-orange-200">
                <img src="/bdms-logo.png" className="h-5 w-6" />
              </div>
              <span className="text-2xl font-extrabold">
                Red<span className="text-red-800">Relief</span>
              </span>
            </Link>
            <h1 className="text-2xl font-bold text-foreground sm:text-3xl">Register Access</h1>
            <p className="text-sm text-muted-foreground">
              Select role first. Registration form will open on the next route.
            </p>
          </div>

          <div className="mt-6">
            <RoleAccessChooser mode="register" role={role} onRoleChange={handleRoleChange} />
          </div>
        </motion.div>
      </div>
    </div>
  );
}
