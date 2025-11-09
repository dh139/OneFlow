// routes/authRoutes.js
const express = require("express")
const router = express.Router()
const User = require("../models/User")
const jwt = require("jsonwebtoken")
const { auth, admin } = require("../middleware/auth") // assuming you have both

// Helper: Generate JWT
const generateToken = (user) => {
  return jwt.sign(
    { id: user._id, email: user.email, role: user.role },
    process.env.JWT_SECRET || "your_jwt_secret",
    { expiresIn: "30d" }
  )
}

// Register Normal User (team member, client, etc.)
router.post("/register", async (req, res) => {
  try {
    const { name, email, password, phone, role = "team_member" } = req.body

    if (!name || !email || !password) {
      return res.status(400).json({ error: "Name, email and password are required" })
    }

    const existingUser = await User.findOne({ email })
    if (existingUser) {
      return res.status(400).json({ error: "User already exists" })
    }

    const user = new User({ name, email, password, phone, role })
    await user.save()

    const token = generateToken(user)

    res.status(201).json({
      message: "User registered successfully",
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        phone: user.phone,
      },
    })
  } catch (error) {
    res.status(500).json({ error: error.message })
  }
})

// Register Admin (ONLY FOR FIRST ADMIN or PROTECTED)
router.post("/register-admin", async (req, res) => {
  try {
    const { name, email, password, phone } = req.body

    if (!name || !email || !password) {
      return res.status(400).json({ error: "Name, email and password are required" })
    }

    // Optional: Remove this block after first admin is created
    const adminExists = await User.findOne({ role: "admin" })
    if (adminExists) {
      return res.status(403).json({ 
        error: "Admin already exists. Use protected route to create more." 
      })
    }

    const user = new User({
      name,
      email,
      password,
      phone,
      role: "admin",
    })

    await user.save()
    const token = generateToken(user)

    res.status(201).json({
      message: "Admin created successfully!",
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: "admin",
      },
    })
  } catch (error) {
    res.status(500).json({ error: error.message })
  }
})

// Login
router.post("/login", async (req, res) => {
  try {
    const { email, password } = req.body
    if (!email || !password) {
      return res.status(400).json({ error: "Email and password required" })
    }

    const user = await User.findOne({ email })
    if (!user || !(await user.comparePassword(password))) {
      return res.status(400).json({ error: "Invalid credentials" })
    }

    if (!user.isActive) {
      return res.status(403).json({ error: "Account deactivated" })
    }

    const token = generateToken(user)

    res.json({
      message: "Login successful",
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
      },
    })
  } catch (error) {
    res.status(500).json({ error: error.message })
  }
})

// Get current user (protected)
router.get("/me", auth, async (req, res) => {
  try {
    const user = await User.findById(req.user.id).select("-password")
    res.json(user)
  } catch (error) {
    res.status(500).json({ error: error.message })
  }
})

module.exports = router