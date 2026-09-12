import Notification from "../models/notification.model.js";

/**
 * Create an in-app notification for a user.
 */
export const createNotification = async ({
  user,
  title,
  message,
  type = "info",
  relatedId = null,
  relatedModel = null,
}) => {
  if (!user || !title || !message) return null;

  return Notification.create({
    user,
    title,
    message,
    type,
    relatedId,
    relatedModel,
  });
};
