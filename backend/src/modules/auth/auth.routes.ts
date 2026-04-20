import { Router } from "express";
import {
  checkEmailRole,
  forgotPasswordReset,
  forgotPasswordSendOtp,
  login,
  refreshToken,
  register,
  sendOtpCode,
  verifyOtp,
} from "./auth.controller";

export const authRoutes = Router();

authRoutes.post("/register", register);
authRoutes.post("/login", login);
authRoutes.post("/check-email-role", checkEmailRole);
authRoutes.post("/send-otp", sendOtpCode);
authRoutes.post("/verify-otp", verifyOtp);
authRoutes.post("/forgot-password/request", forgotPasswordSendOtp);
authRoutes.post("/forgot-password/reset", forgotPasswordReset);
authRoutes.post("/forgot-password/send-otp", forgotPasswordSendOtp);
authRoutes.post("/refresh-token", refreshToken);
