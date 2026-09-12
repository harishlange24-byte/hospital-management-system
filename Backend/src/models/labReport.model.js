import mongoose from "mongoose";

const labReportSchema = new mongoose.Schema(
  {
    patient: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Patient",
      required: true,
    },

    doctor: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Doctor",
    },

    appointment: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Appointment",
    },

    testName: {
      type: String,
      required: [true, "Test name is required"],
      trim: true,
    },

    testType: {
      type: String,
      trim: true,
      default: "",
    },

    resultSummary: {
      type: String,
      trim: true,
      default: "",
    },

    reportUrl: {
      type: String,
      trim: true,
      default: "",
    },

    status: {
      type: String,
      enum: ["pending", "completed", "cancelled"],
      default: "pending",
    },

    reportDate: {
      type: Date,
      default: Date.now,
    },

    uploadedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
    },
  },
  {
    timestamps: true,
  }
);

labReportSchema.index({ patient: 1, reportDate: -1 });
labReportSchema.index({ status: 1 });

const LabReport = mongoose.model("LabReport", labReportSchema);

export default LabReport;
