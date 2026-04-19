import { useState } from "react";
import { Link } from "react-router-dom";
import { ArrowRight } from "lucide-react";
import { motion } from "framer-motion";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { authApi } from "@/lib/backend-api";

export default function ForgotPassword() {
  const [submitted, setSubmitted] = useState(false);
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);

  const requestReset = async (event: React.FormEvent) => {
    event.preventDefault();
    setLoading(true);
    try {
      await authApi.forgotPasswordRequest(email);
      setSubmitted(true);
      toast.success("Password reset link sent.");
    } catch (error) {
      const message =
        error instanceof Error ? error.message : "Failed to send reset link.";
      toast.error(message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-background p-6">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-md space-y-6 rounded-2xl border border-border bg-card p-8"
      >
        <div className="text-center space-y-2">
          <Link
            to="/"
            className="inline-flex items-center gap-2 text-foreground"
          >
            <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-orange-200">
              <img src="/bdms-logo.png" className="h-5 w-6" />
            </div>
            <span className="text-2xl font-extrabold">
              Red<span className="text-red-800">Relief</span>
            </span>
          </Link>
          <h1 className="text-2xl font-bold text-foreground">
            Forgot Password
          </h1>
          <p className="text-sm text-muted-foreground">
            Enter your registered email to receive a secure password reset link.
          </p>
        </div>

        {!submitted ? (
          <form onSubmit={requestReset} className="space-y-4">
            <div className="space-y-2">
              <Label>Email Address</Label>
              <Input
                type="email"
                value={email}
                onChange={(event) => setEmail(event.target.value)}
                placeholder="you@example.com"
                required
              />
            </div>
            <Button className="w-full gap-2" type="submit" disabled={loading}>
              {loading ? "Sending reset link..." : "Reset Password"}
              <ArrowRight className="h-4 w-4" />
            </Button>
          </form>
        ) : (
          <div className="rounded-lg border border-border bg-muted/30 p-4 text-sm text-muted-foreground">
            Check your email for a secure reset link. If an account exists for <strong>{email}</strong>,
            you will receive instructions to reset your password.
          </div>
        )}

        <p className="text-sm text-muted-foreground text-center">
          Back to{" "}
          <Link to="/login" className="text-primary hover:underline">
            Sign in
          </Link>
        </p>
      </motion.div>
    </div>
  );
}
