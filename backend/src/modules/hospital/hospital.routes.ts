import { Router } from "express";
import { authorizeRoles, verifyToken } from "../../middleware/auth";
import { upload } from "../../middleware/upload";
import { hospitalAddStock, hospitalCreateRequest, hospitalDeleteStock, hospitalRequestStatus, hospitalStock, hospitalUpdateStock } from "./hospital.controller";

export const hospitalRoutes = Router();

hospitalRoutes.use(verifyToken, authorizeRoles("hospital"));
hospitalRoutes.get("/stock", hospitalStock);
hospitalRoutes.post("/stock", hospitalAddStock);
hospitalRoutes.patch("/stock/:stockId", hospitalUpdateStock);
hospitalRoutes.delete("/stock/:stockId", hospitalDeleteStock);
hospitalRoutes.get("/request-status", hospitalRequestStatus);
hospitalRoutes.post("/blood-request", upload.single("medical_report"), hospitalCreateRequest);
