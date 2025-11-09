const express = require("express")
const Task = require("../models/Task")
const { auth } = require("../middleware/auth")

const router = express.Router()

// Get all tasks
router.get("/", auth, async (req, res) => {
  try {
    const tasks = await Task.find()
      .populate("project", "name")
      .populate("assignedTo", "name email")
      .sort({ dueDate: 1 })
    res.json(tasks)
  } catch (error) {
    res.status(500).json({ message: error.message })
  }
})

// Get all tasks for a project
router.get("/project/:projectId", auth, async (req, res) => {
  try {
    const tasks = await Task.find({ project: req.params.projectId })
      .populate("assignedTo", "name email")
      .sort({ dueDate: 1 })
    res.json(tasks)
  } catch (error) {
    res.status(500).json({ message: error.message })
  }
})

// Create task
router.post("/", auth, async (req, res) => {
  try {
    const { title, description, project, assignedTo, priority, dueDate, estimatedHours } = req.body
    const task = new Task({
      title,
      description,
      project,
      assignedTo,
      priority,
      dueDate,
      estimatedHours,
      status: "New",
    })
    await task.save()
    await task.populate("assignedTo", "name email")
    res.status(201).json(task)
  } catch (error) {
    res.status(500).json({ message: error.message })
  }
})

// Update task
router.put("/:id", auth, async (req, res) => {
  try {
    const task = await Task.findByIdAndUpdate(req.params.id, req.body, { new: true }).populate(
      "assignedTo",
      "name email",
    )
    res.json(task)
  } catch (error) {
    res.status(500).json({ message: error.message })
  }
})

// Delete task
router.delete("/:id", auth, async (req, res) => {
  try {
    await Task.findByIdAndDelete(req.params.id)
    res.json({ message: "Task deleted" })
  } catch (error) {
    res.status(500).json({ message: error.message })
  }
})

module.exports = router
