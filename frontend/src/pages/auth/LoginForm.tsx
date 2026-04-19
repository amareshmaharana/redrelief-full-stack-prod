import { useEffect, useState } from "react";
import { Link, useNavigate, useSearchParams } from "react-router-dom";
import { ArrowRight, Mail, Phone } from "lucide-react";
import { motion } from "framer-motion";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { authApi } from "@/lib/backend-api";
import { setAuthSession } from "@/lib/auth-session";
import type { UserRole } from "@/types";

type LoginMethod = "email" | "mobile";
type LoginRole = UserRole | "auto";

const validRoles: LoginRole[] = ["auto", "admin", "donor", "recipient", "hospital", "clinic"];

function isLoginRole(value: string | null): value is LoginRole {
  return Boolean(value && validRoles.includes(value as LoginRole));
}

export default function LoginForm() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const [loginMethod, setLoginMethod] = useState<LoginMethod>("email");
  const [mobile, setMobile] = useState("");
  const [email, setEmail] = useState("");
  const [role, setRole] = useState<LoginRole>("auto");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);

  const passwordRequired = role === "admin" || role === "hospital" || role === "clinic";

  useEffect(() => {
    const roleParam = searchParams.get("role");
    if (isLoginRole(roleParam)) {
      setRole(roleParam);
    } else {
      setRole("auto");
    }
  }, [searchParams]);

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    setLoading(true);

    try {
      const payload: Record<string, unknown> = {
        ...(role === "auto" ? {} : { role }),
        ...(passwordRequired ? { password } : {}),
      };

      if (loginMethod === "email") {
        payload.email = email;
      } else {
        payload.mobile = mobile;
      }

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
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
          <div className="mb-6 text-center space-y-2">
            <h1 className="text-2xl font-bold text-foreground">
              {role === "auto" ? "Login (Auto Detect Role)" : `Login as ${role.charAt(0).toUpperCase() + role.slice(1)}`}
            </h1>
            <p className="text-sm text-muted-foreground">
              {role === "auto"
                ? "Role will be detected automatically from your account."
                : "You selected this role in access chooser."}
            </p>
            <Link to="/login" className="text-xs font-medium text-primary hover:underline">
              Change role
            </Link>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label>Login with</Label>
              <div className="flex overflow-hidden rounded-lg border border-border">
                <button
                  type="button"
                  className={`flex-1 flex items-center justify-center gap-2 py-2 text-sm font-medium transition-colors ${
                    loginMethod === "email"
                      ? "bg-primary text-primary-foreground"
                      : "bg-background text-muted-foreground hover:bg-muted"
                  }`}
                  onClick={() => setLoginMethod("email")}
                >
                  <Mail className="h-4 w-4" />
                  Email
                </button>
                <button
                  type="button"
                  className={`flex-1 flex items-center justify-center gap-2 py-2 text-sm font-medium transition-colors ${
                    loginMethod === "mobile"
                      ? "bg-primary text-primary-foreground"
                      : "bg-background text-muted-foreground hover:bg-muted"
                  }`}
                  onClick={() => setLoginMethod("mobile")}
                >
                  <Phone className="h-4 w-4" />
                  Mobile
                </button>
              </div>
            </div>

            {loginMethod === "email" ? (
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
            ) : (
              <div className="space-y-2">
                <Label>Mobile Number</Label>
                <Input
                  type="tel"
                  value={mobile}
                  onChange={(event) => setMobile(event.target.value)}
                  placeholder="+919876543210"
                  required
                />
              </div>
            )}

            {passwordRequired && (
              <div className="space-y-2">
                <Label>Password</Label>
                <Input
                  type="password"
                  value={password}
                  onChange={(event) => setPassword(event.target.value)}
                  placeholder="Enter password"
                  required
                />
              </div>
            )}

            <Button className="w-full gap-2" type="submit" disabled={loading}>
              {loading ? "Signing in..." : "Sign In"}
              <ArrowRight className="h-4 w-4" />
            </Button>
          </form>

          <div className="pt-4 text-center text-sm text-muted-foreground space-y-1">
            <p>
              Forgot password?{" "}
              <Link to="/forgot-password" className="text-primary hover:underline">
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
