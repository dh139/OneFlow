const mongoose = require("mongoose")

const expenseSchema = new mongoose.Schema(
  {
    title: { type: String, required: true },
    description: { type: String, default: "" },
    project: { type: mongoose.Schema.Types.ObjectId, ref: "Project", required: true },
    amount: { type: Number, required: true },
    category: { type: String, enum: ["Travel", "Tools", "Software", "Other"], default: "Other" },
    billable: { type: Boolean, default: false },
    status: { type: String, enum: ["Submitted", "Approved", "Rejected", "Reimbursed"], default: "Submitted" },
    receipt: { type: String, default: "" },
    submittedBy: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    approvedBy: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
    expenseDate: { type: Date, required: true },
    createdAt: { type: Date, default: Date.now },
    updatedAt: { type: Date, default: Date.now },
  },
  { timestamps: true },
)

module.exports = mongoose.model("Expense", expenseSchema)
