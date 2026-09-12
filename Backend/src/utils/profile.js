import Doctor from "../models/doctor.model.js";
import Patient from "../models/patient.model.js";

export const getDoctorByUserId = async (userId) => {
  return Doctor.findOne({ user: userId });
};

export const getPatientByUserId = async (userId) => {
  return Patient.findOne({ user: userId });
};

export const startOfDay = (date) => {
  const d = new Date(date);
  d.setHours(0, 0, 0, 0);
  return d;
};

export const endOfDay = (date) => {
  const d = new Date(date);
  d.setHours(23, 59, 59, 999);
  return d;
};
