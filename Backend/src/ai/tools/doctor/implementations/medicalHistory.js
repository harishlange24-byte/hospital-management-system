// Backend/src/ai/tools/doctor/implementations/medicalHistory.js
import MedicalHistory from "../../../../models/MedicalHistory.model.js";
import { verifyDoctorHasAccess } from "./patients.js";

export const getPatientMedicalHistory = async ({ patientId }, { userId }) => {
  const hasAccess = await verifyDoctorHasAccess(userId, patientId);
  if (!hasAccess) return { error: "Access denied" };

  const history = await MedicalHistory.find({ patientId })
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