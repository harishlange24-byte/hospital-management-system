// backend/src/ai/tools/patient/implementations/invoices.js
import Invoice from "../../../../models/invoice.model.js";

export const getMyInvoices = async ({ onlyPending = false } = {}, { userId }) => {
  const query = { patientId: userId };
  if (onlyPending) query.status = { $ne: "paid" };

  const invoices = await Invoice.find(query)
    .sort({ createdAt: -1 })
    .limit(10)
    .lean();

  const totalPending = invoices
    .filter((i) => i.status !== "paid")
    .reduce((sum, i) => sum + (i.amount || 0), 0);

  return {
    count: invoices.length,
    totalPending,
    invoices: invoices.map((i) => ({
      id: i._id.toString(),
      amount: i.amount,
      status: i.status,
      date: i.createdAt,
      dueDate: i.dueDate,
    })),
  };
};