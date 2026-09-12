import express from "express";
import {
  createLabReport,
  getLabReports,
  getLabReportById,
  updateLabReport,
  deleteLabReport,
} from "../controllers/labReport.controller.js";
import { protect } from "../middlewares/auth.middleware.js";
import { authorizeRoles } from "../middlewares/role.middleware.js";

const router = express.Router();

router.get("/", protect, getLabReports);
router.get("/:id", protect, getLabReportById);
router.post(
  "/",
  protect,
  authorizeRoles("admin", "doctor"),
  createLabReport
);
router.put(
  "/:id",
  protect,
  authorizeRoles("admin", "doctor"),
  updateLabReport
);
router.delete(
  "/:id",
  protect,
  authorizeRoles("admin"),
  deleteLabReport
);

export default router;
