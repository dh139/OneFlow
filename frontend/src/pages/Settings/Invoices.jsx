"use client"

import { useEffect, useState } from "react"
import axios from "axios"
import Layout from "../../components/Layout"
import Table from "../../components/Table"
import Modal from "../../components/Modal"
import FormInput from "../../components/FormInput"
import "./Settings.css"

const Invoices = ({ user }) => {
  const [invoices, setInvoices] = useState([])
  const [projects, setProjects] = useState([])
  const [showModal, setShowModal] = useState(false)
  const [formData, setFormData] = useState({
    customer: "",
    project: "",
    amount: "",
    dueDate: "",
    status: "Draft",
  })

  useEffect(() => {
    fetchInvoices()
    fetchProjects()
  }, [])

  const fetchInvoices = async () => {
    try {
      const token = localStorage.getItem("token")
      const response = await axios.get("http://localhost:5000/api/invoices", {
        headers: { Authorization: `Bearer ${token}` },
      })
      setInvoices(response.data)
    } catch (error) {
      console.error("Error fetching invoices:", error)
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
    const { name, value } = e.target
    setFormData((prev) => ({ ...prev, [name]: value }))
  }

  const handleSubmit = async () => {
    try {
      const token = localStorage.getItem("token")
      await axios.post("http://localhost:5000/api/invoices", formData, {
        headers: { Authorization: `Bearer ${token}` },
      })
      setShowModal(false)
      setFormData({ customer: "", project: "", amount: "", dueDate: "", status: "Draft" })
      fetchInvoices()
    } catch (error) {
      console.error("Error creating invoice:", error)
    }
  }

  const columns = [
    { key: "invoiceNumber", label: "Invoice Number" },
    { key: "customer", label: "Customer" },
    { key: "amount", label: "Amount" },
    { key: "status", label: "Status" },
    { key: "dueDate", label: "Due Date" },
  ]

  const tableData = invoices.map((inv) => ({
    ...inv,
    dueDate: new Date(inv.dueDate).toLocaleDateString(),
  }))

  return (
    <Layout user={user}>
      <div className="settings-page">
        <div className="page-header">
          <h1>Customer Invoices</h1>
          {(user?.role === "admin" || user?.role === "finance" || user?.role === "pm") && (
            <button onClick={() => setShowModal(true)} className="btn-primary">
              + New Invoice
            </button>
          )}
        </div>

        <Table columns={columns} data={tableData} />

        <Modal
          isOpen={showModal}
          title="Create New Invoice"
          onClose={() => setShowModal(false)}
          onSubmit={handleSubmit}
        >
          <FormInput label="Customer Name" name="customer" value={formData.customer} onChange={handleChange} required />
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
          <FormInput
            label="Due Date"
            type="date"
            name="dueDate"
            value={formData.dueDate}
            onChange={handleChange}
            required
          />
        </Modal>
      </div>
    </Layout>
  )
}

export default Invoices
