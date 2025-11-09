const express = require("express")
const SalesOrder = require("../models/SalesOrder")
const { auth, roleCheck } = require("../middleware/auth")

const router = express.Router()

// Get all sales orders
router.get("/", auth, async (req, res) => {
  try {
    const salesOrders = await SalesOrder.find()
      .populate("project", "name")
      .populate("createdBy", "name email")
      .sort({ createdAt: -1 })
    res.json(salesOrders)
  } catch (error) {
    res.status(500).json({ message: error.message })
  }
})

// Get sales orders by project
router.get("/project/:projectId", auth, async (req, res) => {
  try {
    const salesOrders = await SalesOrder.find({ project: req.params.projectId }).populate("createdBy", "name email")
    res.json(salesOrders)
  } catch (error) {
    res.status(500).json({ message: error.message })
  }
})

// Create sales order
router.post("/", auth, roleCheck(["admin", "finance","pm"]), async (req, res) => {
  try {
    const soNumber = "SO-" + Date.now()
    const salesOrder = new SalesOrder({
      ...req.body,
      soNumber,
      createdBy: req.user.id,
    })
    await salesOrder.save()
    await salesOrder.populate("project", "name")
    res.status(201).json(salesOrder)
  } catch (error) {
    res.status(500).json({ message: error.message })
  }
})

// Update sales order
router.put("/:id", auth, roleCheck(["admin", "finance","pm"]), async (req, res) => {
  try {
    const salesOrder = await SalesOrder.findByIdAndUpdate(req.params.id, req.body, { new: true }).populate(
      "project",
      "name",
    )
    res.json(salesOrder)
  } catch (error) {
    res.status(500).json({ message: error.message })
  }
})

module.exports = router
