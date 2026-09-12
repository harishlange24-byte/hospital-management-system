import express from "express";
import {
  createMedicine,
  getMedicines,
  getMedicineById,
  updateMedicine,
  deleteMedicine,
  createPharmacySale,
  getPharmacySales,
} from "../controllers/pharmacy.controller.js";
import { protect } from "../middlewares/auth.middleware.js";
import { authorizeRoles } from "../middlewares/role.middleware.js";

const router = express.Router();

router.get("/medicines", protect, getMedicines);
router.get("/medicines/:id", protect, getMedicineById);
router.post(
  "/medicines",
  protect,
  authorizeRoles("admin"),
  createMedicine
);
router.put(
  "/medicines/:id",
  protect,
  authorizeRoles("admin"),
  updateMedicine
);
router.delete(
  "/medicines/:id",
  protect,
  authorizeRoles("admin"),
  deleteMedicine
);

router.get(
  "/sales",
  protect,
  authorizeRoles("admin"),
  getPharmacySales
);
router.post(
  "/sales",
  protect,
  authorizeRoles("admin"),
  createPharmacySale
);

export default router;
