const mongoose = require("mongoose")

const taskSchema = new mongoose.Schema(
  {
    title: { type: String, required: true },
    description: { type: String, default: "" },
    project: { type: mongoose.Schema.Types.ObjectId, ref: "Project", required: true },
    assignedTo: [{ type: mongoose.Schema.Types.ObjectId, ref: "User" }],
    priority: { type: String, enum: ["Low", "Medium", "High", "Critical"], default: "Medium" },
    status: { type: String, enum: ["New", "In Progress", "Blocked", "Done"], default: "New" },
    dueDate: { type: Date, required: true },
    hoursLogged: { type: Number, default: 0 },
    estimatedHours: { type: Number, default: 0 },
    blockers: [{ type: String, default: "" }],
    comments: [{ type: String, default: "" }],
    attachments: [{ type: String, default: "" }],
    createdAt: { type: Date, default: Date.now },
    updatedAt: { type: Date, default: Date.now },
  },
  { timestamps: true },
)

module.exports = mongoose.model("Task", taskSchema)
