import express from "express";
import {
  createDoctor,
  getDoctors,
  getDoctorById,
  getMyDoctorProfile,
  updateDoctor,
  deleteDoctor,
} from "../controllers/doctor.controller.js";
import { protect } from "../middlewares/auth.middleware.js";
import { authorizeRoles } from "../middlewares/role.middleware.js";

const router = express.Router();

router.get("/", protect, getDoctors);
router.get("/me", protect, authorizeRoles("doctor"), getMyDoctorProfile);
router.get("/:id", protect, getDoctorById);

router.post("/", protect, authorizeRoles("admin"), createDoctor);
router.put("/:id", protect, authorizeRoles("admin", "doctor"), updateDoctor);
router.delete("/:id", protect, authorizeRoles("admin"), deleteDoctor);

export default router;
