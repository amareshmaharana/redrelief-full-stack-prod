import type { Request, Response } from "express";
import { asyncHandler } from "../../utils/async-handler";
import { ok } from "../../utils/api-response";
import { AppError } from "../../utils/app-error";
import { createBloodRequest, listBloodRequestsForUser } from "../request/request.service";
import { addStock, deleteStock, listStock, updateStock } from "../bloodStock/blood-stock.service";

export const hospitalStock = asyncHandler(async (req: Request, res: Response) => {
  const userId = req.user?.id;
  if (!userId) {
    throw new AppError(401, "Authentication required.");
  }
  res.json(ok(await listStock(userId)));
});

export const hospitalRequestStatus = asyncHandler(async (req: Request, res: Response) => {
  const userId = req.user?.id;
  if (!userId) {
    throw new AppError(401, "Authentication required.");
  }
  res.json(ok(await listBloodRequestsForUser(userId, "hospital")));
});

export const hospitalCreateRequest = asyncHandler(async (req: Request, res: Response) => {
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

export const hospitalAddStock = asyncHandler(async (req: Request, res: Response) => {
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

export const hospitalUpdateStock = asyncHandler(async (req: Request, res: Response) => {
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

export const hospitalDeleteStock = asyncHandler(async (req: Request, res: Response) => {
  const userId = req.user?.id;
  if (!userId) {
    throw new AppError(401, "Authentication required.");
  }

  const stockId = Number(req.params.stockId);
  await deleteStock(stockId, userId);
  res.json(ok({}, "Stock deleted."));
});
