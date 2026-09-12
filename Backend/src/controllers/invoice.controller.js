import Invoice from "../models/invoice.model.js";
import {
  getPagination,
  buildPaginatedResponse,
} from "../utils/pagination.js";
import { getPatientByUserId } from "../utils/profile.js";
import { generateInvoiceNumber } from "../utils/invoice.js";

const populateInvoice = [
  {
    path: "patient",
    populate: { path: "user", select: "name email phone" },
  },
  { path: "payment" },
];

export const createInvoice = async (req, res) => {
  try {
    const { patientId, items, tax = 0, notes, paymentId } = req.body;

    if (!patientId || !items || !items.length) {
      return res.status(400).json({
        success: false,
        message: "patientId and items are required",
      });
    }

    const normalizedItems = items.map((item) => {
      const quantity = item.quantity || 1;
      const unitPrice = item.unitPrice || 0;
      return {
        description: item.description,
        quantity,
        unitPrice,
        total: quantity * unitPrice,
      };
    });

    const subtotal = normalizedItems.reduce((sum, i) => sum + i.total, 0);
    const totalAmount = subtotal + Number(tax || 0);
    const invoiceNumber = await generateInvoiceNumber();

    const invoice = await Invoice.create({
      invoiceNumber,
      patient: patientId,
      payment: paymentId,
      items: normalizedItems,
      subtotal,
      tax,
      totalAmount,
      status: "issued",
      notes,
    });

    const populated = await Invoice.findById(invoice._id).populate(
      populateInvoice
    );

    return res.status(201).json({
      success: true,
      message: "Invoice created successfully",
      invoice: populated,
    });
  } catch (error) {
    console.error("Create Invoice Error:", error);
    return res.status(500).json({
      success: false,
      message: "Server error while creating invoice",
    });
  }
};

export const getInvoices = async (req, res) => {
  try {
    const { page, limit, skip } = getPagination(req.query);
    const { status, patientId } = req.query;
    const filter = {};

    if (status) filter.status = status;

    if (req.user.role === "patient") {
      const patient = await getPatientByUserId(req.user._id);
      if (!patient) {
        return res.status(200).json({
          success: true,
          ...buildPaginatedResponse({ data: [], total: 0, page, limit }),
        });
      }
      filter.patient = patient._id;
    } else if (patientId) {
      filter.patient = patientId;
    }

    const [invoices, total] = await Promise.all([
      Invoice.find(filter)
        .populate(populateInvoice)
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit),
      Invoice.countDocuments(filter),
    ]);

    return res.status(200).json({
      success: true,
      message: "Invoices fetched successfully",
      ...buildPaginatedResponse({ data: invoices, total, page, limit }),
    });
  } catch (error) {
    console.error("Get Invoices Error:", error);
    return res.status(500).json({
      success: false,
      message: "Server error while fetching invoices",
    });
  }
};

export const getInvoiceById = async (req, res) => {
  try {
    const invoice = await Invoice.findById(req.params.id).populate(
      populateInvoice
    );

    if (!invoice) {
      return res.status(404).json({
        success: false,
        message: "Invoice not found",
      });
    }

    if (req.user.role === "patient") {
      const patient = await getPatientByUserId(req.user._id);
      if (
        !patient ||
        invoice.patient._id.toString() !== patient._id.toString()
      ) {
        return res.status(403).json({
          success: false,
          message: "Access denied",
        });
      }
    }

    return res.status(200).json({
      success: true,
      invoice,
    });
  } catch (error) {
    console.error("Get Invoice Error:", error);
    return res.status(500).json({
      success: false,
      message: "Server error while fetching invoice",
    });
  }
};

export const updateInvoiceStatus = async (req, res) => {
  try {
    const { status } = req.body;
    const allowed = ["draft", "issued", "paid", "cancelled"];

    if (!allowed.includes(status)) {
      return res.status(400).json({
        success: false,
        message: "Invalid invoice status",
      });
    }

    const invoice = await Invoice.findById(req.params.id);

    if (!invoice) {
      return res.status(404).json({
        success: false,
        message: "Invoice not found",
      });
    }

    invoice.status = status;
    await invoice.save();

    return res.status(200).json({
      success: true,
      message: "Invoice status updated",
      invoice,
    });
  } catch (error) {
    console.error("Update Invoice Status Error:", error);
    return res.status(500).json({
      success: false,
      message: "Server error while updating invoice",
    });
  }
};
