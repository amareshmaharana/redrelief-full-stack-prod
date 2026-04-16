import type { Request, Response } from "express";
import { asyncHandler } from "../../utils/async-handler";
import { ok } from "../../utils/api-response";
import { AppError } from "../../utils/app-error";
import { createBloodRequest, listBloodRequestsForUser } from "../request/request.service";
import { listStock } from "../bloodStock/blood-stock.service";

export const recipientStock = asyncHandler(async (_req: Request, res: Response) => {
  res.json(ok(await listStock()));
});

export const recipientRequestStatus = asyncHandler(async (req: Request, res: Response) => {
  const userId = req.user?.id;
  if (!userId) {
    throw new AppError(401, "Authentication required.");
  }
  res.json(ok(await listBloodRequestsForUser(userId, "recipient")));
});

export const recipientCreateRequest = asyncHandler(async (req: Request, res: Response) => {
  const userId = req.user?.id;
  const role = req.user?.role;
  if (!userId || !role) {
    throw new AppError(401, "Authentication required.");
  }

  const created = await createBloodRequest(userId, role, {
    blood_group: String(req.body?.blood_group ?? ""),
    units_required: String(req.body?.units_required ?? "1"),
    admin_message: req.body?.admin_message ? String(req.body.admin_message) : undefined,
  });

  res.status(201).json(ok(created, "Blood request submitted."));
});
