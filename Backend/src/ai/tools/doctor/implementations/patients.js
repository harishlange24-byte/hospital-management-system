// Backend/src/ai/tools/doctor/implementations/patients.js
import Appointment from "../../../../models/Appointment.model.js";
import Patient from "../../../../models/Patient.model.js";

/**
 * Doctor ka access check — kya ye patient doctor ke paas tha kabhi?
 */
const verifyDoctorHasAccess = async (doctorId, patientId) => {
  const exists = await Appointment.findOne({
    doctorId,
    patientId,
  }).select("_id").lean();
  return !!exists;
};

export const getMyPatientList = async ({ searchName, limit = 20 } = {}, { userId }) => {
  // Doctor ke unique patients nikaalo
  const appointments = await Appointment.find({ doctorId: userId })
    .distinct("patientId");

  const query = { _id: { $in: appointments } };
  if (searchName) query.name = { $regex: searchName, $options: "i" };

  const patients = await Patient.find(query)
    .select("name age gender bloodGroup phone")
    .limit(limit)
    .lean();

  return {
    count: patients.length,
    patients: patients.map((p) => ({
      id: p._id.toString(),
      name: p.name,
      age: p.age,
      gender: p.gender,
      bloodGroup: p.bloodGroup,
      phone: p.phone,
    })),
  };
};

export const getPatientDetails = async ({ patientId }, { userId }) => {
  const hasAccess = await verifyDoctorHasAccess(userId, patientId);
  if (!hasAccess) {
    return { error: "You don't have access to this patient's records" };
  }

  const patient = await Patient.findById(patientId)
    .select("name age gender bloodGroup allergies chronicConditions phone email")
    .lean();

  if (!patient) return { error: "Patient not found" };

  return {
    id: patient._id.toString(),
    name: patient.name,
    age: patient.age,
    gender: patient.gender,
    bloodGroup: patient.bloodGroup,
    allergies: patient.allergies,
    chronicConditions: patient.chronicConditions,
    phone: patient.phone,
    email: patient.email,
  };
};

// Export helper for other files
export { verifyDoctorHasAccess };