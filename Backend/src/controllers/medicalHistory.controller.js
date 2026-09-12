import MedicalHistory from "../models/medicalHistory.model.js";
import {
  getPagination,
  buildPaginatedResponse,
  escapeRegex,
} from "../utils/pagination.js";
import { getPatientByUserId } from "../utils/profile.js";

const populateHistory = [
  {
    path: "patient",
    populate: { path: "user", select: "name email phone" },
  },
  { path: "recordedBy", select: "name email role" },
];

export const createMedicalHistory = async (req, res) => {
  try {
    const {
      patientId,
      title,
      description,
      condition,
      diagnosisDate,
      treatment,
      notes,
    } = req.body;

    let resolvedPatientId = patientId;

    if (req.user.role === "patient") {
      const patient = await getPatientByUserId(req.user._id);
      if (!patient) {
        return res.status(400).json({
          success: false,
          message: "Complete your patient profile first",
        });
      }
      resolvedPatientId = patient._id;
    }

    if (!resolvedPatientId || !title) {
      return res.status(400).json({
        success: false,
        message: "patientId and title are required",
      });
    }

    const history = await MedicalHistory.create({
      patient: resolvedPatientId,
      title,
      description,
      condition,
      diagnosisDate,
      treatment,
      notes,
      recordedBy: req.user._id,
    });

    const populated = await MedicalHistory.findById(history._id).populate(
      populateHistory
    );

    return res.status(201).json({
      success: true,
      message: "Medical history added successfully",
      medicalHistory: populated,
    });
  } catch (error) {
    console.error("Create Medical History Error:", error);
    return res.status(500).json({
      success: false,
      message: "Server error while creating medical history",
    });
  }
};

export const getMedicalHistories = async (req, res) => {
  try {
    const { page, limit, skip } = getPagination(req.query);
    const { patientId, search } = req.query;
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
    } else if (patientId) {
      filter.patient = patientId;
    }

    if (search) {
      const regex = new RegExp(escapeRegex(search), "i");
      filter.$or = [
        { title: regex },
        { condition: regex },
        { description: regex },
      ];
    }

    const [items, total] = await Promise.all([
      MedicalHistory.find(filter)
        .populate(populateHistory)
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit),
      MedicalHistory.countDocuments(filter),
    ]);

    return res.status(200).json({
      success: true,
      message: "Medical history fetched successfully",
      ...buildPaginatedResponse({ data: items, total, page, limit }),
    });
  } catch (error) {
    console.error("Get Medical History Error:", error);
    return res.status(500).json({
      success: false,
      message: "Server error while fetching medical history",
    });
  }
};

export const getMedicalHistoryById = async (req, res) => {
  try {
    const item = await MedicalHistory.findById(req.params.id).populate(
      populateHistory
    );

    if (!item) {
      return res.status(404).json({
        success: false,
        message: "Medical history not found",
      });
    }

    return res.status(200).json({
      success: true,
      medicalHistory: item,
    });
  } catch (error) {
    console.error("Get Medical History By Id Error:", error);
    return res.status(500).json({
      success: false,
      message: "Server error while fetching medical history",
    });
  }
};

export const updateMedicalHistory = async (req, res) => {
  try {
    const item = await MedicalHistory.findById(req.params.id);

    if (!item) {
      return res.status(404).json({
        success: false,
        message: "Medical history not found",
      });
    }

    const {
      title,
      description,
      condition,
      diagnosisDate,
      treatment,
      notes,
    } = req.body;

    if (title !== undefined) item.title = title;
    if (description !== undefined) item.description = description;
    if (condition !== undefined) item.condition = condition;
    if (diagnosisDate !== undefined) item.diagnosisDate = diagnosisDate;
    if (treatment !== undefined) item.treatment = treatment;
    if (notes !== undefined) item.notes = notes;

    await item.save();

    const populated = await MedicalHistory.findById(item._id).populate(
      populateHistory
    );

    return res.status(200).json({
      success: true,
      message: "Medical history updated successfully",
      medicalHistory: populated,
    });
  } catch (error) {
    console.error("Update Medical History Error:", error);
    return res.status(500).json({
      success: false,
      message: "Server error while updating medical history",
    });
  }
};

export const deleteMedicalHistory = async (req, res) => {
  try {
    const item = await MedicalHistory.findById(req.params.id);

    if (!item) {
      return res.status(404).json({
        success: false,
        message: "Medical history not found",
      });
    }

    await item.deleteOne();

    return res.status(200).json({
      success: true,
      message: "Medical history deleted successfully",
    });
  } catch (error) {
    console.error("Delete Medical History Error:", error);
    return res.status(500).json({
      success: false,
      message: "Server error while deleting medical history",
    });
  }
};
