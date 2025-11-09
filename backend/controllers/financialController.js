const SalesOrder = require("../models/SalesOrder")
const PurchaseOrder = require("../models/PurchaseOrder")
const Invoice = require("../models/Invoice")
const VendorBill = require("../models/VendorBill")
const Expense = require("../models/Expense")

// Sales Order
exports.createSalesOrder = async (req, res) => {
  try {
    const { customer, customerEmail, customerPhone, customerAddress, project, dueDate, items, notes } = req.body

    const soNumber = `SO-${Date.now()}`
    const subtotal = items.reduce((sum, item) => sum + item.quantity * item.unitPrice, 0)
    const tax = subtotal * 0.18
    const total = subtotal + tax

    const salesOrder = new SalesOrder({
      soNumber,
      customer,
      project,
      items,
      subtotal,
      tax,
      total,
      amount: total, // Required field - same as total
      totalAmount: total, // Also set totalAmount for frontend compatibility
      dueDate: dueDate || new Date(),
      notes,
      createdBy: req.user.id,
    })

    await salesOrder.save()
    await salesOrder.populate("createdBy", "name email")
    res.status(201).json(salesOrder)
  } catch (error) {
    res.status(500).json({ error: error.message })
  }
}

// Get Sales Orders
exports.getSalesOrders = async (req, res) => {
  try {
    const { status, project } = req.query
    const query = {}
    if (status) query.status = status
    if (project) query.project = project

    const salesOrders = await SalesOrder.find(query).populate("createdBy", "name email").populate("project", "name")
    res.json(salesOrders)
  } catch (error) {
    res.status(500).json({ error: error.message })
  }
}

// Invoice
exports.createInvoice = async (req, res) => {
  try {
    const { customer, project, salesOrder, items, notes } = req.body

    const invoiceNumber = `INV-${Date.now()}`
    const subtotal = items.reduce((sum, item) => sum + item.quantity * item.unitPrice, 0)
    const tax = subtotal * 0.18
    const total = subtotal + tax

    const invoice = new Invoice({
      invoiceNumber,
      customer,
      project,
      salesOrder,
      items,
      subtotal,
      tax,
      total,
      amount: total, // Add this if Invoice model also requires it
      notes,
      createdBy: req.user.id,
    })

    await invoice.save()
    await invoice.populate("createdBy", "name email").populate("project", "name").populate("salesOrder")
    res.status(201).json(invoice)
  } catch (error) {
    res.status(500).json({ error: error.message })
  }
}

// Get Invoices
exports.getInvoices = async (req, res) => {
  try {
    const { status, project } = req.query
    const query = {}
    if (status) query.status = status
    if (project) query.project = project

    const invoices = await Invoice.find(query)
      .populate("createdBy", "name email")
      .populate("project", "name")
      .populate("salesOrder")
    res.json(invoices)
  } catch (error) {
    res.status(500).json({ error: error.message })
  }
}

// Purchase Order
exports.createPurchaseOrder = async (req, res) => {
  try {
    const { vendor, vendorEmail, vendorPhone, vendorAddress, project, items, notes } = req.body

    const poNumber = `PO-${Date.now()}`
    const subtotal = items.reduce((sum, item) => sum + item.quantity * item.unitPrice, 0)
    const tax = subtotal * 0.18
    const total = subtotal + tax

    const purchaseOrder = new PurchaseOrder({
      poNumber,
      vendor,
      project,
      items,
      subtotal,
      tax,
      total,
      amount: total, // Add this if PurchaseOrder model also requires it
      notes,
      createdBy: req.user.id,
    })

    await purchaseOrder.save()
    await purchaseOrder.populate("createdBy", "name email").populate("project", "name")
    res.status(201).json(purchaseOrder)
  } catch (error) {
    res.status(500).json({ error: error.message })
  }
}

// Expense
exports.createExpense = async (req, res) => {
  try {
    const { category, amount, project, description, billable } = req.body

    const expense = new Expense({
      category,
      amount,
      project,
      description,
      billable,
      user: req.user.id,
    })

    await expense.save()
    await expense.populate("user", "name email").populate("project", "name")
    res.status(201).json(expense)
  } catch (error) {
    res.status(500).json({ error: error.message })
  }
}

// Get Expenses
exports.getExpenses = async (req, res) => {
  try {
    const { status, project } = req.query
    const query = {}
    if (status) query.status = status
    if (project) query.project = project

    const expenses = await Expense.find(query).populate("user", "name email").populate("project", "name")

    res.json(expenses)
  } catch (error) {
    res.status(500).json({ error: error.message })
  }
}