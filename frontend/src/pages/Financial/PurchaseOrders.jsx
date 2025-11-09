"use client"

import { useState, useEffect } from "react"
import api from "../../services/api"
import "../Projects/Projects.css"

const PurchaseOrders = () => {
  const [orders, setOrders] = useState([])
  const [showModal, setShowModal] = useState(false)
  const [formData, setFormData] = useState({
    vendor: "",
    vendorEmail: "",
    vendorPhone: "",
    vendorAddress: "",
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
      const response = await api.get("/financial/purchase-orders")
      setOrders(response.data)
    } catch (error) {
      console.error("Error fetching POs:", error)
    } finally {
      setLoading(false)
    }
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    try {
      await api.post("/financial/purchase-orders", formData)
      setFormData({
        vendor: "",
        vendorEmail: "",
        vendorPhone: "",
        vendorAddress: "",
        items: [{ description: "", quantity: 1, unitPrice: 0 }],
        notes: "",
      })
      setShowModal(false)
      fetchOrders()
    } catch (error) {
      console.error("Error creating PO:", error)
    }
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

  if (loading) return <div className="loading">Loading Purchase Orders...</div>

  return (
    <div className="projects">
      <div className="projects-header">
        <h1>Purchase Orders</h1>
        <button className="btn-primary" onClick={() => setShowModal(true)}>
          + New PO
        </button>
      </div>

      <div style={{ marginTop: "20px" }}>
        {orders.map((order) => (
          <div
            key={order._id}
            style={{ background: "white", padding: "15px", marginBottom: "10px", borderRadius: "4px" }}
          >
            <h3 style={{ margin: "0 0 8px", color: "#333" }}>{order.poNumber}</h3>
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
              <span>Vendor: {order.vendor}</span>
              <span>Total: ₹{order.totalAmount?.toLocaleString()}</span>
            </div>
            <span className={`badge badge-${order.status}`}>{order.status}</span>
          </div>
        ))}
      </div>

      {showModal && (
        <div className="modal">
          <div className="modal-content">
            <h2>Create Purchase Order</h2>
            <form onSubmit={handleSubmit}>
              <input
                type="text"
                placeholder="Vendor Name"
                value={formData.vendor}
                onChange={(e) => setFormData({ ...formData, vendor: e.target.value })}
                required
              />
              <input
                type="email"
                placeholder="Vendor Email"
                value={formData.vendorEmail}
                onChange={(e) => setFormData({ ...formData, vendorEmail: e.target.value })}
              />
              <input
                type="tel"
                placeholder="Vendor Phone"
                value={formData.vendorPhone}
                onChange={(e) => setFormData({ ...formData, vendorPhone: e.target.value })}
              />

              <h3>Items</h3>
              {formData.items.map((item, idx) => (
                <div
                  key={idx}
                  style={{ marginBottom: "10px", padding: "10px", background: "#f9f9f9", borderRadius: "4px" }}
                >
                  <input
                    type="text"
                    placeholder="Description"
                    value={item.description}
                    onChange={(e) => handleItemChange(idx, "description", e.target.value)}
                    style={{ width: "100%", marginBottom: "5px" }}
                  />
                  <input
                    type="number"
                    placeholder="Qty"
                    value={item.quantity}
                    onChange={(e) => handleItemChange(idx, "quantity", Number.parseInt(e.target.value))}
                    style={{ width: "48%", marginRight: "4%" }}
                  />
                  <input
                    type="number"
                    placeholder="Price"
                    value={item.unitPrice}
                    onChange={(e) => handleItemChange(idx, "unitPrice", Number.parseFloat(e.target.value))}
                    style={{ width: "48%" }}
                  />
                </div>
              ))}
              <button type="button" className="btn-secondary" onClick={addItem}>
                + Add Item
              </button>

              <textarea
                placeholder="Notes"
                value={formData.notes}
                onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
              ></textarea>

              <button type="submit" className="btn-primary">
                Create PO
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

export default PurchaseOrders
