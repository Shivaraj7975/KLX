import { useEffect, useState } from 'react'
import { api } from '../../services/api.js'
import { useAuth } from '../../contexts/AuthContext.jsx'
import OrderStatusPill from '../../components/OrderStatusPill.jsx'
import { formatCurrency } from '../../utils/format.js'

const ManagerOrders = () => {
  const { token } = useAuth()
  const [orders, setOrders] = useState([])

  useEffect(() => {
    api.getManagerOrders(token).then(setOrders)
  }, [token])

  return (
    <div>
      <h2>Order queue</h2>
      <p className="muted">Approve or assign orders to delivery partners.</p>
      <div className="grid two" style={{ marginTop: '24px' }}>
        {orders.map((order) => (
          <div key={order.id} className="card">
            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
              <strong>{order.id}</strong>
              <OrderStatusPill status={order.status} />
            </div>
            <p className="muted">Customer: {order.customer}</p>
            <p>{order.items} items</p>
            <strong>{formatCurrency(order.total)}</strong>
            <div style={{ display: 'flex', gap: '10px', marginTop: '12px' }}>
              <button className="button small">Accept</button>
              <button className="button ghost small">Reject</button>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}

export default ManagerOrders
