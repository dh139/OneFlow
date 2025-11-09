const mongoose = require("mongoose")

const invoiceSchema = new mongoose.Schema(
  {
    invoiceNumber: { type: String, required: true, unique: true },
    project: { type: mongoose.Schema.Types.ObjectId, ref: "Project", required: true },
    customer: { type: String, required: true },
    salesOrder: { type: mongoose.Schema.Types.ObjectId, ref: "SalesOrder" },
    amount: { type: Number, required: true },
    items: [
      {
        product: String,
        quantity: Number,
        unit: String,
        unitPrice: Number,
        taxRate: Number,
        amount: Number,
      },
    ],
    subtotal: { type: Number, default: 0 },
    tax: { type: Number, default: 0 },
    total: { type: Number, default: 0 },
    status: { type: String, enum: ["Draft", "Sent", "Paid", "Overdue", "Cancelled"], default: "Draft" },
    issueDate: { type: Date, default: Date.now },
    dueDate: { type: Date, required: true },
    paidDate: { type: Date },
    notes: { type: String, default: "" },
    createdBy: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
    createdAt: { type: Date, default: Date.now },
    updatedAt: { type: Date, default: Date.now },
  },
  { timestamps: true },
)

module.exports = mongoose.model("Invoice", invoiceSchema)
