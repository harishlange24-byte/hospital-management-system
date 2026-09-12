import express from "express";
import {
  createMedicalHistory,
  getMedicalHistories,
  getMedicalHistoryById,
  updateMedicalHistory,
  deleteMedicalHistory,
} from "../controllers/medicalHistory.controller.js";
import { protect } from "../middlewares/auth.middleware.js";
import { authorizeRoles } from "../middlewares/role.middleware.js";

const router = express.Router();

router.get("/", protect, getMedicalHistories);
router.get("/:id", protect, getMedicalHistoryById);
router.post("/", protect, createMedicalHistory);
router.put(
  "/:id",
  protect,
  authorizeRoles("admin", "doctor", "patient"),
  updateMedicalHistory
);
router.delete(
  "/:id",
  protect,
  authorizeRoles("admin", "doctor"),
  deleteMedicalHistory
);

export default router;
