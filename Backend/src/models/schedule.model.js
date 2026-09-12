import mongoose from "mongoose";

const slotSchema = new mongoose.Schema(
  {
    startTime: {
      type: String,
      required: true, // "09:00"
    },
    endTime: {
      type: String,
      required: true, // "09:30"
    },
    isBooked: {
      type: Boolean,
      default: false,
    },
  },
  { _id: true }
);

const scheduleSchema = new mongoose.Schema(
  {
    doctor: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Doctor",
      required: true,
    },

    date: {
      type: Date,
      required: true,
    },

    slots: {
      type: [slotSchema],
      default: [],
    },

    isHoliday: {
      type: Boolean,
      default: false,
    },

    notes: {
      type: String,
      trim: true,
      default: "",
    },
  },
  {
    timestamps: true,
  }
);

scheduleSchema.index({ doctor: 1, date: 1 }, { unique: true });

const Schedule = mongoose.model("Schedule", scheduleSchema);

export default Schedule;
