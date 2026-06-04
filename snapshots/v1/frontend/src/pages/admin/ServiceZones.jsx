import { useEffect, useState } from 'react'
import { useAuth } from '../../contexts/AuthContext.jsx'
import { api } from '../../services/api.js'

const ServiceZones = () => {
  const { token } = useAuth()
  const [zones, setZones] = useState([])
  const [loading, setLoading] = useState(true)
  const [showAddForm, setShowAddForm] = useState(false)
  const [newZone, setNewZone] = useState({
    name: '',
    pincode: '',
    radius: '',
    deliveryFee: '',
  })

  useEffect(() => {
    loadZones()
  }, [token])

  const loadZones = async () => {
    setLoading(true)
    try {
      const data = await api.getServiceZones(token)
      setZones(data)
    } catch (error) {
      console.error('Failed to load zones:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleToggleStatus = async (zoneId, currentStatus) => {
    const newStatus = currentStatus === 'ACTIVE' ? 'PAUSED' : 'ACTIVE'
    try {
      await api.updateZoneStatus(zoneId, newStatus, token)
      setZones((prev) =>
        prev.map((z) => (z.id === zoneId ? { ...z, status: newStatus } : z))
      )
    } catch (error) {
      alert('Failed to update zone status.')
    }
  }

  const handleAddZone = async () => {
    try {
      const created = await api.createServiceZone(newZone, token)
      setZones((prev) => [...prev, created])
      setShowAddForm(false)
      setNewZone({ name: '', pincode: '', radius: '', deliveryFee: '' })
    } catch (error) {
      alert('Failed to create zone.')
    }
  }

  return (
    <div>
      <div className="card" style={{ marginBottom: '24px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start', flexWrap: 'wrap', gap: '16px' }}>
          <div>
            <h2>📍 Service Zones</h2>
            <p className="muted">
              Manage delivery coverage areas, set radius limits, and control zone availability.
            </p>
          </div>
          <button className="button" onClick={() => setShowAddForm(!showAddForm)}>
            {showAddForm ? 'Cancel' : '+ Add Zone'}
          </button>
        </div>
      </div>

      {showAddForm && (
        <div className="card" style={{ marginBottom: '24px' }}>
          <h3>Add New Service Zone</h3>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', marginTop: '16px' }}>
            <label>
              Zone Name
              <input
                className="input"
                value={newZone.name}
                onChange={(e) => setNewZone({ ...newZone, name: e.target.value })}
                placeholder="Indiranagar"
              />
            </label>
            <label>
              Pincode
              <input
                className="input"
                value={newZone.pincode}
                onChange={(e) => setNewZone({ ...newZone, pincode: e.target.value })}
                placeholder="560038"
              />
            </label>
            <label>
              Delivery Radius (km)
              <input
                className="input"
                type="number"
                value={newZone.radius}
                onChange={(e) => setNewZone({ ...newZone, radius: e.target.value })}
                placeholder="5"
              />
            </label>
            <label>
              Delivery Fee (₹)
              <input
                className="input"
                type="number"
                value={newZone.deliveryFee}
                onChange={(e) => setNewZone({ ...newZone, deliveryFee: e.target.value })}
                placeholder="30"
              />
            </label>
            <button className="button" onClick={handleAddZone}>
              Create Zone
            </button>
          </div>
        </div>
      )}

      {loading && <p className="muted">Loading zones...</p>}

      {!loading && zones.length === 0 && (
        <div className="card">
          <p className="muted">No service zones configured yet.</p>
        </div>
      )}

      {!loading && zones.length > 0 && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
          {zones.map((zone) => (
            <div key={zone.id} className="card">
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start', flexWrap: 'wrap', gap: '16px' }}>
                <div>
                  <h3 style={{ marginBottom: '4px' }}>{zone.name}</h3>
                  <p className="muted" style={{ fontSize: '0.9em' }}>
                    Pincode: {zone.pincode} • Radius: {zone.radius} km
                  </p>
                  <p className="muted" style={{ fontSize: '0.9em' }}>
                    Delivery Fee: ₹{zone.deliveryFee}
                  </p>
                  <span
                    className="pill"
                    style={{
                      marginTop: '8px',
                      display: 'inline-block',
                      background: zone.status === 'ACTIVE' ? '#d4f4dd' : '#ffe4c4',
                      color: zone.status === 'ACTIVE' ? '#0c8f7a' : '#d97706',
                    }}
                  >
                    {zone.status}
                  </span>
                </div>
                <button
                  className={`button ${zone.status === 'ACTIVE' ? 'warning' : 'ghost'}`}
                  onClick={() => handleToggleStatus(zone.id, zone.status)}
                >
                  {zone.status === 'ACTIVE' ? 'Pause Zone' : 'Activate Zone'}
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

export default ServiceZones
