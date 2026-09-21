// Backend/src/ai/tools/admin/implementations/appointments.js
import Appointment from "../../../../models/Appointment.model.js";

const getDateFilter = (period) => {
  const now = new Date();
  if (period === "today") {
    const start = new Date(); start.setHours(0, 0, 0, 0);
    const end = new Date(); end.setHours(23, 59, 59, 999);
    return { $gte: start, $lte: end };
  }
  if (period === "week") {
    const start = new Date(); start.setDate(start.getDate() - 7);
    return { $gte: start };
  }
  if (period === "month") {
    const start = new Date(); start.setDate(1); start.setHours(0, 0, 0, 0);
    return { $gte: start };
  }
  if (period === "year") {
    const start = new Date();
    return { $gte: new Date(start.getFullYear(), 0, 1) };
  }
  return null;
};

export const getAppointmentStats = async ({ period = "month", groupBy = "status" }) => {
  const filter = getDateFilter(period);
  const match = filter ? { date: filter } : {};

  if (groupBy === "status") {
    const result = await Appointment.aggregate([
      { $match: match },
      { $group: { _id: "$status", count: { $sum: 1 } } },
    ]);
    return {
      period,
      total: result.reduce((s, r) => s + r.count, 0),
      byStatus: result.map((r) => ({ status: r._id || "unknown", count: r.count })),
    };
  }

  if (groupBy === "doctor") {
    const result = await Appointment.aggregate([
      { $match: match },
      { $group: { _id: "$doctorId", count: { $sum: 1 } } },
      { $sort: { count: -1 } },
      { $limit: 10 },
      {
        $lookup: {
          from: "doctors",
          localField: "_id",
          foreignField: "_id",
          as: "doctor",
        },
      },
      { $unwind: { path: "$doctor", preserveNullAndEmptyArrays: true } },
      {
        $project: {
          count: 1,
          doctorName: { $ifNull: ["$doctor.name", "Unknown"] },
          specialization: "$doctor.specialization",
        },
      },
    ]);
    return {
      period,
      topDoctorsByAppointments: result.map((r) => ({
        doctor: r.doctorName,
        specialization: r.specialization,
        appointments: r.count,
      })),
    };
  }

  if (groupBy === "day") {
    const result = await Appointment.aggregate([
      { $match: match },
      {
        $group: {
          _id: { $dateToString: { format: "%Y-%m-%d", date: "$date" } },
          count: { $sum: 1 },
        },
      },
      { $sort: { _id: 1 } },
    ]);
    return {
      period,
      byDay: result.map((r) => ({ date: r._id, count: r.count })),
    };
  }

  return { error: "Invalid groupBy" };
};