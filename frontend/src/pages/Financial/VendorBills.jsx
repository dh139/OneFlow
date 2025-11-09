"use client"

import { useState, useEffect } from "react"
import api from "../../services/api"
import "../Projects/Projects.css"

const VendorBills = () => {
  const [bills, setBills] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchBills()
  }, [])

  const fetchBills = async () => {
    try {
      setLoading(true)
      const response = await api.get("/financial/vendor-bills")
      setBills(response.data || [])
    } catch (error) {
      console.error("Error fetching bills:", error)
    } finally {
      setLoading(false)
    }
  }

  if (loading) return <div className="loading">Loading Vendor Bills...</div>

  return (
    <div className="projects">
      <div className="projects-header">
        <h1>Vendor Bills</h1>
      </div>

      <div
        style={{
          marginTop: "20px",
          background: "white",
          padding: "30px",
          borderRadius: "8px",
          textAlign: "center",
          color: "#666",
        }}
      >
        <p>Vendor Bills management coming soon...</p>
        <p>Total Bills: {bills.length}</p>
      </div>
    </div>
  )
}

export default VendorBills
