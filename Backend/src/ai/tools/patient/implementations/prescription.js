// backend/src/ai/tools/patient/implementations/prescriptions.js
import Prescription from "../../../../models/prescription.model.js";

export const getMyPrescriptions = async ({ limit = 5 } = {}, { userId }) => {
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