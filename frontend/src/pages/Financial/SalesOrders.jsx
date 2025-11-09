"use client"
import { useState, useEffect } from "react"
import api from "../../services/api"
import "../Projects/Projects.css"

const SalesOrders = () => {
  const [orders, setOrders] = useState([])
  const [showModal, setShowModal] = useState(false)
  const [formData, setFormData] = useState({
    customer: "",
    customerEmail: "",
    customerPhone: "",
    customerAddress: "",
    dueDate: "",
    items: [{ description: "", quantity: 1, unitPrice: 0 }],
    notes: "",
  })
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchOrders()
  }, [])

  const fetchOrders = async () => {
    try {
      setLoading(true)
      const response = await api.get("/financial/sales-orders")
      setOrders(response.data)
    } catch (error) {
      console.error("Error fetching orders:", error)
    } finally {
      setLoading(false)
    }
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    
    // Validate items
    const validItems = formData.items.filter(
      item => item.description && item.quantity > 0 && item.unitPrice >= 0
    )
    
    if (validItems.length === 0) {
      alert("Please add at least one valid item with description, quantity, and price")
      return
    }
    
    try {
      // Prepare payload with properly formatted data
      const payload = {
        customer: formData.customer.trim(),
        customerEmail: formData.customerEmail.trim(),
        customerPhone: formData.customerPhone.trim(),
        customerAddress: formData.customerAddress.trim(),
        dueDate: formData.dueDate,
        items: validItems.map(item => ({
          description: item.description.trim(),
          quantity: Number(item.quantity),
          unitPrice: Number(item.unitPrice)
        })),
        notes: formData.notes.trim(),
      }
      
      console.log("Submitting payload:", payload) // For debugging
      
      await api.post("/financial/sales-orders", payload)
      
      // Reset form
      setFormData({
        customer: "",
        customerEmail: "",
        customerPhone: "",
        customerAddress: "",
        dueDate: "",
        items: [{ description: "", quantity: 1, unitPrice: 0 }],
        notes: "",
      })
      setShowModal(false)
      fetchOrders()
    } catch (error) {
      console.error("Error creating SO:", error)
      console.error("Error response:", error.response?.data) // More detailed error logging
      alert("Error creating Sales Order: " + (error.response?.data?.error || error.message))
    }
  }

  const handleItemChange = (index, field, value) => {
    const newItems = [...formData.items]
    if (field === "quantity" || field === "unitPrice") {
      // Ensure numeric values
      newItems[index] = { ...newItems[index], [field]: Number(value) || 0 }
    } else {
      newItems[index] = { ...newItems[index], [field]: value }
    }
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
      const newItems = formData.items.filter((_, i) => i !== index)
      setFormData({ ...formData, items: newItems })
    }
  }

  // Calculate totals for preview
  const calculateTotal = () => {
    const subtotal = formData.items.reduce(
      (sum, item) => sum + (Number(item.quantity) || 0) * (Number(item.unitPrice) || 0),
      0
    )
    const tax = subtotal * 0.18
    const total = subtotal + tax
    return { subtotal, tax, total }
  }

  const { subtotal, tax, total } = calculateTotal()

  if (loading) return <div className="loading">Loading Sales Orders...</div>

  return (
    <div className="projects">
      <div className="projects-header">
        <h1>Sales Orders</h1>
        <button className="btn-primary" onClick={() => setShowModal(true)}>
          + New SO
        </button>
      </div>

      <div style={{ marginTop: "20px" }}>
        {orders.length === 0 ? (
          <div style={{ textAlign: "center", padding: "40px", color: "#666" }}>
            No sales orders yet. Create your first one!
          </div>
        ) : (
          orders.map((order) => (
            <div
              key={order._id}
              style={{
                background: "white",
                padding: "15px",
                marginBottom: "10px",
                borderRadius: "4px",
                border: "1px solid #e0e0e0",
              }}
            >
              <h3 style={{ margin: "0 0 8px", color: "#333" }}>{order.soNumber}</h3>
              <div
                style={{
                  display: "grid",
                  gridTemplateColumns: "1fr 1fr",
                  gap: "10px",
                  fontSize: "14px",
                  color: "#666",
                  marginBottom: "10px",
                }}
              >
                <span>Customer: {order.customer}</span>
                <span>Total: ₹{(order.total || order.amount || 0).toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>
                <span>Due Date: {order.dueDate ? new Date(order.dueDate).toLocaleDateString() : "N/A"}</span>
                <span>Items: {order.items?.length || 0}</span>
              </div>
              <span className={`badge badge-${order.status}`}>{order.status || 'pending'}</span>
            </div>
          ))
        )}
      </div>

      {showModal && (
        <div className="modal">
          <div className="modal-content" style={{ maxWidth: "700px", maxHeight: "90vh", overflowY: "auto" }}>
            <h2>Create Sales Order</h2>
            <form onSubmit={handleSubmit}>
              <input
                type="text"
                placeholder="Customer Name"
                value={formData.customer}
                onChange={(e) => setFormData({ ...formData, customer: e.target.value })}
                required
              />
              <input
                type="email"
                placeholder="Customer Email"
                value={formData.customerEmail}
                onChange={(e) => setFormData({ ...formData, customerEmail: e.target.value })}
              />
              <input
                type="tel"
                placeholder="Customer Phone"
                value={formData.customerPhone}
                onChange={(e) => setFormData({ ...formData, customerPhone: e.target.value })}
              />
              <textarea
                placeholder="Address"
                value={formData.customerAddress}
                onChange={(e) => setFormData({ ...formData, customerAddress: e.target.value })}
                rows="2"
              ></textarea>
              
              <div style={{ marginBottom: "15px" }}>
                <label style={{ display: "block", marginBottom: "5px", fontWeight: "500" }}>
                  Due Date *
                </label>
                <input
                  type="date"
                  value={formData.dueDate}
                  onChange={(e) => setFormData({ ...formData, dueDate: e.target.value })}
                  required
                  style={{ width: "100%" }}
                />
              </div>

              <h3 style={{ marginBottom: "10px" }}>Items</h3>
              {formData.items.map((item, idx) => (
                <div
                  key={idx}
                  style={{
                    marginBottom: "15px",
                    padding: "15px",
                    background: "#f9f9f9",
                    borderRadius: "4px",
                    border: "1px solid #e0e0e0",
                  }}
                >
                  <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "10px" }}>
                    <strong>Item {idx + 1}</strong>
                    {formData.items.length > 1 && (
                      <button
                        type="button"
                        onClick={() => removeItem(idx)}
                        style={{
                          background: "#ff4444",
                          color: "white",
                          border: "none",
                          padding: "4px 12px",
                          borderRadius: "4px",
                          cursor: "pointer",
                          fontSize: "12px",
                        }}
                      >
                        Remove
                      </button>
                    )}
                  </div>
                  <input
                    type="text"
                    placeholder="Description *"
                    value={item.description}
                    onChange={(e) => handleItemChange(idx, "description", e.target.value)}
                    style={{ width: "100%", marginBottom: "8px" }}
                    required
                  />
                  <div style={{ display: "flex", gap: "10px" }}>
                    <div style={{ flex: 1 }}>
                      <label style={{ display: "block", fontSize: "12px", marginBottom: "4px" }}>Quantity</label>
                      <input
                        type="number"
                        placeholder="Qty"
                        min="1"
                        value={item.quantity}
                        onChange={(e) => handleItemChange(idx, "quantity", e.target.value)}
                        style={{ width: "100%" }}
                        required
                      />
                    </div>
                    <div style={{ flex: 1 }}>
                      <label style={{ display: "block", fontSize: "12px", marginBottom: "4px" }}>Unit Price (₹)</label>
                      <input
                        type="number"
                        placeholder="Price"
                        min="0"
                        step="0.01"
                        value={item.unitPrice}
                        onChange={(e) => handleItemChange(idx, "unitPrice", e.target.value)}
                        style={{ width: "100%" }}
                        required
                      />
                    </div>
                    <div style={{ flex: 1 }}>
                      <label style={{ display: "block", fontSize: "12px", marginBottom: "4px" }}>Amount</label>
                      <input
                        type="text"
                        value={`₹${((item.quantity || 0) * (item.unitPrice || 0)).toFixed(2)}`}
                        disabled
                        style={{ width: "100%", background: "#e9ecef" }}
                      />
                    </div>
                  </div>
                </div>
              ))}
              <button type="button" className="btn-secondary" onClick={addItem} style={{ marginBottom: "15px" }}>
                + Add Item
              </button>

              {/* Order Summary */}
              <div style={{
                background: "#f0f8ff",
                padding: "15px",
                borderRadius: "4px",
                marginBottom: "15px",
                border: "1px solid #b3d9ff"
              }}>
                <h4 style={{ margin: "0 0 10px" }}>Order Summary</h4>
                <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "5px" }}>
                  <span>Subtotal:</span>
                  <strong>₹{subtotal.toFixed(2)}</strong>
                </div>
                <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "5px" }}>
                  <span>Tax (18%):</span>
                  <strong>₹{tax.toFixed(2)}</strong>
                </div>
                <div style={{ display: "flex", justifyContent: "space-between", borderTop: "2px solid #007bff", paddingTop: "5px", marginTop: "5px" }}>
                  <span><strong>Total:</strong></span>
                  <strong style={{ fontSize: "18px", color: "#007bff" }}>₹{total.toFixed(2)}</strong>
                </div>
              </div>

              <textarea
                placeholder="Notes (optional)"
                value={formData.notes}
                onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                rows="3"
              ></textarea>

              <div style={{ display: "flex", gap: "10px", marginTop: "15px" }}>
                <button type="submit" className="btn-primary" style={{ flex: 1 }}>
                  Create Sales Order
                </button>
                <button
                  type="button"
                  className="btn-secondary"
                  onClick={() => setShowModal(false)}
                  style={{ flex: 1 }}
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}

export default SalesOrders