import { lazy, Suspense, useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { getStoredAddresses, storeAddresses } from '../services/storage.js'
import { reverseGeocode } from '../utils/geocode.js'

const AddressMap = lazy(() => import('../components/AddressMap.jsx'))

const ProfileAddresses = () => {
  const navigate = useNavigate()
  const [addresses, setAddresses] = useState([])
  const [showAddressForm, setShowAddressForm] = useState(false)
  const [editingAddress, setEditingAddress] = useState(null)
  const [newAddress, setNewAddress] = useState({ label: '', address: '', isDefault: false, lat: null, lng: null })
  const [locating, setLocating] = useState(false)
  const [locationError, setLocationError] = useState('')
  const [labelError, setLabelError] = useState('')
  const [addressError, setAddressError] = useState('')
  const [mapCenter, setMapCenter] = useState([20.5937, 78.9629])
  const [mapZoom, setMapZoom] = useState(5)

  useEffect(() => {
    setAddresses(getStoredAddresses())
  }, [])

  const validateLabel = (value) => {
    const trimmed = value.trim()
    if (!trimmed) return 'Address label is required.'
    return ''
  }

  const validateAddress = (value) => {
    const trimmed = value.trim()
    if (trimmed.length < 5) return 'Address must be at least 5 characters.'
    if (!/^[A-Za-z0-9 ,]+$/.test(trimmed)) {
      return 'Address can only contain letters, numbers, spaces, and commas.'
    }
    return ''
  }

  const handleAddAddress = () => {
    const nextLabelError = validateLabel(newAddress.label)
    const nextAddressError = validateAddress(newAddress.address)
    setLabelError(nextLabelError)
    setAddressError(nextAddressError)
    if (nextLabelError || nextAddressError) return
    const updated = [...addresses, { ...newAddress, id: Date.now().toString() }]
    if (newAddress.isDefault) {
      updated.forEach((addr) => {
        if (addr.id !== newAddress.id) addr.isDefault = false
      })
    }
    setAddresses(updated)
    storeAddresses(updated)
    setNewAddress({ label: '', address: '', isDefault: false, lat: null, lng: null })
    setShowAddressForm(false)
  }

  const handleEditAddress = (addr) => {
    setEditingAddress(addr.id)
    setNewAddress({ ...addr, lat: addr.lat ?? null, lng: addr.lng ?? null })
    if (addr.lat != null && addr.lng != null) {
      setMapCenter([addr.lat, addr.lng])
      setMapZoom(17)
    }
    setShowAddressForm(true)
  }

  const handleUpdateAddress = () => {
    const nextLabelError = validateLabel(newAddress.label)
    const nextAddressError = validateAddress(newAddress.address)
    setLabelError(nextLabelError)
    setAddressError(nextAddressError)
    if (nextLabelError || nextAddressError) return
    const updated = addresses.map((addr) => (addr.id === editingAddress ? newAddress : addr))
    if (newAddress.isDefault) {
      updated.forEach((addr) => {
        if (addr.id !== editingAddress) addr.isDefault = false
      })
    }
    setAddresses(updated)
    storeAddresses(updated)
    setNewAddress({ label: '', address: '', isDefault: false, lat: null, lng: null })
    setEditingAddress(null)
    setShowAddressForm(false)
  }

  const handleDeleteAddress = (id) => {
    const updated = addresses.filter((addr) => addr.id !== id)
    setAddresses(updated)
    storeAddresses(updated)
  }

  const updateAddressFromCoords = async (lat, lon) => {
    const address = await reverseGeocode(lat, lon)
    setMapCenter([lat, lon])
    setMapZoom(17)
    setNewAddress((prev) => ({ ...prev, address, lat, lng: lon }))
    if (addressError) setAddressError('')
  }

  const handleUseCurrentLocation = () => {
    if (!navigator.geolocation) {
      setLocationError('Geolocation is not supported in this browser.')
      return
    }

    setLocating(true)
    setLocationError('')

    navigator.geolocation.getCurrentPosition(
      async (position) => {
        try {
          const { latitude, longitude } = position.coords
          await updateAddressFromCoords(latitude, longitude)
        } catch (error) {
          setLocationError('Unable to fetch address from your location.')
        } finally {
          setLocating(false)
        }
      },
      (error) => {
        if (error.code === error.PERMISSION_DENIED) {
          setLocationError('Location permission denied. Enable it to use current location.')
        } else if (error.code === error.POSITION_UNAVAILABLE) {
          setLocationError('Location unavailable. Try again in a moment.')
        } else {
          setLocationError('Unable to access location. Try again.')
        }
        setLocating(false)
      },
      { enableHighAccuracy: true, timeout: 10000, maximumAge: 0 }
    )
  }

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
        <h2>Saved Addresses</h2>
        <p className="muted">Manage your delivery addresses</p>
      </section>

      <div className="card" style={{ maxWidth: '800px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
          <h3 style={{ margin: 0 }}>Your Addresses</h3>
          <button
            className="button small"
            onClick={() => {
              setShowAddressForm(!showAddressForm)
              setEditingAddress(null)
              setNewAddress({ label: '', address: '', isDefault: false, lat: null, lng: null })
            }}
          >
            {showAddressForm ? 'Cancel' : '+ Add Address'}
          </button>
        </div>

        {showAddressForm && (
          <div style={{ background: '#f8f9fa', padding: '16px', borderRadius: '8px', marginBottom: '16px' }}>
            <label>
              Address Label
              <input
                className="input"
                value={newAddress.label}
                onChange={(e) => {
                  setNewAddress({ ...newAddress, label: e.target.value })
                  if (labelError) setLabelError('')
                }}
                placeholder="Home, Office, etc."
                style={{ marginBottom: '8px' }}
              />
              {labelError && <p className="muted" style={{ color: 'red', marginTop: '4px' }}>{labelError}</p>}
            </label>
            <label>
              Full Address
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '8px' }}>
                <button
                  className="button small ghost"
                  type="button"
                  onClick={handleUseCurrentLocation}
                  disabled={locating}
                >
                  {locating ? 'Detecting location...' : 'Use current location'}
                </button>
                {locationError && <span className="muted" style={{ color: 'red' }}>{locationError}</span>}
              </div>
              <Suspense fallback={<div>Loading map...</div>}>
                <AddressMap
                  center={mapCenter}
                  zoom={mapZoom}
                  height={320}
                  onMarkerDragEnd={async (lat, lon) => {
                    try {
                      setLocationError('')
                      await updateAddressFromCoords(lat, lon)
                    } catch (error) {
                      setLocationError('Unable to fetch address from this location.')
                    }
                  }}
                />
              </Suspense>
              <textarea
                className="input"
                rows="3"
                value={newAddress.address}
                onChange={(e) => {
                  setNewAddress({ ...newAddress, address: e.target.value })
                  if (addressError) setAddressError('')
                }}
                placeholder="House number, street, area, city"
                style={{ marginBottom: '8px' }}
              />
              {addressError && <p className="muted" style={{ color: 'red', marginTop: '4px' }}>{addressError}</p>}
            </label>
            <label style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '12px' }}>
              <input
                type="checkbox"
                checked={newAddress.isDefault}
                onChange={(e) => setNewAddress({ ...newAddress, isDefault: e.target.checked })}
              />
              <span>Set as default address</span>
            </label>
            <button className="button" onClick={editingAddress ? handleUpdateAddress : handleAddAddress}>
              {editingAddress ? 'Update Address' : 'Save Address'}
            </button>
          </div>
        )}

        {addresses.length === 0 ? (
          <p className="muted">No saved addresses. Add one to speed up checkout.</p>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            {addresses.map((addr) => (
              <div key={addr.id} className="card" style={{ background: '#f8f9fa' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start' }}>
                  <div>
                    <strong>{addr.label}</strong>
                    {addr.isDefault && (
                      <span className="pill" style={{ marginLeft: '8px', fontSize: '0.75em' }}>
                        Default
                      </span>
                    )}
                    <p style={{ margin: '4px 0 0 0' }}>{addr.address}</p>
                  </div>
                  <div style={{ display: 'flex', gap: '8px' }}>
                    <button className="button small ghost" onClick={() => handleEditAddress(addr)}>
                      Edit
                    </button>
                    <button className="button small ghost" onClick={() => handleDeleteAddress(addr.id)}>
                      Remove
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}

export default ProfileAddresses
