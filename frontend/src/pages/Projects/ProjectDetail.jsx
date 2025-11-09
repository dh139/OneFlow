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
  const [showSOModal, setShowSOModal] = useState(false)
  const [showPOModal, setShowPOModal] = useState(false)
  const [showExpenseModal, setShowExpenseModal] = useState(false)
  const [activeTab, setActiveTab] = useState("tasks")

  const [taskForm, setTaskForm] = useState({
    title: "",
    description: "",
    priority: "Medium",
    dueDate: "",
    estimatedHours: "",
  })

  const [soForm, setSOForm] = useState({
    customer: "",
    taxRate: 18,
    items: [{ product: "", quantity: 1, unitPrice: 0 }],
  })

  const [poForm, setPOForm] = useState({
    vendor: "",
    taxRate: 18,
    items: [{ product: "", quantity: 1, unitPrice: 0 }],
  })

  const [expenseForm, setExpenseForm] = useState({
    description: "",
    amount: 0,
    category: "Other",
    billable: false,
  })

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

  const handleCreateSalesOrder = async () => {
    try {
      const token = localStorage.getItem("token")
      await axios.post(`http://localhost:5000/api/projects/${id}/sales-orders`, soForm, {
        headers: { Authorization: `Bearer ${token}` },
      })
      setShowSOModal(false)
      setSOForm({
        customer: "",
        taxRate: 18,
        items: [{ product: "", quantity: 1, unitPrice: 0 }],
      })
      fetchProjectData()
    } catch (error) {
      console.error("Error creating sales order:", error)
    }
  }

  const handleCreatePurchaseOrder = async () => {
    try {
      const token = localStorage.getItem("token")
      await axios.post(`http://localhost:5000/api/projects/${id}/purchase-orders`, poForm, {
        headers: { Authorization: `Bearer ${token}` },
      })
      setShowPOModal(false)
      setPOForm({
        vendor: "",
        taxRate: 18,
        items: [{ product: "", quantity: 1, unitPrice: 0 }],
      })
      fetchProjectData()
    } catch (error) {
      console.error("Error creating purchase order:", error)
    }
  }

  const handleCreateExpense = async () => {
    try {
      const token = localStorage.getItem("token")
      await axios.post(`http://localhost:5000/api/projects/${id}/expenses`, expenseForm, {
        headers: { Authorization: `Bearer ${token}` },
      })
      setShowExpenseModal(false)
      setExpenseForm({
        description: "",
        amount: 0,
        category: "Other",
        billable: false,
      })
      fetchProjectData()
    } catch (error) {
      console.error("Error creating expense:", error)
    }
  }

  const handleSOItemChange = (index, field, value) => {
    const newItems = [...soForm.items]
    newItems[index] = { ...newItems[index], [field]: value }
    setSOForm((prev) => ({ ...prev, items: newItems }))
  }

  const handlePOItemChange = (index, field, value) => {
    const newItems = [...poForm.items]
    newItems[index] = { ...newItems[index], [field]: value }
    setPOForm((prev) => ({ ...prev, items: newItems }))
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
            <p>Financial details shown in the Links Panel above.</p>
          </div>
        )}

        <Modal
          isOpen={showSOModal}
          title="Create Sales Order"
          onClose={() => setShowSOModal(false)}
          onSubmit={handleCreateSalesOrder}
        >
          <FormInput
            label="Customer Name"
            value={soForm.customer}
            onChange={(e) => setSOForm((prev) => ({ ...prev, customer: e.target.value }))}
            required
          />
          <div className="form-group">
            <label>Tax Rate (%)</label>
            <input
              type="number"
              value={soForm.taxRate}
              onChange={(e) => setSOForm((prev) => ({ ...prev, taxRate: Number.parseFloat(e.target.value) }))}
              className="form-input"
            />
          </div>
          <div className="form-group">
            <label>Items</label>
            {soForm.items.map((item, index) => (
              <div key={index} className="item-row">
                <input
                  placeholder="Product"
                  value={item.product}
                  onChange={(e) => handleSOItemChange(index, "product", e.target.value)}
                  className="form-input"
                />
                <input
                  placeholder="Qty"
                  type="number"
                  value={item.quantity}
                  onChange={(e) => handleSOItemChange(index, "quantity", Number.parseFloat(e.target.value))}
                  className="form-input"
                />
                <input
                  placeholder="Unit Price"
                  type="number"
                  value={item.unitPrice}
                  onChange={(e) => handleSOItemChange(index, "unitPrice", Number.parseFloat(e.target.value))}
                  className="form-input"
                />
              </div>
            ))}
            <button
              type="button"
              onClick={() =>
                setSOForm((prev) => ({ ...prev, items: [...prev.items, { product: "", quantity: 1, unitPrice: 0 }] }))
              }
              className="btn-secondary"
            >
              + Add Item
            </button>
          </div>
        </Modal>

        <Modal
          isOpen={showPOModal}
          title="Create Purchase Order"
          onClose={() => setShowPOModal(false)}
          onSubmit={handleCreatePurchaseOrder}
        >
          <FormInput
            label="Vendor Name"
            value={poForm.vendor}
            onChange={(e) => setPOForm((prev) => ({ ...prev, vendor: e.target.value }))}
            required
          />
          <div className="form-group">
            <label>Tax Rate (%)</label>
            <input
              type="number"
              value={poForm.taxRate}
              onChange={(e) => setPOForm((prev) => ({ ...prev, taxRate: Number.parseFloat(e.target.value) }))}
              className="form-input"
            />
          </div>
          <div className="form-group">
            <label>Items</label>
            {poForm.items.map((item, index) => (
              <div key={index} className="item-row">
                <input
                  placeholder="Product"
                  value={item.product}
                  onChange={(e) => handlePOItemChange(index, "product", e.target.value)}
                  className="form-input"
                />
                <input
                  placeholder="Qty"
                  type="number"
                  value={item.quantity}
                  onChange={(e) => handlePOItemChange(index, "quantity", Number.parseFloat(e.target.value))}
                  className="form-input"
                />
                <input
                  placeholder="Unit Price"
                  type="number"
                  value={item.unitPrice}
                  onChange={(e) => handlePOItemChange(index, "unitPrice", Number.parseFloat(e.target.value))}
                  className="form-input"
                />
              </div>
            ))}
            <button
              type="button"
              onClick={() =>
                setPOForm((prev) => ({ ...prev, items: [...prev.items, { product: "", quantity: 1, unitPrice: 0 }] }))
              }
              className="btn-secondary"
            >
              + Add Item
            </button>
          </div>
        </Modal>

        <Modal
          isOpen={showExpenseModal}
          title="Create Expense"
          onClose={() => setShowExpenseModal(false)}
          onSubmit={handleCreateExpense}
        >
          <FormInput
            label="Description"
            value={expenseForm.description}
            onChange={(e) => setExpenseForm((prev) => ({ ...prev, description: e.target.value }))}
            required
          />
          <FormInput
            label="Amount"
            type="number"
            value={expenseForm.amount}
            onChange={(e) => setExpenseForm((prev) => ({ ...prev, amount: Number.parseFloat(e.target.value) }))}
            required
          />
          <div className="form-group">
            <label>Category</label>
            <select
              value={expenseForm.category}
              onChange={(e) => setExpenseForm((prev) => ({ ...prev, category: e.target.value }))}
              className="form-input"
            >
              <option value="Travel">Travel</option>
              <option value="Meals">Meals</option>
              <option value="Accommodation">Accommodation</option>
              <option value="Other">Other</option>
            </select>
          </div>
          <div className="form-group">
            <label>
              <input
                type="checkbox"
                checked={expenseForm.billable}
                onChange={(e) => setExpenseForm((prev) => ({ ...prev, billable: e.target.checked }))}
              />
              Billable to Customer
            </label>
          </div>
        </Modal>
      </div>
    </Layout>
  )
}

export default ProjectDetail
