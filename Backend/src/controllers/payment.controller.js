import crypto from "crypto";
import Payment from "../models/payment.model.js";
import Invoice from "../models/invoice.model.js";
import Patient from "../models/patient.model.js";
import Appointment from "../models/appointment.model.js";
import PharmacySale from "../models/pharmacySale.model.js";
import { getRazorpay } from "../config/razorpay.js";
import { generateInvoiceNumber } from "../utils/invoice.js";
import {
  getPagination,
  buildPaginatedResponse,
} from "../utils/pagination.js";
import { getPatientByUserId } from "../utils/profile.js";
import { createNotification } from "../utils/notify.js";

const populatePayment = [
  {
    path: "patient",
    populate: { path: "user", select: "name email phone" },
  },
  { path: "appointment" },
  { path: "pharmacySale" },
  { path: "invoice" },
];

export const createPaymentOrder = async (req, res) => {
  try {
    const {
      appointmentId,
      pharmacySaleId,
      amount,
      purpose = "appointment",
      patientId,
    } = req.body;

    let resolvedPatientId = patientId;
    let resolvedAmount = amount;

    if (req.user.role === "patient") {
      const patient = await getPatientByUserId(req.user._id);
      if (!patient) {
        return res.status(400).json({
          success: false,
          message: "Complete your patient profile first",
        });
      }
      resolvedPatientId = patient._id;
    }

    if (appointmentId) {
      const appointment = await Appointment.findById(appointmentId);
      if (!appointment) {
        return res.status(404).json({
          success: false,
          message: "Appointment not found",
        });
      }
      resolvedPatientId = appointment.patient;
      resolvedAmount = appointment.fee;
    }

    if (pharmacySaleId) {
      const sale = await PharmacySale.findById(pharmacySaleId);
      if (!sale) {
        return res.status(404).json({
          success: false,
          message: "Pharmacy sale not found",
        });
      }
      if (sale.patient) resolvedPatientId = sale.patient;
      resolvedAmount = sale.totalAmount;
    }

    if (!resolvedPatientId || resolvedAmount === undefined) {
      return res.status(400).json({
        success: false,
        message: "patientId and amount are required",
      });
    }

    const amountPaise = Math.round(Number(resolvedAmount) * 100);
    if (amountPaise <= 0) {
      return res.status(400).json({
        success: false,
        message: "Amount must be greater than 0",
      });
    }

    const razorpay = getRazorpay();
    const order = await razorpay.orders.create({
      amount: amountPaise,
      currency: "INR",
      receipt: `rcpt_${Date.now()}`,
    });

    const payment = await Payment.create({
      patient: resolvedPatientId,
      appointment: appointmentId,
      pharmacySale: pharmacySaleId,
      amount: resolvedAmount,
      purpose,
      status: "created",
      razorpayOrderId: order.id,
    });

    return res.status(201).json({
      success: true,
      message: "Payment order created successfully",
      order: {
        id: order.id,
        amount: order.amount,
        currency: order.currency,
      },
      key: process.env.RAZORPAY_KEY_ID,
      paymentId: payment._id,
    });
  } catch (error) {
    console.error("Create Payment Order Error:", error);
    return res.status(500).json({
      success: false,
      message: error.message || "Server error while creating payment order",
    });
  }
};

export const verifyPayment = async (req, res) => {
  try {
    const {
      razorpayOrderId,
      razorpayPaymentId,
      razorpaySignature,
      paymentId,
    } = req.body;

    if (!razorpayOrderId || !razorpayPaymentId || !razorpaySignature) {
      return res.status(400).json({
        success: false,
        message: "Razorpay payment details are required",
      });
    }

    const body = `${razorpayOrderId}|${razorpayPaymentId}`;
    const expectedSignature = crypto
      .createHmac("sha256", process.env.RAZORPAY_KEY_SECRET || "")
      .update(body)
      .digest("hex");

    if (expectedSignature !== razorpaySignature) {
      return res.status(400).json({
        success: false,
        message: "Invalid payment signature",
      });
    }

    const payment = await Payment.findOne(
      paymentId
        ? { _id: paymentId }
        : { razorpayOrderId }
    );

    if (!payment) {
      return res.status(404).json({
        success: false,
        message: "Payment record not found",
      });
    }

    payment.status = "paid";
    payment.razorpayPaymentId = razorpayPaymentId;
    payment.razorpaySignature = razorpaySignature;
    await payment.save();

    // Generate invoice
    const invoiceNumber = await generateInvoiceNumber();
    const invoice = await Invoice.create({
      invoiceNumber,
      patient: payment.patient,
      payment: payment._id,
      items: [
        {
          description: `Payment for ${payment.purpose}`,
          quantity: 1,
          unitPrice: payment.amount,
          total: payment.amount,
        },
      ],
      subtotal: payment.amount,
      tax: 0,
      totalAmount: payment.amount,
      status: "paid",
    });

    payment.invoice = invoice._id;
    await payment.save();

    const patient = await Patient.findById(payment.patient);
    if (patient) {
      await createNotification({
        user: patient.user,
        title: "Payment Successful",
        message: `Payment of ₹${payment.amount} was successful. Invoice ${invoiceNumber} generated.`,
        type: "payment",
        relatedId: payment._id,
        relatedModel: "Payment",
      });
    }

    const populated = await Payment.findById(payment._id).populate(
      populatePayment
    );

    return res.status(200).json({
      success: true,
      message: "Payment verified successfully",
      payment: populated,
      invoice,
    });
  } catch (error) {
    console.error("Verify Payment Error:", error);
    return res.status(500).json({
      success: false,
      message: "Server error while verifying payment",
    });
  }
};

export const getPayments = async (req, res) => {
  try {
    const { page, limit, skip } = getPagination(req.query);
    const { status, purpose } = req.query;
    const filter = {};

    if (status) filter.status = status;
    if (purpose) filter.purpose = purpose;

    if (req.user.role === "patient") {
      const patient = await getPatientByUserId(req.user._id);
      if (!patient) {
        return res.status(200).json({
          success: true,
          ...buildPaginatedResponse({ data: [], total: 0, page, limit }),
        });
      }
      filter.patient = patient._id;
    }

    const [payments, total] = await Promise.all([
      Payment.find(filter)
        .populate(populatePayment)
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit),
      Payment.countDocuments(filter),
    ]);

    return res.status(200).json({
      success: true,
      message: "Payments fetched successfully",
      ...buildPaginatedResponse({ data: payments, total, page, limit }),
    });
  } catch (error) {
    console.error("Get Payments Error:", error);
    return res.status(500).json({
      success: false,
      message: "Server error while fetching payments",
    });
  }
};

export const getPaymentById = async (req, res) => {
  try {
    const payment = await Payment.findById(req.params.id).populate(
      populatePayment
    );

    if (!payment) {
      return res.status(404).json({
        success: false,
        message: "Payment not found",
      });
    }

    return res.status(200).json({
      success: true,
      payment,
    });
  } catch (error) {
    console.error("Get Payment Error:", error);
    return res.status(500).json({
      success: false,
      message: "Server error while fetching payment",
    });
  }
};
