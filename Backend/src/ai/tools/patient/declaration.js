// backend/src/ai/tools/patient/declarations.js
export const patientFunctionDeclarations = [
  {
    name: "getMyProfile",
    description: "Get the logged-in patient's basic profile (name, age, gender, blood group, allergies, chronic conditions).",
    parameters: { type: "object", properties: {} },
  },
  {
    name: "getMyAppointments",
    description: "Get the patient's appointments. Use 'upcoming' for future, 'past' for history, 'all' for both.",
    parameters: {
      type: "object",
      properties: {
        filter: { type: "string", enum: ["upcoming", "past", "all"] },
      },
      required: ["filter"],
    },
  },
  {
    name: "getMyPrescriptions",
    description: "Get patient's prescriptions. Optionally filter by limit.",
    parameters: {
      type: "object",
      properties: {
        limit: { type: "number", description: "How many recent (default 5)" },
      },
    },
  },
  {
    name: "getMyLabReports",
    description: "Get patient's lab reports. Optionally filter by test name.",
    parameters: {
      type: "object",
      properties: {
        testName: { type: "string", description: "Filter by test name keyword" },
        limit: { type: "number", description: "Default 5" },
      },
    },
  },
  {
    name: "getMyMedicalHistory",
    description: "Get patient's medical history records.",
    parameters: { type: "object", properties: {} },
  },
  {
    name: "getMyInvoices",
    description: "Get patient's invoices and pending payments.",
    parameters: {
      type: "object",
      properties: {
        onlyPending: { type: "boolean" },
      },
    },
  },
  {
    name: "listDoctors",
    description: "List doctors, optionally filter by specialization.",
    parameters: {
      type: "object",
      properties: {
        specialization: { type: "string" },
      },
    },
  },
  {
    name: "getAvailableSlots",
    description: "Get available appointment slots for a specific doctor on a specific date.",
    parameters: {
      type: "object",
      properties: {
        doctorName: { type: "string" },
        date: { type: "string", description: "YYYY-MM-DD" },
      },
      required: ["doctorName", "date"],
    },
  },
  {
    name: "bookAppointment",
    description: "Book an appointment. Only call AFTER patient confirms all details.",
    parameters: {
      type: "object",
      properties: {
        doctorId: { type: "string" },
        date: { type: "string" },
        time: { type: "string" },
        reason: { type: "string" },
      },
      required: ["doctorId", "date", "time", "reason"],
    },
  },
  {
    name: "cancelAppointment",
    description: "Cancel an existing appointment. Only call AFTER patient confirms.",
    parameters: {
      type: "object",
      properties: {
        appointmentId: { type: "string" },
        reason: { type: "string" },
      },
      required: ["appointmentId"],
    },
  },
];