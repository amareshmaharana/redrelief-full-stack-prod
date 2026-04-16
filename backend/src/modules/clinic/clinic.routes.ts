import { Router } from "express";
import { authorizeRoles, verifyToken } from "../../middleware/auth";
import { upload } from "../../middleware/upload";
import { clinicAddStock, clinicCreateRequest, clinicDeleteStock, clinicRequestStatus, clinicStock, clinicUpdateStock } from "./clinic.controller";

export const clinicRoutes = Router();

clinicRoutes.use(verifyToken, authorizeRoles("clinic"));
clinicRoutes.get("/stock", clinicStock);
clinicRoutes.post("/stock", clinicAddStock);
clinicRoutes.patch("/stock/:stockId", clinicUpdateStock);
clinicRoutes.delete("/stock/:stockId", clinicDeleteStock);
clinicRoutes.get("/request-status", clinicRequestStatus);
clinicRoutes.post("/blood-request", upload.single("medical_report"), clinicCreateRequest);
