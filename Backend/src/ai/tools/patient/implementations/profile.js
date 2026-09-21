// backend/src/ai/tools/patient/implementations/profile.js
import Patient from "../../../../models/patient.model.js";

export const getMyProfile = async (args, { userId }) => {
  const patient = await Patient.findById(userId)
    .select("name age gender bloodGroup allergies chronicConditions phone email")
    .lean();
  if (!patient) return { error: "Profile not found" };
  return patient;
};