import { Router } from "express";
import { authorizeRoles, verifyToken } from "../../middleware/auth";
import { upload } from "../../middleware/upload";
import { donorCamps, donorCreateRequest, donorRequestStatus } from "./donor.controller";

export const donorRoutes = Router();

donorRoutes.use(verifyToken, authorizeRoles("donor"));
donorRoutes.get("/camps", donorCamps);
donorRoutes.get("/request-status", donorRequestStatus);
donorRoutes.post("/donation-request", upload.single("medical_report"), donorCreateRequest);
