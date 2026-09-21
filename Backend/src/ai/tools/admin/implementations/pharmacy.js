// Backend/src/ai/tools/admin/implementations/pharmacy.js
import Medicine from "../../../../models/medicine.model.js";

export const getPharmacyInventory = async ({ lowStock = false, searchName } = {}) => {
  const query = {};
  if (searchName) query.name = { $regex: searchName, $options: "i" };

  if (lowStock) {
    query.$expr = { $lt: ["$quantity", "$reorderLevel"] };
  }

  const medicines = await Medicine.find(query)
    .select("name category quantity reorderLevel price expiryDate")
    .sort({ quantity: 1 })
    .limit(50)
    .lean();

  return {
    count: medicines.length,
    medicines: medicines.map((m) => ({
      id: m._id.toString(),
      name: m.name,
      category: m.category,
      quantity: m.quantity,
      reorderLevel: m.reorderLevel,
      price: m.price,
      expiryDate: m.expiryDate,
      needsRestock: m.quantity < (m.reorderLevel || 0),
    })),
  };
};

export const getPharmacySales = async ({ period = "month" }) => {
  // Assumption: PharmacySale model hai. Agar alag hai to adjust.
  const PharmacySale = (await import("../../../../models/pharmacySale.model.js")).default;

  const now = new Date();
  let start;
  if (period === "today") { start = new Date(); start.setHours(0, 0, 0, 0); }
  else if (period === "week") { start = new Date(); start.setDate(start.getDate() - 7); }
  else if (period === "month") { start = new Date(); start.setDate(1); start.setHours(0, 0, 0, 0); }
  else { start = new Date(now.getFullYear(), 0, 1); }

  const match = { createdAt: { $gte: start } };

  const [totalSales, topMeds] = await Promise.all([
    PharmacySale.aggregate([
      { $match: match },
      { $group: { _id: null, total: { $sum: "$totalAmount" }, count: { $sum: 1 } } },
    ]),
    PharmacySale.aggregate([
      { $match: match },
      { $unwind: "$items" },
      {
        $group: {
          _id: "$items.medicineName",
          quantity: { $sum: "$items.quantity" },
          revenue: { $sum: { $multiply: ["$items.quantity", "$items.price"] } },
        },
      },
      { $sort: { quantity: -1 } },
      { $limit: 10 },
    ]),
  ]);

  return {
    period,
    totalSales: totalSales[0]?.total || 0,
    totalTransactions: totalSales[0]?.count || 0,
    topMedicines: topMeds.map((m) => ({
      name: m._id,
      quantitySold: m.quantity,
      revenue: m.revenue,
    })),
  };
};

export const predictMedicineDemand = async ({ topN = 10 } = {}) => {
  const PharmacySale = (await import("../../../../models/pharmacySale.model.js")).default;

  // Last 3 months sales → average → predict next month
  const threeMonthsAgo = new Date();
  threeMonthsAgo.setMonth(threeMonthsAgo.getMonth() - 3);

  const sales = await PharmacySale.aggregate([
    { $match: { createdAt: { $gte: threeMonthsAgo } } },
    { $unwind: "$items" },
    {
      $group: {
        _id: "$items.medicineName",
        totalQuantity: { $sum: "$items.quantity" },
      },
    },
    { $sort: { totalQuantity: -1 } },
    { $limit: topN },
  ]);

  return {
    note: "Prediction based on last 3 months avg. Actual demand may vary.",
    predictions: sales.map((s) => ({
      medicine: s._id,
      last3MonthsTotal: s.totalQuantity,
      predictedNextMonth: Math.ceil(s.totalQuantity / 3),
    })),
  };
};