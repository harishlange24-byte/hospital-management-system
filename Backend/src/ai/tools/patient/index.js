// backend/src/ai/tools/patient/index.js
import { patientFunctionDeclarations } from "../patient/declaration.js";
import { getMyProfile } from "../patient/implementations/profile.js";
import {
  getMyAppointments,
  bookAppointment,
  cancelAppointment,
} from "./implementations/appointments.js";
import { getMyPrescriptions } from "../patient/implementations/prescription.js";
import { getMyLabReports } from "../patient/implementations/labReports.js";
import { getMyMedicalHistory } from "../patient/implementations/medicalHistory.js";
import { getMyInvoices } from "../patient/implementations/invoices.js";
import { listDoctors, getAvailableSlots } from "../patient/implementations/doctor.js";

export const patientTools = {
  functions: patientFunctionDeclarations,
  implementations: {
    getMyProfile,
    getMyAppointments,
    getMyPrescriptions,
    getMyLabReports,
    getMyMedicalHistory,
    getMyInvoices,
    listDoctors,
    getAvailableSlots,
    bookAppointment,
    cancelAppointment,
  },
};