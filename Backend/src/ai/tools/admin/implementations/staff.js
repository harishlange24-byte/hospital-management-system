// Backend/src/ai/tools/admin/implementations/staff.js
import Doctor from "../../../../models/doctor.model.js";
import Patient from "../../../../models/patient.model.js";

export const getStaffOverview = async () => {
  const [totalDoctors, totalPatients] = await Promise.all([
    Doctor.countDocuments(),
    Patient.countDocuments(),
  ]);

  // Specialization breakdown
  const bySpecialization = await Doctor.aggregate([
    { $group: { _id: "$specialization", count: { $sum: 1 } } },
    { $sort: { count: -1 } },
  ]);

  return {
    totalDoctors,
    totalPatients,
    bySpecialization: bySpecialization.map((s) => ({
      specialization: s._id || "general",
      count: s.count,
    })),
  };
};

export const getDoctorPerformance = async ({ period = "month" }) => {
  // Placeholder — Appointment model aggregate
  const Appointment = (await import("../../../../models/appointment.model.js")).default;

  const now = new Date();
  let start;
  if (period === "week") { start = new Date(); start.setDate(start.getDate() - 7); }
  else if (period === "year") { start = new Date(now.getFullYear(), 0, 1); }
  else { start = new Date(); start.setDate(1); start.setHours(0, 0, 0, 0); }

  const result = await Appointment.aggregate([
    { $match: { date: { $gte: start } } },
    {
      $group: {
        _id: "$doctorId",
        total: { $sum: 1 },
        completed: { $sum: { $cond: [{ $eq: ["$status", "completed"] }, 1, 0] } },
        cancelled: { $sum: { $cond: [{ $eq: ["$status", "cancelled"] }, 1, 0] } },
      },
    },
    {
      $lookup: {
        from: "doctors",
        localField: "_id",
        foreignField: "_id",
        as: "doctor",
      },
    },
    { $unwind: { path: "$doctor", preserveNullAndEmptyArrays: true } },
    { $sort: { total: -1 } },
    { $limit: 20 },
    {
      $project: {
        doctorName: { $ifNull: ["$doctor.name", "Unknown"] },
        specialization: "$doctor.specialization",
        total: 1,
        completed: 1,
        cancelled: 1,
        completionRate: {
          $cond: [
            { $gt: ["$total", 0] },
            { $multiply: [{ $divide: ["$completed", "$total"] }, 100] },
            0,
          ],
        },
      },
    },
  ]);

  return { period, doctors: result };
};