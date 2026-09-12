import mongoose from "mongoose";

const notificationSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },

    title: {
      type: String,
      required: true,
      trim: true,
    },

    message: {
      type: String,
      required: true,
      trim: true,
    },

    type: {
      type: String,
      enum: ["info", "success", "warning", "error", "appointment", "payment", "lab"],
      default: "info",
    },

    relatedId: {
      type: mongoose.Schema.Types.ObjectId,
      default: null,
    },

    relatedModel: {
      type: String,
      default: null,
    },

    isRead: {
      type: Boolean,
      default: false,
    },
  },
  {
    timestamps: true,
  }
);

notificationSchema.index({ user: 1, createdAt: -1 });
notificationSchema.index({ user: 1, isRead: 1 });

const Notification = mongoose.model("Notification", notificationSchema);

export default Notification;
