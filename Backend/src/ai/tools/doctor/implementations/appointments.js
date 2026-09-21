// Backend/src/ai/tools/doctor/implementations/appointments.js
import Appointment from "../../../../models/appointment.model.js";

export const getMyAppointments = async ({ filter = "today" }, { userId }) => {
  const query = { doctorId: userId };
  const now = new Date();

  if (filter === "today") {
    const start = new Date(); start.setHours(0, 0, 0, 0);
    const end = new Date(); end.setHours(23, 59, 59, 999);
    query.date = { $gte: start, $lte: end };
  } else if (filter === "upcoming") {
    query.date = { $gte: now };
  } else if (filter === "past") {
    query.date = { $lt: now };
  }

  const appointments = await Appointment.find(query)
    .populate("patientId", "name age gender phone")
    .sort({ date: filter === "past" ? -1 : 1 })
    .limit(20)
    .lean();

  return {
    count: appointments.length,
    appointments: appointments.map((a) => ({
      id: a._id.toString(),
      patientId: a.patientId?._id?.toString(),
      patientName: a.patientId?.name || "Unknown",
      patientAge: a.patientId?.age,
      patientGender: a.patientId?.gender,
      date: a.date,
      time: a.time,
      status: a.status,
      reason: a.reason,
    })),
  };
};