"use client"

import { useEffect, useState } from "react"
import { useParams, useNavigate } from "react-router-dom"
import axios from "axios"
import Layout from "../../components/Layout"
import "./Settings.css"

const PurchaseOrderDetail = ({ user }) => {
  const { id } = useParams()
  const navigate = useNavigate()
  const [purchaseOrder, setPurchaseOrder] = useState(null)
  const [projects, setProjects] = useState([])
  const [items, setItems] = useState([])
  const [newItem, setNewItem] = useState({
    product: "",
    quantity: "",
    unit: "",
    unitPrice: "",
    taxRate: "",
  })
  const [loading, setLoading] = useState(true)
  const [isEditing, setIsEditing] = useState(false)
  const [formData, setFormData] = useState({
    vendor: "",
    project: "",
    status: "Draft",
    dueDate: "",
  })

  useEffect(() => {
    fetchPurchaseOrder()
    fetchProjects()
  }, [id])

  const fetchPurchaseOrder = async () => {
    try {
      const token = localStorage.getItem("token")
      const response = await axios.get(`http://localhost:5000/api/purchaseorders/${id}`, {
        headers: { Authorization: `Bearer ${token}` },
      })
      setPurchaseOrder(response.data)
      setItems(response.data.items || [])
      setFormData({
        vendor: response.data.vendor,
        project: response.data.project._id,
        status: response.data.status,
        dueDate: response.data.dueDate.split("T")[0],
      })
      setLoading(false)
    } catch (error) {
      console.error("Error fetching purchase order:", error)
      setLoading(false)
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

  const handleAddItem = () => {
    if (newItem.product && newItem.quantity && newItem.unitPrice) {
      const amount = (
        Number.parseFloat(newItem.quantity) *
        Number.parseFloat(newItem.unitPrice) *
        (1 + Number.parseFloat(newItem.taxRate || 0) / 100)
      ).toFixed(2)
      setItems([...items, { ...newItem, amount: Number.parseFloat(amount) }])
      setNewItem({ product: "", quantity: "", unit: "", unitPrice: "", taxRate: "" })
    }
  }

  const handleRemoveItem = (index) => {
    setItems(items.filter((_, i) => i !== index))
  }

  const calculateTotals = () => {
    const subtotal = items.reduce(
      (sum, item) => sum + Number.parseFloat(item.unitPrice) * Number.parseFloat(item.quantity),
      0,
    )
    const tax = items.reduce(
      (sum, item) =>
        sum +
        (Number.parseFloat(item.unitPrice) * Number.parseFloat(item.quantity) * Number.parseFloat(item.taxRate || 0)) /
          100,
      0,
    )
    return { subtotal: subtotal.toFixed(2), tax: tax.toFixed(2), total: (subtotal + tax).toFixed(2) }
  }

  const handleCreateBill = async () => {
    try {
      const token = localStorage.getItem("token")
      const totals = calculateTotals()
      const billData = {
        vendor: formData.vendor,
        project: formData.project,
        purchaseOrder: id,
        items,
        subtotal: totals.subtotal,
        tax: totals.tax,
        total: totals.total,
        dueDate: formData.dueDate,
      }
      await axios.post("http://localhost:5000/api/vendorbills", billData, {
        headers: { Authorization: `Bearer ${token}` },
      })
      alert("Bill created successfully!")
      navigate("/vendorbills")
    } catch (error) {
      console.error("Error creating bill:", error)
    }
  }

  const handleSave = async () => {
    try {
      const token = localStorage.getItem("token")
      const totals = calculateTotals()
      await axios.put(
        `http://localhost:5000/api/purchaseorders/${id}`,
        {
          ...formData,
          items,
          subtotal: totals.subtotal,
          tax: totals.tax,
          total: totals.total,
        },
        {
          headers: { Authorization: `Bearer ${token}` },
        },
      )
      setIsEditing(false)
      fetchPurchaseOrder()
    } catch (error) {
      console.error("Error updating purchase order:", error)
    }
  }

  if (loading) return <div>Loading...</div>

  const totals = calculateTotals()

  return (
    <Layout user={user}>
      <div className="document-detail-page">
        <div className="page-header">
          <h1>{purchaseOrder?.poNumber} - Purchase Order</h1>
          <div className="header-actions">
            {isEditing ? (
              <>
                <button onClick={handleSave} className="btn-primary">
                  Confirm
                </button>
                <button onClick={() => setIsEditing(false)} className="btn-secondary">
                  Cancel
                </button>
              </>
            ) : (
              <>
                <button onClick={() => setIsEditing(true)} className="btn-primary">
                  Edit
                </button>
                <button onClick={handleCreateBill} className="btn-success">
                  Create Bills
                </button>
              </>
            )}
          </div>
        </div>

        <div className="document-container">
          {isEditing ? (
            <div className="form-group">
              <label>Vendor</label>
              <input
                type="text"
                value={formData.vendor}
                onChange={(e) => setFormData({ ...formData, vendor: e.target.value })}
                className="form-input"
              />
              <label>Project</label>
              <select
                value={formData.project}
                onChange={(e) => setFormData({ ...formData, project: e.target.value })}
                className="form-input"
              >
                {projects.map((p) => (
                  <option key={p._id} value={p._id}>
                    {p.name}
                  </option>
                ))}
              </select>
              <label>Status</label>
              <select
                value={formData.status}
                onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                className="form-input"
              >
                <option value="Draft">Draft</option>
                <option value="Sent">Sent</option>
                <option value="Confirmed">Confirmed</option>
                <option value="Received">Received</option>
                <option value="Billed">Billed</option>
              </select>
            </div>
          ) : (
            <div className="document-info">
              <p>
                <strong>Vendor:</strong> {formData.vendor}
              </p>
              <p>
                <strong>Project:</strong> {projects.find((p) => p._id === formData.project)?.name}
              </p>
              <p>
                <strong>Status:</strong> <span className="status-badge">{formData.status}</span>
              </p>
              <p>
                <strong>Due Date:</strong> {new Date(formData.dueDate).toLocaleDateString()}
              </p>
            </div>
          )}

          <h3>Order Lines</h3>
          <table className="items-table">
            <thead>
              <tr>
                <th>Product</th>
                <th>Quantity</th>
                <th>Unit</th>
                <th>Unit Price</th>
                <th>Tax %</th>
                <th>Amount</th>
                <th>Action</th>
              </tr>
            </thead>
            <tbody>
              {items.map((item, index) => (
                <tr key={index}>
                  <td>{item.product}</td>
                  <td>{item.quantity}</td>
                  <td>{item.unit}</td>
                  <td>${Number.parseFloat(item.unitPrice).toFixed(2)}</td>
                  <td>{item.taxRate}%</td>
                  <td>${Number.parseFloat(item.amount).toFixed(2)}</td>
                  <td>
                    {isEditing && (
                      <button onClick={() => handleRemoveItem(index)} className="btn-danger">
                        Remove
                      </button>
                    )}
                  </td>
                </tr>
              ))}
              {isEditing && (
                <tr>
                  <td>
                    <input
                      type="text"
                      placeholder="Product"
                      value={newItem.product}
                      onChange={(e) => setNewItem({ ...newItem, product: e.target.value })}
                    />
                  </td>
                  <td>
                    <input
                      type="number"
                      placeholder="Qty"
                      value={newItem.quantity}
                      onChange={(e) => setNewItem({ ...newItem, quantity: e.target.value })}
                    />
                  </td>
                  <td>
                    <input
                      type="text"
                      placeholder="Unit"
                      value={newItem.unit}
                      onChange={(e) => setNewItem({ ...newItem, unit: e.target.value })}
                    />
                  </td>
                  <td>
                    <input
                      type="number"
                      placeholder="Price"
                      value={newItem.unitPrice}
                      onChange={(e) => setNewItem({ ...newItem, unitPrice: e.target.value })}
                    />
                  </td>
                  <td>
                    <input
                      type="number"
                      placeholder="Tax %"
                      value={newItem.taxRate}
                      onChange={(e) => setNewItem({ ...newItem, taxRate: e.target.value })}
                    />
                  </td>
                  <td>
                    <button onClick={handleAddItem} className="btn-primary">
                      Add a product
                    </button>
                  </td>
                </tr>
              )}
            </tbody>
          </table>

          <div className="totals">
            <p>
              <strong>Untaxed Amount:</strong> ${totals.subtotal}
            </p>
            <p>
              <strong>Tax:</strong> ${totals.tax}
            </p>
            <p>
              <strong>Total:</strong> ${totals.total}
            </p>
          </div>
        </div>
      </div>
    </Layout>
  )
}

export default PurchaseOrderDetail
