import { NavLink, useNavigate } from 'react-router-dom'
import { useCart } from '../contexts/CartContext.jsx'
import { useAuth } from '../contexts/AuthContext.jsx'
import QuantityStepper from '../components/QuantityStepper.jsx'
import { formatCurrency } from '../utils/format.js'

const Cart = () => {
  const { items, updateQuantity, removeItem, total } = useCart()
  const { isAuthenticated, role } = useAuth()
  const navigate = useNavigate()

  const handleCheckout = () => {
    if (!isAuthenticated || role !== 'CUSTOMER') {
      navigate('/login?returnTo=/checkout')
      return
    }
    navigate('/checkout')
  }

  return (
    <div className="container">
      <section className="section">
        <h2>Your cart</h2>
      </section>

      {items.length === 0 ? (
        <div className="card">
          {isAuthenticated ? (
            <>
              <h3>Your cart is empty.</h3>
              <p className="muted">Pick a fresh coconut pack to get started.</p>
              <NavLink to="/products" className="button">
                Browse products
              </NavLink>
            </>
          ) : (
            <>
              <h3>Log in to see your cart.</h3>
              <p className="muted">Sign in to save items and checkout faster.</p>
              <NavLink to="/login?returnTo=/cart" className="button">
                Log in
              </NavLink>
            </>
          )}
        </div>
      ) : (
        
        <div className="grid two">
          <div className="card">
            <p className="muted">Review items before checkout.</p>
            {items.map((item) => (
              <div key={item.id} style={{ marginBottom: '18px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <div>
                    <NavLink to={`/products/${item.id}`} style={{ textDecoration: 'none' }}>
                      <h4 style={{ marginBottom: '4px' }}>{item.name}</h4>
                    </NavLink>
                    <p className="muted" style={{ marginTop: 0 }}>
                      {item.size}
                    </p>
                  </div>
                  <button className="button ghost small" onClick={() => removeItem(item.id)}>
                    Remove
                  </button>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <QuantityStepper value={item.quantity} onChange={(value) => updateQuantity(item.id, value)} />
                  <strong>{formatCurrency(item.price * item.quantity)}</strong>
                </div>
                <div className="divider" />
              </div>
            ))}
          </div>
          <div className="card">
            <h3>Order summary</h3>
            <p className="muted">Delivery within 15 minutes.</p>
            <div className="divider" />
            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
              <span>Subtotal</span>
              <strong>{formatCurrency(total)}</strong>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
              <span>Delivery</span>
              <strong>{formatCurrency(total > 0 ? 30 : 0)}</strong>
            </div>
            <div className="divider" />
            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
              <span>Total</span>
              <strong>{formatCurrency(total + (total > 0 ? 30 : 0))}</strong>
            </div>
            <button className="button" style={{ width: '100%', marginTop: '16px' }} onClick={handleCheckout}>
              Proceed to checkout
            </button>
            {!isAuthenticated && (
              <p className="muted" style={{ marginTop: '12px' }}>
                Log in to complete your order.
              </p>
            )}
          </div>
        </div>
      )}
    </div>
  )
}

export default Cart
