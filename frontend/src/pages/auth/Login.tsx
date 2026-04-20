import { Link } from "react-router-dom";
import { motion } from "framer-motion";

import { Button } from "@/components/ui/button";

export default function Login() {
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
            <h1 className="text-2xl font-bold text-foreground sm:text-3xl">Sign In</h1>
            <p className="text-sm text-muted-foreground">
              Use your email and password. Your role is detected automatically from your account.
            </p>
          </div>

          <div className="mt-6">
            <div className="rounded-3xl border border-border bg-card p-6 shadow-elevated text-center">
              <p className="text-sm text-muted-foreground">
                Continue to the login form to sign in with automatic role detection.
              </p>
              <Button asChild className="mt-4">
                <Link to="/login/form">Continue</Link>
              </Button>
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
}
