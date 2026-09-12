import express from "express";
import {
  createPatient,
  getPatients,
  getPatientById,
  getMyPatientProfile,
  upsertMyPatientProfile,
  updatePatient,
  deletePatient,
} from "../controllers/patient.controller.js";
import { protect } from "../middlewares/auth.middleware.js";
import { authorizeRoles } from "../middlewares/role.middleware.js";

const router = express.Router();

router.get(
  "/",
  protect,
  authorizeRoles("admin", "doctor"),
  getPatients
);
router.get("/me", protect, authorizeRoles("patient"), getMyPatientProfile);
router.put("/me", protect, authorizeRoles("patient"), upsertMyPatientProfile);
router.get("/:id", protect, getPatientById);

router.post("/", protect, authorizeRoles("admin"), createPatient);
router.put(
  "/:id",
  protect,
  authorizeRoles("admin", "patient"),
  updatePatient
);
router.delete("/:id", protect, authorizeRoles("admin"), deletePatient);

export default router;
