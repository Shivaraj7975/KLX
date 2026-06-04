import { lazy, Suspense, useEffect, useRef, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useCart } from '../contexts/CartContext.jsx'
import { useAuth } from '../contexts/AuthContext.jsx'
import { api } from '../services/api.js'
import { formatCurrency } from '../utils/format.js'
import { getStoredAddresses, storeAddresses } from '../services/storage.js'
import { reverseGeocode } from '../utils/geocode.js'

const AddressMap = lazy(() => import('../components/AddressMap.jsx'))

const Checkout = () => {
  const { items, total, clear } = useCart()
  const { token } = useAuth()
  const navigate = useNavigate()
  const [addresses, setAddresses] = useState([])
  const [selectedAddressId, setSelectedAddressId] = useState('')
  const [selectedPaymentOption, setSelectedPaymentOption] = useState('COD')
  const [useNewAddress, setUseNewAddress] = useState(false)
  const [newAddress, setNewAddress] = useState('')
  const [newAddressCoords, setNewAddressCoords] = useState(null)
  const [saveNewAddress, setSaveNewAddress] = useState(false)
  const [note, setNote] = useState('')
  const [processing, setProcessing] = useState(false)
  const [message, setMessage] = useState('')
  const [addressError, setAddressError] = useState('')
  const [locating, setLocating] = useState(false)
  const [locationError, setLocationError] = useState('')
  const [mapCenter, setMapCenter] = useState([20.5937, 78.9629])
  const [mapZoom, setMapZoom] = useState(5)
  const addressRef = useRef(null)

  useEffect(() => {
    const savedAddresses = getStoredAddresses()
    setAddresses(savedAddresses)
    
    // Auto-select defaults
    const defaultAddr = savedAddresses.find(a => a.isDefault)
    if (defaultAddr) {
      setSelectedAddressId(defaultAddr.id)
      if (defaultAddr.lat != null && defaultAddr.lng != null) {
        setMapCenter([defaultAddr.lat, defaultAddr.lng])
        setMapZoom(17)
      }
    }
    setSelectedPaymentOption('COD')
  }, [])

  const paymentOptions = [
    { id: 'COD', label: 'Cash on Delivery' },
    { id: 'Razorpay', label: 'Razorpay (mock)' },
  ]

  const updateAddressFromCoords = async (lat, lon) => {
    const address = await reverseGeocode(lat, lon)
    setMapCenter([lat, lon])
    setMapZoom(17)
    setUseNewAddress(true)
    setSelectedAddressId('')
    setNewAddress(address)
    setNewAddressCoords({ lat, lng: lon })
    if (addressError) setAddressError('')
  }

  const validateAddress = (value) => {
    const trimmed = value.trim()
    if (trimmed.length < 5) return 'Address must be at least 5 characters.'
    if (!/^[A-Za-z0-9 ,]+$/.test(trimmed)) {
      return 'Address can only contain letters, numbers, spaces, and commas.'
    }
    return ''
  }

  const handleUseCurrentLocation = () => {
    if (!navigator.geolocation) {
      setLocationError('Geolocation is not supported in this browser.')
      return
    }

    setLocating(true)
    setLocationError('')
    setMessage('')

    navigator.geolocation.getCurrentPosition(
      async (position) => {
        try {
          const { latitude, longitude } = position.coords
          await updateAddressFromCoords(latitude, longitude)
          addressRef.current?.focus()
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

  const handleSubmit = async (event) => {
    event.preventDefault()
    if (items.length === 0) return

    let finalAddress = ''
    if (useNewAddress) {
      const nextAddressError = validateAddress(newAddress)
      setAddressError(nextAddressError)
      if (nextAddressError) return
      finalAddress = newAddress
    } else {
      if (!selectedAddressId) {
        setMessage('Please select a delivery address')
        return
      }
      const selectedAddr = addresses.find(a => a.id === selectedAddressId)
      finalAddress = selectedAddr ? selectedAddr.address : ''
    }

    if (!selectedPaymentOption) {
      setMessage('Please select a payment method')
      return
    }
    const paymentMode = selectedPaymentOption

    setProcessing(true)
    setMessage('')

    try {
      await api.createCustomerOrder(
        {
          items,
          address: finalAddress,
          note,
          payment: paymentMode,
        },
        token
      )
      if (useNewAddress && saveNewAddress) {
        const nextAddresses = [
          ...addresses,
          {
            id: Date.now().toString(),
            label: `Address ${addresses.length + 1}`,
            address: finalAddress,
            ...(newAddressCoords ? { lat: newAddressCoords.lat, lng: newAddressCoords.lng } : {}),
            isDefault: false,
          },
        ]
        setAddresses(nextAddresses)
        storeAddresses(nextAddresses)
        setSaveNewAddress(false)
      }
      clear()
      navigate('/customer/orders', { state: { success: true } })
    } catch (error) {
      setMessage('Unable to place the order. Try again.')
    } finally {
      setProcessing(false)
    }
  }

  if (items.length === 0) {
    return (
      <div className="container">
        <div className="card">
          <h3>Your cart is empty.</h3>
          <p className="muted">Add coconut packs before checkout.</p>
        </div>
      </div>
    )
  }

  const selectedSavedAddress = addresses.find((addr) => addr.id === selectedAddressId)
  const hasSelectedCoords =
    selectedSavedAddress?.lat != null && selectedSavedAddress?.lng != null

  return (
    <div className="container">
      <section className="section">
        <h2>Checkout</h2>
        <p className="muted">Select delivery address and payment method.</p>
      </section>

      <div className="grid two">
        <form className="card" onSubmit={handleSubmit}>
          <h3>Delivery Address</h3>
          
          {addresses.length > 0 ? (
            <>
              <div style={{ display: 'flex', gap: '12px', marginBottom: '16px' }}>
                <label style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <input
                    type="radio"
                    name="addressMode"
                    value="saved"
                    checked={!useNewAddress}
                    onChange={() => {
                      setUseNewAddress(false)
                      setSaveNewAddress(false)
                      if (!selectedAddressId) {
                        const defaultAddr = addresses.find((addr) => addr.isDefault)
                        setSelectedAddressId(defaultAddr?.id || addresses[0]?.id || '')
                      }
                    }}
                  />
                  <span>Use saved address</span>
                </label>
                <label style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <input
                    type="radio"
                    name="addressMode"
                    value="new"
                    checked={useNewAddress}
                    onChange={() => {
                      setUseNewAddress(true)
                      setSelectedAddressId('')
                      setNewAddressCoords(null)
                    }}
                  />
                  <span>Add new address</span>
                </label>
              </div>

              {useNewAddress ? (
                <label>
                  Delivery address
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
                      draggable
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
                    rows="4"
                    value={newAddress}
                    onChange={(event) => {
                      setNewAddress(event.target.value)
                      if (addressError) setAddressError('')
                    }}
                    placeholder="House number, street, area, city"
                    required
                    ref={addressRef}
                  />
                  {addressError && <p className="muted" style={{ color: 'red', marginTop: '4px' }}>{addressError}</p>}
                  <label style={{ display: 'flex', alignItems: 'center', gap: '8px', marginTop: '12px' }}>
                    <input
                      type="checkbox"
                      checked={saveNewAddress}
                      onChange={(event) => setSaveNewAddress(event.target.checked)}
                    />
                    <span>Save this address</span>
                  </label>
                </label>
              ) : (
                <>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', marginBottom: '16px' }}>
                    {addresses.map((addr) => (
                      <label
                        key={addr.id}
                        style={{
                          display: 'flex',
                          alignItems: 'start',
                          gap: '12px',
                          padding: '12px',
                          border: selectedAddressId === addr.id ? '2px solid var(--brand)' : '1px solid #e0e0e0',
                          borderRadius: '8px',
                          cursor: 'pointer',
                          background: selectedAddressId === addr.id ? '#f0f9f7' : 'white',
                        }}
                      >
                        <input
                          type="radio"
                          name="address"
                          value={addr.id}
                          checked={selectedAddressId === addr.id}
                          onChange={(e) => {
                            setSelectedAddressId(e.target.value)
                            if (addr.lat != null && addr.lng != null) {
                              setMapCenter([addr.lat, addr.lng])
                              setMapZoom(17)
                            }
                          }}
                        />
                        <div>
                          <strong>{addr.label}</strong>
                          {addr.isDefault && (
                            <span className="pill" style={{ marginLeft: '8px', fontSize: '0.75em' }}>
                              Default
                            </span>
                          )}
                          <p style={{ margin: '4px 0 0 0', color: '#666' }}>{addr.address}</p>
                        </div>
                      </label>
                    ))}
                  </div>
                  {hasSelectedCoords && (
                    <div style={{ marginBottom: '16px' }}>
                      <Suspense fallback={<div>Loading map...</div>}>
                        <AddressMap
                          center={mapCenter}
                          zoom={mapZoom}
                          height={260}
                          draggable={false}
                        />
                      </Suspense>
                    </div>
                  )}
                </>
              )}
            </>
          ) : (
            <label>
              Delivery address
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
                  draggable
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
                rows="4"
                value={newAddress}
                onChange={(event) => {
                  setNewAddress(event.target.value)
                  if (addressError) setAddressError('')
                }}
                placeholder="House number, street, area, city"
                required
                ref={addressRef}
              />
              {addressError && <p className="muted" style={{ color: 'red', marginTop: '4px' }}>{addressError}</p>}
              <label style={{ display: 'flex', alignItems: 'center', gap: '8px', marginTop: '12px' }}>
                <input
                  type="checkbox"
                  checked={saveNewAddress}
                  onChange={(event) => setSaveNewAddress(event.target.checked)}
                />
                <span>Save this address</span>
              </label>
            </label>
          )}

          <div className="divider" />

          <h3>Payment Method</h3>
          <div style={{ marginBottom: '16px' }}>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              {paymentOptions.map((option) => (
                <label
                  key={option.id}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '12px',
                    padding: '12px',
                    border: selectedPaymentOption === option.id ? '2px solid var(--brand)' : '1px solid #e0e0e0',
                    borderRadius: '8px',
                    cursor: 'pointer',
                    background: selectedPaymentOption === option.id ? '#f0f9f7' : 'white',
                  }}
                >
                  <input
                    type="radio"
                    name="payment"
                    value={option.id}
                    checked={selectedPaymentOption === option.id}
                    onChange={(e) => setSelectedPaymentOption(e.target.value)}
                  />
                  <div>
                    <strong>{option.label}</strong>
                  </div>
                </label>
              ))}
            </div>
          </div>

          <div className="divider" />

          <label>
            Delivery note (optional)
            <input
              className="input"
              value={note}
              onChange={(event) => setNote(event.target.value)}
              placeholder="Gate code, landmark"
            />
          </label>

          <div className="divider" />
          
          <button className="button" type="submit" disabled={processing}>
            {processing ? 'Placing order...' : 'Place order'}
          </button>
          {message && <p className="muted" style={{ color: 'red' }}>{message}</p>}
        </form>

        <div className="card">
          <h3>Order summary</h3>
          {items.map((item) => (
            <div key={item.id} style={{ display: 'flex', justifyContent: 'space-between' }}>
              <span>
                {item.name} x {item.quantity}
              </span>
              <strong>{formatCurrency(item.price * item.quantity)}</strong>
            </div>
          ))}
          <div className="divider" />
          <div style={{ display: 'flex', justifyContent: 'space-between' }}>
            <span>Total</span>
            <strong>{formatCurrency(total + 30)}</strong>
          </div>
        </div>
      </div>
    </div>
  )
}

export default Checkout
