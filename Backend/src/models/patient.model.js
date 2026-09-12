import mongoose from "mongoose";

const patientSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      unique: true,
    },

    dateOfBirth: {
      type: Date,
    },

    gender: {
      type: String,
      enum: ["male", "female", "other", ""],
      default: "",
    },

    bloodGroup: {
      type: String,
      enum: [
        "A+",
        "A-",
        "B+",
        "B-",
        "AB+",
        "AB-",
        "O+",
        "O-",
        "",
      ],
      default: "",
    },

    address: {
      type: String,
      trim: true,
      default: "",
    },

    emergencyContact: {
      name: { type: String, trim: true, default: "" },
      phone: { type: String, trim: true, default: "" },
      relation: { type: String, trim: true, default: "" },
    },

    allergies: {
      type: [String],
      default: [],
    },

    chronicDiseases: {
      type: [String],
      default: [],
    },
  },
  {
    timestamps: true,
  }
);

const Patient = mongoose.model("Patient", patientSchema);

export default Patient;
