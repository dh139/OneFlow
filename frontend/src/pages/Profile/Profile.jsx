"use client"

import { useState } from "react"
import axios from "axios"
import Layout from "../../components/Layout"
import FormInput from "../../components/FormInput"
import "./Profile.css"

const Profile = ({ user }) => {
  const [profile, setProfile] = useState(user || {})
  const [password, setPassword] = useState({ current: "", new: "", confirm: "" })
  const [message, setMessage] = useState("")

  const handleProfileChange = (e) => {
    const { name, value } = e.target
    setProfile((prev) => ({ ...prev, [name]: value }))
  }

  const handlePasswordChange = (e) => {
    const { name, value } = e.target
    setPassword((prev) => ({ ...prev, [name]: value }))
  }

  const handleUpdateProfile = async () => {
    try {
      const token = localStorage.getItem("token")
      await axios.put(`http://localhost:5000/api/users/${user?.id}`, profile, {
        headers: { Authorization: `Bearer ${token}` },
      })
      setMessage("Profile updated successfully")
    } catch (error) {
      setMessage("Error updating profile")
    }
  }

  return (
    <Layout user={user}>
      <div className="profile-page">
        <div className="profile-container">
          <h1>My Profile</h1>

          <div className="profile-sections">
            <div className="section">
              <h2>Personal Information</h2>
              <FormInput label="Full Name" name="name" value={profile.name} onChange={handleProfileChange} />
              <FormInput label="Email" type="email" name="email" value={profile.email} onChange={handleProfileChange} />
              <FormInput label="Phone" name="phone" value={profile.phone} onChange={handleProfileChange} />
              <FormInput
                label="Department"
                name="department"
                value={profile.department}
                onChange={handleProfileChange}
              />
              <button onClick={handleUpdateProfile} className="btn-primary">
                Update Profile
              </button>
            </div>

            <div className="section">
              <h2>Change Password</h2>
              <FormInput
                label="Current Password"
                type="password"
                name="current"
                value={password.current}
                onChange={handlePasswordChange}
              />
              <FormInput
                label="New Password"
                type="password"
                name="new"
                value={password.new}
                onChange={handlePasswordChange}
              />
              <FormInput
                label="Confirm Password"
                type="password"
                name="confirm"
                value={password.confirm}
                onChange={handlePasswordChange}
              />
              <button className="btn-primary">Update Password</button>
            </div>
          </div>

          {message && <div className="message">{message}</div>}
        </div>
      </div>
    </Layout>
  )
}

export default Profile
