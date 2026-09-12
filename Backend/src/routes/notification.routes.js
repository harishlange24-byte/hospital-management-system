import express from "express";
import {
  getMyNotifications,
  markNotificationRead,
  markAllNotificationsRead,
  deleteNotification,
} from "../controllers/notification.controller.js";
import { protect } from "../middlewares/auth.middleware.js";

const router = express.Router();

router.get("/", protect, getMyNotifications);
router.patch("/read-all", protect, markAllNotificationsRead);
router.patch("/:id/read", protect, markNotificationRead);
router.delete("/:id", protect, deleteNotification);

export default router;
