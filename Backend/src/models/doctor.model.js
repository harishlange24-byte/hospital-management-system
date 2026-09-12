import mongoose from "mongoose";

const doctorSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      unique: true,
    },

    specialization: {
      type: String,
      required: [true, "Specialization is required"],
      trim: true,
    },

    qualification: {
      type: String,
      trim: true,
      default: "",
    },

    experienceYears: {
      type: Number,
      default: 0,
      min: 0,
    },

    consultationFee: {
      type: Number,
      default: 0,
      min: 0,
    },

    department: {
      type: String,
      trim: true,
      default: "",
    },

    bio: {
      type: String,
      trim: true,
      default: "",
    },

    availableDays: [
      {
        type: String,
        enum: [
          "Monday",
          "Tuesday",
          "Wednesday",
          "Thursday",
          "Friday",
          "Saturday",
          "Sunday",
        ],
      },
    ],

    isAvailable: {
      type: Boolean,
      default: true,
    },
  },
  {
    timestamps: true,
  }
);

doctorSchema.index({ specialization: 1 });
doctorSchema.index({ department: 1 });

const Doctor = mongoose.model("Doctor", doctorSchema);

export default Doctor;
