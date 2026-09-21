// Backend/src/ai/tools/doctor/declarations.js
export const doctorFunctionDeclarations = [
  {
    name: "getMySchedule",
    description: "Get the logged-in doctor's schedule. Use 'today', 'week', or 'all'.",
    parameters: {
      type: "object",
      properties: {
        filter: { type: "string", enum: ["today", "week", "all"] },
      },
      required: ["filter"],
    },
  },
  {
    name: "getMyAppointments",
    description: "Get doctor's appointments. Filter: 'today', 'upcoming', 'past', or 'all'.",
    parameters: {
      type: "object",
      properties: {
        filter: { type: "string", enum: ["today", "upcoming", "past", "all"] },
      },
      required: ["filter"],
    },
  },
  {
    name: "getMyPatientList",
    description: "Get list of patients the doctor has seen. Optionally search by name.",
    parameters: {
      type: "object",
      properties: {
        searchName: { type: "string", description: "Patient name keyword to search" },
        limit: { type: "number", description: "Default 20" },
      },
    },
  },
  {
    name: "getPatientDetails",
    description: "Get a specific patient's full profile. Only works for patients the doctor has treated.",
    parameters: {
      type: "object",
      properties: {
        patientId: { type: "string" },
      },
      required: ["patientId"],
    },
  },
  {
    name: "getPatientPrescriptions",
    description: "Get prescriptions for a patient the doctor has treated.",
    parameters: {
      type: "object",
      properties: {
        patientId: { type: "string" },
        limit: { type: "number", description: "Default 10" },
      },
      required: ["patientId"],
    },
  },
  {
    name: "getPatientLabReports",
    description: "Get lab reports for a patient. Optionally filter by test name.",
    parameters: {
      type: "object",
      properties: {
        patientId: { type: "string" },
        testName: { type: "string" },
        limit: { type: "number", description: "Default 10" },
      },
      required: ["patientId"],
    },
  },
  {
    name: "getPatientMedicalHistory",
    description: "Get medical history for a patient the doctor has treated.",
    parameters: {
      type: "object",
      properties: {
        patientId: { type: "string" },
      },
      required: ["patientId"],
    },
  },
  {
    name: "summarizePatientHistory",
    description: "Get a comprehensive snapshot of a patient for clinical review — profile, recent prescriptions, recent labs, medical history. Use this when doctor asks for 'summary', 'overview', or 'brief me on this patient'.",
    parameters: {
      type: "object",
      properties: {
        patientId: { type: "string" },
      },
      required: ["patientId"],
    },
  },
  {
    name: "analyzeLabTrends",
    description: "Get chronological lab data for trend analysis. Returns values over time so AI can spot patterns.",
    parameters: {
      type: "object",
      properties: {
        patientId: { type: "string" },
        testName: { type: "string", description: "Test name to analyze (e.g., blood sugar, hemoglobin)" },
      },
      required: ["patientId", "testName"],
    },
  },
  {
    name: "checkDrugInteractions",
    description: "Get a patient's current medications so you (AI) can flag potential interactions. Use when doctor asks about safety of adding a new drug or reviewing current meds.",
    parameters: {
      type: "object",
      properties: {
        patientId: { type: "string" },
      },
      required: ["patientId"],
    },
  },
  {
    name: "draftPrescription",
    description: "Create a DRAFT prescription for doctor's review. Never auto-saves — returns draft for approval. Only call after doctor explicitly provides diagnosis and medicines.",
    parameters: {
      type: "object",
      properties: {
        patientId: { type: "string" },
        diagnosis: { type: "string" },
        medicines: {
          type: "array",
          description: "List of medicines",
          items: {
            type: "object",
            properties: {
              name: { type: "string" },
              dosage: { type: "string" },
              frequency: { type: "string" },
              duration: { type: "string" },
              instructions: { type: "string" },
            },
            required: ["name", "dosage", "frequency", "duration"],
          },
        },
        notes: { type: "string" },
      },
      required: ["patientId", "diagnosis", "medicines"],
    },
  },
];