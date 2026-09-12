import express from "express";
import {
  createInvoice,
  getInvoices,
  getInvoiceById,
  updateInvoiceStatus,
} from "../controllers/invoice.controller.js";
import { protect } from "../middlewares/auth.middleware.js";
import { authorizeRoles } from "../middlewares/role.middleware.js";

const router = express.Router();

router.get("/", protect, getInvoices);
router.get("/:id", protect, getInvoiceById);
router.post("/", protect, authorizeRoles("admin"), createInvoice);
router.patch(
  "/:id/status",
  protect,
  authorizeRoles("admin"),
  updateInvoiceStatus
);

export default router;
