"use client"

import { useEffect, useState } from "react"
import { useNavigate } from "react-router-dom"
import axios from "axios"
import Layout from "../../components/Layout"
import Modal from "../../components/Modal"
import FormInput from "../../components/FormInput"
import Table from "../../components/Table"
import "./Projects.css"

const Projects = ({ user }) => {
  const [projects, setProjects] = useState([])
  const [filteredProjects, setFilteredProjects] = useState([])
  const [filter, setFilter] = useState("All")
  const [showModal, setShowModal] = useState(false)
  const [users, setUsers] = useState([])
  const [imageFile, setImageFile] = useState(null)
  const [formData, setFormData] = useState({
    name: "",
    description: "",
    projectManager: "",
    teamMembers: [],
    budget: "",
    startDate: "",
    endDate: "",
  })
  const navigate = useNavigate()

  useEffect(() => {
    fetchProjects()
    fetchUsers()
  }, [])

  useEffect(() => {
    filterProjects()
  }, [filter, projects])

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

  const fetchUsers = async () => {
    try {
      const token = localStorage.getItem("token")
      const response = await axios.get("http://localhost:5000/api/users", {
        headers: { Authorization: `Bearer ${token}` },
      })
      setUsers(response.data)
    } catch (error) {
      console.error("Error fetching users:", error)
    }
  }

  const filterProjects = () => {
    if (filter === "All") {
      setFilteredProjects(projects)
    } else {
      setFilteredProjects(projects.filter((p) => p.status === filter))
    }
  }

  const handleChange = (e) => {
    const { name, value } = e.target
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }))
  }

  const handleImageChange = (e) => {
    const file = e.target.files[0]
    if (file) {
      const reader = new FileReader()
      reader.onloadend = () => {
        const img = new Image()
        img.src = reader.result
        img.onload = () => {
          const canvas = document.createElement("canvas")
          const ctx = canvas.getContext("2d")

          // Scale down to max 800x600
          let width = img.width
          let height = img.height
          const maxWidth = 800
          const maxHeight = 600

          if (width > height) {
            if (width > maxWidth) {
              height = Math.round((height * maxWidth) / width)
              width = maxWidth
            }
          } else {
            if (height > maxHeight) {
              width = Math.round((width * maxHeight) / height)
              height = maxHeight
            }
          }

          canvas.width = width
          canvas.height = height
          ctx.drawImage(img, 0, 0, width, height)

          // Compress to JPEG with 0.7 quality
          const compressedImage = canvas.toDataURL("image/jpeg", 0.7)
          setImageFile(compressedImage)
        }
      }
      reader.readAsDataURL(file)
    }
  }

  const handleSubmit = async () => {
    try {
      const token = localStorage.getItem("token")
      const submitData = { ...formData }
      if (imageFile) {
        submitData.image = imageFile
      }
      await axios.post("http://localhost:5000/api/projects", submitData, {
        headers: { Authorization: `Bearer ${token}` },
      })
      setShowModal(false)
      setImageFile(null)
      setFormData({
        name: "",
        description: "",
        projectManager: "",
        teamMembers: [],
        budget: "",
        startDate: "",
        endDate: "",
      })
      fetchProjects()
    } catch (error) {
      console.error("Error creating project:", error)
      alert("Error creating project: " + error.response?.data?.error || error.message)
    }
  }

  const columns = [
    { key: "name", label: "Project Name" },
    { key: "description", label: "Description" },
    { key: "status", label: "Status" },
    { key: "budget", label: "Budget" },
    { key: "progress", label: "Progress" },
  ]

  const tableData = filteredProjects.map((project) => ({
    ...project,
    status: project.status,
    description: project.description.substring(0, 50) + "...",
  }))

  return (
    <Layout user={user}>
      <div className="projects-page">
        <div className="page-header">
          <h1>Projects</h1>
          {(user?.role === "admin" || user?.role === "pm") && (
            <button onClick={() => setShowModal(true)} className="btn-primary">
              + New Project
            </button>
          )}
        </div>

        <div className="filter-bar">
          {["All", "New", "In Progress", "Done"].map((status) => (
            <button
              key={status}
              className={`filter-btn ${filter === status ? "active" : ""}`}
              onClick={() => setFilter(status)}
            >
              {status}
            </button>
          ))}
        </div>

        <Table
          columns={columns}
          data={tableData}
          actions={(project) => (
            <div className="action-buttons">
              <button onClick={() => navigate(`/projects/${project._id}`)} className="action-btn view">
                View
              </button>
              <button onClick={() => navigate(`/projects/${project._id}/edit`)} className="action-btn edit">
                Edit
              </button>
            </div>
          )}
        />

        <Modal
          isOpen={showModal}
          title="Create New Project"
          onClose={() => setShowModal(false)}
          onSubmit={handleSubmit}
        >
          <FormInput label="Project Name" name="name" value={formData.name} onChange={handleChange} required />
          <FormInput label="Description" name="description" value={formData.description} onChange={handleChange} />
          <div className="form-group">
            <label>Project Image</label>
            <input type="file" accept="image/*" onChange={handleImageChange} className="form-input" />
            {imageFile && (
              <img
                src={imageFile || "/placeholder.svg"}
                alt="preview"
                style={{ maxWidth: "100%", marginTop: "10px" }}
              />
            )}
          </div>
          <div className="form-group">
            <label>Project Manager</label>
            <select
              name="projectManager"
              value={formData.projectManager}
              onChange={handleChange}
              className="form-input"
            >
              <option value="">Select PM</option>
              {users.map((u) => (
                <option key={u._id} value={u._id}>
                  {u.name}
                </option>
              ))}
            </select>
          </div>
          <FormInput label="Budget" type="number" name="budget" value={formData.budget} onChange={handleChange} />
          <FormInput
            label="Start Date"
            type="date"
            name="startDate"
            value={formData.startDate}
            onChange={handleChange}
            required
          />
          <FormInput
            label="End Date"
            type="date"
            name="endDate"
            value={formData.endDate}
            onChange={handleChange}
            required
          />
        </Modal>
      </div>
    </Layout>
  )
}

export default Projects
