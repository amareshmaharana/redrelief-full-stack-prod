import { Router } from "express";
import { verifyToken } from "../../middleware/auth";
import { changePassword, getProfile, updateProfile } from "./profile.controller";

export const profileRoutes = Router();

profileRoutes.use(verifyToken);
profileRoutes.get("/profile", getProfile);
profileRoutes.patch("/profile", updateProfile);
profileRoutes.post("/change-password", changePassword);
