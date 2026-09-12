import Notification from "../models/notification.model.js";
import {
  getPagination,
  buildPaginatedResponse,
} from "../utils/pagination.js";

export const getMyNotifications = async (req, res) => {
  try {
    const { page, limit, skip } = getPagination(req.query);
    const { isRead } = req.query;
    const filter = { user: req.user._id };

    if (isRead !== undefined) {
      filter.isRead = isRead === "true";
    }

    const [notifications, total, unreadCount] = await Promise.all([
      Notification.find(filter)
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit),
      Notification.countDocuments(filter),
      Notification.countDocuments({ user: req.user._id, isRead: false }),
    ]);

    return res.status(200).json({
      success: true,
      message: "Notifications fetched successfully",
      unreadCount,
      ...buildPaginatedResponse({
        data: notifications,
        total,
        page,
        limit,
      }),
    });
  } catch (error) {
    console.error("Get Notifications Error:", error);
    return res.status(500).json({
      success: false,
      message: "Server error while fetching notifications",
    });
  }
};

export const markNotificationRead = async (req, res) => {
  try {
    const notification = await Notification.findOne({
      _id: req.params.id,
      user: req.user._id,
    });

    if (!notification) {
      return res.status(404).json({
        success: false,
        message: "Notification not found",
      });
    }

    notification.isRead = true;
    await notification.save();

    return res.status(200).json({
      success: true,
      message: "Notification marked as read",
      notification,
    });
  } catch (error) {
    console.error("Mark Notification Read Error:", error);
    return res.status(500).json({
      success: false,
      message: "Server error while updating notification",
    });
  }
};

export const markAllNotificationsRead = async (req, res) => {
  try {
    await Notification.updateMany(
      { user: req.user._id, isRead: false },
      { $set: { isRead: true } }
    );

    return res.status(200).json({
      success: true,
      message: "All notifications marked as read",
    });
  } catch (error) {
    console.error("Mark All Notifications Read Error:", error);
    return res.status(500).json({
      success: false,
      message: "Server error while updating notifications",
    });
  }
};

export const deleteNotification = async (req, res) => {
  try {
    const notification = await Notification.findOneAndDelete({
      _id: req.params.id,
      user: req.user._id,
    });

    if (!notification) {
      return res.status(404).json({
        success: false,
        message: "Notification not found",
      });
    }

    return res.status(200).json({
      success: true,
      message: "Notification deleted successfully",
    });
  } catch (error) {
    console.error("Delete Notification Error:", error);
    return res.status(500).json({
      success: false,
      message: "Server error while deleting notification",
    });
  }
};
