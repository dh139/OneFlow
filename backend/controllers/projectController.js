const Project = require("../models/Project")
const Task = require("../models/Task")

// Create project
exports.createProject = async (req, res) => {
  try {
    const { name, description, startDate, endDate, budget, client, priority, billable, image } = req.body

    const project = new Project({
      name,
      description,
      startDate,
      endDate,
      budget,
      client,
      priority,
      billable,
      image, // Store image as base64
      projectManager: req.user.id,
      createdBy: req.user.id,
    })

    await project.save()
    res.status(201).json(project)
  } catch (error) {
    res.status(500).json({ error: error.message })
  }
}

// Get all projects
exports.getProjects = async (req, res) => {
  try {
    const { status, search } = req.query
    const query = {}

    if (status) query.status = status
    if (search) query.name = { $regex: search, $options: "i" }

    const projects = await Project.find(query)
      .populate("projectManager", "name email")
      .populate("team", "name email role")
      .populate("createdBy", "name email")

    res.json(projects)
  } catch (error) {
    res.status(500).json({ error: error.message })
  }
}

// Get project by ID
exports.getProjectById = async (req, res) => {
  try {
    const project = await Project.findById(req.params.id)
      .populate("projectManager", "name email")
      .populate("team", "name email role")
      .populate("createdBy", "name email")

    if (!project) {
      return res.status(404).json({ error: "Project not found" })
    }

    res.json(project)
  } catch (error) {
    res.status(500).json({ error: error.message })
  }
}

// Update project
exports.updateProject = async (req, res) => {
  try {
    const { name, description, status, startDate, endDate, budget, team, priority, billable, image } = req.body

    const updateData = {
      name,
      description,
      status,
      startDate,
      endDate,
      budget,
      team,
      priority,
      billable,
      updatedAt: new Date(),
    }

    if (image) {
      updateData.image = image
    }

    const project = await Project.findByIdAndUpdate(req.params.id, updateData, { new: true })
      .populate("projectManager", "name email")
      .populate("team", "name email role")

    res.json(project)
  } catch (error) {
    res.status(500).json({ error: error.message })
  }
}

// Delete project
exports.deleteProject = async (req, res) => {
  try {
    await Project.findByIdAndDelete(req.params.id)
    await Task.deleteMany({ project: req.params.id })

    res.json({ message: "Project deleted successfully" })
  } catch (error) {
    res.status(500).json({ error: error.message })
  }
}

// Get project statistics
exports.getProjectStats = async (req, res) => {
  try {
    const stats = await Project.aggregate([
      {
        $group: {
          _id: null,
          totalProjects: { $sum: 1 },
          activeProjects: {
            $sum: { $cond: [{ $eq: ["$status", "in_progress"] }, 1, 0] },
          },
          totalBudget: { $sum: "$budget" },
          totalCost: { $sum: "$totalCost" },
          totalRevenue: { $sum: "$actualRevenue" },
        },
      },
    ])

    res.json(stats[0] || {})
  } catch (error) {
    res.status(500).json({ error: error.message })
  }
}
