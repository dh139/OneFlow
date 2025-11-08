"use client"

import { useEffect, useState } from "react"
import { useParams } from "react-router-dom"
import axios from "axios"
import Layout from "../../components/Layout"
import Modal from "../../components/Modal"
import FormInput from "../../components/FormInput"
import Table from "../../components/Table"
import StatusBadge from "../../components/StatusBadge"
import "./ProjectDetail.css"

const ProjectDetail = ({ user }) => {
  const { id } = useParams()
  const [project, setProject] = useState(null)
  const [tasks, setTasks] = useState([])
  const [showTaskModal, setShowTaskModal] = useState(false)
  const [taskForm, setTaskForm] = useState({
    title: "",
    description: "",
    priority: "Medium",
    dueDate: "",
    estimatedHours: "",
  })
  const [activeTab, setActiveTab] = useState("tasks")

  useEffect(() => {
    fetchProjectData()
  }, [id])

  const fetchProjectData = async () => {
    try {
      const token = localStorage.getItem("token")
      const projectRes = await axios.get(`http://localhost:5000/api/projects/${id}`, {
        headers: { Authorization: `Bearer ${token}` },
      })
      setProject(projectRes.data)

      const tasksRes = await axios.get(`http://localhost:5000/api/tasks/project/${id}`, {
        headers: { Authorization: `Bearer ${token}` },
      })
      setTasks(tasksRes.data)
    } catch (error) {
      console.error("Error fetching project data:", error)
    }
  }

  const handleTaskChange = (e) => {
    const { name, value } = e.target
    setTaskForm((prev) => ({ ...prev, [name]: value }))
  }

  const handleCreateTask = async () => {
    try {
      const token = localStorage.getItem("token")
      await axios.post(
        "http://localhost:5000/api/tasks",
        {
          ...taskForm,
          project: id,
        },
        {
          headers: { Authorization: `Bearer ${token}` },
        },
      )
      setShowTaskModal(false)
      setTaskForm({
        title: "",
        description: "",
        priority: "Medium",
        dueDate: "",
        estimatedHours: "",
      })
      fetchProjectData()
    } catch (error) {
      console.error("Error creating task:", error)
    }
  }

  if (!project) {
    return (
      <Layout user={user}>
        <div className="loading">Loading project...</div>
      </Layout>
    )
  }

  const taskColumns = [
    { key: "title", label: "Task Title" },
    { key: "priority", label: "Priority" },
    { key: "status", label: "Status" },
    { key: "dueDate", label: "Due Date" },
    { key: "hoursLogged", label: "Hours Logged" },
  ]

  const taskData = tasks.map((task) => ({
    ...task,
    dueDate: new Date(task.dueDate).toLocaleDateString(),
  }))

  return (
    <Layout user={user}>
      <div className="project-detail">
        <div className="project-header-detail">
          <div>
            <h1>{project.name}</h1>
            <p className="description">{project.description}</p>
          </div>
          <StatusBadge status={project.status} />
        </div>

        <div className="project-stats">
          <div className="stat-card">
            <p className="stat-label">Budget</p>
            <p className="stat-value">₹{project.budget}</p>
          </div>
          <div className="stat-card">
            <p className="stat-label">Revenue</p>
            <p className="stat-value">₹{project.totalRevenue}</p>
          </div>
          <div className="stat-card">
            <p className="stat-label">Cost</p>
            <p className="stat-value">₹{project.totalCost}</p>
          </div>
          <div className="stat-card">
            <p className="stat-label">Profit</p>
            <p className="stat-value profit">₹{project.totalRevenue - project.totalCost}</p>
          </div>
        </div>

        <div className="tabs">
          <button className={`tab-btn ${activeTab === "tasks" ? "active" : ""}`} onClick={() => setActiveTab("tasks")}>
            Tasks ({tasks.length})
          </button>
          <button
            className={`tab-btn ${activeTab === "financial" ? "active" : ""}`}
            onClick={() => setActiveTab("financial")}
          >
            Financial
          </button>
        </div>

        {activeTab === "tasks" && (
          <div className="tab-content">
            <button onClick={() => setShowTaskModal(true)} className="btn-primary">
              + New Task
            </button>
            <Table columns={taskColumns} data={taskData} />
            <Modal
              isOpen={showTaskModal}
              title="Create New Task"
              onClose={() => setShowTaskModal(false)}
              onSubmit={handleCreateTask}
            >
              <FormInput label="Task Title" name="title" value={taskForm.title} onChange={handleTaskChange} required />
              <FormInput
                label="Description"
                name="description"
                value={taskForm.description}
                onChange={handleTaskChange}
              />
              <div className="form-group">
                <label>Priority</label>
                <select name="priority" value={taskForm.priority} onChange={handleTaskChange} className="form-input">
                  <option value="Low">Low</option>
                  <option value="Medium">Medium</option>
                  <option value="High">High</option>
                  <option value="Critical">Critical</option>
                </select>
              </div>
              <FormInput
                label="Due Date"
                type="date"
                name="dueDate"
                value={taskForm.dueDate}
                onChange={handleTaskChange}
                required
              />
              <FormInput
                label="Estimated Hours"
                type="number"
                name="estimatedHours"
                value={taskForm.estimatedHours}
                onChange={handleTaskChange}
              />
            </Modal>
          </div>
        )}

        {activeTab === "financial" && (
          <div className="tab-content">
            <div className="financial-grid">
              <div className="financial-section">
                <h3>Sales Orders ({project.salesOrders?.length || 0})</h3>
                {project.salesOrders?.length > 0 ? (
                  <ul>
                    {project.salesOrders.map((so) => (
                      <li key={so._id}>
                        {so.soNumber} - ₹{so.amount}
                      </li>
                    ))}
                  </ul>
                ) : (
                  <p>No sales orders</p>
                )}
              </div>
              <div className="financial-section">
                <h3>Purchase Orders ({project.purchaseOrders?.length || 0})</h3>
                {project.purchaseOrders?.length > 0 ? (
                  <ul>
                    {project.purchaseOrders.map((po) => (
                      <li key={po._id}>
                        {po.poNumber} - ₹{po.amount}
                      </li>
                    ))}
                  </ul>
                ) : (
                  <p>No purchase orders</p>
                )}
              </div>
            </div>
          </div>
        )}
      </div>
    </Layout>
  )
}

export default ProjectDetail
