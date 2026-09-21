// Backend/src/ai/tools/admin/implementations/revenue.js
import Invoice from "../../../../models/invoice.model.js";

export const getRevenueReport = async ({ period = "month" }) => {
  const now = new Date();
  let start;
  if (period === "today") { start = new Date(); start.setHours(0, 0, 0, 0); }
  else if (period === "week") { start = new Date(); start.setDate(start.getDate() - 7); }
  else if (period === "month") { start = new Date(); start.setDate(1); start.setHours(0, 0, 0, 0); }
  else { start = new Date(now.getFullYear(), 0, 1); }

  const match = { createdAt: { $gte: start } };

  const [collected, pending, bySource] = await Promise.all([
    Invoice.aggregate([
      { $match: { ...match, status: "paid" } },
      { $group: { _id: null, total: { $sum: "$amount" } } },
    ]),
    Invoice.aggregate([
      { $match: { ...match, status: { $ne: "paid" } } },
      { $group: { _id: null, total: { $sum: "$amount" }, count: { $sum: 1 } } },
    ]),
    Invoice.aggregate([
      { $match: match },
      { $group: { _id: "$serviceType", total: { $sum: "$amount" }, count: { $sum: 1 } } },
    ]),
  ]);

  return {
    period,
    collected: collected[0]?.total || 0,
    pending: {
      amount: pending[0]?.total || 0,
      count: pending[0]?.count || 0,
    },
    bySource: bySource.map((s) => ({
      service: s._id || "other",
      revenue: s.total,
      count: s.count,
    })),
  };
};

export const getPendingInvoices = async () => {
  const now = new Date();

  const result = await Invoice.aggregate([
    { $match: { status: { $ne: "paid" } } },
    {
      $project: {
        amount: 1,
        status: 1,
        dueDate: 1,
        agingDays: {
          $divide: [{ $subtract: [now, "$createdAt"] }, 1000 * 60 * 60 * 24],
        },
      },
    },
    {
      $bucket: {
        groupBy: "$agingDays",
        boundaries: [0, 7, 30, 60, 90, 99999],
        default: "old",
        output: {
          count: { $sum: 1 },
          totalAmount: { $sum: "$amount" },
        },
      },
    },
  ]);

  const labels = { 0: "0-7 days", 7: "8-30 days", 30: "31-60 days", 60: "61-90 days", 90: "90+ days" };

  const totalPending = result.reduce((s, r) => s + r.totalAmount, 0);
  const totalCount = result.reduce((s, r) => s + r.count, 0);

  return {
    totalPendingAmount: totalPending,
    totalPendingCount: totalCount,
    aging: result.map((r) => ({
      bucket: labels[r._id] || r._id,
      count: r.count,
      amount: r.totalAmount,
    })),
  };
};