"use client"

import { useEffect, useState } from "react"
import axios from "axios"
import Layout from "../../components/Layout"
import Table from "../../components/Table"
import "./Tasks.css"

const Tasks = ({ user }) => {
  const [tasks, setTasks] = useState([])
  const [filter, setFilter] = useState("All")

  useEffect(() => {
    fetchTasks()
  }, [])

  const fetchTasks = async () => {
    try {
      const token = localStorage.getItem("token")
      const response = await axios.get("http://localhost:5000/api/tasks/project/all", {
        headers: { Authorization: `Bearer ${token}` },
      })
      setTasks(response.data || [])
    } catch (error) {
      console.error("Error fetching tasks:", error)
    }
  }

  const filteredTasks = filter === "All" ? tasks : tasks.filter((t) => t.status === filter)

  const columns = [
    { key: "title", label: "Task Title" },
    { key: "priority", label: "Priority" },
    { key: "status", label: "Status" },
    { key: "dueDate", label: "Due Date" },
    { key: "hoursLogged", label: "Hours Logged" },
  ]

  const tableData = filteredTasks.map((task) => ({
    ...task,
    dueDate: new Date(task.dueDate).toLocaleDateString(),
  }))

  return (
    <Layout user={user}>
      <div className="tasks-page">
        <h1>Tasks</h1>

        <div className="filter-bar">
          {["All", "New", "In Progress", "Blocked", "Done"].map((status) => (
            <button
              key={status}
              className={`filter-btn ${filter === status ? "active" : ""}`}
              onClick={() => setFilter(status)}
            >
              {status}
            </button>
          ))}
        </div>

        <Table columns={columns} data={tableData} />
      </div>
    </Layout>
  )
}

export default Tasks
