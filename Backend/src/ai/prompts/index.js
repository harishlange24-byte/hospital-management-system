import { patientSystemPrompt } from "./patient.prompt.js";
import { doctorSystemPrompt } from "./doctor.prompt.js";
import { adminSystemPrompt } from "./admin.prompt.js";

export const systemPrompts = {
  patient: patientSystemPrompt,
  doctor: doctorSystemPrompt,
  admin: adminSystemPrompt,
};

export const getSystemPrompt = (role) => {
  return systemPrompts[role] || systemPrompts.patient;
};