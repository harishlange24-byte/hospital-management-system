// Backend/src/ai/tools/doctor/implementations/prescriptions.js
import Prescription from "../../../../models/prescription.model.js";
import { verifyDoctorHasAccess } from "./patients.js";

export const getPatientPrescriptions = async (
  { patientId, limit = 10 },
  { userId }
) => {
  const hasAccess = await verifyDoctorHasAccess(userId, patientId);
  if (!hasAccess) return { error: "Access denied to this patient's records" };

  const prescriptions = await Prescription.find({ patientId })
    .populate("doctorId", "name specialization")
    .sort({ createdAt: -1 })
    .limit(limit)
    .lean();

  return {
    count: prescriptions.length,
    prescriptions: prescriptions.map((p) => ({
      id: p._id.toString(),
      date: p.createdAt,
      prescribedBy: p.doctorId?.name || "Unknown",
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