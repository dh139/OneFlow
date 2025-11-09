const Timesheet = require("../models/Timesheet")
const Task = require("../models/Task")

// Log hours
exports.logHours = async (req, res) => {
  try {
    const { task, project, hoursLogged, billable, description, date } = req.body

    const timesheet = new Timesheet({
      user: req.user.id,
      task,
      project,
      hoursLogged,
      billable,
      description,
      date: date || new Date(),
    })

    await timesheet.save()

    // Update task hours
    await Task.findByIdAndUpdate(task, {
      $inc: { actualHours: hoursLogged },
    })

    res.status(201).json(timesheet)
  } catch (error) {
    res.status(500).json({ error: error.message })
  }
}

// Get timesheets
exports.getTimesheets = async (req, res) => {
  try {
    const { user, project, task, startDate, endDate } = req.query
    const query = {}

    if (user) query.user = user
    if (project) query.project = project
    if (task) query.task = task
    if (startDate || endDate) {
      query.date = {}
      if (startDate) query.date.$gte = new Date(startDate)
      if (endDate) query.date.$lte = new Date(endDate)
    }

    const timesheets = await Timesheet.find(query)
      .populate("user", "name email")
      .populate("task", "title")
      .populate("project", "name")

    res.json(timesheets)
  } catch (error) {
    res.status(500).json({ error: error.message })
  }
}

// Get user timesheets
exports.getUserTimesheets = async (req, res) => {
  try {
    const timesheets = await Timesheet.find({ user: req.user.id }).populate("task", "title").populate("project", "name")

    res.json(timesheets)
  } catch (error) {
    res.status(500).json({ error: error.message })
  }
}
