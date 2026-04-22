import type { Request, Response } from "express";
import type { Role } from "../../models/domain";
import { asyncHandler } from "../../utils/async-handler";
import { ok } from "../../utils/api-response";
import { AppError } from "../../utils/app-error";
import { createBloodRequest, listBloodRequestsForUser } from "../request/request.service";
import { addStock, deleteStock, listStock, updateStock } from "../bloodStock/blood-stock.service";

type AuthenticatedRequest = Request & {
  user?: {
    id: number;
    role: Role;
  };
};

export const clinicStock = asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
  const userId = req.user?.id;
  if (!userId) {
    throw new AppError(401, "Authentication required.");
  }
  res.json(ok(await listStock(userId)));
});

export const clinicRequestStatus = asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
  const userId = req.user?.id;
  if (!userId) {
    throw new AppError(401, "Authentication required.");
  }
  res.json(ok(await listBloodRequestsForUser(userId, "clinic")));
});

export const clinicCreateRequest = asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
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

export const clinicAddStock = asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
  const userId = req.user?.id;
  if (!userId) {
    throw new AppError(401, "Authentication required.");
  }

  const created = await addStock({
    hospitalId: userId,
    blood_group: String(req.body?.blood_group ?? ""),
    units: Number(req.body?.units ?? 0),
    expiry_date: String(req.body?.expiry_date ?? new Date().toISOString().slice(0, 10)),
  });

  res.status(201).json(ok(created, "Stock added."));
});

export const clinicUpdateStock = asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
  const userId = req.user?.id;
  if (!userId) {
    throw new AppError(401, "Authentication required.");
  }

  const stockId = Number(req.params.stockId);
  const updated = await updateStock(stockId, {
    hospitalId: userId,
    blood_group: req.body?.blood_group ? String(req.body.blood_group) : undefined,
    units: req.body?.units !== undefined ? Number(req.body.units) : undefined,
    expiry_date: req.body?.expiry_date ? String(req.body.expiry_date) : undefined,
  });

  res.json(ok(updated, "Stock updated."));
});

export const clinicDeleteStock = asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
  const userId = req.user?.id;
  if (!userId) {
    throw new AppError(401, "Authentication required.");
  }

  const stockId = Number(req.params.stockId);
  await deleteStock(stockId, userId);
  res.json(ok({}, "Stock deleted."));
});
