import User from "../models/user.model.js";
import Doctor from "../models/doctor.model.js";
import Patient from "../models/patient.model.js";
import Appointment from "../models/appointment.model.js";
import Payment from "../models/payment.model.js";
import Medicine from "../models/medicine.model.js";
import LabReport from "../models/labReport.model.js";
import {
  getDoctorByUserId,
  getPatientByUserId,
  startOfDay,
} from "../utils/profile.js";

export const getDashboardAnalytics = async (req, res) => {
  try {
    if (req.user.role === "admin") {
      const [
        totalUsers,
        totalDoctors,
        totalPatients,
        totalAppointments,
        pendingAppointments,
        completedAppointments,
        cancelledAppointments,
        paidPayments,
        lowStockMedicines,
        pendingLabReports,
      ] = await Promise.all([
        User.countDocuments(),
        Doctor.countDocuments(),
        Patient.countDocuments(),
        Appointment.countDocuments(),
        Appointment.countDocuments({ status: "pending" }),
        Appointment.countDocuments({ status: "completed" }),
        Appointment.countDocuments({ status: "cancelled" }),
        Payment.find({ status: "paid" }),
        Medicine.countDocuments({
          $expr: { $lte: ["$stock", "$lowStockThreshold"] },
          isActive: true,
        }),
        LabReport.countDocuments({ status: "pending" }),
      ]);

      const revenue = paidPayments.reduce((sum, p) => sum + p.amount, 0);

      const appointmentsByStatus = await Appointment.aggregate([
        { $group: { _id: "$status", count: { $sum: 1 } } },
      ]);

      const revenueByMonth = await Payment.aggregate([
        { $match: { status: "paid" } },
        {
          $group: {
            _id: {
              year: { $year: "$createdAt" },
              month: { $month: "$createdAt" },
            },
            total: { $sum: "$amount" },
            count: { $sum: 1 },
          },
        },
        { $sort: { "_id.year": 1, "_id.month": 1 } },
      ]);

      return res.status(200).json({
        success: true,
        analytics: {
          totals: {
            users: totalUsers,
            doctors: totalDoctors,
            patients: totalPatients,
            appointments: totalAppointments,
            revenue,
            lowStockMedicines,
            pendingLabReports,
          },
          appointments: {
            pending: pendingAppointments,
            completed: completedAppointments,
            cancelled: cancelledAppointments,
            byStatus: appointmentsByStatus,
          },
          revenueByMonth,
        },
      });
    }

    if (req.user.role === "doctor") {
      const doctor = await getDoctorByUserId(req.user._id);
      if (!doctor) {
        return res.status(404).json({
          success: false,
          message: "Doctor profile not found",
        });
      }

      const today = startOfDay(new Date());

      const [
        totalAppointments,
        todayAppointments,
        pendingAppointments,
        completedAppointments,
      ] = await Promise.all([
        Appointment.countDocuments({ doctor: doctor._id }),
        Appointment.countDocuments({
          doctor: doctor._id,
          appointmentDate: {
            $gte: today,
            $lte: new Date(today.getTime() + 24 * 60 * 60 * 1000 - 1),
          },
        }),
        Appointment.countDocuments({
          doctor: doctor._id,
          status: "pending",
        }),
        Appointment.countDocuments({
          doctor: doctor._id,
          status: "completed",
        }),
      ]);

      return res.status(200).json({
        success: true,
        analytics: {
          totals: {
            appointments: totalAppointments,
            todayAppointments,
            pendingAppointments,
            completedAppointments,
          },
        },
      });
    }

    // patient
    const patient = await getPatientByUserId(req.user._id);
    if (!patient) {
      return res.status(200).json({
        success: true,
        analytics: {
          totals: {
            appointments: 0,
            upcomingAppointments: 0,
            payments: 0,
            labReports: 0,
          },
        },
      });
    }

    const today = startOfDay(new Date());

    const [
      totalAppointments,
      upcomingAppointments,
      payments,
      labReports,
    ] = await Promise.all([
      Appointment.countDocuments({ patient: patient._id }),
      Appointment.countDocuments({
        patient: patient._id,
        appointmentDate: { $gte: today },
        status: { $in: ["pending", "confirmed"] },
      }),
      Payment.countDocuments({ patient: patient._id, status: "paid" }),
      LabReport.countDocuments({ patient: patient._id }),
    ]);

    return res.status(200).json({
      success: true,
      analytics: {
        totals: {
          appointments: totalAppointments,
          upcomingAppointments,
          payments,
          labReports,
        },
      },
    });
  } catch (error) {
    console.error("Analytics Error:", error);
    return res.status(500).json({
      success: false,
      message: "Server error while fetching analytics",
    });
  }
};
