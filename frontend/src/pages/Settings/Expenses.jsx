"use client"

import { useEffect, useState } from "react"
import axios from "axios"
import Layout from "../../components/Layout"
import Table from "../../components/Table"
import Modal from "../../components/Modal"
import FormInput from "../../components/FormInput"
import "./Settings.css"

const Expenses = ({ user }) => {
  const [expenses, setExpenses] = useState([])
  const [projects, setProjects] = useState([])
  const [showModal, setShowModal] = useState(false)
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    project: "",
    amount: "",
    category: "Other",
    billable: false,
    expenseDate: "",
  })

  useEffect(() => {
    fetchExpenses()
    fetchProjects()
  }, [])

  const fetchExpenses = async () => {
    try {
      const token = localStorage.getItem("token")
      const response = await axios.get("http://localhost:5000/api/expenses", {
        headers: { Authorization: `Bearer ${token}` },
      })
      setExpenses(response.data)
    } catch (error) {
      console.error("Error fetching expenses:", error)
    }
  }

  const fetchProjects = async () => {
    try {
      const token = localStorage.getItem("token")
      const response = await axios.get("http://localhost:5000/api/projects", {
        headers: { Authorization: `Bearer ${token}` },
      })
      setProjects(response.data)
    } catch (error) {
      console.error("Error fetching projects:", error)
    }
  }

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target
    setFormData((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }))
  }

  const handleSubmit = async () => {
    try {
      const token = localStorage.getItem("token")
      await axios.post("http://localhost:5000/api/expenses", formData, {
        headers: { Authorization: `Bearer ${token}` },
      })
      setShowModal(false)
      setFormData({
        title: "",
        description: "",
        project: "",
        amount: "",
        category: "Other",
        billable: false,
        expenseDate: "",
      })
      fetchExpenses()
    } catch (error) {
      console.error("Error creating expense:", error)
    }
  }

  const columns = [
    { key: "title", label: "Title" },
    { key: "amount", label: "Amount" },
    { key: "category", label: "Category" },
    { key: "status", label: "Status" },
    { key: "billable", label: "Billable" },
  ]

  const tableData = expenses.map((exp) => ({
    ...exp,
    billable: exp.billable ? "Yes" : "No",
  }))

  return (
    <Layout user={user}>
      <div className="settings-page">
        <div className="page-header">
          <h1>Expenses</h1>
          <button onClick={() => setShowModal(true)} className="btn-primary">
            + New Expense
          </button>
        </div>

        <Table columns={columns} data={tableData} />

        <Modal
          isOpen={showModal}
          title="Submit New Expense"
          onClose={() => setShowModal(false)}
          onSubmit={handleSubmit}
        >
          <FormInput label="Title" name="title" value={formData.title} onChange={handleChange} required />
          <FormInput label="Description" name="description" value={formData.description} onChange={handleChange} />
          <div className="form-group">
            <label>Project</label>
            <select name="project" value={formData.project} onChange={handleChange} className="form-input">
              <option value="">Select Project</option>
              {projects.map((p) => (
                <option key={p._id} value={p._id}>
                  {p.name}
                </option>
              ))}
            </select>
          </div>
          <FormInput
            label="Amount"
            type="number"
            name="amount"
            value={formData.amount}
            onChange={handleChange}
            required
          />
          <div className="form-group">
            <label>Category</label>
            <select name="category" value={formData.category} onChange={handleChange} className="form-input">
              <option value="Travel">Travel</option>
              <option value="Tools">Tools</option>
              <option value="Software">Software</option>
              <option value="Other">Other</option>
            </select>
          </div>
          <div className="form-group checkbox">
            <input type="checkbox" name="billable" checked={formData.billable} onChange={handleChange} />
            <label htmlFor="billable">Billable Expense</label>
          </div>
          <FormInput
            label="Expense Date"
            type="date"
            name="expenseDate"
            value={formData.expenseDate}
            onChange={handleChange}
            required
          />
        </Modal>
      </div>
    </Layout>
  )
}

export default Expenses
