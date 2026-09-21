// Backend/src/ai/tools/index.js
import { patientTools } from "./patient/index.js";
import { doctorTools } from "./doctor/index.js";
import { adminTools } from "./admin/index.js";

export const toolsByRole = {
  patient: patientTools,
  doctor: doctorTools,
  admin: adminTools,
};

export const getRoleTools = (role) => {
  return toolsByRole[role] || toolsByRole.patient;
};