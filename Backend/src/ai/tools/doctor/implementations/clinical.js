// Backend/src/ai/tools/doctor/implementations/clinical.js
import Patient from "../../../../models/patient.model.js";
import Prescription from "../../../../models/prescription.model.js";
import LabReport from "../../../../models/labReport.model.js";
import MedicalHistory from "../../../../models/medicalHistory.model.js";
import { verifyDoctorHasAccess } from "./patients.js";

/**
 * Full snapshot for AI summarization
 */
export const summarizePatientHistory = async ({ patientId }, { userId }) => {
  const hasAccess = await verifyDoctorHasAccess(userId, patientId);
  if (!hasAccess) return { error: "Access denied" };

  const [patient, prescriptions, labs, history] = await Promise.all([
    Patient.findById(patientId)
      .select("name age gender bloodGroup allergies chronicConditions")
      .lean(),
    Prescription.find({ patientId }).sort({ createdAt: -1 }).limit(5).lean(),
    LabReport.find({ patientId }).sort({ createdAt: -1 }).limit(10).lean(),
    MedicalHistory.find({ patientId }).sort({ createdAt: -1 }).limit(5).lean(),
  ]);

  return {
    patient: patient && {
      name: patient.name,
      age: patient.age,
      gender: patient.gender,
      bloodGroup: patient.bloodGroup,
      allergies: patient.allergies,
      chronicConditions: patient.chronicConditions,
    },
    recentPrescriptions: prescriptions.map((p) => ({
      date: p.createdAt,
      diagnosis: p.diagnosis,
      medicines: (p.medicines || []).map((m) => `${m.name} ${m.dosage}`).join(", "),
    })),
    recentLabs: labs.map((l) => ({
      date: l.createdAt,
      testName: l.testName,
      value: `${l.value} ${l.unit || ""}`,
      normalRange: l.normalRange,
      status: l.status,
    })),
    medicalHistory: history.map((h) => ({
      condition: h.condition,
      diagnosedDate: h.diagnosedDate,
      treatment: h.treatment,
    })),
  };
};

/**
 * Return current medicines for AI to check interactions
 */
export const checkDrugInteractions = async ({ patientId }, { userId }) => {
  const hasAccess = await verifyDoctorHasAccess(userId, patientId);
  if (!hasAccess) return { error: "Access denied" };

  const prescriptions = await Prescription.find({ patientId })
    .sort({ createdAt: -1 })
    .limit(5)
    .lean();

  const activeMeds = [];
  prescriptions.forEach((p) => {
    (p.medicines || []).forEach((m) => {
      activeMeds.push({
        name: m.name,
        dosage: m.dosage,
        frequency: m.frequency,
        prescribedOn: p.createdAt,
      });
    });
  });

  return {
    totalMedicines: activeMeds.length,
    medicines: activeMeds,
    note: "Analyze these for potential interactions and contraindications.",
  };
};

/**
 * Draft prescription — does NOT save to DB, returns draft for doctor approval
 */
export const draftPrescription = async (
  { patientId, diagnosis, medicines, notes },
  { userId }
) => {
  const hasAccess = await verifyDoctorHasAccess(userId, patientId);
  if (!hasAccess) return { error: "Access denied" };

  // Sirf draft return — actual save doctor UI se hoga
  return {
    status: "draft",
    patientId,
    doctorId: userId,
    diagnosis,
    medicines,
    notes,
    createdAt: new Date(),
    message:
      "Draft ready. Doctor must review and save via the UI. This is NOT saved yet.",
    requiresApproval: true,
  };
};