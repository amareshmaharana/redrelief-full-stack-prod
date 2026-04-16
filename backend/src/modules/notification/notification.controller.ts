import type { Request, Response } from "express";
import { NotificationModel } from "../../models/notification";
import { asyncHandler } from "../../utils/async-handler";
import { ok } from "../../utils/api-response";
import { AppError } from "../../utils/app-error";
import { mapNotification } from "../../utils/serializers";

export const listNotifications = asyncHandler(async (req: Request, res: Response) => {
  const userId = req.user?.id;
  if (!userId) {
    throw new AppError(401, "Authentication required.");
  }

  const list = await NotificationModel.find({ userId }).sort({ createdAt: -1 }).limit(50).lean();

  res.json(ok(list.map(mapNotification)));
});

export const markRead = asyncHandler(async (req: Request, res: Response) => {
  const userId = req.user?.id;
  if (!userId) {
    throw new AppError(401, "Authentication required.");
  }

  const markAll = Boolean(req.body?.mark_all);
  const ids = (req.body?.notification_ids as number[] | undefined) ?? [];

  await NotificationModel.updateMany(
    {
      userId,
      ...(markAll ? {} : { id: { $in: ids } }),
    },
    { $set: { isRead: true } },
  );

  res.json(ok({}, "Notifications updated."));
});
