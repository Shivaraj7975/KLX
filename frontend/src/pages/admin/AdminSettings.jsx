import { NavLink } from 'react-router-dom'

const AdminSettings = () => (
  <div>
    <div className="card" style={{ marginBottom: '24px' }}>
      <h2>System Settings</h2>
      <p className="muted">Configure pricing rules and service zones.</p>
    </div>

    <div className="grid two">
      <NavLink to="/admin/settings/pricing-rules" className="card" style={{ textDecoration: 'none', color: 'inherit' }}>
        <h3>💰 Pricing Rules</h3>
        <p className="muted">
          Adjust product prices, margins, and promotional pricing for all products in the system.
        </p>
        <button className="button" style={{ marginTop: '12px' }}>
          Manage Pricing
        </button>
      </NavLink>

      <NavLink to="/admin/settings/service-zones" className="card" style={{ textDecoration: 'none', color: 'inherit' }}>
        <h3>📍 Service Zones</h3>
        <p className="muted">
          Activate or pause delivery zones, set radius limits, and manage coverage areas.
        </p>
        <button className="button" style={{ marginTop: '12px' }}>
          Manage Zones
        </button>
      </NavLink>
    </div>
  </div>
)

export default AdminSettings
