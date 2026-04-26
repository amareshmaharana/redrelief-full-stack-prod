import { useEffect, useRef, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { ArrowRight, AlertCircle } from "lucide-react";
import { motion } from "framer-motion";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { authApi } from "@/lib/backend-api";
import { setAuthSession } from "@/lib/auth-session";

export default function LoginForm() {
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [detectedRole, setDetectedRole] = useState<string | null>(null);
  const [passwordRequired, setPasswordRequired] = useState(false);
  const [emailCheckingLoading, setEmailCheckingLoading] = useState(false);
  const emailCheckRequestId = useRef(0);

  const isValidEmailFormat = (emailValue: string): boolean => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(emailValue.trim());
  };

  useEffect(() => {
    const normalizedEmail = email.trim().toLowerCase();
    if (!normalizedEmail) {
      emailCheckRequestId.current += 1;
      setDetectedRole(null);
      setPasswordRequired(false);
      setEmailCheckingLoading(false);
      return;
    }

    const timeout = setTimeout(async () => {
      const requestId = ++emailCheckRequestId.current;
      setEmailCheckingLoading(true);

      try {
        const response = await authApi.checkEmailRole(normalizedEmail);
        if (requestId !== emailCheckRequestId.current) {
          return;
        }
        setDetectedRole(response.role);
        setPasswordRequired(response.requiresPassword);
      } catch {
        if (requestId !== emailCheckRequestId.current) {
          return;
        }
        setDetectedRole(null);
        setPasswordRequired(false);
      } finally {
        if (requestId === emailCheckRequestId.current) {
          setEmailCheckingLoading(false);
        }
      }
    }, 500);

    return () => clearTimeout(timeout);
  }, [email]);

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    setLoading(true);

    try {
      const normalizedEmail = email.trim().toLowerCase();
      const payload: Record<string, unknown> = {
        email: normalizedEmail,
        ...(password.trim() ? { password } : {}),
      };

      const response = await authApi.login(payload);
      setAuthSession({
        access: response.tokens.access,
        refresh: response.tokens.refresh,
        user: response.user,
      });
      toast.success("Login successful.");
      navigate(`/${response.user.role}`, { replace: true });
    } catch (error) {
      const message = error instanceof Error ? error.message : "Login failed.";
      toast.error(message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-background px-4 py-8 sm:px-6 lg:px-8">
      <div className="mx-auto w-full max-w-md rounded-3xl border border-border bg-card p-6 shadow-card sm:p-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <div className="mb-6 text-center space-y-2">
            <h1 className="text-2xl font-bold text-foreground">Login</h1>
            <p className="text-sm text-muted-foreground">
              Use your email or password to sign in.
            </p>
            <Link
              to="/login"
              className="text-xs font-medium text-primary hover:underline"
            >
              Back to sign-in options
            </Link>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label requiredMark>Email Address</Label>
              <Input
                type="email"
                value={email}
                onChange={(event) => setEmail(event.target.value)}
                placeholder="you@example.com"
                required
              />
              {detectedRole && (
                <motion.p
                  initial={{ opacity: 0, y: -8 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="text-xs font-medium text-muted-foreground"
                >
                  Login with{" "}
                  <span className="font-semibold text-emerald-600">
                    {detectedRole}
                  </span>
                </motion.p>
              )}
              {!detectedRole &&
                email &&
                !emailCheckingLoading &&
                isValidEmailFormat(email) && (
                  <motion.p
                    initial={{ opacity: 0, y: -8 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="text-xs font-medium text-red-600 flex items-center gap-1"
                  >
                    <AlertCircle className="h-3 w-3" /> User not found
                  </motion.p>
                )}
            </div>

            <div className="space-y-2">
              <Label {...(passwordRequired ? { requiredMark: true } : {})}>
                Password{!passwordRequired && " (Optional)"}
              </Label>
              <Input
                type="password"
                value={password}
                onChange={(event) => setPassword(event.target.value)}
                placeholder="Enter password"
                required={passwordRequired}
              />
            </div>

            <Button
              className="w-full gap-2"
              type="submit"
              disabled={loading || !detectedRole}
            >
              {loading ? "Signing in..." : "Sign In"}
              <ArrowRight className="h-4 w-4" />
            </Button>
          </form>

          <div className="pt-4 text-center text-sm text-muted-foreground space-y-1">
            <p>
              Forgot password?{" "}
              <Link
                to="/forgot-password"
                className="text-primary hover:underline"
              >
                Reset here
              </Link>
            </p>
            <p>
              New user?{" "}
              <Link to="/register" className="text-primary hover:underline">
                Create account
              </Link>
            </p>
          </div>
        </motion.div>
      </div>
    </div>
  );
}
