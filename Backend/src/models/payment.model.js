import mongoose from "mongoose";

const paymentSchema = new mongoose.Schema(
  {
    patient: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Patient",
      required: true,
    },

    appointment: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Appointment",
    },

    pharmacySale: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "PharmacySale",
    },

    amount: {
      type: Number,
      required: true,
      min: 0,
    },

    currency: {
      type: String,
      default: "INR",
    },

    purpose: {
      type: String,
      enum: ["appointment", "pharmacy", "lab", "other"],
      default: "appointment",
    },

    status: {
      type: String,
      enum: ["created", "paid", "failed", "refunded"],
      default: "created",
    },

    razorpayOrderId: {
      type: String,
      trim: true,
      default: "",
    },

    razorpayPaymentId: {
      type: String,
      trim: true,
      default: "",
    },

    razorpaySignature: {
      type: String,
      trim: true,
      default: "",
    },

    invoice: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Invoice",
    },
  },
  {
    timestamps: true,
  }
);

paymentSchema.index({ patient: 1, createdAt: -1 });
paymentSchema.index({ razorpayOrderId: 1 });

const Payment = mongoose.model("Payment", paymentSchema);

export default Payment;
