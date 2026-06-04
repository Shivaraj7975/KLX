import { lazy, Suspense, useEffect, useState } from 'react'
import { api } from '../../services/api.js'
import { useAuth } from '../../contexts/AuthContext.jsx'
import OrderStatusPill from '../../components/OrderStatusPill.jsx'
import { formatDate } from '../../utils/format.js'

const AddressMap = lazy(() => import('../../components/AddressMap.jsx'))

const DeliveryOrders = () => {
  const { token } = useAuth()
  const [orders, setOrders] = useState([])
  const [routeError, setRouteError] = useState('')
  const [deliveryRange, setDeliveryRange] = useState('week')

  useEffect(() => {
    api.getDeliveryOrders(token).then(setOrders)
  }, [token])

  const isActiveDelivery = (status) => {
    const normalized = (status || '').toUpperCase()
    return normalized.includes('ASSIGNED') || normalized.includes('PICKED_UP')
  }

  const isDelivered = (status) => (status || '').toUpperCase().includes('DELIVERED')

  const getRangeStart = (range) => {
    const now = new Date()
    if (range === 'day') {
      return new Date(now.getFullYear(), now.getMonth(), now.getDate())
    }
    if (range === 'month') {
      return new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000)
    }
    return new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000)
  }

  const deliveredCount = orders.filter((order) => {
    if (!isDelivered(order.status)) return false
    const timestamp = order.deliveredAt || order.completedAt || order.placedAt
    if (!timestamp) return false
    const deliveredDate = new Date(timestamp)
    return deliveredDate >= getRangeStart(deliveryRange)
  }).length

  const handleShowRoute = (order) => {
    if (!order?.lat || !order?.lng) return
    if (!navigator.geolocation) {
      setRouteError('Geolocation is not supported in this browser.')
      return
    }

    navigator.geolocation.getCurrentPosition(
      (position) => {
        const { latitude, longitude } = position.coords
        const url = `https://www.openstreetmap.org/directions?engine=graphhopper_car&route=${latitude},${longitude};${order.lat},${order.lng}`
        window.open(url, '_blank', 'noopener,noreferrer')
      },
      () => {
        setRouteError('Unable to access your current location.')
      },
      { enableHighAccuracy: true, timeout: 10000, maximumAge: 0 }
    )
  }

  return (
    <div>
      <h2>Assigned deliveries</h2>
      <p className="muted">Update status as you move.</p>
      <div className="card" style={{ marginTop: '16px' }}>
        <h3>Delivery summary</h3>
        <p className="muted" style={{ marginBottom: '12px' }}>
          Delivered: {deliveredCount}
        </p>
        <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
          {[
            { id: 'day', label: 'Today' },
            { id: 'week', label: 'Last 7 days' },
            { id: 'month', label: 'Last 30 days' },
          ].map((option) => (
            <button
              key={option.id}
              className={`button ${deliveryRange === option.id ? '' : 'ghost'}`}
              onClick={() => setDeliveryRange(option.id)}
            >
              {option.label}
            </button>
          ))}
        </div>
      </div>
      <div className="grid two" style={{ marginTop: '24px' }}>
        {orders.map((order) => (
          <div key={order.id} className="card">
            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
              <strong>{order.id}</strong>
              <OrderStatusPill status={order.status} />
            </div>
            {order.placedAt && (
              <p className="muted">Assigned {formatDate(order.placedAt)}</p>
            )}
            <p className="muted">Drop: {order.drop}</p>
            <p>{order.items} items</p>
            {isActiveDelivery(order.status) && order.lat != null && order.lng != null && (
              <div style={{ marginTop: '12px' }}>
                <Suspense fallback={<div>Loading map...</div>}>
                  <AddressMap
                    center={[order.lat, order.lng]}
                    zoom={16}
                    height={220}
                    draggable={false}
                  />
                </Suspense>
                <button
                  className="button ghost small"
                  type="button"
                  style={{ marginTop: '10px' }}
                  onClick={() => handleShowRoute(order)}
                >
                  Show route
                </button>
                {routeError && (
                  <p className="muted" style={{ color: 'red', marginTop: '6px' }}>
                    {routeError}
                  </p>
                )}
              </div>
            )}
            {!isDelivered(order.status) && (
              <div style={{ display: 'flex', gap: '10px', marginTop: '12px' }}>
                <button className="button small">Pick up</button>
                <button className="button ghost small">Out for delivery</button>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  )
}

export default DeliveryOrders
