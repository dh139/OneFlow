"use client"

import { useEffect, useState } from "react"
import { useParams, useNavigate } from "react-router-dom"
import axios from "axios"
import Layout from "../../components/Layout"
import FormInput from "../../components/FormInput"
import "./Projects.css"

const ProjectEdit = ({ user }) => {
  const { id } = useParams()
  const navigate = useNavigate()
  const [project, setProject] = useState(null)
  const [users, setUsers] = useState([])
  const [imageFile, setImageFile] = useState(null)
  const [formData, setFormData] = useState({
    name: "",
    description: "",
    status: "New",
    projectManager: "",
    budget: "",
    startDate: "",
    endDate: "",
  })
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchProject()
    fetchUsers()
  }, [id])

  const fetchProject = async () => {
    try {
      const token = localStorage.getItem("token")
      const response = await axios.get(`http://localhost:5000/api/projects/${id}`, {
        headers: { Authorization: `Bearer ${token}` },
      })
      setProject(response.data)
      setFormData({
        name: response.data.name,
        description: response.data.description,
        status: response.data.status,
        projectManager: response.data.projectManager._id,
        budget: response.data.budget,
        startDate: response.data.startDate.split("T")[0],
        endDate: response.data.endDate.split("T")[0],
      })
      setLoading(false)
    } catch (error) {
      console.error("Error fetching project:", error)
      setLoading(false)
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
        setImageFile(reader.result)
      }
      reader.readAsDataURL(file)
    }
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    try {
      const token = localStorage.getItem("token")
      const submitData = { ...formData }
      if (imageFile) {
        submitData.image = imageFile
      }
      await axios.put(`http://localhost:5000/api/projects/${id}`, submitData, {
        headers: { Authorization: `Bearer ${token}` },
      })
      navigate(`/projects/${id}`)
    } catch (error) {
      console.error("Error updating project:", error)
    }
  }

  if (loading) return <div>Loading...</div>

  return (
    <Layout user={user}>
      <div className="project-edit-page">
        <div className="page-header">
          <h1>Edit Project</h1>
        </div>

        <form onSubmit={handleSubmit} className="form-container">
          <FormInput label="Project Name" name="name" value={formData.name} onChange={handleChange} required />
          <FormInput label="Description" name="description" value={formData.description} onChange={handleChange} />

          <div className="form-group">
            <label>Project Image</label>
            {project?.image && !imageFile && (
              <img
                src={project.image || "/placeholder.svg"}
                alt="current"
                style={{ maxWidth: "100%", marginBottom: "10px" }}
              />
            )}
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
            <label>Status</label>
            <select name="status" value={formData.status} onChange={handleChange} className="form-input">
              <option value="New">New</option>
              <option value="In Progress">In Progress</option>
              <option value="Done">Done</option>
            </select>
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

          <div className="form-actions">
            <button type="submit" className="btn-primary">
              Save Changes
            </button>
            <button type="button" onClick={() => navigate(`/projects/${id}`)} className="btn-secondary">
              Cancel
            </button>
          </div>
        </form>
      </div>
    </Layout>
  )
}

export default ProjectEdit
