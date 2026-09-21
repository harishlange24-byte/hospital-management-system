// Backend/src/ai/tools/doctor/implementations/labReports.js
import LabReport from "../../../../models/labReport.model.js";
import { verifyDoctorHasAccess } from "./patients.js";

export const getPatientLabReports = async (
  { patientId, testName, limit = 10 },
  { userId }
) => {
  const hasAccess = await verifyDoctorHasAccess(userId, patientId);
  if (!hasAccess) return { error: "Access denied to this patient's records" };

  const query = { patientId };
  if (testName) query.testName = { $regex: testName, $options: "i" };

  const reports = await LabReport.find(query)
    .sort({ createdAt: -1 })
    .limit(limit)
    .lean();

  return {
    count: reports.length,
    reports: reports.map((r) => ({
      id: r._id.toString(),
      testName: r.testName,
      value: r.value,
      unit: r.unit,
      normalRange: r.normalRange,
      status: r.status,
      date: r.createdAt,
      remarks: r.remarks,
    })),
  };
};

export const analyzeLabTrends = async ({ patientId, testName }, { userId }) => {
  const hasAccess = await verifyDoctorHasAccess(userId, patientId);
  if (!hasAccess) return { error: "Access denied" };

  const reports = await LabReport.find({
    patientId,
    testName: { $regex: testName, $options: "i" },
  })
    .sort({ createdAt: 1 })
    .lean();

  if (reports.length === 0) {
    return { error: `No reports found for "${testName}"` };
  }

  return {
    testName,
    readingsCount: reports.length,
    timeline: reports.map((r) => ({
      date: r.createdAt,
      value: r.value,
      unit: r.unit,
      normalRange: r.normalRange,
      status: r.status,
    })),
  };
};