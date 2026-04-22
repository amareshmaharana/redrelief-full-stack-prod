import type { Role } from "../models/domain";

declare module "express-serve-static-core" {
  interface Request {
    user?: {
      id: number;
      role: Role;
    };
  }
}

export {};
