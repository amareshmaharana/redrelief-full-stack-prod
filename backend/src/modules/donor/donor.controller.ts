import type { Request, Response } from "express";
import type { Role } from "../../models/domain";
import { CampModel } from "../../models/camp";
import { asyncHandler } from "../../utils/async-handler";
import { ok } from "../../utils/api-response";
import { AppError } from "../../utils/app-error";
import { createDonationRequest, listDonationRequestsForUser } from "../request/request.service";

type AuthenticatedRequest = Request & {
  user?: {
    id: number;
    role: Role;
  };
};

export const donorCamps = asyncHandler(async (_req: Request, res: Response) => {
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

export const donorRequestStatus = asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
  const userId = req.user?.id;
  if (!userId) {
    throw new AppError(401, "Authentication required.");
  }
  const rows = await listDonationRequestsForUser(userId);
  res.json(ok(rows));
});

export const donorCreateRequest = asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
  const userId = req.user?.id;
  if (!userId) {
    throw new AppError(401, "Authentication required.");
  }

  const created = await createDonationRequest(userId, {
    blood_group: String(req.body?.blood_group ?? ""),
    camp: req.body?.camp ? String(req.body.camp) : undefined,
    admin_message: req.body?.admin_message ? String(req.body.admin_message) : undefined,
  });

  res.status(201).json(ok(created, "Donation request submitted."));
});
