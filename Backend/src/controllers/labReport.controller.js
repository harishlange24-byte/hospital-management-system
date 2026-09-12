import LabReport from "../models/labReport.model.js";
import {
  getPagination,
  buildPaginatedResponse,
  escapeRegex,
} from "../utils/pagination.js";
import {
  getDoctorByUserId,
  getPatientByUserId,
} from "../utils/profile.js";
import { createNotification } from "../utils/notify.js";
import Patient from "../models/patient.model.js";

const populateLab = [
  {
    path: "patient",
    populate: { path: "user", select: "name email phone" },
  },
  {
    path: "doctor",
    populate: { path: "user", select: "name email" },
  },
  { path: "uploadedBy", select: "name email role" },
];

export const createLabReport = async (req, res) => {
  try {
    const {
      patientId,
      doctorId,
      appointmentId,
      testName,
      testType,
      resultSummary,
      reportUrl,
      status,
      reportDate,
    } = req.body;

    if (!patientId || !testName) {
      return res.status(400).json({
        success: false,
        message: "patientId and testName are required",
      });
    }

    let resolvedDoctorId = doctorId;
    if (req.user.role === "doctor") {
      const doctor = await getDoctorByUserId(req.user._id);
      if (!doctor) {
        return res.status(404).json({
          success: false,
          message: "Doctor profile not found",
        });
      }
      resolvedDoctorId = doctor._id;
    }

    const report = await LabReport.create({
      patient: patientId,
      doctor: resolvedDoctorId,
      appointment: appointmentId,
      testName,
      testType,
      resultSummary,
      reportUrl,
      status: status || "pending",
      reportDate,
      uploadedBy: req.user._id,
    });

    const patient = await Patient.findById(patientId);
    if (patient) {
      await createNotification({
        user: patient.user,
        title: "Lab Report Added",
        message: `Lab report for ${testName} has been added`,
        type: "lab",
        relatedId: report._id,
        relatedModel: "LabReport",
      });
    }

    const populated = await LabReport.findById(report._id).populate(
      populateLab
    );

    return res.status(201).json({
      success: true,
      message: "Lab report created successfully",
      labReport: populated,
    });
  } catch (error) {
    console.error("Create Lab Report Error:", error);
    return res.status(500).json({
      success: false,
      message: "Server error while creating lab report",
    });
  }
};

export const getLabReports = async (req, res) => {
  try {
    const { page, limit, skip } = getPagination(req.query);
    const { patientId, status, search } = req.query;
    const filter = {};

    if (status) filter.status = status;
    if (search) {
      filter.testName = new RegExp(escapeRegex(search), "i");
    }

    if (req.user.role === "patient") {
      const patient = await getPatientByUserId(req.user._id);
      if (!patient) {
        return res.status(200).json({
          success: true,
          ...buildPaginatedResponse({ data: [], total: 0, page, limit }),
        });
      }
      filter.patient = patient._id;
    } else if (req.user.role === "doctor") {
      const doctor = await getDoctorByUserId(req.user._id);
      if (doctor) filter.doctor = doctor._id;
      if (patientId) filter.patient = patientId;
    } else if (patientId) {
      filter.patient = patientId;
    }

    const [reports, total] = await Promise.all([
      LabReport.find(filter)
        .populate(populateLab)
        .sort({ reportDate: -1 })
        .skip(skip)
        .limit(limit),
      LabReport.countDocuments(filter),
    ]);

    return res.status(200).json({
      success: true,
      message: "Lab reports fetched successfully",
      ...buildPaginatedResponse({ data: reports, total, page, limit }),
    });
  } catch (error) {
    console.error("Get Lab Reports Error:", error);
    return res.status(500).json({
      success: false,
      message: "Server error while fetching lab reports",
    });
  }
};

export const getLabReportById = async (req, res) => {
  try {
    const report = await LabReport.findById(req.params.id).populate(
      populateLab
    );

    if (!report) {
      return res.status(404).json({
        success: false,
        message: "Lab report not found",
      });
    }

    return res.status(200).json({
      success: true,
      labReport: report,
    });
  } catch (error) {
    console.error("Get Lab Report Error:", error);
    return res.status(500).json({
      success: false,
      message: "Server error while fetching lab report",
    });
  }
};

export const updateLabReport = async (req, res) => {
  try {
    const report = await LabReport.findById(req.params.id);

    if (!report) {
      return res.status(404).json({
        success: false,
        message: "Lab report not found",
      });
    }

    const {
      testName,
      testType,
      resultSummary,
      reportUrl,
      status,
      reportDate,
    } = req.body;

    if (testName !== undefined) report.testName = testName;
    if (testType !== undefined) report.testType = testType;
    if (resultSummary !== undefined) report.resultSummary = resultSummary;
    if (reportUrl !== undefined) report.reportUrl = reportUrl;
    if (status !== undefined) report.status = status;
    if (reportDate !== undefined) report.reportDate = reportDate;

    await report.save();

    const populated = await LabReport.findById(report._id).populate(
      populateLab
    );

    return res.status(200).json({
      success: true,
      message: "Lab report updated successfully",
      labReport: populated,
    });
  } catch (error) {
    console.error("Update Lab Report Error:", error);
    return res.status(500).json({
      success: false,
      message: "Server error while updating lab report",
    });
  }
};

export const deleteLabReport = async (req, res) => {
  try {
    const report = await LabReport.findById(req.params.id);

    if (!report) {
      return res.status(404).json({
        success: false,
        message: "Lab report not found",
      });
    }

    await report.deleteOne();

    return res.status(200).json({
      success: true,
      message: "Lab report deleted successfully",
    });
  } catch (error) {
    console.error("Delete Lab Report Error:", error);
    return res.status(500).json({
      success: false,
      message: "Server error while deleting lab report",
    });
  }
};
