"use client"
import { useNavigate } from "react-router-dom"
import "./Header.css"

const Header = ({ user }) => {
  const navigate = useNavigate()

  const handleLogout = () => {
    localStorage.removeItem("token")
    localStorage.removeItem("user")
    navigate("/login")
  }

  return (
    <header className="header">
      <div className="header-content">
        <div className="header-left">
          <h1>Welcome, {user?.name}!</h1>
        </div>
        <div className="header-right">
          <button onClick={handleLogout} className="logout-btn">
            Logout
          </button>
        </div>
      </div>
    </header>
  )
}

export default Header
