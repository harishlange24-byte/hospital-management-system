import crypto from "crypto";
import Invoice from "../models/invoice.model.js";

export const generateInvoiceNumber = async () => {
  const date = new Date();
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, "0");
  const d = String(date.getDate()).padStart(2, "0");
  const random = crypto.randomBytes(3).toString("hex").toUpperCase();
  const invoiceNumber = `INV-${y}${m}${d}-${random}`;

  const exists = await Invoice.findOne({ invoiceNumber });
  if (exists) return generateInvoiceNumber();

  return invoiceNumber;
};
