import { Router } from "express";
import { authorizeRoles, verifyToken } from "../../middleware/auth";
import { upload } from "../../middleware/upload";
import { recipientCreateRequest, recipientRequestStatus, recipientStock } from "./recipient.controller";

export const recipientRoutes = Router();

recipientRoutes.use(verifyToken, authorizeRoles("recipient"));
recipientRoutes.get("/stock", recipientStock);
recipientRoutes.get("/request-status", recipientRequestStatus);
recipientRoutes.post("/blood-request", upload.fields([{ name: "medical_report" }, { name: "id_proof" }]), recipientCreateRequest);
