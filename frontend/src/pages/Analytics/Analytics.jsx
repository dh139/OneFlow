"use client"

import { useEffect, useState } from "react"
import axios from "axios"
import Layout from "../../components/Layout"
import KPICard from "../../components/KPICard"
import "./Analytics.css"

const Analytics = ({ user }) => {
  const [analytics, setAnalytics] = useState({
    totalProjects: 0,
    tasksCompleted: 0,
    hoursLogged: 0,
    billableHours: 0,
    nonBillableHours: 0,
    totalRevenue: 0,
    totalCost: 0,
  })

  useEffect(() => {
    fetchAnalytics()
  }, [])

  const fetchAnalytics = async () => {
    try {
      const token = localStorage.getItem("token")
      const projectsRes = await axios.get("http://localhost:5000/api/projects", {
        headers: { Authorization: `Bearer ${token}` },
      })

      const projects = projectsRes.data
      const totalRevenue = projects.reduce((sum, p) => sum + p.totalRevenue, 0)
      const totalCost = projects.reduce((sum, p) => sum + p.totalCost, 0)

      setAnalytics({
        totalProjects: projects.length,
        tasksCompleted: 15,
        hoursLogged: 200,
        billableHours: 150,
        nonBillableHours: 50,
        totalRevenue,
        totalCost,
      })
    } catch (error) {
      console.error("Error fetching analytics:", error)
    }
  }

  return (
    <Layout user={user}>
      <div className="analytics-page">
        <h1>Analytics & Reports</h1>

        <div className="kpi-grid">
          <KPICard title="Total Projects" value={analytics.totalProjects} icon="📁" color="blue" />
          <KPICard title="Tasks Completed" value={analytics.tasksCompleted} icon="✓" color="green" />
          <KPICard title="Hours Logged" value={analytics.hoursLogged} icon="⏱️" color="orange" />
          <KPICard title="Total Revenue" value={`₹${analytics.totalRevenue}`} icon="💰" color="green" />
          <KPICard title="Total Cost" value={`₹${analytics.totalCost}`} icon="📊" color="red" />
          <KPICard title="Profit" value={`₹${analytics.totalRevenue - analytics.totalCost}`} icon="📈" color="green" />
        </div>

        <div className="charts-section">
          <div className="chart-card">
            <h3>Hours Breakdown</h3>
            <div className="breakdown">
              <div className="breakdown-item">
                <span className="label">Billable Hours</span>
                <span className="value">{analytics.billableHours}h</span>
              </div>
              <div className="breakdown-item">
                <span className="label">Non-Billable Hours</span>
                <span className="value">{analytics.nonBillableHours}h</span>
              </div>
            </div>
          </div>

          <div className="chart-card">
            <h3>Financial Summary</h3>
            <div className="breakdown">
              <div className="breakdown-item">
                <span className="label">Revenue</span>
                <span className="value">₹{analytics.totalRevenue}</span>
              </div>
              <div className="breakdown-item">
                <span className="label">Cost</span>
                <span className="value">₹{analytics.totalCost}</span>
              </div>
              <div className="breakdown-item">
                <span className="label profit">Profit</span>
                <span className="value">₹{analytics.totalRevenue - analytics.totalCost}</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </Layout>
  )
}

export default Analytics
