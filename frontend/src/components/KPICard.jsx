import "./KPICard.css"

const KPICard = ({ title, value, icon, color = "blue" }) => {
  return (
    <div className={`kpi-card kpi-${color}`}>
      <div className="kpi-icon">{icon}</div>
      <div className="kpi-content">
        <p className="kpi-title">{title}</p>
        <p className="kpi-value">{value}</p>
      </div>
    </div>
  )
}

export default KPICard
