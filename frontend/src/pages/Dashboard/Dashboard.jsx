"use client"

import { useEffect, useState } from "react"
import axios from "axios"
import Layout from "../../components/Layout"
import KPICard from "../../components/KPICard"
import "./Dashboard.css"

const Dashboard = ({ user }) => {
  const [stats, setStats] = useState({
    activeProjects: 0,
    delayedTasks: 0,
    hoursLogged: 0,
    revenue: 0,
  })
  const [projects, setProjects] = useState([])

  useEffect(() => {
    fetchDashboardData()
  }, [])

  const fetchDashboardData = async () => {
    try {
      const token = localStorage.getItem("token")
      const response = await axios.get("http://localhost:5000/api/projects", {
        headers: { Authorization: `Bearer ${token}` },
      })

      const projectsData = response.data
      setProjects(projectsData)

      const activeProjects = projectsData.filter((p) => p.status === "In Progress").length
      const totalRevenue = projectsData.reduce((sum, p) => sum + p.totalRevenue, 0)

      setStats({
        activeProjects,
        delayedTasks: 5,
        hoursLogged: 120,
        revenue: totalRevenue,
      })
    } catch (error) {
      console.error("Error fetching dashboard data:", error)
    }
  }

  return (
    <Layout user={user}>
      <div className="dashboard">
        <h1>Dashboard</h1>

        <div className="kpi-grid">
          <KPICard title="Active Projects" value={stats.activeProjects} icon="📊" color="blue" />
          <KPICard title="Delayed Tasks" value={stats.delayedTasks} icon="⚠️" color="red" />
          <KPICard title="Hours Logged" value={stats.hoursLogged} icon="⏱️" color="orange" />
          <KPICard title="Revenue Earned" value={`₹${stats.revenue}`} icon="💰" color="green" />
        </div>

        <div className="projects-section">
          <h2>Recent Projects</h2>
          <div className="projects-grid">
            {projects.slice(0, 6).map((project) => (
              <div key={project._id} className="project-card">
                <div className="project-header">
                  <h3>{project.name}</h3>
                  <span className={`status status-${project.status.toLowerCase()}`}>{project.status}</span>
                </div>
                <p className="project-description">{project.description}</p>
                <div className="project-details">
                  <p>
                    <strong>Budget:</strong> ₹{project.budget}
                  </p>
                  <p>
                    <strong>Progress:</strong> {project.progress}%
                  </p>
                </div>
                <div className="progress-bar">
                  <div className="progress-fill" style={{ width: `${project.progress}%` }}></div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </Layout>
  )
}

export default Dashboard
