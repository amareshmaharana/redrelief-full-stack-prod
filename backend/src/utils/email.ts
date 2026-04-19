import nodemailer from "nodemailer";
import { Resend } from "resend";
import { env } from "../config/env";

const hasResend = Boolean(env.RESEND_API_KEY && env.RESEND_FROM_EMAIL);
const hasSmtp = Boolean(env.SMTP_HOST && env.SMTP_PORT && env.SMTP_USER && env.SMTP_PASS);

const resend = env.RESEND_API_KEY ? new Resend(env.RESEND_API_KEY) : null;

const transporter = hasSmtp
  ? nodemailer.createTransport({
      host: env.SMTP_HOST,
      port: env.SMTP_PORT,
      secure: env.SMTP_PORT === 465,
      auth: {
        user: env.SMTP_USER,
        pass: env.SMTP_PASS,
      },
    })
  : null;

type EmailParams = {
  to: string;
  subject: string;
  html: string;
  text?: string;
};

export async function sendEmail({ to, subject, html, text }: EmailParams) {
  if (hasResend) {
    const { error } = await resend!.emails.send({
      from: env.RESEND_FROM_EMAIL!,
      to: [to],
      subject,
      html,
      text,
    });

    if (error) {
      throw new Error(`Resend failed: ${error.message}`);
    }

    return;
  }

  if (transporter) {
    await transporter.sendMail({
      from: env.SMTP_FROM ?? env.SMTP_USER,
      to,
      subject,
      html,
      text,
    });
    return;
  }

  console.info(`[email:${subject}] ${to}`);
  console.info(text ?? html);
}