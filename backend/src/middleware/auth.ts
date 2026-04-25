import type { NextFunction, Request, Response } from "express";
import type { Role } from "../models/domain";
import { verifyAccessToken } from "../utils/jwt";
import { AppError } from "../utils/app-error";
import { DonorUserModel } from "../models/donor-user";
import { RecipientUserModel } from "../models/recipient-user";
import { HospitalUserModel } from "../models/hospital-user";
import { ClinicUserModel } from "../models/clinic-user";
import { AdminUserModel } from "../models/admin-user";
import { UserModel } from "../models/user";

type AuthenticatedRequest = Request & {
  user?: {
    id: number;
    role: Role;
  };
};

async function findUserById(userId: number) {
  return (
    (await DonorUserModel.findOne({ id: userId }).lean()) ||
    (await RecipientUserModel.findOne({ id: userId }).lean()) ||
    (await HospitalUserModel.findOne({ id: userId }).lean()) ||
    (await ClinicUserModel.findOne({ id: userId }).lean()) ||
    (await AdminUserModel.findOne({ id: userId }).lean()) ||
    (await UserModel.findOne({ id: userId }).lean())
  );
}

export async function verifyToken(req: AuthenticatedRequest, _res: Response, next: NextFunction) {
  const authorization = req.headers.authorization;
  if (!authorization || !authorization.startsWith("Bearer ")) {
    return next(new AppError(401, "Authentication required."));
  }

  const token = authorization.slice("Bearer ".length);

  try {
    const payload = verifyAccessToken(token);

    const userId = Number(payload.sub);
    const existingUser = await findUserById(userId);
    if (!existingUser) {
      return next(new AppError(401, "Session is no longer valid. Please login again."));
    }

    req.user = { id: Number(payload.sub), role: payload.role as Role };
    return next();
  } catch {
    return next(new AppError(401, "Invalid or expired token."));
  }
}

export function authorizeRoles(...roles: Role[]) {
  return (req: AuthenticatedRequest, _res: Response, next: NextFunction) => {
    if (!req.user) {
      return next(new AppError(401, "Authentication required."));
    }

    if (!roles.includes(req.user.role)) {
      return next(new AppError(403, "You are not allowed to access this resource."));
    }

    return next();
  };
}
