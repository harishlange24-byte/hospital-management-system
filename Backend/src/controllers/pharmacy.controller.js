import Medicine from "../models/medicine.model.js";
import PharmacySale from "../models/pharmacySale.model.js";
import {
  getPagination,
  buildPaginatedResponse,
  escapeRegex,
} from "../utils/pagination.js";

export const createMedicine = async (req, res) => {
  try {
    const {
      name,
      brand,
      category,
      description,
      unit,
      price,
      stock,
      lowStockThreshold,
      expiryDate,
    } = req.body;

    if (!name || price === undefined) {
      return res.status(400).json({
        success: false,
        message: "Name and price are required",
      });
    }

    const existing = await Medicine.findOne({ name: name.trim() });
    if (existing) {
      return res.status(409).json({
        success: false,
        message: "Medicine already exists",
      });
    }

    const medicine = await Medicine.create({
      name,
      brand,
      category,
      description,
      unit,
      price,
      stock,
      lowStockThreshold,
      expiryDate,
    });

    return res.status(201).json({
      success: true,
      message: "Medicine added successfully",
      medicine,
    });
  } catch (error) {
    console.error("Create Medicine Error:", error);
    return res.status(500).json({
      success: false,
      message: "Server error while creating medicine",
    });
  }
};

export const getMedicines = async (req, res) => {
  try {
    const { page, limit, skip } = getPagination(req.query);
    const { search, category, lowStock, isActive } = req.query;
    const filter = {};

    if (category) {
      filter.category = new RegExp(escapeRegex(category), "i");
    }

    if (isActive !== undefined) {
      filter.isActive = isActive === "true";
    }

    if (lowStock === "true") {
      filter.$expr = { $lte: ["$stock", "$lowStockThreshold"] };
    }

    if (search) {
      const regex = new RegExp(escapeRegex(search), "i");
      filter.$or = [
        { name: regex },
        { brand: regex },
        { category: regex },
      ];
    }

    const [medicines, total] = await Promise.all([
      Medicine.find(filter)
        .sort({ name: 1 })
        .skip(skip)
        .limit(limit),
      Medicine.countDocuments(filter),
    ]);

    return res.status(200).json({
      success: true,
      message: "Medicines fetched successfully",
      ...buildPaginatedResponse({ data: medicines, total, page, limit }),
    });
  } catch (error) {
    console.error("Get Medicines Error:", error);
    return res.status(500).json({
      success: false,
      message: "Server error while fetching medicines",
    });
  }
};

export const getMedicineById = async (req, res) => {
  try {
    const medicine = await Medicine.findById(req.params.id);

    if (!medicine) {
      return res.status(404).json({
        success: false,
        message: "Medicine not found",
      });
    }

    return res.status(200).json({
      success: true,
      medicine,
    });
  } catch (error) {
    console.error("Get Medicine Error:", error);
    return res.status(500).json({
      success: false,
      message: "Server error while fetching medicine",
    });
  }
};

export const updateMedicine = async (req, res) => {
  try {
    const medicine = await Medicine.findById(req.params.id);

    if (!medicine) {
      return res.status(404).json({
        success: false,
        message: "Medicine not found",
      });
    }

    const fields = [
      "name",
      "brand",
      "category",
      "description",
      "unit",
      "price",
      "stock",
      "lowStockThreshold",
      "expiryDate",
      "isActive",
    ];

    fields.forEach((field) => {
      if (req.body[field] !== undefined) medicine[field] = req.body[field];
    });

    await medicine.save();

    return res.status(200).json({
      success: true,
      message: "Medicine updated successfully",
      medicine,
    });
  } catch (error) {
    console.error("Update Medicine Error:", error);
    return res.status(500).json({
      success: false,
      message: "Server error while updating medicine",
    });
  }
};

export const deleteMedicine = async (req, res) => {
  try {
    const medicine = await Medicine.findById(req.params.id);

    if (!medicine) {
      return res.status(404).json({
        success: false,
        message: "Medicine not found",
      });
    }

    medicine.isActive = false;
    await medicine.save();

    return res.status(200).json({
      success: true,
      message: "Medicine deactivated successfully",
    });
  } catch (error) {
    console.error("Delete Medicine Error:", error);
    return res.status(500).json({
      success: false,
      message: "Server error while deleting medicine",
    });
  }
};

export const createPharmacySale = async (req, res) => {
  try {
    const { patientId, prescriptionId, items } = req.body;

    if (!items || !Array.isArray(items) || items.length === 0) {
      return res.status(400).json({
        success: false,
        message: "Sale items are required",
      });
    }

    const saleItems = [];
    let totalAmount = 0;

    for (const item of items) {
      const medicine = await Medicine.findById(item.medicineId);
      if (!medicine || !medicine.isActive) {
        return res.status(404).json({
          success: false,
          message: `Medicine not found: ${item.medicineId}`,
        });
      }

      const quantity = Number(item.quantity);
      if (!quantity || quantity < 1) {
        return res.status(400).json({
          success: false,
          message: `Invalid quantity for ${medicine.name}`,
        });
      }

      if (medicine.stock < quantity) {
        return res.status(400).json({
          success: false,
          message: `Insufficient stock for ${medicine.name}`,
        });
      }

      const lineTotal = medicine.price * quantity;
      saleItems.push({
        medicine: medicine._id,
        quantity,
        unitPrice: medicine.price,
        total: lineTotal,
      });
      totalAmount += lineTotal;

      medicine.stock -= quantity;
      await medicine.save();
    }

    const sale = await PharmacySale.create({
      patient: patientId,
      prescription: prescriptionId,
      items: saleItems,
      totalAmount,
      soldBy: req.user._id,
    });

    const populated = await PharmacySale.findById(sale._id)
      .populate("patient")
      .populate("items.medicine")
      .populate("soldBy", "name email");

    return res.status(201).json({
      success: true,
      message: "Pharmacy sale completed successfully",
      sale: populated,
    });
  } catch (error) {
    console.error("Create Pharmacy Sale Error:", error);
    return res.status(500).json({
      success: false,
      message: "Server error while creating pharmacy sale",
    });
  }
};

export const getPharmacySales = async (req, res) => {
  try {
    const { page, limit, skip } = getPagination(req.query);
    const { patientId } = req.query;
    const filter = {};

    if (patientId) filter.patient = patientId;

    const [sales, total] = await Promise.all([
      PharmacySale.find(filter)
        .populate("patient")
        .populate("items.medicine")
        .populate("soldBy", "name email")
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit),
      PharmacySale.countDocuments(filter),
    ]);

    return res.status(200).json({
      success: true,
      message: "Pharmacy sales fetched successfully",
      ...buildPaginatedResponse({ data: sales, total, page, limit }),
    });
  } catch (error) {
    console.error("Get Pharmacy Sales Error:", error);
    return res.status(500).json({
      success: false,
      message: "Server error while fetching pharmacy sales",
    });
  }
};
