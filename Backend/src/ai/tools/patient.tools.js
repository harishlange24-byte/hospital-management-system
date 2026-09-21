// backend/ai/tools/patient.tools.js
import Appointment from "../../models/appointment.model.js";
import Prescription from "../../models/Prescription.model.js";
import LabReport from "../../models/LabReport.model.js";
import MedicalHistory from "../../models/MedicalHistory.model.js";
import Invoice from "../../models/Invoice.model.js";
import Patient from "../../models/Patient.model.js";
import Doctor from "../../models/Doctor.model.js";
import Schedule from "../../models/Schedule.model.js";

// =====================================================
// 1. TOOL DECLARATIONS (Gemini ko batane ke liye)
// =====================================================
export const patientFunctionDeclarations = [
  {
    name: "getMyProfile",
    description: "Get the logged-in patient's basic profile (name, age, gender, blood group, allergies, chronic conditions).",
    parameters: { type: "object", properties: {} },
  },
  {
    name: "getMyAppointments",
    description: "Get the patient's appointments. Use 'upcoming' for future appointments, 'past' for history, 'all' for both.",
    parameters: {
      type: "object",
      properties: {
        filter: { type: "string", enum: ["upcoming", "past", "all"], description: "Which appointments to fetch" },
      },
      required: ["filter"],
    },
  },
  {
    name: "getMyPrescriptions",
    description: "Get patient's prescriptions. Optionally filter by doctor or date range.",
    parameters: {
      type: "object",
      properties: {
        limit: { type: "number", description: "How many recent prescriptions (default 5)" },
      },
    },
  },
  {
    name: "getMyLabReports",
    description: "Get patient's lab reports. Optionally filter by test name (e.g., 'blood sugar', 'hemoglobin').",
    parameters: {
      type: "object",
      properties: {
        testName: { type: "string", description: "Filter by test name keyword" },
        limit: { type: "number", description: "How many recent reports (default 5)" },
      },
    },
  },
  {
    name: "getMyMedicalHistory",
    description: "Get patient's medical history records (past conditions, surgeries, treatments).",
    parameters: { type: "object", properties: {} },
  },
  {
    name: "getMyInvoices",
    description: "Get patient's invoices and pending payments.",
    parameters: {
      type: "object",
      properties: {
        onlyPending: { type: "boolean", description: "If true, only unpaid invoices" },
      },
    },
  },
  {
    name: "getAvailableSlots",
    description: "Get available appointment slots for a specific doctor on a specific date. Use this before booking.",
    parameters: {
      type: "object",
      properties: {
        doctorName: { type: "string", description: "Doctor's name (partial match ok)" },
        date: { type: "string", description: "Date in YYYY-MM-DD format" },
      },
      required: ["doctorName", "date"],
    },
  },
  {
    name: "listDoctors",
    description: "List doctors, optionally filter by specialization. Use when patient asks 'kaunse doctors hain' or needs to pick one.",
    parameters: {
      type: "object",
      properties: {
        specialization: { type: "string", description: "Filter by specialization (e.g., cardiology, dermatology)" },
      },
    },
  },
  {
    name: "bookAppointment",
    description: "Book an appointment. Only call this AFTER the patient has confirmed all details (doctor, date, time, reason). Never book without confirmation.",
    parameters: {
      type: "object",
      properties: {
        doctorId: { type: "string", description: "Doctor's ID (from listDoctors or getAvailableSlots)" },
        date: { type: "string", description: "Date YYYY-MM-DD" },
        time: { type: "string", description: "Time slot (e.g., '10:00')" },
        reason: { type: "string", description: "Reason for visit" },
      },
      required: ["doctorId", "date", "time", "reason"],
    },
  },
  {
    name: "cancelAppointment",
    description: "Cancel an existing appointment. Only call AFTER patient confirms cancellation.",
    parameters: {
      type: "object",
      properties: {
        appointmentId: { type: "string", description: "Appointment ID" },
        reason: { type: "string", description: "Cancellation reason (optional)" },
      },
      required: ["appointmentId"],
    },
  },
];

// =====================================================
// 2. TOOL IMPLEMENTATIONS (Actual DB operations)
// =====================================================

const getMyProfile = async (args, { userId }) => {
  const patient = await Patient.findById(userId)
    .select("name age gender bloodGroup allergies chronicConditions phone email")
    .lean();
  if (!patient) return { error: "Profile not found" };
  return patient;
};

const getMyAppointments = async ({ filter = "all" }, { userId }) => {
  const query = { patientId: userId };
  const now = new Date();

  if (filter === "upcoming") query.date = { $gte: now };
  else if (filter === "past") query.date = { $lt: now };

  const appointments = await Appointment.find(query)
    .populate("doctorId", "name specialization")
    .sort({ date: filter === "past" ? -1 : 1 })
    .limit(10)
    .lean();

  return {
    count: appointments.length,
    appointments: appointments.map((a) => ({
      id: a._id.toString(),
      doctor: a.doctorId?.name || "Unknown",
      specialization: a.doctorId?.specialization || "",
      date: a.date,
      time: a.time,
      status: a.status,
      reason: a.reason,
    })),
  };
};

const getMyPrescriptions = async ({ limit = 5 } = {}, { userId }) => {
  const prescriptions = await Prescription.find({ patientId: userId })
    .populate("doctorId", "name specialization")
    .sort({ createdAt: -1 })
    .limit(limit)
    .lean();

  return {
    count: prescriptions.length,
    prescriptions: prescriptions.map((p) => ({
      id: p._id.toString(),
      date: p.createdAt,
      doctor: p.doctorId?.name || "Unknown",
      diagnosis: p.diagnosis,
      medicines: (p.medicines || []).map((m) => ({
        name: m.name,
        dosage: m.dosage,
        frequency: m.frequency,
        duration: m.duration,
        instructions: m.instructions,
      })),
      notes: p.notes,
    })),
  };
};

const getMyLabReports = async ({ testName, limit = 5 } = {}, { userId }) => {
  const query = { patientId: userId };
  if (testName) query.testName = { $regex: testName, $options: "i" };

  const reports = await LabReport.find(query)
    .sort({ createdAt: -1 })
    .limit(limit)
    .lean();

  return {
    count: reports.length,
    reports: reports.map((r) => ({
      id: r._id.toString(),
      testName: r.testName,
      value: r.value,
      unit: r.unit,
      normalRange: r.normalRange,
      date: r.createdAt,
      status: r.status,
      remarks: r.remarks,
    })),
  };
};

const getMyMedicalHistory = async (args, { userId }) => {
  const history = await MedicalHistory.find({ patientId: userId })
    .sort({ createdAt: -1 })
    .lean();

  return {
    count: history.length,
    records: history.map((h) => ({
      id: h._id.toString(),
      condition: h.condition,
      diagnosedDate: h.diagnosedDate,
      treatment: h.treatment,
      notes: h.notes,
    })),
  };
};

const getMyInvoices = async ({ onlyPending = false } = {}, { userId }) => {
  const query = { patientId: userId };
  if (onlyPending) query.status = { $ne: "paid" };

  const invoices = await Invoice.find(query)
    .sort({ createdAt: -1 })
    .limit(10)
    .lean();

  const totalPending = invoices
    .filter((i) => i.status !== "paid")
    .reduce((sum, i) => sum + (i.amount || 0), 0);

  return {
    count: invoices.length,
    totalPending,
    invoices: invoices.map((i) => ({
      id: i._id.toString(),
      amount: i.amount,
      status: i.status,
      date: i.createdAt,
      dueDate: i.dueDate,
    })),
  };
};

const listDoctors = async ({ specialization } = {}) => {
  const query = {};
  if (specialization) query.specialization = { $regex: specialization, $options: "i" };

  const doctors = await Doctor.find(query)
    .select("name specialization consultationFee")
    .limit(20)
    .lean();

  return {
    count: doctors.length,
    doctors: doctors.map((d) => ({
      id: d._id.toString(),
      name: d.name,
      specialization: d.specialization,
      fee: d.consultationFee,
    })),
  };
};

const getAvailableSlots = async ({ doctorName, date }) => {
  const doctor = await Doctor.findOne({ name: { $regex: doctorName, $options: "i" } }).lean();
  if (!doctor) return { error: `Doctor "${doctorName}" not found` };

  // Jo already booked hain us din
  const booked = await Appointment.find({
    doctorId: doctor._id,
    date: {
      $gte: new Date(date + "T00:00:00"),
      $lt: new Date(date + "T23:59:59"),
    },
    status: { $ne: "cancelled" },
  }).select("time").lean();

  const bookedTimes = booked.map((b) => b.time);

  // Schedule se doctor ke slots lo
  const dayName = new Date(date).toLocaleDateString("en-US", { weekday: "lowercase" });
  const schedule = await Schedule.findOne({ doctorId: doctor._id, day: dayName }).lean();

  if (!schedule || !schedule.slots) {
    return { doctor: doctor.name, date, availableSlots: [], message: "Doctor is not available on this day" };
  }

  const available = schedule.slots.filter((s) => !bookedTimes.includes(s));

  return {
    doctorId: doctor._id.toString(),
    doctor: doctor.name,
    date,
    availableSlots: available,
  };
};

const bookAppointment = async ({ doctorId, date, time, reason }, { userId }) => {
  // Double-check slot availability
  const existing = await Appointment.findOne({
    doctorId,
    date: {
      $gte: new Date(date + "T00:00:00"),
      $lt: new Date(date + "T23:59:59"),
    },
    time,
    status: { $ne: "cancelled" },
  });

  if (existing) return { error: "Slot already booked. Please choose another time." };

  const appt = await Appointment.create({
    patientId: userId,
    doctorId,
    date: new Date(date),
    time,
    reason,
    status: "pending",
  });

  return {
    success: true,
    appointmentId: appt._id.toString(),
    date: appt.date,
    time: appt.time,
    message: "Appointment booked successfully",
  };
};

const cancelAppointment = async ({ appointmentId, reason }, { userId }) => {
  const appt = await Appointment.findOne({ _id: appointmentId, patientId: userId });
  if (!appt) return { error: "Appointment not found or not yours" };
  if (appt.status === "cancelled") return { error: "Already cancelled" };

  appt.status = "cancelled";
  if (reason) appt.cancellationReason = reason;
  await appt.save();

  return { success: true, message: "Appointment cancelled" };
};

// =====================================================
// 3. EXPORT BUNDLE
// =====================================================
export const patientTools = {
  functions: patientFunctionDeclarations,
  implementations: {
    getMyProfile,
    getMyAppointments,
    getMyPrescriptions,
    getMyLabReports,
    getMyMedicalHistory,
    getMyInvoices,
    listDoctors,
    getAvailableSlots,
    bookAppointment,
    cancelAppointment,
  },
};