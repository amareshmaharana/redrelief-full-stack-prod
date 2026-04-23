import cors from "cors";
import express from "express";
import rateLimit from "express-rate-limit";
import { env } from "./config/env";
import { authRoutes } from "./modules/auth/auth.routes";
import { profileRoutes } from "./modules/profile/profile.routes";
import { notificationRoutes } from "./modules/notification/notification.routes";
import { donorRoutes } from "./modules/donor/donor.routes";
import { recipientRoutes } from "./modules/recipient/recipient.routes";
import { hospitalRoutes } from "./modules/hospital/hospital.routes";
import { clinicRoutes } from "./modules/clinic/clinic.routes";
import { adminRoutes } from "./modules/admin/admin.routes";
import { publicRoutes } from "./modules/public/public.routes";
import { notFound, errorHandler } from "./middleware/error-handler";

export const app = express();

const allowedOrigins = env.CORS_ORIGIN.split(",")
  .map((origin) => origin.trim())
  .filter(Boolean);

app.use(
  cors({
    origin: (origin, callback) => {
      if (!origin || allowedOrigins.includes(origin)) {
        callback(null, true);
        return;
      }
      callback(new Error(`Origin ${origin} is not allowed by CORS.`));
    },
    credentials: true,
  }),
);

app.use(
  rateLimit({
    windowMs: 60 * 1000,
    max: 120,
    standardHeaders: true,
    legacyHeaders: false,
  }),
);

app.use(express.json({ limit: "1mb" }));
app.use(express.urlencoded({ extended: true }));

app.get("/health", (_req, res) => {
  res.json({ success: true, data: { status: "ok" } });
});

app.use("/api", authRoutes);
app.use("/api/user", profileRoutes);
app.use("/api/notifications", notificationRoutes);
app.use("/api/donor", donorRoutes);
app.use("/api/recipient", recipientRoutes);
app.use("/api/hospital", hospitalRoutes);
app.use("/api/clinic", clinicRoutes);
app.use("/api/admin", adminRoutes);
app.use("/api/public", publicRoutes);

app.use(notFound);
app.use(errorHandler);
