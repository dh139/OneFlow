const mongoose = require("mongoose")

const salesOrderSchema = new mongoose.Schema(
  {
    soNumber: { type: String, required: true, unique: true },
    customer: { type: String, required: true },
    project: { type: mongoose.Schema.Types.ObjectId, ref: "Project" },
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
    status: { type: String, enum: ["Draft", "Confirmed", "Delivered", "Billed", "Cancelled"], default: "Draft" },
    issueDate: { type: Date, default: Date.now },
    dueDate: { type: Date, required: true },
    notes: { type: String, default: "" },
    createdBy: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
    createdAt: { type: Date, default: Date.now },
    updatedAt: { type: Date, default: Date.now },
  },
  { timestamps: true },
)

module.exports = mongoose.model("SalesOrder", salesOrderSchema)
