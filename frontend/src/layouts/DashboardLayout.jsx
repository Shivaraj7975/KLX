import { NavLink, Outlet, Navigate } from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext.jsx'
import Navbar from '../components/Navbar.jsx'

const roleConfig = {
  ADMIN: {
    title: 'Admin Control',
    links: [
      { to: '/admin', label: 'Overview' },
      { to: '/admin/users', label: 'Users' },
      { to: '/admin/products', label: 'Products' },
      { to: '/admin/audit', label: 'Audit Logs' },
      { to: '/admin/analytics', label: 'Analytics' },
      { to: '/admin/settings', label: 'Settings' },
    ],
  },
  MANAGER: {
    title: 'Manager Desk',
    links: [
      { to: '/manager', label: 'Dashboard' },
      { to: '/manager/orders', label: 'Orders' },
      { to: '/manager/products', label: 'Products' },
      { to: '/manager/cod', label: 'COD Settlement' },
    ],
  },
  DELIVERY: {
    title: 'Delivery Run',
    links: [{ to: '/delivery/orders', label: 'Assigned Orders' }],
  },
}

const DashboardLayout = ({ role }) => {
  const { user, logout, isAdmin } = useAuth()
  const config = roleConfig[role]

  if (role === 'ADMIN' && !isAdmin) {
    return <Navigate to="/" replace />
  }

  return (
    <div className="dashboard-shell">
      <aside className="sidebar">
        <span className="pill">{role}</span>
        <h3>{config?.title}</h3>
        <div className="sidebar-links">
          {config?.links.map((link) => (
            <NavLink
              key={link.to}
              to={link.to}
              end={link.to === `/${role.toLowerCase()}`}
              className={({ isActive }) =>
                `sidebar-link ${isActive ? 'active' : ''}`
              }
            >
              {link.label}
            </NavLink>
          ))}
        </div>
        <div className="divider" />
        <p className="muted">Signed in as {user?.name || 'dfreshy Staff'}</p>
        <button className="button ghost" onClick={logout}>
          Log out
        </button>
      </aside>
      <section className="dashboard-content">
        <Outlet />
      </section>
      <Navbar />
    </div>
  )
}

export default DashboardLayout
