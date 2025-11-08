"use client"

import { useEffect, useState } from "react"
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom"
import Login from "./pages/Auth/Login"
import Signup from "./pages/Auth/Signup"
import Dashboard from "./pages/Dashboard/Dashboard"
import Projects from "./pages/Projects/Projects"
import ProjectDetail from "./pages/Projects/ProjectDetail"
import Tasks from "./pages/Tasks/Tasks"
import Analytics from "./pages/Analytics/Analytics"
import Profile from "./pages/Profile/Profile"
import SalesOrders from "./pages/Settings/SalesOrders"
import PurchaseOrders from "./pages/Settings/PurchaseOrders"
import Invoices from "./pages/Settings/Invoices"
import VendorBills from "./pages/Settings/VendorBills"
import Expenses from "./pages/Settings/Expenses"
import PrivateRoute from "./components/PrivateRoute"
import "./App.css"

function App() {
  const [user, setUser] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const token = localStorage.getItem("token")
    const userData = localStorage.getItem("user")
    if (token && userData) {
      setUser(JSON.parse(userData))
    }
    setLoading(false)
  }, [])

  if (loading) {
    return <div className="loading">Loading...</div>
  }

  return (
    <BrowserRouter>
      <Routes>
        <Route path="/login" element={<Login setUser={setUser} />} />
        <Route path="/signup" element={<Signup />} />

        <Route element={<PrivateRoute user={user} />}>
          <Route path="/dashboard" element={<Dashboard user={user} />} />
          <Route path="/projects" element={<Projects user={user} />} />
          <Route path="/projects/:id" element={<ProjectDetail user={user} />} />
          <Route path="/tasks" element={<Tasks user={user} />} />
          <Route path="/analytics" element={<Analytics user={user} />} />
          <Route path="/profile" element={<Profile user={user} />} />
          <Route path="/salesorders" element={<SalesOrders user={user} />} />
          <Route path="/purchaseorders" element={<PurchaseOrders user={user} />} />
          <Route path="/invoices" element={<Invoices user={user} />} />
          <Route path="/vendorbills" element={<VendorBills user={user} />} />
          <Route path="/expenses" element={<Expenses user={user} />} />
        </Route>

        <Route path="/" element={<Navigate to="/dashboard" />} />
      </Routes>
    </BrowserRouter>
  )
}

export default App
