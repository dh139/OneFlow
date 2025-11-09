"use client"

import { useState, useEffect } from "react"
import api from "../../services/api"
import "../Projects/Projects.css"

const Expenses = () => {
  const [expenses, setExpenses] = useState([])
  const [showModal, setShowModal] = useState(false)
  const [projects, setProjects] = useState([])
  const [formData, setFormData] = useState({
    category: "",
    amount: "",
    project: "",
    description: "",
    billable: false,
  })
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchData()
  }, [])

  const fetchData = async () => {
    try {
      setLoading(true)
      const [expensesRes, projectsRes] = await Promise.all([api.get("/financial/expenses"), api.get("/projects")])
      setExpenses(expensesRes.data)
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
      await api.post("/financial/expenses", formData)
      setFormData({ category: "", amount: "", project: "", description: "", billable: false })
      setShowModal(false)
      fetchData()
    } catch (error) {
      console.error("Error creating expense:", error)
    }
  }

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target
    setFormData({ ...formData, [name]: type === "checkbox" ? checked : value })
  }

  if (loading) return <div className="loading">Loading Expenses...</div>

  return (
    <div className="projects">
      <div className="projects-header">
        <h1>Expenses</h1>
        <button className="btn-primary" onClick={() => setShowModal(true)}>
          + New Expense
        </button>
      </div>

      <div style={{ marginTop: "20px" }}>
        {expenses.map((expense) => (
          <div
            key={expense._id}
            style={{ background: "white", padding: "15px", marginBottom: "10px", borderRadius: "4px" }}
          >
            <h3 style={{ margin: "0 0 8px", color: "#333" }}>{expense.category}</h3>
            <div style={{ display: "flex", gap: "20px", fontSize: "14px", color: "#666", marginBottom: "10px" }}>
              <span>Amount: ₹{expense.amount}</span>
              <span>Project: {expense.project?.name || "-"}</span>
              <span>Type: {expense.billable ? "Billable" : "Non-Billable"}</span>
            </div>
            <span className={`badge badge-${expense.status}`}>{expense.status}</span>
          </div>
        ))}
      </div>

      {showModal && (
        <div className="modal">
          <div className="modal-content">
            <h2>Create Expense</h2>
            <form onSubmit={handleSubmit}>
              <input
                type="text"
                name="category"
                placeholder="Expense Category"
                value={formData.category}
                onChange={handleChange}
                required
              />
              <input
                type="number"
                name="amount"
                placeholder="Amount"
                value={formData.amount}
                onChange={handleChange}
                required
              />
              <select name="project" value={formData.project} onChange={handleChange}>
                <option value="">Select Project (Optional)</option>
                {projects.map((p) => (
                  <option key={p._id} value={p._id}>
                    {p.name}
                  </option>
                ))}
              </select>
              <textarea
                name="description"
                placeholder="Description"
                value={formData.description}
                onChange={handleChange}
              ></textarea>
              <label>
                <input type="checkbox" name="billable" checked={formData.billable} onChange={handleChange} />
                Billable Expense
              </label>
              <button type="submit" className="btn-primary">
                Create Expense
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

export default Expenses
