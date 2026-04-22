import type { NextFunction, Request, Response } from "express";
import type { Role } from "../models/domain";
import { verifyAccessToken } from "../utils/jwt";
import { AppError } from "../utils/app-error";

type AuthenticatedRequest = Request & {
  user?: {
    id: number;
    role: Role;
  };
};

export function verifyToken(req: AuthenticatedRequest, _res: Response, next: NextFunction) {
  const authorization = req.headers.authorization;
  if (!authorization || !authorization.startsWith("Bearer ")) {
    return next(new AppError(401, "Authentication required."));
  }

  const token = authorization.slice("Bearer ".length);

  try {
    const payload = verifyAccessToken(token);
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
