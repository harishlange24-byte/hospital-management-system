import mongoose from "mongoose";

const invoiceItemSchema = new mongoose.Schema(
  {
    description: { type: String, required: true, trim: true },
    quantity: { type: Number, default: 1, min: 1 },
    unitPrice: { type: Number, required: true, min: 0 },
    total: { type: Number, required: true, min: 0 },
  },
  { _id: false }
);

const invoiceSchema = new mongoose.Schema(
  {
    invoiceNumber: {
      type: String,
      unique: true,
      required: true,
    },

    patient: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Patient",
      required: true,
    },

    payment: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Payment",
    },

    items: {
      type: [invoiceItemSchema],
      default: [],
    },

    subtotal: {
      type: Number,
      required: true,
      min: 0,
    },

    tax: {
      type: Number,
      default: 0,
      min: 0,
    },

    totalAmount: {
      type: Number,
      required: true,
      min: 0,
    },

    status: {
      type: String,
      enum: ["draft", "issued", "paid", "cancelled"],
      default: "issued",
    },

    issuedAt: {
      type: Date,
      default: Date.now,
    },

    notes: {
      type: String,
      trim: true,
      default: "",
    },
  },
  {
    timestamps: true,
  }
);

invoiceSchema.index({ patient: 1, createdAt: -1 });

const Invoice = mongoose.model("Invoice", invoiceSchema);

export default Invoice;
