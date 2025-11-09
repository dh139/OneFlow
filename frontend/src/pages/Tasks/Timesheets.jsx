"use client"

import { useState, useEffect } from "react"
import api from "../../services/api"
import "../Projects/Projects.css"

const Timesheets = () => {
  const [timesheets, setTimesheets] = useState([])
  const [showModal, setShowModal] = useState(false)
  const [tasks, setTasks] = useState([])
  const [projects, setProjects] = useState([])
  const [formData, setFormData] = useState({
    task: "",
    project: "",
    hoursLogged: "",
    billable: true,
    description: "",
  })
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchData()
  }, [])

  const fetchData = async () => {
    try {
      setLoading(true)
      const [timesheetsRes, tasksRes, projectsRes] = await Promise.all([
        api.get("/timesheets/user"),
        api.get("/tasks"),
        api.get("/projects"),
      ])
      setTimesheets(timesheetsRes.data)
      setTasks(tasksRes.data)
      setProjects(projectsRes.data)
    } catch (error) {
      console.error("Error fetching data:", error)
    } finally {
      setLoading(false)
    }
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    try {
      await api.post("/timesheets", formData)
      setFormData({ task: "", project: "", hoursLogged: "", billable: true, description: "" })
      setShowModal(false)
      fetchData()
    } catch (error) {
      console.error("Error logging hours:", error)
    }
  }

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target
    setFormData({ ...formData, [name]: type === "checkbox" ? checked : value })
  }

  if (loading) return <div className="loading">Loading timesheets...</div>

  return (
    <div className="projects">
      <div className="projects-header">
        <h1>Timesheets</h1>
        <button className="btn-primary" onClick={() => setShowModal(true)}>
          + Log Hours
        </button>
      </div>

      <div style={{ marginTop: "20px" }}>
        {timesheets.map((ts) => (
          <div key={ts._id} style={{ background: "white", padding: "15px", marginBottom: "10px", borderRadius: "4px" }}>
            <h3 style={{ margin: "0 0 8px", color: "#333" }}>{ts.task?.title}</h3>
            <div style={{ display: "flex", gap: "20px", fontSize: "14px", color: "#666" }}>
              <span>Project: {ts.project?.name}</span>
              <span>
                Hours: <strong>{ts.hoursLogged}h</strong>
              </span>
              <span>Type: {ts.billable ? "Billable" : "Non-Billable"}</span>
              <span>Date: {new Date(ts.date).toLocaleDateString()}</span>
            </div>
          </div>
        ))}
      </div>

      {showModal && (
        <div className="modal">
          <div className="modal-content">
            <h2>Log Hours</h2>
            <form onSubmit={handleSubmit}>
              <select name="project" value={formData.project} onChange={handleChange} required>
                <option value="">Select Project</option>
                {projects.map((p) => (
                  <option key={p._id} value={p._id}>
                    {p.name}
                  </option>
                ))}
              </select>
              <select name="task" value={formData.task} onChange={handleChange} required>
                <option value="">Select Task</option>
                {tasks.map((t) => (
                  <option key={t._id} value={t._id}>
                    {t.title}
                  </option>
                ))}
              </select>
              <input
                type="number"
                step="0.5"
                name="hoursLogged"
                placeholder="Hours Logged"
                value={formData.hoursLogged}
                onChange={handleChange}
                required
              />
              <textarea
                name="description"
                placeholder="What did you work on?"
                value={formData.description}
                onChange={handleChange}
              ></textarea>
              <label>
                <input type="checkbox" name="billable" checked={formData.billable} onChange={handleChange} />
                Billable Hours
              </label>
              <button type="submit" className="btn-primary">
                Log Hours
              </button>
              <button type="button" className="btn-secondary" onClick={() => setShowModal(false)}>
                Cancel
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}

export default Timesheets
