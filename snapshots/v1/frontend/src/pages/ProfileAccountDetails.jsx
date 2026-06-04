import { useAuth } from '../contexts/AuthContext.jsx'
import { useNavigate } from 'react-router-dom'

const ProfileAccountDetails = () => {
  const { user, logout } = useAuth()
  const navigate = useNavigate()

  return (
    <div className="container">
      <button 
        onClick={() => navigate('/profile')} 
        className="button ghost small" 
        style={{ marginBottom: '16px' }}
      >
        {'《 Profile'}
      </button>
      
      <section className="section">
        <h2>Account details</h2>
        <p className="muted">Your personal information</p>
      </section>

      <div className="card" style={{ maxWidth: '600px' }}>
        <div style={{ marginBottom: '24px' }}>
          <label style={{ display: 'block', marginBottom: '8px', color: '#666' }}>Name</label>
          <p style={{ margin: 0, fontSize: '1.1em' }}>{user?.name || 'dfreshy Member'}</p>
        </div>

        <div style={{ marginBottom: '24px' }}>
          <label style={{ display: 'block', marginBottom: '8px', color: '#666' }}>Phone Number</label>
          <p style={{ margin: 0, fontSize: '1.1em' }}>{user?.phone || 'Not shared'}</p>
        </div>

        <div style={{ marginBottom: '24px' }}>
          <label style={{ display: 'block', marginBottom: '8px', color: '#666' }}>Role</label>
          <p style={{ margin: 0, fontSize: '1.1em' }}>{user?.role || 'Customer'}</p>
        </div>

        <div className="divider" />

        <button className="button ghost" onClick={logout}>
          Log out
        </button>
      </div>
    </div>
  )
}

export default ProfileAccountDetails
