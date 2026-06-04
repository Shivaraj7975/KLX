import { useEffect, useState } from 'react'
import { useAuth } from '../../contexts/AuthContext.jsx'
import { api } from '../../services/api.js'

const AdminUsers = () => {
  const { token } = useAuth()
  const [users, setUsers] = useState([])
  const [loading, setLoading] = useState(true)
  const [filter, setFilter] = useState('ALL')

  useEffect(() => {
    loadUsers()
  }, [token])

  const loadUsers = async () => {
    setLoading(true)
    try {
      const data = await api.getUsers(token)
      setUsers(data)
    } catch (error) {
      console.error('Failed to load users:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleRoleChange = async (userId, newRole) => {
    try {
      await api.updateUserRole(userId, newRole, token)
      setUsers((prev) =>
        prev.map((u) => (u.id === userId ? { ...u, role: newRole } : u))
      )
    } catch (error) {
      alert('Failed to update role.')
    }
  }

  const handleStatusToggle = async (userId, currentStatus) => {
    const newStatus = currentStatus === 'ACTIVE' ? 'SUSPENDED' : 'ACTIVE'
    try {
      await api.updateUserStatus(userId, newStatus, token)
      setUsers((prev) =>
        prev.map((u) => (u.id === userId ? { ...u, status: newStatus } : u))
      )
    } catch (error) {
      alert('Failed to update status.')
    }
  }

  const filtered =
    filter === 'ALL' ? users : users.filter((u) => u.role === filter)

  return (
    <div>
      <div className="card" style={{ marginBottom: '24px' }}>
        <h2>User Management</h2>
        <p className="muted">Manage customer and staff accounts in real time.</p>
        <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap', marginTop: '16px' }}>
          {['ALL', 'CUSTOMER', 'MANAGER', 'DELIVERY', 'ADMIN'].map((f) => (
            <button
              key={f}
              className={`button ${filter === f ? '' : 'ghost'}`}
              onClick={() => setFilter(f)}
            >
              {f}
            </button>
          ))}
        </div>
      </div>

      {loading && <p className="muted">Loading users...</p>}

      {!loading && filtered.length === 0 && (
        <div className="card">
          <p className="muted">No users found.</p>
        </div>
      )}

      {!loading && filtered.length > 0 && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
          {filtered.map((user) => (
            <div key={user.id} className="card">
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start', flexWrap: 'wrap', gap: '16px' }}>
                <div>
                  <h3 style={{ marginBottom: '4px' }}>{user.name}</h3>
                  <p className="muted" style={{ fontSize: '0.9em' }}>
                    {user.phone} • {user.email || 'No email'}
                  </p>
                  <span className="pill" style={{ marginTop: '8px', display: 'inline-block' }}>
                    {user.role}
                  </span>
                </div>
                <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap', alignItems: 'center' }}>
                  <select
                    className="input"
                    value={user.role}
                    onChange={(e) => handleRoleChange(user.id, e.target.value)}
                    style={{ width: 'auto' }}
                  >
                    <option value="CUSTOMER">Customer</option>
                    <option value="MANAGER">Manager</option>
                    <option value="DELIVERY">Delivery</option>
                    <option value="ADMIN">Admin</option>
                  </select>
                  <button
                    className={`button ${user.status === 'ACTIVE' ? 'ghost' : 'warning'}`}
                    onClick={() => handleStatusToggle(user.id, user.status)}
                  >
                    {user.status === 'ACTIVE' ? 'Suspend' : 'Activate'}
                  </button>
                </div>
              </div>
              <p className="muted" style={{ marginTop: '12px', fontSize: '0.85em' }}>
                Joined: {new Date(user.createdAt).toLocaleDateString()} •{' '}
                Status: <strong>{user.status}</strong>
              </p>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

export default AdminUsers
