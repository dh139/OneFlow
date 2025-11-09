const express = require("express")
const Expense = require("../models/Expense")
const { auth, roleCheck } = require("../middleware/auth")

const router = express.Router()

// Get all expenses
router.get("/", auth, async (req, res) => {
  try {
    const expenses = await Expense.find()
      .populate("project", "name")
      .populate("submittedBy", "name email")
      .populate("approvedBy", "name email")
      .sort({ createdAt: -1 })
    res.json(expenses)
  } catch (error) {
     console.error(error)
    res.status(500).json({ message: error.message })
  }
})

// Get expenses by project
router.get("/project/:projectId", auth, async (req, res) => {
  try {
    const expenses = await Expense.find({ project: req.params.projectId }).populate("submittedBy", "name email")
    res.json(expenses)
  } catch (error) {
    res.status(500).json({ message: error.message })
  }
})

// Create expense
router.post("/", auth, async (req, res) => {
  try {
    const expense = new Expense({
      ...req.body,
      submittedBy: req.user.id,
    })
    await expense.save()
    const exp = await expense.populate("project", "name")
    console.log("Created Expense:", exp)
    res.status(201).json(expense)
  } catch (error) {
    res.status(500).json({ message: error.message })
  }
})

// Update expense
router.put("/:id", auth, async (req, res) => {
  try {
    const expense = await Expense.findByIdAndUpdate(req.params.id, req.body, { new: true })
      .populate("project", "name")
      .populate("submittedBy", "name email")
    res.json(expense)
  } catch (error) {
    res.status(500).json({ message: error.message })
  }
})

module.exports = router
