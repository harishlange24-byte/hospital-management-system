import bcrypt from "bcryptjs";
import User from "../models/user.model.js";
import Doctor from "../models/doctor.model.js";
import {
  getPagination,
  buildPaginatedResponse,
  escapeRegex,
} from "../utils/pagination.js";

const populateDoctor = {
  path: "user",
  select: "name email phone profileImage isActive role",
};

// ==========================================
// CREATE DOCTOR (Admin)
// ==========================================
export const createDoctor = async (req, res) => {
  try {
    const {
      name,
      email,
      password,
      phone,
      profileImage,
      specialization,
      qualification,
      experienceYears,
      consultationFee,
      department,
      bio,
      availableDays,
    } = req.body;

    if (!name || !email || !password || !specialization) {
      return res.status(400).json({
        success: false,
        message: "Name, email, password and specialization are required",
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
      role: "doctor",
      phone,
      profileImage,
    });

    const doctor = await Doctor.create({
      user: user._id,
      specialization,
      qualification,
      experienceYears,
      consultationFee,
      department,
      bio,
      availableDays,
    });

    const populated = await Doctor.findById(doctor._id).populate(
      populateDoctor
    );

    return res.status(201).json({
      success: true,
      message: "Doctor created successfully",
      doctor: populated,
    });
  } catch (error) {
    console.error("Create Doctor Error:", error);
    return res.status(500).json({
      success: false,
      message: "Server error while creating doctor",
    });
  }
};

// ==========================================
// GET ALL DOCTORS (Search, Filter, Pagination)
// ==========================================
export const getDoctors = async (req, res) => {
  try {
    const { page, limit, skip } = getPagination(req.query);
    const {
      search,
      specialization,
      department,
      isAvailable,
    } = req.query;

    const filter = {};

    if (specialization) {
      filter.specialization = new RegExp(escapeRegex(specialization), "i");
    }

    if (department) {
      filter.department = new RegExp(escapeRegex(department), "i");
    }

    if (isAvailable !== undefined) {
      filter.isAvailable = isAvailable === "true";
    }

    if (search) {
      const regex = new RegExp(escapeRegex(search), "i");
      const users = await User.find({
        role: "doctor",
        $or: [{ name: regex }, { email: regex }, { phone: regex }],
      }).select("_id");

      const userIds = users.map((u) => u._id);

      filter.$or = [
        { user: { $in: userIds } },
        { specialization: regex },
        { department: regex },
        { qualification: regex },
      ];
    }

    const [doctors, total] = await Promise.all([
      Doctor.find(filter)
        .populate(populateDoctor)
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit),
      Doctor.countDocuments(filter),
    ]);

    return res.status(200).json({
      success: true,
      message: "Doctors fetched successfully",
      ...buildPaginatedResponse({ data: doctors, total, page, limit }),
    });
  } catch (error) {
    console.error("Get Doctors Error:", error);
    return res.status(500).json({
      success: false,
      message: "Server error while fetching doctors",
    });
  }
};

// ==========================================
// GET DOCTOR BY ID
// ==========================================
export const getDoctorById = async (req, res) => {
  try {
    const doctor = await Doctor.findById(req.params.id).populate(
      populateDoctor
    );

    if (!doctor) {
      return res.status(404).json({
        success: false,
        message: "Doctor not found",
      });
    }

    return res.status(200).json({
      success: true,
      doctor,
    });
  } catch (error) {
    console.error("Get Doctor Error:", error);
    return res.status(500).json({
      success: false,
      message: "Server error while fetching doctor",
    });
  }
};

// ==========================================
// GET MY DOCTOR PROFILE
// ==========================================
export const getMyDoctorProfile = async (req, res) => {
  try {
    const doctor = await Doctor.findOne({ user: req.user._id }).populate(
      populateDoctor
    );

    if (!doctor) {
      return res.status(404).json({
        success: false,
        message: "Doctor profile not found",
      });
    }

    return res.status(200).json({
      success: true,
      doctor,
    });
  } catch (error) {
    console.error("Get My Doctor Profile Error:", error);
    return res.status(500).json({
      success: false,
      message: "Server error while fetching doctor profile",
    });
  }
};

// ==========================================
// UPDATE DOCTOR
// ==========================================
export const updateDoctor = async (req, res) => {
  try {
    const doctor = await Doctor.findById(req.params.id);

    if (!doctor) {
      return res.status(404).json({
        success: false,
        message: "Doctor not found",
      });
    }

    // Doctor can only update own profile unless admin
    if (
      req.user.role === "doctor" &&
      doctor.user.toString() !== req.user._id.toString()
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
      specialization,
      qualification,
      experienceYears,
      consultationFee,
      department,
      bio,
      availableDays,
      isAvailable,
    } = req.body;

    const userUpdates = {};
    if (name !== undefined) userUpdates.name = name;
    if (phone !== undefined) userUpdates.phone = phone;
    if (profileImage !== undefined) userUpdates.profileImage = profileImage;
    if (isActive !== undefined && req.user.role === "admin") {
      userUpdates.isActive = isActive;
    }

    if (Object.keys(userUpdates).length) {
      await User.findByIdAndUpdate(doctor.user, userUpdates);
    }

    if (specialization !== undefined) doctor.specialization = specialization;
    if (qualification !== undefined) doctor.qualification = qualification;
    if (experienceYears !== undefined)
      doctor.experienceYears = experienceYears;
    if (consultationFee !== undefined)
      doctor.consultationFee = consultationFee;
    if (department !== undefined) doctor.department = department;
    if (bio !== undefined) doctor.bio = bio;
    if (availableDays !== undefined) doctor.availableDays = availableDays;
    if (isAvailable !== undefined) doctor.isAvailable = isAvailable;

    await doctor.save();

    const populated = await Doctor.findById(doctor._id).populate(
      populateDoctor
    );

    return res.status(200).json({
      success: true,
      message: "Doctor updated successfully",
      doctor: populated,
    });
  } catch (error) {
    console.error("Update Doctor Error:", error);
    return res.status(500).json({
      success: false,
      message: "Server error while updating doctor",
    });
  }
};

// ==========================================
// DELETE / DEACTIVATE DOCTOR (Admin)
// ==========================================
export const deleteDoctor = async (req, res) => {
  try {
    const doctor = await Doctor.findById(req.params.id);

    if (!doctor) {
      return res.status(404).json({
        success: false,
        message: "Doctor not found",
      });
    }

    await User.findByIdAndUpdate(doctor.user, { isActive: false });
    doctor.isAvailable = false;
    await doctor.save();

    return res.status(200).json({
      success: true,
      message: "Doctor deactivated successfully",
    });
  } catch (error) {
    console.error("Delete Doctor Error:", error);
    return res.status(500).json({
      success: false,
      message: "Server error while deleting doctor",
    });
  }
};
