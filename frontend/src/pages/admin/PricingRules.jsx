import { useEffect, useState } from 'react'
import { NavLink } from 'react-router-dom'
import { useAuth } from '../../contexts/AuthContext.jsx'
import { api } from '../../services/api.js'

const PricingRules = () => {
  const { token } = useAuth()
  const [products, setProducts] = useState([])
  const [loading, setLoading] = useState(true)
  const [deletingId, setDeletingId] = useState(null)

  useEffect(() => {
    loadProducts()
  }, [token])

  const loadProducts = async () => {
    setLoading(true)
    try {
      const data = await api.getAdminProducts(token)
      setProducts(data)
    } catch (error) {
      console.error('Failed to load products:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleDelete = async (event, productId) => {
    event.preventDefault()
    event.stopPropagation()

    const confirmed = window.confirm('Remove this product? This cannot be undone.')
    if (!confirmed) {
      return
    }

    setDeletingId(productId)
    try {
      await api.deleteProduct(productId, token)
      setProducts((prev) => prev.filter((product) => product.id !== productId))
    } catch (error) {
      alert('Failed to remove product.')
    } finally {
      setDeletingId(null)
    }
  }

  return (
    <div>
      <div className="card" style={{ marginBottom: '24px' }}>
        <h2>💰 Pricing Rules</h2>
        <p className="muted">
          Configure pricing for all products. Click on a product to edit its details.
        </p>
      </div>

      {loading && <p className="muted">Loading products...</p>}

      {!loading && products.length === 0 && (
        <div className="card">
          <p className="muted">No products found.</p>
        </div>
      )}

      {!loading && products.length > 0 && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
          {products.map((product) => (
            <NavLink
              key={product.id}
              to={`/admin/settings/pricing-rules/${product.id}`}
              className="card"
              style={{ textDecoration: 'none', color: 'inherit', cursor: 'pointer' }}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '16px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
                  <div
                    style={{
                      width: '60px',
                      height: '60px',
                      borderRadius: '8px',
                      background: product.image?.bg || '#e0e0e0',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      fontWeight: 'bold',
                      fontSize: '1.2em',
                      color: '#0c8f7a',
                    }}
                  >
                    {product.image?.label || product.name.slice(0, 2).toUpperCase()}
                  </div>
                  <div>
                    <h3 style={{ marginBottom: '4px' }}>{product.name}</h3>
                    <p className="muted" style={{ fontSize: '0.9em' }}>
                      {product.size}
                    </p>
                  </div>
                </div>
                <div style={{ textAlign: 'right' }}>
                  <h3 style={{ color: 'var(--brand)' }}>₹{product.price}</h3>
                  <div style={{ display: 'flex', gap: '8px', justifyContent: 'flex-end', marginTop: '8px' }}>
                    <button className="button ghost">Edit Pricing</button>
                    <button
                      className="button warning"
                      onClick={(event) => handleDelete(event, product.id)}
                      disabled={deletingId === product.id}
                    >
                      {deletingId === product.id ? 'Removing...' : 'Remove'}
                    </button>
                  </div>
                </div>
              </div>
            </NavLink>
          ))}
        </div>
      )}
    </div>
  )
}

export default PricingRules
