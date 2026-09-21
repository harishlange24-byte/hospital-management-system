
import medicalHistory from "../../../../models/medicalHistory.model.js";

export const getMyMedicalHistory = async (args, { userId }) => {
  const history = await medicalHistory.find({ patientId: userId })
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