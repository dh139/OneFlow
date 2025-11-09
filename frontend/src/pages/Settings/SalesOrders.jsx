"use client"

import { useEffect, useState } from "react"
import api from "../../services/api"
import Layout from "../../components/Layout"
import Table from "../../components/Table"
import Modal from "../../components/Modal"
import FormInput from "../../components/FormInput"
import "./Settings.css"

const SalesOrders = ({ user }) => {
  const [salesOrders, setSalesOrders] = useState([])
  const [projects, setProjects] = useState([])
  const [showModal, setShowModal] = useState(false)
  const [formData, setFormData] = useState({
    customer: "",
    customerEmail: "",
    customerPhone: "",
    customerAddress: "",
    project: "",
    dueDate: "",
    items: [{ description: "", quantity: 1, unitPrice: 0 }],
    notes: "",
    status: "Draft",
  })

  useEffect(() => {
    fetchSalesOrders()
    fetchProjects()
  }, [])

  const fetchSalesOrders = async () => {
    try {
      const response = await api.get("/financial/sales-orders")
      setSalesOrders(response.data)
    } catch (error) {
      console.error("Error fetching sales orders:", error)
    }
  }

  const fetchProjects = async () => {
    try {
      const response = await api.get("/projects")
      setProjects(response.data)
    } catch (error) {
      console.error("Error fetching projects:", error)
    }
  }

  const handleChange = (e) => {
    const { name, value } = e.target
    setFormData((prev) => ({ ...prev, [name]: value }))
  }

  const handleItemChange = (index, field, value) => {
    const newItems = [...formData.items]
    newItems[index] = { ...newItems[index], [field]: value }
    setFormData({ ...formData, items: newItems })
  }

  const addItem = () => {
    setFormData({
      ...formData,
      items: [...formData.items, { description: "", quantity: 1, unitPrice: 0 }],
    })
  }

  const removeItem = (index) => {
    if (formData.items.length > 1) {
      const newItems = formData.items.filter((_, idx) => idx !== index)
      setFormData({ ...formData, items: newItems })
    }
  }

  const calculateItemTotal = (item) => {
    return (item.quantity || 0) * (item.unitPrice || 0)
  }

  const calculateSubtotal = () => {
    return formData.items.reduce((sum, item) => sum + calculateItemTotal(item), 0)
  }

  const calculateTax = () => {
    return calculateSubtotal() * 0.18
  }

  const calculateTotal = () => {
    return calculateSubtotal() + calculateTax()
  }

  const handleSubmit = async () => {
    try {
      await api.post("/financial/sales-orders", formData)
      setShowModal(false)
      setFormData({
        customer: "",
        customerEmail: "",
        customerPhone: "",
        customerAddress: "",
        project: "",
        dueDate: "",
        items: [{ description: "", quantity: 1, unitPrice: 0 }],
        notes: "",
        status: "Draft",
      })
      fetchSalesOrders()
    } catch (error) {
      console.error("Error creating sales order:", error)
      alert("Error creating Sales Order: " + (error.response?.data?.error || error.message))
    }
  }

  const columns = [
    { key: "soNumber", label: "SO Number" },
    { key: "customer", label: "Customer" },
    { key: "totalAmount", label: "Total Amount" },
    { key: "status", label: "Status" },
    { key: "dueDate", label: "Due Date" },
  ]

  const tableData = salesOrders.map((so) => ({
    ...so,
    totalAmount: `₹${so.totalAmount?.toLocaleString() || 0}`,
    dueDate: so.dueDate ? new Date(so.dueDate).toLocaleDateString() : "N/A",
  }))

  return (
    <Layout user={user}>
      <div className="settings-page">
        <div className="page-header">
          <h1>Sales Orders</h1>
          {(user?.role === "admin" || user?.role === "finance" || user?.role === "sales" || user?.role === "pm") && (
            <button onClick={() => setShowModal(true)} className="btn-primary">
              + New Sales Order
            </button>
          )}
        </div>

        <Table columns={columns} data={tableData} />

        <Modal
          isOpen={showModal}
          title="Create New Sales Order"
          onClose={() => setShowModal(false)}
          onSubmit={handleSubmit}
        >
          <div className="form-group">
            <FormInput
              label="Customer Name"
              name="customer"
              value={formData.customer}
              onChange={handleChange}
              required
            />
          </div>

          <div className="form-group">
            <FormInput
              label="Customer Email"
              type="email"
              name="customerEmail"
              value={formData.customerEmail}
              onChange={handleChange}
            />
          </div>

          <div className="form-group">
            <FormInput
              label="Customer Phone"
              type="tel"
              name="customerPhone"
              value={formData.customerPhone}
              onChange={handleChange}
            />
          </div>

          <div className="form-group">
            <label>Customer Address</label>
            <textarea
              name="customerAddress"
              value={formData.customerAddress}
              onChange={handleChange}
              className="form-input"
              rows="3"
            />
          </div>

          <div className="form-group">
            <label>Project (Optional)</label>
            <select name="project" value={formData.project} onChange={handleChange} className="form-input">
              <option value="">Select Project</option>
              {projects.map((p) => (
                <option key={p._id} value={p._id}>
                  {p.name}
                </option>
              ))}
            </select>
          </div>

          <div className="form-group">
            <FormInput
              label="Due Date"
              type="date"
              name="dueDate"
              value={formData.dueDate}
              onChange={handleChange}
              required
            />
          </div>

          <div className="form-group">
            <label>Items</label>
            <table className="items-table">
              <thead>
                <tr>
                  <th>Description</th>
                  <th style={{ width: "100px" }}>Quantity</th>
                  <th style={{ width: "120px" }}>Unit Price</th>
                  <th style={{ width: "120px" }}>Total</th>
                  <th style={{ width: "80px" }}>Action</th>
                </tr>
              </thead>
              <tbody>
                {formData.items.map((item, idx) => (
                  <tr key={idx}>
                    <td>
                      <input
                        type="text"
                        placeholder="Description"
                        value={item.description}
                        onChange={(e) => handleItemChange(idx, "description", e.target.value)}
                      />
                    </td>
                    <td>
                      <input
                        type="number"
                        placeholder="Qty"
                        value={item.quantity}
                        onChange={(e) => handleItemChange(idx, "quantity", Number.parseInt(e.target.value) || 0)}
                        min="1"
                      />
                    </td>
                    <td>
                      <input
                        type="number"
                        placeholder="Price"
                        value={item.unitPrice}
                        onChange={(e) => handleItemChange(idx, "unitPrice", Number.parseFloat(e.target.value) || 0)}
                        min="0"
                        step="0.01"
                      />
                    </td>
                    <td style={{ textAlign: "right", padding: "12px" }}>
                      ₹{calculateItemTotal(item).toFixed(2)}
                    </td>
                    <td style={{ textAlign: "center" }}>
                      {formData.items.length > 1 && (
                        <button type="button" onClick={() => removeItem(idx)} className="btn-danger">
                          Remove
                        </button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            <button type="button" onClick={addItem} className="btn-secondary" style={{ marginTop: "10px" }}>
              + Add Item
            </button>
          </div>

          <div className="totals">
            <p>
              <strong>Subtotal:</strong> ₹{calculateSubtotal().toFixed(2)}
            </p>
            <p>
              <strong>Tax (18%):</strong> ₹{calculateTax().toFixed(2)}
            </p>
            <p style={{ fontSize: "18px", color: "#2c3e50" }}>
              <strong>Total:</strong> ₹{calculateTotal().toFixed(2)}
            </p>
          </div>

          <div className="form-group">
            <label>Notes</label>
            <textarea
              name="notes"
              value={formData.notes}
              onChange={handleChange}
              className="form-input"
              rows="3"
              placeholder="Additional notes..."
            />
          </div>
        </Modal>
      </div>
    </Layout>
  )
}

export default SalesOrders