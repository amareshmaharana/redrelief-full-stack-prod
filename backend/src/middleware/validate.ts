import type { NextFunction, Request, Response } from "express";
import type { AnyZodObject } from "zod";
import { AppError } from "../utils/app-error";

export function validate(schema: AnyZodObject) {
  return (req: Request, _res: Response, next: NextFunction) => {
    const result = schema.safeParse({
      body: req.body,
      params: req.params,
      query: req.query,
    });

    if (!result.success) {
      const firstError = result.error.issues[0];
      return next(new AppError(400, firstError?.message ?? "Validation failed."));
    }

    return next();
  };
}
