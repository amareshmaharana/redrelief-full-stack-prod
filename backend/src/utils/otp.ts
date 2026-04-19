import { Resend } from "resend";
import { env } from "../config/env";

const hasResend = Boolean(env.RESEND_API_KEY && env.RESEND_FROM_EMAIL);

const resend = env.RESEND_API_KEY ? new Resend(env.RESEND_API_KEY) : null;

export function generateOtpCode() {
  return `${Math.floor(100000 + Math.random() * 900000)}`;
}

async function sendOtpWithResend(email: string, code: string, purpose: string) {
  if (!resend || !env.RESEND_FROM_EMAIL) {
    throw new Error("Resend API key or FROM email not configured");
  }

  const { data, error } = await resend.emails.send({
    from: env.RESEND_FROM_EMAIL,
    to: [email],
    subject: `RedRelief OTP for ${purpose}`,
    html: `<p>Your OTP is <strong>${code}</strong>. It expires in 10 minutes.</p>`,
  });

  if (error) {
    throw new Error(`Resend failed: ${error.message}`);
  }

  return data;
}

export async function sendOtp(target: { email?: string; phone?: string }, code: string, purpose: string) {
  if (target.email) {
    if (!hasResend) {
      throw new Error("Resend is not configured. Set RESEND_API_KEY and RESEND_FROM_EMAIL.");
    }

    try {
      await sendOtpWithResend(target.email, code, purpose);
      return;
    } catch (error) {
      console.error("OTP email delivery failed via Resend.", error);
      throw new Error("OTP email delivery failed. Please use a verified sender domain.");
    }
  }

  throw new Error("SMS OTP provider is not configured. Please use email for OTP.");
}

export async function sendPasswordResetEmail(email: string, resetLink: string) {
  if (!resend || !env.RESEND_FROM_EMAIL) {
    throw new Error("Resend API key or FROM email not configured");
  }

  const { error } = await resend.emails.send({
    from: env.RESEND_FROM_EMAIL,
    to: [email],
    subject: "Reset your RedRelief password",
    html: `
      <div style="font-family: Arial, sans-serif; line-height: 1.6; color: #1f2937;">
        <h2 style="margin-bottom: 8px;">Reset your password</h2>
        <p style="margin-top: 0;">We received a request to reset your RedRelief account password.</p>
        <p>
          <a href="${resetLink}" style="display:inline-block;padding:10px 16px;background:#dc2626;color:#fff;text-decoration:none;border-radius:6px;">
            Reset Password
          </a>
        </p>
        <p>This link is valid for 30 minutes. If you did not request this, you can safely ignore this email.</p>
      </div>
    `,
  });

  if (error) {
    throw new Error(`Resend failed: ${error.message}`);
  }
}
