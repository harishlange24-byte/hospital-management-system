import Appointment from "../models/appointment.model.js";
import Schedule from "../models/schedule.model.js";
import Doctor from "../models/doctor.model.js";
import {
  getPagination,
  buildPaginatedResponse,
} from "../utils/pagination.js";
import {
  getDoctorByUserId,
  getPatientByUserId,
  startOfDay,
  endOfDay,
} from "../utils/profile.js";
import { createNotification } from "../utils/notify.js";

const appointmentPopulate = [
  {
    path: "patient",
    populate: { path: "user", select: "name email phone" },
  },
  {
    path: "doctor",
    populate: { path: "user", select: "name email phone" },
  },
];

// ==========================================
// BOOK APPOINTMENT
// ==========================================
export const bookAppointment = async (req, res) => {
  try {
    const {
      doctorId,
      scheduleId,
      slotId,
      reason,
      appointmentDate,
      startTime,
      endTime,
    } = req.body;

    const patient = await getPatientByUserId(req.user._id);
    if (!patient) {
      return res.status(400).json({
        success: false,
        message: "Complete your patient profile before booking",
      });
    }

    if (!doctorId) {
      return res.status(400).json({
        success: false,
        message: "doctorId is required",
      });
    }

    const doctor = await Doctor.findById(doctorId).populate("user");
    if (!doctor || !doctor.isAvailable) {
      return res.status(404).json({
        success: false,
        message: "Doctor not available",
      });
    }

    let resolvedStart = startTime;
    let resolvedEnd = endTime;
    let resolvedDate = appointmentDate
      ? startOfDay(appointmentDate)
      : null;
    let schedule = null;
    let slot = null;

    if (scheduleId && slotId) {
      schedule = await Schedule.findById(scheduleId);
      if (!schedule || schedule.isHoliday) {
        return res.status(404).json({
          success: false,
          message: "Schedule not found",
        });
      }

      slot = schedule.slots.id(slotId);
      if (!slot || slot.isBooked) {
        return res.status(400).json({
          success: false,
          message: "Selected slot is not available",
        });
      }

      resolvedStart = slot.startTime;
      resolvedEnd = slot.endTime;
      resolvedDate = startOfDay(schedule.date);
      slot.isBooked = true;
      await schedule.save();
    }

    if (!resolvedDate || !resolvedStart || !resolvedEnd) {
      return res.status(400).json({
        success: false,
        message: "appointmentDate, startTime and endTime are required",
      });
    }

    const appointment = await Appointment.create({
      patient: patient._id,
      doctor: doctor._id,
      schedule: schedule?._id,
      slotId: slot?._id,
      appointmentDate: resolvedDate,
      startTime: resolvedStart,
      endTime: resolvedEnd,
      reason: reason || "",
      fee: doctor.consultationFee || 0,
      status: "pending",
    });

    await createNotification({
      user: doctor.user._id || doctor.user,
      title: "New Appointment",
      message: `New appointment request on ${resolvedDate.toDateString()} at ${resolvedStart}`,
      type: "appointment",
      relatedId: appointment._id,
      relatedModel: "Appointment",
    });

    const populated = await Appointment.findById(appointment._id).populate(
      appointmentPopulate
    );

    return res.status(201).json({
      success: true,
      message: "Appointment booked successfully",
      appointment: populated,
    });
  } catch (error) {
    console.error("Book Appointment Error:", error);
    return res.status(500).json({
      success: false,
      message: "Server error while booking appointment",
    });
  }
};

// ==========================================
// GET APPOINTMENTS (role-aware + filters)
// ==========================================
export const getAppointments = async (req, res) => {
  try {
    const { page, limit, skip } = getPagination(req.query);
    const { status, doctorId, patientId, from, to } = req.query;

    const filter = {};

    if (status) filter.status = status;

    if (from || to) {
      filter.appointmentDate = {};
      if (from) filter.appointmentDate.$gte = startOfDay(from);
      if (to) filter.appointmentDate.$lte = endOfDay(to);
    }

    if (req.user.role === "patient") {
      const patient = await getPatientByUserId(req.user._id);
      if (!patient) {
        return res.status(200).json({
          success: true,
          message: "No appointments",
          ...buildPaginatedResponse({
            data: [],
            total: 0,
            page,
            limit,
          }),
        });
      }
      filter.patient = patient._id;
    } else if (req.user.role === "doctor") {
      const doctor = await getDoctorByUserId(req.user._id);
      if (!doctor) {
        return res.status(404).json({
          success: false,
          message: "Doctor profile not found",
        });
      }
      filter.doctor = doctor._id;
    } else {
      if (doctorId) filter.doctor = doctorId;
      if (patientId) filter.patient = patientId;
    }

    const [appointments, total] = await Promise.all([
      Appointment.find(filter)
        .populate(appointmentPopulate)
        .sort({ appointmentDate: -1, startTime: 1 })
        .skip(skip)
        .limit(limit),
      Appointment.countDocuments(filter),
    ]);

    return res.status(200).json({
      success: true,
      message: "Appointments fetched successfully",
      ...buildPaginatedResponse({
        data: appointments,
        total,
        page,
        limit,
      }),
    });
  } catch (error) {
    console.error("Get Appointments Error:", error);
    return res.status(500).json({
      success: false,
      message: "Server error while fetching appointments",
    });
  }
};

// ==========================================
// GET APPOINTMENT BY ID
// ==========================================
export const getAppointmentById = async (req, res) => {
  try {
    const appointment = await Appointment.findById(req.params.id).populate(
      appointmentPopulate
    );

    if (!appointment) {
      return res.status(404).json({
        success: false,
        message: "Appointment not found",
      });
    }

    return res.status(200).json({
      success: true,
      appointment,
    });
  } catch (error) {
    console.error("Get Appointment Error:", error);
    return res.status(500).json({
      success: false,
      message: "Server error while fetching appointment",
    });
  }
};

// ==========================================
// UPDATE STATUS / MANAGE
// ==========================================
export const updateAppointmentStatus = async (req, res) => {
  try {
    const { status, notes } = req.body;
    const allowed = [
      "pending",
      "confirmed",
      "completed",
      "cancelled",
      "no-show",
    ];

    if (!status || !allowed.includes(status)) {
      return res.status(400).json({
        success: false,
        message: "Valid status is required",
      });
    }

    const appointment = await Appointment.findById(req.params.id)
      .populate("patient")
      .populate({ path: "doctor", populate: { path: "user" } });

    if (!appointment) {
      return res.status(404).json({
        success: false,
        message: "Appointment not found",
      });
    }

    if (req.user.role === "doctor") {
      const doctor = await getDoctorByUserId(req.user._id);
      if (
        !doctor ||
        appointment.doctor._id.toString() !== doctor._id.toString()
      ) {
        return res.status(403).json({
          success: false,
          message: "Access denied",
        });
      }
    }

    appointment.status = status;
    if (notes !== undefined) appointment.notes = notes;
    await appointment.save();

    const patientUserId = appointment.patient.user;
    await createNotification({
      user: patientUserId,
      title: "Appointment Updated",
      message: `Your appointment status is now "${status}"`,
      type: "appointment",
      relatedId: appointment._id,
      relatedModel: "Appointment",
    });

    const populated = await Appointment.findById(appointment._id).populate(
      appointmentPopulate
    );

    return res.status(200).json({
      success: true,
      message: "Appointment updated successfully",
      appointment: populated,
    });
  } catch (error) {
    console.error("Update Appointment Status Error:", error);
    return res.status(500).json({
      success: false,
      message: "Server error while updating appointment",
    });
  }
};

// ==========================================
// CANCEL APPOINTMENT
// ==========================================
export const cancelAppointment = async (req, res) => {
  try {
    const { cancellationReason } = req.body;
    const appointment = await Appointment.findById(req.params.id)
      .populate("patient")
      .populate({ path: "doctor", populate: { path: "user" } });

    if (!appointment) {
      return res.status(404).json({
        success: false,
        message: "Appointment not found",
      });
    }

    if (["completed", "cancelled"].includes(appointment.status)) {
      return res.status(400).json({
        success: false,
        message: `Cannot cancel a ${appointment.status} appointment`,
      });
    }

    if (req.user.role === "patient") {
      const patient = await getPatientByUserId(req.user._id);
      if (
        !patient ||
        appointment.patient._id.toString() !== patient._id.toString()
      ) {
        return res.status(403).json({
          success: false,
          message: "Access denied",
        });
      }
    }

    if (req.user.role === "doctor") {
      const doctor = await getDoctorByUserId(req.user._id);
      if (
        !doctor ||
        appointment.doctor._id.toString() !== doctor._id.toString()
      ) {
        return res.status(403).json({
          success: false,
          message: "Access denied",
        });
      }
    }

    appointment.status = "cancelled";
    appointment.cancelledBy = req.user.role;
    appointment.cancellationReason = cancellationReason || "";
    await appointment.save();

    // Free slot if linked
    if (appointment.schedule && appointment.slotId) {
      const schedule = await Schedule.findById(appointment.schedule);
      if (schedule) {
        const slot = schedule.slots.id(appointment.slotId);
        if (slot) {
          slot.isBooked = false;
          await schedule.save();
        }
      }
    }

    await createNotification({
      user: appointment.doctor.user._id || appointment.doctor.user,
      title: "Appointment Cancelled",
      message: "An appointment has been cancelled",
      type: "appointment",
      relatedId: appointment._id,
      relatedModel: "Appointment",
    });

    return res.status(200).json({
      success: true,
      message: "Appointment cancelled successfully",
      appointment,
    });
  } catch (error) {
    console.error("Cancel Appointment Error:", error);
    return res.status(500).json({
      success: false,
      message: "Server error while cancelling appointment",
    });
  }
};

// ==========================================
// RESCHEDULE
// ==========================================
export const rescheduleAppointment = async (req, res) => {
  try {
    const { scheduleId, slotId, appointmentDate, startTime, endTime } =
      req.body;

    const appointment = await Appointment.findById(req.params.id);

    if (!appointment) {
      return res.status(404).json({
        success: false,
        message: "Appointment not found",
      });
    }

    if (["completed", "cancelled"].includes(appointment.status)) {
      return res.status(400).json({
        success: false,
        message: `Cannot reschedule a ${appointment.status} appointment`,
      });
    }

    // Free old slot
    if (appointment.schedule && appointment.slotId) {
      const oldSchedule = await Schedule.findById(appointment.schedule);
      if (oldSchedule) {
        const oldSlot = oldSchedule.slots.id(appointment.slotId);
        if (oldSlot) {
          oldSlot.isBooked = false;
          await oldSchedule.save();
        }
      }
    }

    if (scheduleId && slotId) {
      const schedule = await Schedule.findById(scheduleId);
      if (!schedule || schedule.isHoliday) {
        return res.status(404).json({
          success: false,
          message: "New schedule not found",
        });
      }

      const slot = schedule.slots.id(slotId);
      if (!slot || slot.isBooked) {
        return res.status(400).json({
          success: false,
          message: "Selected slot is not available",
        });
      }

      slot.isBooked = true;
      await schedule.save();

      appointment.schedule = schedule._id;
      appointment.slotId = slot._id;
      appointment.appointmentDate = startOfDay(schedule.date);
      appointment.startTime = slot.startTime;
      appointment.endTime = slot.endTime;
    } else {
      if (!appointmentDate || !startTime || !endTime) {
        return res.status(400).json({
          success: false,
          message: "appointmentDate, startTime and endTime are required",
        });
      }
      appointment.appointmentDate = startOfDay(appointmentDate);
      appointment.startTime = startTime;
      appointment.endTime = endTime;
      appointment.schedule = undefined;
      appointment.slotId = undefined;
    }

    appointment.status = "pending";
    await appointment.save();

    const populated = await Appointment.findById(appointment._id).populate(
      appointmentPopulate
    );

    return res.status(200).json({
      success: true,
      message: "Appointment rescheduled successfully",
      appointment: populated,
    });
  } catch (error) {
    console.error("Reschedule Appointment Error:", error);
    return res.status(500).json({
      success: false,
      message: "Server error while rescheduling appointment",
    });
  }
};
