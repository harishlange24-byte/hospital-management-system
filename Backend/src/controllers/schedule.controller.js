import Schedule from "../models/schedule.model.js";
import Doctor from "../models/doctor.model.js";
import {
  getPagination,
  buildPaginatedResponse,
} from "../utils/pagination.js";
import {
  getDoctorByUserId,
  startOfDay,
  endOfDay,
} from "../utils/profile.js";

// ==========================================
// CREATE / UPSERT SCHEDULE (Admin / Doctor)
// ==========================================
export const upsertSchedule = async (req, res) => {
  try {
    let { doctorId, date, slots, isHoliday, notes } = req.body;

    if (req.user.role === "doctor") {
      const doctor = await getDoctorByUserId(req.user._id);
      if (!doctor) {
        return res.status(404).json({
          success: false,
          message: "Doctor profile not found",
        });
      }
      doctorId = doctor._id.toString();
    }

    if (!doctorId || !date) {
      return res.status(400).json({
        success: false,
        message: "doctorId and date are required",
      });
    }

    const doctor = await Doctor.findById(doctorId);
    if (!doctor) {
      return res.status(404).json({
        success: false,
        message: "Doctor not found",
      });
    }

    const day = startOfDay(date);

    let schedule = await Schedule.findOne({
      doctor: doctorId,
      date: {
        $gte: day,
        $lte: endOfDay(date),
      },
    });

    if (schedule) {
      if (slots !== undefined) schedule.slots = slots;
      if (isHoliday !== undefined) schedule.isHoliday = isHoliday;
      if (notes !== undefined) schedule.notes = notes;
      await schedule.save();
    } else {
      schedule = await Schedule.create({
        doctor: doctorId,
        date: day,
        slots: slots || [],
        isHoliday: isHoliday || false,
        notes: notes || "",
      });
    }

    return res.status(200).json({
      success: true,
      message: "Schedule saved successfully",
      schedule,
    });
  } catch (error) {
    console.error("Upsert Schedule Error:", error);
    return res.status(500).json({
      success: false,
      message: "Server error while saving schedule",
    });
  }
};

// ==========================================
// GET SCHEDULES
// ==========================================
export const getSchedules = async (req, res) => {
  try {
    const { page, limit, skip } = getPagination(req.query);
    const { doctorId, from, to } = req.query;

    const filter = {};

    if (req.user.role === "doctor") {
      const doctor = await getDoctorByUserId(req.user._id);
      if (!doctor) {
        return res.status(404).json({
          success: false,
          message: "Doctor profile not found",
        });
      }
      filter.doctor = doctor._id;
    } else if (doctorId) {
      filter.doctor = doctorId;
    }

    if (from || to) {
      filter.date = {};
      if (from) filter.date.$gte = startOfDay(from);
      if (to) filter.date.$lte = endOfDay(to);
    }

    const [schedules, total] = await Promise.all([
      Schedule.find(filter)
        .populate({
          path: "doctor",
          populate: { path: "user", select: "name email" },
        })
        .sort({ date: 1 })
        .skip(skip)
        .limit(limit),
      Schedule.countDocuments(filter),
    ]);

    return res.status(200).json({
      success: true,
      message: "Schedules fetched successfully",
      ...buildPaginatedResponse({ data: schedules, total, page, limit }),
    });
  } catch (error) {
    console.error("Get Schedules Error:", error);
    return res.status(500).json({
      success: false,
      message: "Server error while fetching schedules",
    });
  }
};

// ==========================================
// GET AVAILABLE SLOTS FOR A DOCTOR/DATE
// ==========================================
export const getAvailableSlots = async (req, res) => {
  try {
    const { doctorId, date } = req.query;

    if (!doctorId || !date) {
      return res.status(400).json({
        success: false,
        message: "doctorId and date are required",
      });
    }

    const schedule = await Schedule.findOne({
      doctor: doctorId,
      date: {
        $gte: startOfDay(date),
        $lte: endOfDay(date),
      },
      isHoliday: false,
    });

    if (!schedule) {
      return res.status(200).json({
        success: true,
        message: "No schedule found for this date",
        slots: [],
      });
    }

    const availableSlots = schedule.slots.filter((s) => !s.isBooked);

    return res.status(200).json({
      success: true,
      scheduleId: schedule._id,
      slots: availableSlots,
    });
  } catch (error) {
    console.error("Get Available Slots Error:", error);
    return res.status(500).json({
      success: false,
      message: "Server error while fetching slots",
    });
  }
};

// ==========================================
// DELETE SCHEDULE
// ==========================================
export const deleteSchedule = async (req, res) => {
  try {
    const schedule = await Schedule.findById(req.params.id);

    if (!schedule) {
      return res.status(404).json({
        success: false,
        message: "Schedule not found",
      });
    }

    if (req.user.role === "doctor") {
      const doctor = await getDoctorByUserId(req.user._id);
      if (!doctor || schedule.doctor.toString() !== doctor._id.toString()) {
        return res.status(403).json({
          success: false,
          message: "Access denied",
        });
      }
    }

    const hasBooked = schedule.slots.some((s) => s.isBooked);
    if (hasBooked) {
      return res.status(400).json({
        success: false,
        message: "Cannot delete schedule with booked slots",
      });
    }

    await schedule.deleteOne();

    return res.status(200).json({
      success: true,
      message: "Schedule deleted successfully",
    });
  } catch (error) {
    console.error("Delete Schedule Error:", error);
    return res.status(500).json({
      success: false,
      message: "Server error while deleting schedule",
    });
  }
};
