const express = require("express")
const VendorBill = require("../models/VendorBill")
const { auth, roleCheck } = require("../middleware/auth")

const router = express.Router()

// Get all vendor bills
router.get("/", auth, async (req, res) => {
  try {
    const vendorBills = await VendorBill.find()
      .populate("project", "name")
      .populate("createdBy", "name email")
      .sort({ createdAt: -1 })
    res.json(vendorBills)
  } catch (error) {
    res.status(500).json({ message: error.message })
  }
})

// Get vendor bills by project
router.get("/project/:projectId", auth, async (req, res) => {
  try {
    const vendorBills = await VendorBill.find({ project: req.params.projectId }).populate("createdBy", "name email")
    res.json(vendorBills)
  } catch (error) {
    res.status(500).json({ message: error.message })
  }
})

// Create vendor bill
router.post("/", auth, roleCheck(["admin", "finance"]), async (req, res) => {
  try {
    const billNumber = "BILL-" + Date.now()
    const vendorBill = new VendorBill({
      ...req.body,
      billNumber,
      createdBy: req.user.id,
    })
    await vendorBill.save()
    await vendorBill.populate("project", "name")
    res.status(201).json(vendorBill)
  } catch (error) {
    res.status(500).json({ message: error.message })
  }
})

// Update vendor bill
router.put("/:id", auth, roleCheck(["admin", "finance"]), async (req, res) => {
  try {
    const vendorBill = await VendorBill.findByIdAndUpdate(req.params.id, req.body, { new: true }).populate(
      "project",
      "name",
    )
    res.json(vendorBill)
  } catch (error) {
    res.status(500).json({ message: error.message })
  }
})

module.exports = router
