import express from "express";
import {
  createPrescription,
  getPrescriptions,
  getPrescriptionById,
  updatePrescription,
  deletePrescription,
} from "../controllers/prescription.controller.js";
import { protect } from "../middlewares/auth.middleware.js";
import { authorizeRoles } from "../middlewares/role.middleware.js";

const router = express.Router();

router.get("/", protect, getPrescriptions);
router.get("/:id", protect, getPrescriptionById);
router.post(
  "/",
  protect,
  authorizeRoles("admin", "doctor"),
  createPrescription
);
router.put(
  "/:id",
  protect,
  authorizeRoles("admin", "doctor"),
  updatePrescription
);
router.delete(
  "/:id",
  protect,
  authorizeRoles("admin", "doctor"),
  deletePrescription
);

export default router;
