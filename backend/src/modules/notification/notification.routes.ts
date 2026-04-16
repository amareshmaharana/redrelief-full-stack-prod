import { Router } from "express";
import { verifyToken } from "../../middleware/auth";
import { listNotifications, markRead } from "./notification.controller";

export const notificationRoutes = Router();

notificationRoutes.use(verifyToken);
notificationRoutes.get("/", listNotifications);
notificationRoutes.post("/mark-read", markRead);
