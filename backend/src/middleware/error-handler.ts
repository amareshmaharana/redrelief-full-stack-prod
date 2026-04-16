import type { NextFunction, Request, Response } from "express";
import { ZodError } from "zod";
import { AppError } from "../utils/app-error";
import { fail } from "../utils/api-response";

export function notFound(req: Request, res: Response) {
  res.status(404).json(fail(`Route not found: ${req.method} ${req.originalUrl}`));
}

export function errorHandler(
  err: unknown,
  _req: Request,
  res: Response,
  _next: NextFunction,
) {
  if (err instanceof AppError) {
    res.status(err.statusCode).json(fail(err.message));
    return;
  }

  if (err instanceof ZodError) {
    res.status(400).json(fail(err.issues[0]?.message ?? "Validation failed."));
    return;
  }

  console.error(err);
  res.status(500).json(fail("Internal server error."));
}
