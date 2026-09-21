// Backend/src/ai/tools/doctor/index.js
import { doctorFunctionDeclarations } from "./declaration.js";
import { getMySchedule } from "./implementations/schedule.js";
import { getMyAppointments } from "./implementations/appointments.js";
import {
  getMyPatientList,
  getPatientDetails,
} from "./implementations/patients.js";
import { getPatientPrescriptions } from "./implementations/prescription.js";
import {
  getPatientLabReports,
  analyzeLabTrends,
} from "./implementations/labReports.js";
import { getPatientMedicalHistory } from "./implementations/medicalHistory.js";
import {
  summarizePatientHistory,
  checkDrugInteractions,
  draftPrescription,
} from "./implementations/clinical.js";

export const doctorTools = {
  functions: doctorFunctionDeclarations,
  implementations: {
    getMySchedule,
    getMyAppointments,
    getMyPatientList,
    getPatientDetails,
    getPatientPrescriptions,
    getPatientLabReports,
    getPatientMedicalHistory,
    summarizePatientHistory,
    analyzeLabTrends,
    checkDrugInteractions,
    draftPrescription,
  },
};