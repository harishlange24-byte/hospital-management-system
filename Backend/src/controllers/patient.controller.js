import bcrypt from "bcryptjs";
import User from "../models/user.model.js";
import Patient from "../models/patient.model.js";
import {
  getPagination,
  buildPaginatedResponse,
  escapeRegex,
} from "../utils/pagination.js";

const populatePatient = {
  path: "user",
  select: "name email phone profileImage isActive role",
};

// ==========================================
// CREATE PATIENT (Admin) / ensure profile for self
// ==========================================
export const createPatient = async (req, res) => {
  try {
    const {
      name,
      email,
      password,
      phone,
      profileImage,
      dateOfBirth,
      gender,
      bloodGroup,
      address,
      emergencyContact,
      allergies,
      chronicDiseases,
    } = req.body;

    if (!name || !email || !password) {
      return res.status(400).json({
        success: false,
        message: "Name, email and password are required",
      });
    }

    const existingUser = await User.findOne({
      email: email.toLowerCase(),
    });

    if (existingUser) {
      return res.status(409).json({
        success: false,
        message: "User with this email already exists",
      });
    }

    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    const user = await User.create({
      name,
      email: email.toLowerCase(),
      password: hashedPassword,
      role: "patient",
      phone,
      profileImage,
    });

    const patient = await Patient.create({
      user: user._id,
      dateOfBirth,
      gender,
      bloodGroup,
      address,
      emergencyContact,
      allergies,
      chronicDiseases,
    });

    const populated = await Patient.findById(patient._id).populate(
      populatePatient
    );

    return res.status(201).json({
      success: true,
      message: "Patient created successfully",
      patient: populated,
    });
  } catch (error) {
    console.error("Create Patient Error:", error);
    return res.status(500).json({
      success: false,
      message: "Server error while creating patient",
    });
  }
};

// ==========================================
// CREATE / UPDATE OWN PATIENT PROFILE
// ==========================================
export const upsertMyPatientProfile = async (req, res) => {
  try {
    const {
      dateOfBirth,
      gender,
      bloodGroup,
      address,
      emergencyContact,
      allergies,
      chronicDiseases,
      name,
      phone,
      profileImage,
    } = req.body;

    const userUpdates = {};
    if (name !== undefined) userUpdates.name = name;
    if (phone !== undefined) userUpdates.phone = phone;
    if (profileImage !== undefined) userUpdates.profileImage = profileImage;

    if (Object.keys(userUpdates).length) {
      await User.findByIdAndUpdate(req.user._id, userUpdates);
    }

    let patient = await Patient.findOne({ user: req.user._id });

    if (!patient) {
      patient = await Patient.create({
        user: req.user._id,
        dateOfBirth,
        gender,
        bloodGroup,
        address,
        emergencyContact,
        allergies,
        chronicDiseases,
      });
    } else {
      if (dateOfBirth !== undefined) patient.dateOfBirth = dateOfBirth;
      if (gender !== undefined) patient.gender = gender;
      if (bloodGroup !== undefined) patient.bloodGroup = bloodGroup;
      if (address !== undefined) patient.address = address;
      if (emergencyContact !== undefined)
        patient.emergencyContact = emergencyContact;
      if (allergies !== undefined) patient.allergies = allergies;
      if (chronicDiseases !== undefined)
        patient.chronicDiseases = chronicDiseases;
      await patient.save();
    }

    const populated = await Patient.findById(patient._id).populate(
      populatePatient
    );

    return res.status(200).json({
      success: true,
      message: "Patient profile saved successfully",
      patient: populated,
    });
  } catch (error) {
    console.error("Upsert Patient Profile Error:", error);
    return res.status(500).json({
      success: false,
      message: "Server error while saving patient profile",
    });
  }
};

// ==========================================
// GET ALL PATIENTS
// ==========================================
export const getPatients = async (req, res) => {
  try {
    const { page, limit, skip } = getPagination(req.query);
    const { search, bloodGroup, gender } = req.query;

    const filter = {};

    if (bloodGroup) filter.bloodGroup = bloodGroup;
    if (gender) filter.gender = gender;

    if (search) {
      const regex = new RegExp(escapeRegex(search), "i");
      const users = await User.find({
        role: "patient",
        $or: [{ name: regex }, { email: regex }, { phone: regex }],
      }).select("_id");

      filter.user = { $in: users.map((u) => u._id) };
    }

    const [patients, total] = await Promise.all([
      Patient.find(filter)
        .populate(populatePatient)
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit),
      Patient.countDocuments(filter),
    ]);

    return res.status(200).json({
      success: true,
      message: "Patients fetched successfully",
      ...buildPaginatedResponse({ data: patients, total, page, limit }),
    });
  } catch (error) {
    console.error("Get Patients Error:", error);
    return res.status(500).json({
      success: false,
      message: "Server error while fetching patients",
    });
  }
};

// ==========================================
// GET PATIENT BY ID
// ==========================================
export const getPatientById = async (req, res) => {
  try {
    const patient = await Patient.findById(req.params.id).populate(
      populatePatient
    );

    if (!patient) {
      return res.status(404).json({
        success: false,
        message: "Patient not found",
      });
    }

    // Patients can only view own profile
    if (
      req.user.role === "patient" &&
      patient.user._id.toString() !== req.user._id.toString()
    ) {
      return res.status(403).json({
        success: false,
        message: "Access denied",
      });
    }

    return res.status(200).json({
      success: true,
      patient,
    });
  } catch (error) {
    console.error("Get Patient Error:", error);
    return res.status(500).json({
      success: false,
      message: "Server error while fetching patient",
    });
  }
};

// ==========================================
// GET MY PATIENT PROFILE
// ==========================================
export const getMyPatientProfile = async (req, res) => {
  try {
    const patient = await Patient.findOne({ user: req.user._id }).populate(
      populatePatient
    );

    if (!patient) {
      return res.status(404).json({
        success: false,
        message: "Patient profile not found. Please complete your profile.",
      });
    }

    return res.status(200).json({
      success: true,
      patient,
    });
  } catch (error) {
    console.error("Get My Patient Profile Error:", error);
    return res.status(500).json({
      success: false,
      message: "Server error while fetching patient profile",
    });
  }
};

// ==========================================
// UPDATE PATIENT (Admin / Self)
// ==========================================
export const updatePatient = async (req, res) => {
  try {
    const patient = await Patient.findById(req.params.id);

    if (!patient) {
      return res.status(404).json({
        success: false,
        message: "Patient not found",
      });
    }

    if (
      req.user.role === "patient" &&
      patient.user.toString() !== req.user._id.toString()
    ) {
      return res.status(403).json({
        success: false,
        message: "Access denied",
      });
    }

    const {
      name,
      phone,
      profileImage,
      isActive,
      dateOfBirth,
      gender,
      bloodGroup,
      address,
      emergencyContact,
      allergies,
      chronicDiseases,
    } = req.body;

    const userUpdates = {};
    if (name !== undefined) userUpdates.name = name;
    if (phone !== undefined) userUpdates.phone = phone;
    if (profileImage !== undefined) userUpdates.profileImage = profileImage;
    if (isActive !== undefined && req.user.role === "admin") {
      userUpdates.isActive = isActive;
    }

    if (Object.keys(userUpdates).length) {
      await User.findByIdAndUpdate(patient.user, userUpdates);
    }

    if (dateOfBirth !== undefined) patient.dateOfBirth = dateOfBirth;
    if (gender !== undefined) patient.gender = gender;
    if (bloodGroup !== undefined) patient.bloodGroup = bloodGroup;
    if (address !== undefined) patient.address = address;
    if (emergencyContact !== undefined)
      patient.emergencyContact = emergencyContact;
    if (allergies !== undefined) patient.allergies = allergies;
    if (chronicDiseases !== undefined)
      patient.chronicDiseases = chronicDiseases;

    await patient.save();

    const populated = await Patient.findById(patient._id).populate(
      populatePatient
    );

    return res.status(200).json({
      success: true,
      message: "Patient updated successfully",
      patient: populated,
    });
  } catch (error) {
    console.error("Update Patient Error:", error);
    return res.status(500).json({
      success: false,
      message: "Server error while updating patient",
    });
  }
};

// ==========================================
// DELETE / DEACTIVATE PATIENT (Admin)
// ==========================================
export const deletePatient = async (req, res) => {
  try {
    const patient = await Patient.findById(req.params.id);

    if (!patient) {
      return res.status(404).json({
        success: false,
        message: "Patient not found",
      });
    }

    await User.findByIdAndUpdate(patient.user, { isActive: false });

    return res.status(200).json({
      success: true,
      message: "Patient deactivated successfully",
    });
  } catch (error) {
    console.error("Delete Patient Error:", error);
    return res.status(500).json({
      success: false,
      message: "Server error while deleting patient",
    });
  }
};
