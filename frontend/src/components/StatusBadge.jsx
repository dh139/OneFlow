import "./StatusBadge.css"

const StatusBadge = ({ status }) => {
  const getStatusClass = (status) => {
    const statusMap = {
      Draft: "draft",
      Planned: "planned",
      New: "new",
      "In Progress": "in-progress",
      Blocked: "blocked",
      Done: "done",
      Completed: "completed",
      "On Hold": "on-hold",
      Confirmed: "confirmed",
      Sent: "sent",
      Delivered: "delivered",
      Billed: "billed",
      Paid: "paid",
      Approved: "approved",
      Received: "received",
      Submitted: "submitted",
      Rejected: "rejected",
      Reimbursed: "reimbursed",
    }
    return statusMap[status] || "default"
  }

  return <span className={`status-badge status-${getStatusClass(status)}`}>{status}</span>
}

export default StatusBadge
