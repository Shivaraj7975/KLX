import { useEffect, useState } from 'react'
import { api } from '../../services/api.js'
import { useAuth } from '../../contexts/AuthContext.jsx'

const AdminAudit = () => {
  const { token } = useAuth()
  const [logs, setLogs] = useState([])

  useEffect(() => {
    api.getAdminLogs(token).then(setLogs)
  }, [token])

  return (
    <div>
      <h2>Audit logs</h2>
      <p className="muted">Recent platform events and security traces.</p>
      <div className="grid two" style={{ marginTop: '24px' }}>
        {logs.map((log) => (
          <div key={log.id} className="card">
            <strong>{log.message}</strong>
            <p className="muted">{log.time}</p>
          </div>
        ))}
      </div>
    </div>
  )
}

export default AdminAudit
