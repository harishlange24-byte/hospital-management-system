import express from "express";
import {
  createPaymentOrder,
  verifyPayment,
  getPayments,
  getPaymentById,
} from "../controllers/payment.controller.js";
import { protect } from "../middlewares/auth.middleware.js";
import { authorizeRoles } from "../middlewares/role.middleware.js";

const router = express.Router();

router.get("/", protect, getPayments);
router.get("/:id", protect, getPaymentById);
router.post(
  "/create-order",
  protect,
  authorizeRoles("admin", "patient"),
  createPaymentOrder
);
router.post(
  "/verify",
  protect,
  authorizeRoles("admin", "patient"),
  verifyPayment
);

export default router;
