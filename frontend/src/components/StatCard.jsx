const StatCard = ({ label, value }) => (
  <div className="card">
    <p className="muted">{label}</p>
    <h2 style={{ margin: 0 }}>{value}</h2>
  </div>
)

export default StatCard
