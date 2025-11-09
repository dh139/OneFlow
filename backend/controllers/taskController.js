const Task = require("../models/Task")
const Project = require("../models/Project")

// Create task
exports.createTask = async (req, res) => {
  try {
    const { title, description, project, assignee, status, priority, startDate, dueDate, estimatedHours, billable } =
      req.body

    const task = new Task({
      title,
      description,
      project,
      assignee,
      status,
      priority,
      startDate,
      dueDate,
      estimatedHours,
      billable,
      createdBy: req.user.id,
    })

    await task.save()
    await task.populate("project", "name")
    await task.populate("assignee", "name email")
    await task.populate("createdBy", "name email")

    res.status(201).json(task)
  } catch (error) {
    res.status(500).json({ error: error.message })
  }
}

// Get all tasks
exports.getTasks = async (req, res) => {
  try {
    const { project, status, priority, search } = req.query
    const query = {}

    if (project) query.project = project
    if (status) query.status = status
    if (priority) query.priority = priority
    if (search) query.title = { $regex: search, $options: "i" }

    const tasks = await Task.find(query)
      .populate("project", "name")
      .populate("assignee", "name email")
      .populate("createdBy", "name email")

    res.json(tasks)
  } catch (error) {
    res.status(500).json({ error: error.message })
  }
}

// Get tasks by project
exports.getTasksByProject = async (req, res) => {
  try {
    const tasks = await Task.find({ project: req.params.projectId })
      .populate("project", "name")
      .populate("assignee", "name email")
      .populate("createdBy", "name email")

    res.json(tasks)
  } catch (error) {
    res.status(500).json({ error: error.message })
  }
}

// Update task
exports.updateTask = async (req, res) => {
  try {
    const { title, description, status, priority, assignee, dueDate, estimatedHours, actualHours, progress, blocker } =
      req.body

    const task = await Task.findByIdAndUpdate(
      req.params.id,
      {
        title,
        description,
        status,
        priority,
        assignee,
        dueDate,
        estimatedHours,
        actualHours,
        progress,
        blocker,
        updatedAt: new Date(),
      },
      { new: true },
    )
      .populate("project", "name")
      .populate("assignee", "name email")

    res.json(task)
  } catch (error) {
    res.status(500).json({ error: error.message })
  }
}

// Delete task
exports.deleteTask = async (req, res) => {
  try {
    await Task.findByIdAndDelete(req.params.id)
    res.json({ message: "Task deleted successfully" })
  } catch (error) {
    res.status(500).json({ error: error.message })
  }
}
