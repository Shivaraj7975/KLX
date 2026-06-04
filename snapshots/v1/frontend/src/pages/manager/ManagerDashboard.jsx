const ManagerDashboard = () => (
  <div className="card">
    <h2>Manager dashboard</h2>
    <p className="muted">Keep the queue moving and inventory balanced.</p>
    <div className="grid two">
      <div>
        <h4>Order queue</h4>
        <p className="muted">12 pending approvals</p>
      </div>
      <div>
        <h4>Inventory</h4>
        <p className="muted">8 hours of stock remaining</p>
      </div>
    </div>
  </div>
)

export default ManagerDashboard
