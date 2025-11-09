const express = require("express")
const { auth, authorize } = require("../middleware/auth")
const {
  createSalesOrder,
  getSalesOrders,
  createInvoice,
  getInvoices,
  createPurchaseOrder,
  createExpense,
  getExpenses,
} = require("../controllers/financialController")

const router = express.Router()

// Sales Orders
router.post("/sales-orders", auth, authorize(["admin", "sales", "finance", "pm"]), createSalesOrder)
router.get("/sales-orders", auth, authorize(["admin", "sales", "finance", "pm"]), getSalesOrders)

// Invoices
router.post("/invoices", auth, authorize(["admin", "sales", "finance", "pm"]), createInvoice)
router.get("/invoices", auth, authorize(["admin", "sales", "finance", "pm"]), getInvoices)

// Purchase Orders
router.post("/purchase-orders", auth, authorize(["admin", "finance", "pm"]), createPurchaseOrder)
router.get("/purchase-orders", auth, authorize(["admin", "finance", "pm"]), getSalesOrders)

// Expenses
router.post("/expenses", auth, createExpense)
router.get("/expenses", auth, getExpenses)

module.exports = router
