import { Router } from "express";
import { authorizeRoles, verifyToken } from "../../middleware/auth";
import {
  adminAddStock,
  adminCamps,
  adminCreateCamp,
  adminDeleteCamp,
  adminDeleteStock,
  adminRequests,
  adminStock,
  adminUpdateCamp,
  adminUpdateStock,
  adminUpdateUserVerification,
  adminUsers,
  clinicsList,
  dashboardStats,
  hospitalsList,
  reviewBloodRequest,
  reviewDonationRequest,
} from "./admin.controller";

export const adminRoutes = Router();

adminRoutes.use(verifyToken, authorizeRoles("admin"));
adminRoutes.get("/users", adminUsers);
adminRoutes.patch("/users/:userId/verification", adminUpdateUserVerification);
adminRoutes.get("/camps", adminCamps);
adminRoutes.post("/camps", adminCreateCamp);
adminRoutes.patch("/camps/:campId", adminUpdateCamp);
adminRoutes.delete("/camps/:campId", adminDeleteCamp);
adminRoutes.get("/requests", adminRequests);
adminRoutes.patch("/requests/donation/:requestId/review", reviewDonationRequest);
adminRoutes.patch("/requests/blood/:requestId/review", reviewBloodRequest);
adminRoutes.get("/blood-stock", adminStock);
adminRoutes.post("/blood-stock", adminAddStock);
adminRoutes.patch("/blood-stock/:stockId", adminUpdateStock);
adminRoutes.delete("/blood-stock/:stockId", adminDeleteStock);
adminRoutes.get("/hospitals-list", hospitalsList);
adminRoutes.get("/clinics-list", clinicsList);
adminRoutes.get("/dashboard-stats", dashboardStats);
