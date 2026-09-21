import mongoose from "mongoose";

const medicalHistorySchema = new mongoose.Schema(
  {
    patient: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Patient",
      required: true,
    },

    title: {
      type: String,
      required: [true, "Title is required"],
      trim: true,
    },

    description: {
      type: String,
      trim: true,
      default: "",
    },

    condition: {
      type: String,
      trim: true,
      default: "",
    },

    diagnosisDate: {
      type: Date,
    },

    treatment: {
      type: String,
      trim: true,
      default: "",
    },

    notes: {
      type: String,
      trim: true,
      default: "",
    },

    recordedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
    },
  },
  {
    timestamps: true,
  }
);

medicalHistorySchema.index({ patient: 1, createdAt: -1 });

const MedicalHistory = mongoose.models.MedicalHistory || mongoose.model(
  "MedicalHistory",
  medicalHistorySchema
);

export default MedicalHistory;
