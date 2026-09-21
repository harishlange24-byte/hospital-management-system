// backend/src/ai/tools/patient/implementations/labReports.js
import LabReport from "../../../../models/LabReport.model.js";

export const getMyLabReports = async ({ testName, limit = 5 } = {}, { userId }) => {
  const query = { patientId: userId };
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
      date: r.createdAt,
      status: r.status,
      remarks: r.remarks,
    })),
  };
};