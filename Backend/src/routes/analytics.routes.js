import express from "express";
import { getDashboardAnalytics } from "../controllers/analytics.controller.js";
import { protect } from "../middlewares/auth.middleware.js";

const router = express.Router();

router.get("/dashboard", protect, getDashboardAnalytics);

export default router;
