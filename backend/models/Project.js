const mongoose = require("mongoose")

const projectSchema = new mongoose.Schema(
  {
    name: { type: String, required: true },
    description: { type: String, default: "" },
    status: { type: String, enum: ["New", "In Progress", "Done"], default: "New" },
    image: { type: String, default: "" },
    projectManager: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    teamMembers: [{ type: mongoose.Schema.Types.ObjectId, ref: "User" }],
    budget: { type: Number, default: 0 },
    startDate: { type: Date, required: true },
    endDate: { type: Date, required: true },
    progress: { type: Number, default: 0 },
    totalCost: { type: Number, default: 0 },
    totalRevenue: { type: Number, default: 0 },
    salesOrders: [{ type: mongoose.Schema.Types.ObjectId, ref: "SalesOrder" }],
    purchaseOrders: [{ type: mongoose.Schema.Types.ObjectId, ref: "PurchaseOrder" }],
    invoices: [{ type: mongoose.Schema.Types.ObjectId, ref: "Invoice" }],
    vendorBills: [{ type: mongoose.Schema.Types.ObjectId, ref: "VendorBill" }],
    expenses: [{ type: mongoose.Schema.Types.ObjectId, ref: "Expense" }],
    createdAt: { type: Date, default: Date.now },
    updatedAt: { type: Date, default: Date.now },
  },
  { timestamps: true },
)

module.exports = mongoose.model("Project", projectSchema)
