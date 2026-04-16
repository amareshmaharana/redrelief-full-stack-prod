import { Router } from "express";
import { getPublicStockHealth, getPublicStockSummary, listPublicCamps, subscribeNewsletter } from "./public.controller";

export const publicRoutes = Router();

publicRoutes.get("/camps", listPublicCamps);
publicRoutes.get("/stock-summary", getPublicStockSummary);
publicRoutes.get("/stock-health", getPublicStockHealth);
publicRoutes.post("/subscribe", subscribeNewsletter);
