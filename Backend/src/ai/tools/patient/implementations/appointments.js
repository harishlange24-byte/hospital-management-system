// backend/src/ai/tools/patient/implementations/appointments.js
import Appointment from "../../../../models/appointment.model.js";

export const getMyAppointments = async ({ filter = "all" }, { userId }) => {
  const query = { patientId: userId };
  const now = new Date();

  if (filter === "upcoming") query.date = { $gte: now };
  else if (filter === "past") query.date = { $lt: now };

  const appointments = await Appointment.find(query)
    .populate("doctorId", "name specialization")
    .sort({ date: filter === "past" ? -1 : 1 })
    .limit(10)
    .lean();

  return {
    count: appointments.length,
    appointments: appointments.map((a) => ({
      id: a._id.toString(),
      doctor: a.doctorId?.name || "Unknown",
      specialization: a.doctorId?.specialization || "",
      date: a.date,
      time: a.time,
      status: a.status,
      reason: a.reason,
    })),
  };
};

export const bookAppointment = async ({ doctorId, date, time, reason }, { userId }) => {
  const existing = await Appointment.findOne({
    doctorId,
    date: {
      $gte: new Date(date + "T00:00:00"),
      $lt: new Date(date + "T23:59:59"),
    },
    time,
    status: { $ne: "cancelled" },
  });

  if (existing) return { error: "Slot already booked. Please choose another time." };

  const appt = await Appointment.create({
    patientId: userId,
    doctorId,
    date: new Date(date),
    time,
    reason,
    status: "pending",
  });

  return {
    success: true,
    appointmentId: appt._id.toString(),
    date: appt.date,
    time: appt.time,
    message: "Appointment booked successfully",
  };
};

export const cancelAppointment = async ({ appointmentId, reason }, { userId }) => {
  const appt = await Appointment.findOne({ _id: appointmentId, patientId: userId });
  if (!appt) return { error: "Appointment not found or not yours" };
  if (appt.status === "cancelled") return { error: "Already cancelled" };

  appt.status = "cancelled";
  if (reason) appt.cancellationReason = reason;
  await appt.save();

  return { success: true, message: "Appointment cancelled" };
};