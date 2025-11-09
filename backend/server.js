const express = require("express")
const cors = require("cors")
const dotenv = require("dotenv")
const mongoose = require("mongoose")
const path = require("path")

dotenv.config()

const app = express()

// Middleware
app.use(cors())
app.use(express.json({ limit: "50mb" }))
app.use(express.urlencoded({ limit: "50mb", extended: true }))

// MongoDB Connection
mongoose
  .connect(process.env.MONGODB_URI || "mongodb://localhost:27017/oneflow", {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  })
  .then(() => console.log("MongoDB connected"))
  .catch((err) => console.log("MongoDB connection error:", err))

// Routes
app.use("/api/auth", require("./routes/authRoutes"))
app.use("/api/projects", require("./routes/projectRoutes"))
app.use("/api/tasks", require("./routes/taskRoutes"))
app.use("/api/users", require("./routes/userRoutes"))
app.use("/api/financial", require("./routes/financialRoutes"))
app.use("/api/timesheets", require("./routes/timesheetRoutes"))
app.use("/api/purchaseorders", require("./routes/purchaseOrderRoutes"))
app.use("/api/expenses", require("./routes/expenseRoutes"))
app.use("/api/invoices", require("./routes/invoiceRoutes"))
// Add this line with your other route imports
app.use("/api/vendorbills", require("./routes/vendorBillRoutes"))
const PORT = process.env.PORT || 5000
app.listen(PORT, () => console.log(`Server running on port ${PORT}`))
