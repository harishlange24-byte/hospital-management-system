import express from "express";
import {
  upsertSchedule,
  getSchedules,
  getAvailableSlots,
  deleteSchedule,
} from "../controllers/schedule.controller.js";
import { protect } from "../middlewares/auth.middleware.js";
import { authorizeRoles } from "../middlewares/role.middleware.js";

const router = express.Router();

router.get("/slots", protect, getAvailableSlots);
router.get("/", protect, getSchedules);
router.post(
  "/",
  protect,
  authorizeRoles("admin", "doctor"),
  upsertSchedule
);
router.delete(
  "/:id",
  protect,
  authorizeRoles("admin", "doctor"),
  deleteSchedule
);

export default router;
