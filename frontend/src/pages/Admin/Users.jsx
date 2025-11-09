"use client"

import { useState, useEffect } from "react"
import api from "../../services/api"
import "../Projects/Projects.css"

const Users = () => {
  const [users, setUsers] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchUsers()
  }, [])

  const fetchUsers = async () => {
    try {
      setLoading(true)
      const response = await api.get("/auth/users")
      setUsers(response.data)
    } catch (error) {
      console.error("Error fetching users:", error)
    } finally {
      setLoading(false)
    }
  }

  if (loading) return <div className="loading">Loading Users...</div>

  return (
    <div className="projects">
      <h1>Users Management</h1>

      <table className="table" style={{ marginTop: "20px", background: "white" }}>
        <thead>
          <tr>
            <th>Name</th>
            <th>Email</th>
            <th>Role</th>
            <th>Phone</th>
            <th>Status</th>
          </tr>
        </thead>
        <tbody>
          {users.map((user) => (
            <tr key={user._id}>
              <td>{user.name}</td>
              <td>{user.email}</td>
              <td>
                <span
                  className="badge"
                  style={{ background: "#667eea", color: "white", padding: "4px 12px", borderRadius: "4px" }}
                >
                  {user.role}
                </span>
              </td>
              <td>{user.phone || "-"}</td>
              <td>{user.isActive ? "Active" : "Inactive"}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}

export default Users
