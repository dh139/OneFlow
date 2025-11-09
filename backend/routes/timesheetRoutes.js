const express = require("express")
const Timesheet = require("../models/Timesheet")
const { auth } = require("../middleware/auth")

const router = express.Router()

// Get all timesheets
router.get("/", auth, async (req, res) => {
  try {
    const timesheets = await Timesheet.find()
      .populate("employee", "name email")
      .populate("task", "title")
      .populate("project", "name")
      .sort({ date: -1 })
    res.json(timesheets)
  } catch (error) {
    res.status(500).json({ message: error.message })
  }
})

// Get timesheets by project
router.get("/project/:projectId", auth, async (req, res) => {
  try {
    const timesheets = await Timesheet.find({ project: req.params.projectId })
      .populate("employee", "name email")
      .populate("task", "title")
    res.json(timesheets)
  } catch (error) {
    res.status(500).json({ message: error.message })
  }
})

// Create timesheet
router.post("/", auth, async (req, res) => {
  try {
    const timesheet = new Timesheet({
      ...req.body,
      employee: req.user.id,
    })
    await timesheet.save()
    await timesheet.populate("employee", "name email").populate("task", "title")
    res.status(201).json(timesheet)
  } catch (error) {
    res.status(500).json({ message: error.message })
  }
})

// Update timesheet
router.put("/:id", auth, async (req, res) => {
  try {
    const timesheet = await Timesheet.findByIdAndUpdate(req.params.id, req.body, { new: true })
      .populate("employee", "name email")
      .populate("task", "title")
    res.json(timesheet)
  } catch (error) {
    res.status(500).json({ message: error.message })
  }
})

module.exports = router
