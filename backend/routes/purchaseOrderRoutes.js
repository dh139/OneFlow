const express = require("express")
const PurchaseOrder = require("../models/PurchaseOrder")
const { auth, roleCheck } = require("../middleware/auth")

const router = express.Router()

// Get all purchase orders
router.get("/", auth, async (req, res) => {
  try {
    const purchaseOrders = await PurchaseOrder.find()
      .populate("project", "name")
      .populate("createdBy", "name email")
      .sort({ createdAt: -1 })
    res.json(purchaseOrders)
  } catch (error) {
    res.status(500).json({ message: error.message })
  }
})

// Get purchase orders by project
router.get("/project/:projectId", auth, async (req, res) => {
  try {
    const purchaseOrders = await PurchaseOrder.find({ project: req.params.projectId }).populate(
      "createdBy",
      "name email",
    )
    res.json(purchaseOrders)
  } catch (error) {
    res.status(500).json({ message: error.message })
  }
})

// Create purchase order
router.post("/", auth, roleCheck(["admin", "finance","pm"]), async (req, res) => {
  try {
    const poNumber = "PO-" + Date.now()
    const purchaseOrder = new PurchaseOrder({
      ...req.body,
      poNumber,
      createdBy: req.user.id,
    })
    await purchaseOrder.save()
    await purchaseOrder.populate("project", "name")
    res.status(201).json(purchaseOrder)
  } catch (error) {
    res.status(500).json({ message: error.message })
  }
})

// Update purchase order
router.put("/:id", auth, roleCheck(["admin", "finance","pm"]), async (req, res) => {
  try {
    const purchaseOrder = await PurchaseOrder.findByIdAndUpdate(req.params.id, req.body, { new: true }).populate(
      "project",
      "name",
    )
    res.json(purchaseOrder)
  } catch (error) {
    res.status(500).json({ message: error.message })
  }
})

module.exports = router
