import { Link, useLocation } from "react-router-dom"
import "./Sidebar.css"

const Sidebar = ({ user }) => {
  const location = useLocation()

  const isActive = (path) => location.pathname === path || location.pathname.startsWith(path + "/")

  const renderMenuItems = () => {
    const commonItems = [
      { path: "/dashboard", label: "Dashboard", icon: "📊" },
      { path: "/projects", label: "Projects", icon: "📁" },
      { path: "/tasks", label: "Tasks", icon: "✓" },
      { path: "/analytics", label: "Analytics", icon: "📈" },
    ]

    const adminItems = [
      { path: "/salesorders", label: "Sales Orders", icon: "🛒" },
      { path: "/purchaseorders", label: "Purchase Orders", icon: "📦" },
      { path: "/invoices", label: "Invoices", icon: "💰" },
      { path: "/vendorbills", label: "Vendor Bills", icon: "📄" },
      { path: "/expenses", label: "Expenses", icon: "💸" },
    ]

    const items = commonItems
    if (user?.role === "admin" || user?.role === "finance" || user?.role === "pm") {
      items.push(...adminItems)
    }

    return items
  }

  return (
    <div className="sidebar">
      <div className="sidebar-header">
        <h2>OneFlow</h2>
      </div>
      <nav className="sidebar-nav">
        {renderMenuItems().map((item) => (
          <Link key={item.path} to={item.path} className={`nav-item ${isActive(item.path) ? "active" : ""}`}>
            <span className="icon">{item.icon}</span>
            <span className="label">{item.label}</span>
          </Link>
        ))}
      </nav>
      <div className="sidebar-footer">
        <Link to="/profile" className="profile-link">
          <span className="avatar">{user?.name?.charAt(0)}</span>
          <span className="name">{user?.name}</span>
        </Link>
      </div>
    </div>
  )
}

export default Sidebar
