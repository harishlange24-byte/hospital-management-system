// Backend/src/ai/tools/admin/index.js
import { adminFunctionDeclarations } from "./declaration.js";
import { getDashboardStats } from "./implementations/dashboard.js";
import { getPatientStats } from "./implementations/patients.js";
import { getAppointmentStats } from "./implementations/appointments.js";
import {
  getPharmacyInventory,
  getPharmacySales,
  predictMedicineDemand,
} from "./implementations/pharmacy.js";
import { getRevenueReport, getPendingInvoices } from "./implementations/revenue.js";
import {
  getStaffOverview,
  getDoctorPerformance,
} from "./implementations/staff.js";
import { sendBroadcastNotification } from "./implementations/notifications.js";

export const adminTools = {
  functions: adminFunctionDeclarations,
  implementations: {
    getDashboardStats,
    getPatientStats,
    getAppointmentStats,
    getDoctorPerformance,
    getPharmacyInventory,
    getPharmacySales,
    getRevenueReport,
    getPendingInvoices,
    getStaffOverview,
    predictMedicineDemand,
    sendBroadcastNotification,
  },
};