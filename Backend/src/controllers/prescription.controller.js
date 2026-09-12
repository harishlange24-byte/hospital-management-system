import Prescription from "../models/prescription.model.js";
import Patient from "../models/patient.model.js";
import Appointment from "../models/appointment.model.js";
import {
  getPagination,
  buildPaginatedResponse,
} from "../utils/pagination.js";
import {
  getDoctorByUserId,
  getPatientByUserId,
} from "../utils/profile.js";
import { createNotification } from "../utils/notify.js";

const populatePrescription = [
  {
    path: "patient",
    populate: { path: "user", select: "name email phone" },
  },
  {
    path: "doctor",
    populate: { path: "user", select: "name email" },
  },
  { path: "appointment" },
];

export const createPrescription = async (req, res) => {
  try {
    const {
      patientId,
      appointmentId,
      diagnosis,
      medicines,
      advice,
      followUpDate,
    } = req.body;

    const doctor = await getDoctorByUserId(req.user._id);
    if (!doctor && req.user.role === "doctor") {
      return res.status(404).json({
        success: false,
        message: "Doctor profile not found",
      });
    }

    let resolvedPatientId = patientId;
    let resolvedDoctorId = doctor?._id;

    if (appointmentId) {
      const appointment = await Appointment.findById(appointmentId).populate(
        "patient"
      );
      if (!appointment) {
        return res.status(404).json({
          success: false,
          message: "Appointment not found",
        });
      }
      resolvedPatientId = appointment.patient._id;
      resolvedDoctorId = appointment.doctor;
    }

    if (!resolvedPatientId || !resolvedDoctorId) {
      return res.status(400).json({
        success: false,
        message: "patientId (or appointmentId) is required",
      });
    }

    if (req.user.role === "admin" && req.body.doctorId) {
      resolvedDoctorId = req.body.doctorId;
    }

    const prescription = await Prescription.create({
      patient: resolvedPatientId,
      doctor: resolvedDoctorId,
      ...(appointmentId ? {appointment : appointmentId}: {}),
      diagnosis,
      medicines: medicines || [],
      advice,
      followUpDate,
    });

    const patientDoc = await Patient.findById(resolvedPatientId);
    if (patientDoc) {
      await createNotification({
        user: patientDoc.user,
        title: "New Prescription",
        message: "A new prescription has been added to your record",
        type: "info",
        relatedId: prescription._id,
        relatedModel: "Prescription",
      });
    }

    const populated = await Prescription.findById(prescription._id).populate(
      populatePrescription
    );

    return res.status(201).json({
      success: true,
      message: "Prescription created successfully",
      prescription: populated,
    });
  } catch (error) {
    console.error("Create Prescription Error:", error);
    return res.status(500).json({
      success: false,
      message: "Server error while creating prescription",
    });
  }
};

export const getPrescriptions = async (req, res) => {
  try {
    const { page, limit, skip } = getPagination(req.query);
    const { patientId, doctorId } = req.query;
    const filter = {};

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
      if (!doctor) {
        return res.status(404).json({
          success: false,
          message: "Doctor profile not found",
        });
      }
      filter.doctor = doctor._id;
      if (patientId) filter.patient = patientId;
    } else {
      if (patientId) filter.patient = patientId;
      if (doctorId) filter.doctor = doctorId;
    }

    const [prescriptions, total] = await Promise.all([
      Prescription.find(filter)
        .populate(populatePrescription)
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit),
      Prescription.countDocuments(filter),
    ]);

    return res.status(200).json({
      success: true,
      message: "Prescriptions fetched successfully",
      ...buildPaginatedResponse({ data: prescriptions, total, page, limit }),
    });
  } catch (error) {
    console.error("Get Prescriptions Error:", error);
    return res.status(500).json({
      success: false,
      message: "Server error while fetching prescriptions",
    });
  }
};

export const getPrescriptionById = async (req, res) => {
  try {
    const prescription = await Prescription.findById(req.params.id).populate(
      populatePrescription
    );

    if (!prescription) {
      return res.status(404).json({
        success: false,
        message: "Prescription not found",
      });
    }

    return res.status(200).json({
      success: true,
      prescription,
    });
  } catch (error) {
    console.error("Get Prescription Error:", error);
    return res.status(500).json({
      success: false,
      message: "Server error while fetching prescription",
    });
  }
};

export const updatePrescription = async (req, res) => {
  try {
    const prescription = await Prescription.findById(req.params.id);

    if (!prescription) {
      return res.status(404).json({
        success: false,
        message: "Prescription not found",
      });
    }

    if (req.user.role === "doctor") {
      const doctor = await getDoctorByUserId(req.user._id);
      if (
        !doctor ||
        prescription.doctor.toString() !== doctor._id.toString()
      ) {
        return res.status(403).json({
          success: false,
          message: "Access denied",
        });
      }
    }

    const { diagnosis, medicines, advice, followUpDate } = req.body;
    if (diagnosis !== undefined) prescription.diagnosis = diagnosis;
    if (medicines !== undefined) prescription.medicines = medicines;
    if (advice !== undefined) prescription.advice = advice;
    if (followUpDate !== undefined) prescription.followUpDate = followUpDate;

    await prescription.save();

    const populated = await Prescription.findById(prescription._id).populate(
      populatePrescription
    );

    return res.status(200).json({
      success: true,
      message: "Prescription updated successfully",
      prescription: populated,
    });
  } catch (error) {
    console.error("Update Prescription Error:", error);
    return res.status(500).json({
      success: false,
      message: "Server error while updating prescription",
    });
  }
};

export const deletePrescription = async (req, res) => {
  try {
    const prescription = await Prescription.findById(req.params.id);

    if (!prescription) {
      return res.status(404).json({
        success: false,
        message: "Prescription not found",
      });
    }

    await prescription.deleteOne();

    return res.status(200).json({
      success: true,
      message: "Prescription deleted successfully",
    });
  } catch (error) {
    console.error("Delete Prescription Error:", error);
    return res.status(500).json({
      success: false,
      message: "Server error while deleting prescription",
    });
  }
};
