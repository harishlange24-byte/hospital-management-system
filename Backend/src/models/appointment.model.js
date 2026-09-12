import mongoose from "mongoose";

const appointmentSchema = new mongoose.Schema(
  {
    patient: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Patient",
      required: true,
    },

    doctor: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Doctor",
      required: true,
    },

    schedule: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Schedule",
    },

    slotId: {
      type: mongoose.Schema.Types.ObjectId,
    },

    appointmentDate: {
      type: Date,
      required: true,
    },

    startTime: {
      type: String,
      required: true,
    },

    endTime: {
      type: String,
      required: true,
    },

    reason: {
      type: String,
      trim: true,
      default: "",
    },

    status: {
      type: String,
      enum: [
        "pending",
        "confirmed",
        "completed",
        "cancelled",
        "no-show",
      ],
      default: "pending",
    },

    notes: {
      type: String,
      trim: true,
      default: "",
    },

    fee: {
      type: Number,
      default: 0,
      min: 0,
    },

    cancelledBy: {
      type: String,
      enum: ["admin", "doctor", "patient", null],
      default: null,
    },

    cancellationReason: {
      type: String,
      trim: true,
      default: "",
    },
  },
  {
    timestamps: true,
  }
);

appointmentSchema.index({ doctor: 1, appointmentDate: 1 });
appointmentSchema.index({ patient: 1, appointmentDate: 1 });
appointmentSchema.index({ status: 1 });

const Appointment = mongoose.model("Appointment", appointmentSchema);

export default Appointment;
