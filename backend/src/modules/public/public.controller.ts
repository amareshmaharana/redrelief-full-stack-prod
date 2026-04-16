import type { Request, Response } from "express";
import { CampModel } from "../../models/camp";
import { BloodStockModel } from "../../models/blood-stock";
import { asyncHandler } from "../../utils/async-handler";
import { ok } from "../../utils/api-response";
import { AppError } from "../../utils/app-error";
import { stockSummary } from "../bloodStock/blood-stock.service";
import { sendEmail } from "../../utils/email";
import { z } from "zod";
import { connectMongo } from "../../config/mongodb";
import { NewsletterSubscriberModel } from "../../models/newsletter-subscriber";

export const listPublicCamps = asyncHandler(async (_req: Request, res: Response) => {
  const camps = await CampModel.find().sort({ date: 1 }).lean();
  res.json(
    ok(
      camps.map((camp) => ({
        id: camp.id,
        camp_name: camp.campName,
        location: camp.location,
        date: camp.date.toISOString().slice(0, 10),
        description: camp.description,
      })),
    ),
  );
});

export const getPublicStockSummary = asyncHandler(async (_req: Request, res: Response) => {
  res.json(ok(await stockSummary()));
});

export const getPublicStockHealth = asyncHandler(async (_req: Request, res: Response) => {
  const today = new Date();
  const todayStart = new Date(Date.UTC(today.getUTCFullYear(), today.getUTCMonth(), today.getUTCDate()));

  const stock = await BloodStockModel.find().lean();
  const expired = stock.filter((item) => item.expiryDate < todayStart).length;
  const available = stock.filter((item) => item.expiryDate >= todayStart && item.unitsAvailable >= 10).length;
  const low = stock.filter((item) => item.expiryDate >= todayStart && item.unitsAvailable > 0 && item.unitsAvailable < 10).length;
  const total_units = stock
    .filter((item) => item.expiryDate >= todayStart)
    .reduce((sum, item) => sum + item.unitsAvailable, 0);

  res.json(
    ok({
      available,
      low,
      expired,
      total_units,
      updated_at: new Date().toISOString(),
    }),
  );
});

const subscribeSchema = z.object({
  email: z.string().email(),
});

function formatGreeting(email: string) {
  const localPart = email.split("@")[0] ?? "there";
  const cleaned = localPart.replace(/[._-]+/g, " ").trim();
  if (!cleaned) {
    return "there";
  }

  return cleaned
    .split(/\s+/)
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1).toLowerCase())
    .join(" ");
}

export const subscribeNewsletter = asyncHandler(async (req: Request, res: Response) => {
  const payload = subscribeSchema.parse(req.body);
  const greeting = formatGreeting(payload.email);

  if (process.env.MONGODB_URI) {
    await connectMongo();
    await NewsletterSubscriberModel.updateOne(
      { email: payload.email },
      {
        $set: {
          email: payload.email,
          name: greeting,
          source: "footer",
        },
      },
      { upsert: true },
    );
  }

  try {
    await sendEmail({
      to: payload.email,
      subject: "Welcome to RedRelief",
      html: `
        <div style="font-family: Arial, sans-serif; line-height: 1.6; color: #1f2937;">
          <h2 style="color: #dc2626; margin-bottom: 12px;">Welcome, ${greeting}!</h2>
          <p>Thanks for subscribing to RedRelief updates.</p>
          <p>You’ll now receive blood camp announcements, urgent request alerts, and community updates directly in your inbox.</p>
          <p style="margin-top: 24px;">Together, we can help save lives.</p>
          <p style="margin-top: 24px; color: #6b7280;">- RedRelief Team</p>
        </div>
      `,
      text: `Welcome, ${greeting}! Thanks for subscribing to RedRelief updates.`,
    });
  } catch (error) {
    console.error("Newsletter subscribe email failed:", error);
    throw new AppError(500, "Unable to send welcome email right now.");
  }

  res.json(ok({}, `Welcome email sent to ${payload.email}.`));
});
