// Backend/src/ai/tools/admin/declarations.js
export const adminFunctionDeclarations = [
  {
    name: "getDashboardStats",
    description: "Get overall hospital stats — total patients, doctors, appointments today, revenue this month, pending invoices. Use for 'hospital overview' type questions.",
    parameters: { type: "object", properties: {} },
  },
  {
    name: "getPatientStats",
    description: "Get patient registration stats — total, new this month, age/gender distribution. Aggregate only.",
    parameters: {
      type: "object",
      properties: {
        period: { type: "string", enum: ["today", "week", "month", "year", "all"] },
      },
      required: ["period"],
    },
  },
  {
    name: "getAppointmentStats",
    description: "Get appointment analytics — total, completed, cancelled, no-shows. Breakdown by doctor or day.",
    parameters: {
      type: "object",
      properties: {
        period: { type: "string", enum: ["today", "week", "month", "year"] },
        groupBy: { type: "string", enum: ["status", "doctor", "day"], description: "How to group the stats" },
      },
      required: ["period"],
    },
  },
  {
    name: "getDoctorPerformance",
    description: "Get performance stats per doctor — appointments count, completion rate, avg rating. For staffing/reporting.",
    parameters: {
      type: "object",
      properties: {
        period: { type: "string", enum: ["week", "month", "year"] },
      },
      required: ["period"],
    },
  },
  {
    name: "getPharmacyInventory",
    description: "Get pharmacy medicine inventory. Use 'lowStock: true' to find medicines needing restock.",
    parameters: {
      type: "object",
      properties: {
        lowStock: { type: "boolean", description: "If true, only items below threshold" },
        searchName: { type: "string", description: "Search medicine by name" },
      },
    },
  },
  {
    name: "getPharmacySales",
    description: "Get pharmacy sales analytics — total sales, top-selling medicines, revenue trends.",
    parameters: {
      type: "object",
      properties: {
        period: { type: "string", enum: ["today", "week", "month", "year"] },
      },
      required: ["period"],
    },
  },
  {
    name: "getRevenueReport",
    description: "Get hospital revenue report — total collected, pending, breakdown by source (consultation, pharmacy, lab).",
    parameters: {
      type: "object",
      properties: {
        period: { type: "string", enum: ["today", "week", "month", "year"] },
      },
      required: ["period"],
    },
  },
  {
    name: "getPendingInvoices",
    description: "Get summary of unpaid invoices — count, total amount, aging breakdown. No individual patient details.",
    parameters: { type: "object", properties: {} },
  },
  {
    name: "getStaffOverview",
    description: "Get staff counts — total doctors, nurses, pharmacists, admins. Aggregate only.",
    parameters: { type: "object", properties: {} },
  },
  {
    name: "predictMedicineDemand",
    description: "Analyze past pharmacy sales to predict next month's medicine demand for top-selling items. Use for inventory planning.",
    parameters: {
      type: "object",
      properties: {
        topN: { type: "number", description: "How many top medicines to predict (default 10)" },
      },
    },
  },
  {
    name: "sendBroadcastNotification",
    description: "Send a notification to a group of users. Only call AFTER admin confirms the message and target audience. Never auto-send.",
    parameters: {
      type: "object",
      properties: {
        audience: { type: "string", enum: ["all_patients", "all_doctors", "all_staff", "all"] },
        title: { type: "string" },
        message: { type: "string" },
      },
      required: ["audience", "title", "message"],
    },
  },
];