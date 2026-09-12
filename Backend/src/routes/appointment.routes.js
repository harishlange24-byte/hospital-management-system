import express from "express";
import {
  bookAppointment,
  getAppointments,
  getAppointmentById,
  updateAppointmentStatus,
  cancelAppointment,
  rescheduleAppointment,
} from "../controllers/appointment.controller.js";
import { protect } from "../middlewares/auth.middleware.js";
import { authorizeRoles } from "../middlewares/role.middleware.js";

const router = express.Router();

router.get("/", protect, getAppointments);
router.get("/:id", protect, getAppointmentById);

router.post("/", protect, authorizeRoles("patient"), bookAppointment);

router.patch(
  "/:id/status",
  protect,
  authorizeRoles("admin", "doctor"),
  updateAppointmentStatus
);

router.patch("/:id/cancel", protect, cancelAppointment);

router.patch(
  "/:id/reschedule",
  protect,
  authorizeRoles("admin", "doctor", "patient"),
  rescheduleAppointment
);

export default router;
