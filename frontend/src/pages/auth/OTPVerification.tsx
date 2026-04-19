import { useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { ArrowRight, Send } from "lucide-react";
import { motion } from "framer-motion";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import {
  InputOTP,
  InputOTPGroup,
  InputOTPSlot,
  InputOTPSeparator,
} from "@/components/ui/input-otp";
import { authApi } from "@/lib/backend-api";
import { setAuthSession } from "@/lib/auth-session";

interface OTPState {
  mobile?: string;
  email?: string;
  role?: string;
  purpose?: "register" | "password_reset";
  registrationPayload?: Record<string, unknown>;
}

const roleThemes: Record<string, {
  border: string;
  heading: string;
  activeBtn: string;
  sendBtn: string;
  verifyBtn: string;
  link: string;
}> = {
  admin: {
    border: "border-red-200",
    heading: "text-red-700",
    activeBtn: "bg-red-600 text-white hover:bg-red-700 border-red-600",
    sendBtn: "bg-red-600 text-white hover:bg-red-700",
    verifyBtn: "bg-red-600 text-white hover:bg-red-700",
    link: "text-red-600 hover:text-red-700",
  },
  donor: {
    border: "border-emerald-200",
    heading: "text-emerald-700",
    activeBtn: "bg-emerald-600 text-white hover:bg-emerald-700 border-emerald-600",
    sendBtn: "bg-emerald-600 text-white hover:bg-emerald-700",
    verifyBtn: "bg-emerald-600 text-white hover:bg-emerald-700",
    link: "text-emerald-600 hover:text-emerald-700",
  },
  recipient: {
    border: "border-indigo-200",
    heading: "text-indigo-700",
    activeBtn: "bg-indigo-600 text-white hover:bg-indigo-700 border-indigo-600",
    sendBtn: "bg-indigo-600 text-white hover:bg-indigo-700",
    verifyBtn: "bg-indigo-600 text-white hover:bg-indigo-700",
    link: "text-indigo-600 hover:text-indigo-700",
  },
  hospital: {
    border: "border-amber-200",
    heading: "text-amber-700",
    activeBtn: "bg-amber-600 text-white hover:bg-amber-700 border-amber-600",
    sendBtn: "bg-amber-600 text-white hover:bg-amber-700",
    verifyBtn: "bg-amber-600 text-white hover:bg-amber-700",
    link: "text-amber-600 hover:text-amber-700",
  },
  clinic: {
    border: "border-amber-200",
    heading: "text-amber-700",
    activeBtn: "bg-amber-600 text-white hover:bg-amber-700 border-amber-600",
    sendBtn: "bg-amber-600 text-white hover:bg-amber-700",
    verifyBtn: "bg-amber-600 text-white hover:bg-amber-700",
    link: "text-amber-600 hover:text-amber-700",
  },
};

const defaultTheme = {
  border: "border-border",
  heading: "text-foreground",
  activeBtn: "",
  sendBtn: "",
  verifyBtn: "",
  link: "text-primary",
};

export default function OTPVerification() {
  const navigate = useNavigate();
  const location = useLocation();
  const state = (location.state ?? {}) as OTPState;
  const theme = roleThemes[state.role ?? ""] ?? defaultTheme;

  const [mobile, setMobile] = useState(state.mobile ?? "");
  const [email, setEmail] = useState(state.email ?? "");
  const [useEmail, setUseEmail] = useState(state.mobile && !state.email ? false : true);
  const [purpose, setPurpose] = useState<"register" | "password_reset">(state.purpose ?? "register");
  const [otp, setOtp] = useState("");
  const [loading, setLoading] = useState(false);
  const [otpSent, setOtpSent] = useState(state.purpose === "register" ? false : !!state.email || !!state.mobile);
  const [sending, setSending] = useState(false);

  const identifier = useEmail ? email : mobile;

  const verifyOtp = async () => {
    if (!otpSent) {
      toast.error("Click Send OTP first.");
      return;
    }

    if (!identifier) {
      toast.error(useEmail ? "Email is required." : "Mobile number is required.");
      return;
    }
    if (otp.length !== 6) {
      toast.error("Enter the 6-digit OTP.");
      return;
    }

    setLoading(true);
    try {
      const payload = {
        ...(useEmail ? { email } : { mobile }),
        code: otp,
        purpose,
      };
      const response = await authApi.verifyOtp(payload);
      if (response.tokens && response.user) {
        setAuthSession({
          access: response.tokens.access,
          refresh: response.tokens.refresh,
          user: response.user,
        });
        toast.success("Login successful.");
        navigate(`/${response.user.role}`, { replace: true });
        return;
      }
      toast.success("OTP verified.");
      navigate("/login", { replace: true });
    } catch (error) {
      const message =
        error instanceof Error ? error.message : "OTP verification failed.";
      toast.error(message);
    } finally {
      setLoading(false);
    }
  };

  const sendOtp = async () => {
    if (!identifier) {
      toast.error(useEmail ? "Enter email first." : "Enter mobile number first.");
      return;
    }
    setSending(true);
    try {
      await authApi.sendOtp({
        ...(useEmail ? { email } : { mobile }),
        purpose,
        ...(purpose === "register"
          ? {
              role: state.role,
              registration_payload: state.registrationPayload,
            }
          : {}),
      });
      toast.success(`OTP sent to your ${useEmail ? "email" : "mobile"}.`);
      setOtpSent(true);
      setOtp("");
    } catch (error) {
      const message =
        error instanceof Error ? error.message : "Failed to send OTP.";
      toast.error(message);
    } finally {
      setSending(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-background p-6">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className={`w-full max-w-md space-y-6 rounded-2xl border ${theme.border} bg-card p-8`}
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
          
          <h1 className={`text-2xl font-bold ${theme.heading}`}>Verify OTP</h1>
          <p className="text-sm text-muted-foreground">
            {otpSent
              ? `Enter the 6-digit code sent to your ${useEmail ? "email" : "mobile"}`
              : "Send OTP to verify your identity"}
          </p>
        </div>

        <div className="flex gap-2">
          <Button
            type="button"
            variant={!useEmail ? "default" : "outline"}
            size="sm"
            className={`flex-1 ${!useEmail ? theme.activeBtn : ""}`}
            onClick={() => { setUseEmail(false); setOtpSent(false); setOtp(""); }}
          >
            Mobile (Optional)
          </Button>
          <Button
            type="button"
            variant={useEmail ? "default" : "outline"}
            size="sm"
            className={`flex-1 ${useEmail ? theme.activeBtn : ""}`}
            onClick={() => { setUseEmail(true); setOtpSent(false); setOtp(""); }}
          >
            Email
          </Button>
        </div>

        <div className="space-y-2">
          <label className="text-sm font-medium text-foreground">
            {useEmail ? "Email Address" : "Mobile Number"}
          </label>
          <div className="flex gap-2">
            <input
              className="flex-1 rounded-md border border-border bg-background px-3 py-2 text-sm"
              value={useEmail ? email : mobile}
              onChange={(event) => {
                if (useEmail) setEmail(event.target.value);
                else setMobile(event.target.value);
                setOtpSent(false);
              }}
              placeholder={useEmail ? "you@example.com" : "+919876543210"}
            />
            <Button
              type="button"
              size="sm"
              variant={otpSent ? "outline" : "default"}
              className={`shrink-0 gap-1.5 ${!otpSent ? theme.sendBtn : ""}`}
              disabled={sending || !identifier}
              onClick={sendOtp}
            >
              <Send className="h-3.5 w-3.5" />
              {sending ? "Sending..." : "Send OTP"}
            </Button>
          </div>
        </div>

        <div className="space-y-2">
          <label className="text-sm font-medium text-foreground">Purpose</label>
          <select
            className="w-full rounded-md border border-border bg-background px-3 py-2 text-sm"
            value={purpose}
            onChange={(event) =>
              setPurpose(event.target.value as "register" | "password_reset")
            }
          >
            <option value="register">Register</option>
            <option value="password_reset">Password Reset</option>
          </select>
        </div>

        <div className="flex justify-center">
          <InputOTP value={otp} onChange={setOtp} maxLength={6}>
            <InputOTPGroup>
              <InputOTPSlot index={0} />
              <InputOTPSlot index={1} />
              <InputOTPSlot index={2} />
            </InputOTPGroup>
            <InputOTPSeparator />
            <InputOTPGroup>
              <InputOTPSlot index={3} />
              <InputOTPSlot index={4} />
              <InputOTPSlot index={5} />
            </InputOTPGroup>
          </InputOTP>
        </div>

        {!otpSent && <p className="text-xs text-muted-foreground text-center">Click Send OTP first, then enter the code.</p>}

        <Button className={`w-full gap-2 ${theme.verifyBtn}`} disabled={loading || !otpSent} onClick={verifyOtp}>
          {loading ? "Verifying..." : "Verify OTP"}
          <ArrowRight className="h-4 w-4" />
        </Button>

        <p className="text-sm text-muted-foreground text-center">
          Back to{" "}
          <Link to="/login" className={`${theme.link} hover:underline`}>
            Sign in
          </Link>
        </p>
      </motion.div>
    </div>
  );
}
