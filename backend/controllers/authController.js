const User = require("../models/User")
const jwt = require("jsonwebtoken")

// Generate JWT Token
const generateToken = (user) => {
  return jwt.sign({ id: user._id, email: user.email, role: user.role }, process.env.JWT_SECRET || "your-secret-key", {
    expiresIn: "30d",
  })
}

// Register User
exports.register = async (req, res) => {
  try {
    const { name, email, password, role, phone } = req.body

    // Validate input
    if (!name || !email || !password) {
      return res.status(400).json({ error: "Name, email, and password are required" })
    }

    // Check if user exists
    let user = await User.findOne({ email })
    if (user) {
      return res.status(400).json({ error: "User already exists" })
    }

    // Only allow admin role to be assigned by existing admins
    const userRole = role || "team_member"
    if (role === "admin" && !req.user) {
      return res.status(403).json({ error: "Only admins can create admin accounts" })
    }

    // Create new user
    user = new User({
      name,
      email,
      password,
      phone,
      role: userRole,
    })

    // Save user
    await user.save()

    // Generate token
    const token = generateToken(user)

    res.status(201).json({
      token,
      user: user.toJSON(),
    })
  } catch (error) {
    res.status(500).json({ error: error.message })
  }
}

// Admin Register (only for admins)
exports.registerAdmin = async (req, res) => {
  try {
    const { name, email, password, phone } = req.body

    if (!name || !email || !password) {
      return res.status(400).json({ error: "Name, email, and password are required" })
    }

    let user = await User.findOne({ email })
    if (user) {
      return res.status(400).json({ error: "Admin already exists" })
    }

    user = new User({
      name,
      email,
      password,
      phone,
      role: "admin",
    })

    await user.save()
    const token = generateToken(user)

    res.status(201).json({
      token,
      user: user.toJSON(),
    })
  } catch (error) {
    res.status(500).json({ error: error.message })
  }
}

// Login
exports.login = async (req, res) => {
  try {
    const { email, password } = req.body

    if (!email || !password) {
      return res.status(400).json({ error: "Email and password are required" })
    }

    const user = await User.findOne({ email })
    if (!user) {
      return res.status(400).json({ error: "Invalid credentials" })
    }

    const isMatch = await user.comparePassword(password)
    if (!isMatch) {
      return res.status(400).json({ error: "Invalid credentials" })
    }

    if (!user.isActive) {
      return res.status(403).json({ error: "Account is inactive" })
    }

    const token = generateToken(user)

    res.json({
      token,
      user: user.toJSON(),
    })
  } catch (error) {
    res.status(500).json({ error: error.message })
  }
}

// Get current user
exports.getCurrentUser = async (req, res) => {
  try {
    const user = await User.findById(req.user.id)
    res.json(user)
  } catch (error) {
    res.status(500).json({ error: error.message })
  }
}

// Update profile
exports.updateProfile = async (req, res) => {
  try {
    const { name, phone, designation, bio, address, city, state, zipCode, country, bankDetails } = req.body

    const user = await User.findByIdAndUpdate(
      req.user.id,
      {
        name: name || undefined,
        phone: phone || undefined,
        designation: designation || undefined,
        bio: bio || undefined,
        address: address || undefined,
        city: city || undefined,
        state: state || undefined,
        zipCode: zipCode || undefined,
        country: country || undefined,
        bankDetails: bankDetails || undefined,
        updatedAt: new Date(),
      },
      { new: true },
    )

    res.json({
      message: "Profile updated successfully",
      user: user.toJSON(),
    })
  } catch (error) {
    res.status(500).json({ error: error.message })
  }
}

// Get all users (admin only)
exports.getAllUsers = async (req, res) => {
  try {
    const users = await User.find().select("-password")
    res.json(users)
  } catch (error) {
    res.status(500).json({ error: error.message })
  }
}

// Get users by role
exports.getUsersByRole = async (req, res) => {
  try {
    const { role } = req.params
    const users = await User.find({ role }).select("-password")
    res.json(users)
  } catch (error) {
    res.status(500).json({ error: error.message })
  }
}

// Update user (admin only)
exports.updateUser = async (req, res) => {
  try {
    const { userId } = req.params
    const { name, email, phone, role, isActive } = req.body

    const user = await User.findByIdAndUpdate(
      userId,
      {
        name: name || undefined,
        email: email || undefined,
        phone: phone || undefined,
        role: role || undefined,
        isActive: isActive !== undefined ? isActive : undefined,
      },
      { new: true },
    ).select("-password")

    res.json({
      message: "User updated successfully",
      user,
    })
  } catch (error) {
    res.status(500).json({ error: error.message })
  }
}
