import { useEffect, useState } from 'react'
import { useLocation } from 'react-router-dom'
import { api } from '../services/api.js'
import { useAuth } from '../contexts/AuthContext.jsx'
import OrderStatusPill from '../components/OrderStatusPill.jsx'
import { formatCurrency, formatDate } from '../utils/format.js'
import { useNavigate } from 'react-router-dom'

const CustomerOrders = () => {
  const { token } = useAuth()
  const location = useLocation()
  const [orders, setOrders] = useState([])
  const [loading, setLoading] = useState(true)
  const navigate = useNavigate()

  useEffect(() => {
    let active = true
    api
      .getCustomerOrders(token)
      .then((data) => {
        if (active) {
          setOrders(data)
          setLoading(false)
        }
      })
      .catch(() => {
        if (active) {
          setOrders([])
          setLoading(false)
        }
      })

    return () => {
      active = false
    }
  }, [token])

  const getOrderCardClass = (status) => {
    const upper = (status || '').toUpperCase()
    if (upper.includes('DELIVERED')) return 'order-card order-card--delivered'
    if (upper.includes('CANCEL') || upper.includes('FAILED') || upper.includes('REJECT')) {
      return 'order-card order-card--cancelled'
    }
    return 'order-card order-card--running'
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
        <h2>Your orders</h2>
        {location.state?.success && (
          <p className="muted">Order placed! We are dispatching your coconuts.</p>
        )}
      </section>

      {loading ? (
        <p className="muted">Loading orders...</p>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          {orders.map((order) => (
            <div key={order.id} className={`card ${getOrderCardClass(order.status)}`}>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '12px' }}>
                <strong>{order.id}</strong>
                <OrderStatusPill status={order.status} />
              </div>
              <p className="muted">Placed {formatDate(order.placedAt)}</p>
              <p className="muted">ETA: {order.eta}</p>
              <p className="muted">Delivery address: {order.address || 'Not available'}</p>
              
              {order.status !== 'DELIVERED' && order.deliveryPerson && (
                <>
                  <div className="divider" style={{ margin: '12px 0' }} />
                  <h4 style={{ marginBottom: '8px' }}>Delivery Information</h4>
                  <div style={{ background: '#f0f9f7', padding: '12px', borderRadius: '8px' }}>
                    <p style={{ margin: '0 0 4px 0' }}>
                      <strong>Delivery Partner:</strong> {order.deliveryPerson.name}
                    </p>
                    <p style={{ margin: '0 0 4px 0' }}>
                      <strong>Contact:</strong> {order.deliveryPerson.phone}
                    </p>
                    <p style={{ margin: 0 }}>
                      <strong>Payment:</strong> {order.paymentMode === 'COD' ? 'Cash on Delivery' : order.paymentMode}
                    </p>
                  </div>
                </>
              )}

              {order.status === 'DELIVERED' && order.paymentMode && (
                <p className="muted">Payment: {order.paymentMode === 'COD' ? 'Cash on Delivery' : order.paymentMode}</p>
              )}
              
              <div className="divider" style={{ margin: '12px 0' }} />
              
              <h4 style={{ marginBottom: '8px' }}>Order Items</h4>
              {order.items && order.items.length > 0 ? (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                  {order.items.map((item) => (
                    <div key={item.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <div>
                        <p style={{ margin: 0 }}>{item.name}</p>
                        <p className="muted" style={{ margin: 0, fontSize: '0.85em' }}>
                          Qty: {item.quantity} × {formatCurrency(item.price)}
                        </p>
                      </div>
                      <strong>{formatCurrency(item.quantity * item.price)}</strong>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="muted">No items listed.</p>
              )}
              
              <div className="divider" style={{ margin: '12px 0' }} />
              
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <strong>Total</strong>
                <strong>{formatCurrency(order.total)}</strong>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

export default CustomerOrders
