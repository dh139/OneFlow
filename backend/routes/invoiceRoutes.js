const express = require("express")
const Invoice = require("../models/Invoice")
const { auth, roleCheck } = require("../middleware/auth")

const router = express.Router()

// Get all invoices
router.get("/", auth, async (req, res) => {
  try {
    const invoices = await Invoice.find()
      .populate("project", "name")
      .populate("createdBy", "name email")
      .sort({ createdAt: -1 })
    res.json(invoices)
  } catch (error) {
    res.status(500).json({ message: error.message })
  }
})

// Get invoices by project
router.get("/project/:projectId", auth, async (req, res) => {
  try {
    const invoices = await Invoice.find({ project: req.params.projectId }).populate("createdBy", "name email")
    res.json(invoices)
  } catch (error) {
    res.status(500).json({ message: error.message })
  }
})

// Create invoice
router.post("/", auth, roleCheck(["admin", "pm", "finance"]), async (req, res) => {
  try {
    const invoiceNumber = "INV-" + Date.now()
    const invoice = new Invoice({
      ...req.body,
      invoiceNumber,
      createdBy: req.user.id,
    })
    await invoice.save()
    await invoice.populate("project", "name")
    res.status(201).json(invoice)
  } catch (error) {
    res.status(500).json({ message: error.message })
  }
})

// Update invoice
router.put("/:id", auth, roleCheck(["admin", "pm", "finance"]), async (req, res) => {
  try {
    const invoice = await Invoice.findByIdAndUpdate(req.params.id, req.body, { new: true }).populate("project", "name")
    res.json(invoice)
  } catch (error) {
    res.status(500).json({ message: error.message })
  }
})

module.exports = router
