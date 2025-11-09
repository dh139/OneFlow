const express = require("express")
const Project = require("../models/Project")
const SalesOrder = require("../models/SalesOrder")
const PurchaseOrder = require("../models/PurchaseOrder")
const Invoice = require("../models/Invoice")
const VendorBill = require("../models/VendorBill")
const Expense = require("../models/Expense")
const { auth, roleCheck } = require("../middleware/auth")

const router = express.Router()

// Get all projects
router.get("/", auth, async (req, res) => {
  try {
    const projects = await Project.find()
      .populate("projectManager", "name email")
      .populate("teamMembers", "name email")
      .sort({ createdAt: -1 })
    res.json(projects)
  } catch (error) {
    res.status(500).json({ message: error.message })
  }
})

// Get project by ID
router.get("/:id", auth, async (req, res) => {
  try {
    const project = await Project.findById(req.params.id)
      .populate("projectManager", "name email")
      .populate("teamMembers", "name email")
      .populate("salesOrders")
      .populate("purchaseOrders")
      .populate("invoices")
      .populate("vendorBills")
      .populate("expenses")
    if (!project) {
      return res.status(404).json({ message: "Project not found" })
    }
    res.json(project)
  } catch (error) {
    res.status(500).json({ message: error.message })
  }
})

// Create project
router.post("/", auth, roleCheck(["admin", "pm"]), async (req, res) => {
  try {
    const { name, description, projectManager, teamMembers, budget, startDate, endDate, image } = req.body
    const project = new Project({
      name,
      description,
      projectManager,
      teamMembers,
      budget,
      startDate,
      endDate,
      image,
      status: "New",
    })
    await project.save()
    await project.populate("projectManager", "name email")
    res.status(201).json(project)
  } catch (error) {
    res.status(500).json({ message: error.message })
  }
})

// Update project
router.put("/:id", auth, roleCheck(["admin", "pm"]), async (req, res) => {
  try {
    const project = await Project.findByIdAndUpdate(req.params.id, req.body, { new: true })
      .populate("projectManager", "name email")
      .populate("teamMembers", "name email")
      .populate("salesOrders")
      .populate("purchaseOrders")
      .populate("invoices")
      .populate("vendorBills")
      .populate("expenses")
    res.json(project)
  } catch (error) {
    res.status(500).json({ message: error.message })
  }
})

// Delete project
router.delete("/:id", auth, roleCheck(["admin"]), async (req, res) => {
  try {
    await Project.findByIdAndDelete(req.params.id)
    res.json({ message: "Project deleted" })
  } catch (error) {
    res.status(500).json({ message: error.message })
  }
})

// Create Sales Order for project
router.post("/:projectId/sales-orders", auth, roleCheck(["admin", "pm", "sales"]), async (req, res) => {
  try {
    const { projectId } = req.params
    const { customer, items, taxRate, description } = req.body

    const project = await Project.findById(projectId)
    if (!project) {
      return res.status(404).json({ message: "Project not found" })
    }

    const soNumber = `SO-${Date.now()}`
    const subtotal = items.reduce((sum, item) => sum + item.quantity * item.unitPrice, 0)
    const tax = (subtotal * taxRate) / 100
    const amount = subtotal + tax

    const salesOrder = new SalesOrder({
      soNumber,
      project: projectId,
      customer,
      items,
      taxRate,
      subtotal,
      tax,
      amount,
      description,
      status: "Draft",
    })

    await salesOrder.save()
    project.salesOrders.push(salesOrder._id)
    project.totalRevenue += amount
    await project.save()

    res.status(201).json(salesOrder)
  } catch (error) {
    res.status(500).json({ message: error.message })
  }
})

// Create Purchase Order for project
router.post("/:projectId/purchase-orders", auth, roleCheck(["admin", "pm"]), async (req, res) => {
  try {
    const { projectId } = req.params
    const { vendor, items, taxRate, description } = req.body

    const project = await Project.findById(projectId)
    if (!project) {
      return res.status(404).json({ message: "Project not found" })
    }

    const poNumber = `PO-${Date.now()}`
    const subtotal = items.reduce((sum, item) => sum + item.quantity * item.unitPrice, 0)
    const tax = (subtotal * taxRate) / 100
    const amount = subtotal + tax

    const purchaseOrder = new PurchaseOrder({
      poNumber,
      project: projectId,
      vendor,
      items,
      taxRate,
      subtotal,
      tax,
      amount,
      description,
      status: "Draft",
    })

    await purchaseOrder.save()
    project.purchaseOrders.push(purchaseOrder._id)
    project.totalCost += amount
    await project.save()

    res.status(201).json(purchaseOrder)
  } catch (error) {
    res.status(500).json({ message: error.message })
  }
})

// Create Invoice for project (from Sales Order)
router.post("/:projectId/invoices", auth, roleCheck(["admin", "sales", "finance"]), async (req, res) => {
  try {
    const { projectId } = req.params
    const { customer, items, taxRate, salesOrderId } = req.body

    const project = await Project.findById(projectId)
    if (!project) {
      return res.status(404).json({ message: "Project not found" })
    }

    const invoiceNumber = `INV-${Date.now()}`
    const subtotal = items.reduce((sum, item) => sum + item.quantity * item.unitPrice, 0)
    const tax = (subtotal * taxRate) / 100
    const amount = subtotal + tax

    const invoice = new Invoice({
      invoiceNumber,
      project: projectId,
      customer,
      items,
      taxRate,
      subtotal,
      tax,
      amount,
      salesOrder: salesOrderId,
      status: "Draft",
    })

    await invoice.save()
    project.invoices.push(invoice._id)
    await project.save()

    res.status(201).json(invoice)
  } catch (error) {
    res.status(500).json({ message: error.message })
  }
})

// Create Vendor Bill for project (from Purchase Order)
router.post("/:projectId/vendor-bills", auth, roleCheck(["admin", "finance"]), async (req, res) => {
  try {
    const { projectId } = req.params
    const { vendor, items, taxRate, purchaseOrderId } = req.body

    const project = await Project.findById(projectId)
    if (!project) {
      return res.status(404).json({ message: "Project not found" })
    }

    const billNumber = `BILL-${Date.now()}`
    const subtotal = items.reduce((sum, item) => sum + item.quantity * item.unitPrice, 0)
    const tax = (subtotal * taxRate) / 100
    const amount = subtotal + tax

    const vendorBill = new VendorBill({
      billNumber,
      project: projectId,
      vendor,
      items,
      taxRate,
      subtotal,
      tax,
      amount,
      purchaseOrder: purchaseOrderId,
      status: "Draft",
    })

    await vendorBill.save()
    project.vendorBills.push(vendorBill._id)
    await project.save()

    res.status(201).json(vendorBill)
  } catch (error) {
    res.status(500).json({ message: error.message })
  }
})

// Create Expense for project
router.post("/:projectId/expenses", auth, roleCheck(["admin", "pm", "team_member"]), async (req, res) => {
  try {
    const { projectId } = req.params
    const { description, amount, category, billable, receipt } = req.body

    const project = await Project.findById(projectId)
    if (!project) {
      return res.status(404).json({ message: "Project not found" })
    }

    const expense = new Expense({
      project: projectId,
      description,
      amount,
      category,
      billable,
      receipt,
      submittedBy: req.user.id,
      status: "Pending",
    })

    await expense.save()
    project.expenses.push(expense._id)
    if (!billable) {
      project.totalCost += amount
    }
    await project.save()

    res.status(201).json(expense)
  } catch (error) {
    res.status(500).json({ message: error.message })
  }
})

module.exports = router
