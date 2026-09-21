// Backend/src/ai/tools/admin/implementations/dashboard.js
import Patient from "../../../../models/patient.model.js";
import Doctor from "../../../../models/doctor.model.js";
import Appointment from "../../../../models/appointment.model.js";
import Invoice from "../../../../models/invoice.model.js";

export const getDashboardStats = async () => {
  const todayStart = new Date(); todayStart.setHours(0, 0, 0, 0);
  const todayEnd = new Date(); todayEnd.setHours(23, 59, 59, 999);

  const monthStart = new Date();
  monthStart.setDate(1);
  monthStart.setHours(0, 0, 0, 0);

  const [
    totalPatients,
    totalDoctors,
    appointmentsToday,
    revenueThisMonth,
    pendingInvoices,
  ] = await Promise.all([
    Patient.countDocuments(),
    Doctor.countDocuments(),
    Appointment.countDocuments({ date: { $gte: todayStart, $lte: todayEnd } }),
    Invoice.aggregate([
      { $match: { status: "paid", updatedAt: { $gte: monthStart } } },
      { $group: { _id: null, total: { $sum: "$amount" } } },
    ]),
    Invoice.aggregate([
      { $match: { status: { $ne: "paid" } } },
      { $group: { _id: null, total: { $sum: "$amount" }, count: { $sum: 1 } } },
    ]),
  ]);

  return {
    totalPatients,
    totalDoctors,
    appointmentsToday,
    revenueThisMonth: revenueThisMonth[0]?.total || 0,
    pendingInvoices: {
      count: pendingInvoices[0]?.count || 0,
      totalAmount: pendingInvoices[0]?.total || 0,
    },
    generatedAt: new Date(),
  };
};