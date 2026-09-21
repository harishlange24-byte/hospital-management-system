// Backend/src/ai/tools/admin/implementations/patients.js
import Patient from "../../../../models/patient.model.js";

const getDateFilter = (period) => {
  const now = new Date();
  if (period === "today") {
    const start = new Date(); start.setHours(0, 0, 0, 0);
    return { $gte: start };
  }
  if (period === "week") {
    const start = new Date(); start.setDate(start.getDate() - 7);
    return { $gte: start };
  }
  if (period === "month") {
    const start = new Date(); start.setDate(1); start.setHours(0, 0, 0, 0);
    return { $gte: start };
  }
  if (period === "year") {
    return { $gte: new Date(now.getFullYear(), 0, 1) };
  }
  return null; // all
};

export const getPatientStats = async ({ period = "month" }) => {
  const filter = getDateFilter(period);
  const match = filter ? { createdAt: filter } : {};

  const [total, ageGroups, genderDist] = await Promise.all([
    Patient.countDocuments(match),
    Patient.aggregate([
      { $match: match },
      {
        $bucket: {
          groupBy: "$age",
          boundaries: [0, 18, 35, 50, 65, 120],
          default: "unknown",
          output: { count: { $sum: 1 } },
        },
      },
    ]),
    Patient.aggregate([
      { $match: match },
      { $group: { _id: "$gender", count: { $sum: 1 } } },
    ]),
  ]);

  const ageLabels = { 0: "0-17", 18: "18-34", 35: "35-49", 50: "50-64", 65: "65+" };

  return {
    period,
    totalPatients: total,
    byAgeGroup: ageGroups.map((a) => ({
      group: ageLabels[a._id] || a._id,
      count: a.count,
    })),
    byGender: genderDist.map((g) => ({
      gender: g._id || "unknown",
      count: g.count,
    })),
  };
};