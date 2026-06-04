import { useEffect, useState } from 'react'
import { NavLink } from 'react-router-dom'
import { useAuth } from '../../contexts/AuthContext.jsx'
import { api } from '../../services/api.js'

const emptyForm = {
  name: '',
  size: '',
  price: '',
  description: '',
  imageUrl: '',
}

const AdminProducts = () => {
  const { token } = useAuth()
  const [products, setProducts] = useState([])
  const [loading, setLoading] = useState(true)
  const [showForm, setShowForm] = useState(false)
  const [formData, setFormData] = useState(emptyForm)
  const [saving, setSaving] = useState(false)

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

  const handleChange = (field, value) => {
    setFormData((prev) => ({ ...prev, [field]: value }))
  }

  const handleCreate = async () => {
    setSaving(true)
    try {
      const created = await api.createProduct(formData, token)
      setProducts((prev) => [created, ...prev])
      setFormData(emptyForm)
      setShowForm(false)
    } catch (error) {
      alert('Failed to create product.')
    } finally {
      setSaving(false)
    }
  }

  return (
    <div>
      <div className="card" style={{ marginBottom: '24px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start', gap: '16px', flexWrap: 'wrap' }}>
          <div>
            <h2>Product Control</h2>
            <p className="muted">Create and manage products for the catalog.</p>
          </div>
          <button className="button" onClick={() => setShowForm((prev) => !prev)}>
            {showForm ? 'Cancel' : 'Create new product'}
          </button>
        </div>
      </div>

      {showForm && (
        <div className="card" style={{ marginBottom: '24px' }}>
          <h3>Create Product</h3>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', marginTop: '16px' }}>
            <label>
              Product name
              <input
                className="input"
                value={formData.name}
                onChange={(e) => handleChange('name', e.target.value)}
                placeholder="Fresh Tender Coconut"
              />
            </label>
            <label>
              Size
              <input
                className="input"
                value={formData.size}
                onChange={(e) => handleChange('size', e.target.value)}
                placeholder="500ml"
              />
            </label>
            <label>
              Price (₹)
              <input
                className="input"
                type="number"
                value={formData.price}
                onChange={(e) => handleChange('price', e.target.value)}
                placeholder="80"
              />
            </label>
            <label>
              Description
              <textarea
                className="input"
                value={formData.description}
                onChange={(e) => handleChange('description', e.target.value)}
                placeholder="Sweet, chilled and ready within 45 minutes."
                rows="3"
                style={{ resize: 'vertical' }}
              />
            </label>
            <label>
              Image URL
              <input
                className="input"
                value={formData.imageUrl}
                onChange={(e) => handleChange('imageUrl', e.target.value)}
                placeholder="https://images.example.com/coconut.jpg"
              />
            </label>
            <button
              className="button"
              onClick={handleCreate}
              disabled={saving || !formData.name || !formData.price}
            >
              {saving ? 'Creating...' : 'Create product'}
            </button>
          </div>
        </div>
      )}

      {loading && <p className="muted">Loading products...</p>}

      {!loading && products.length === 0 && (
        <div className="card">
          <p className="muted">No products available.</p>
        </div>
      )}

      {!loading && products.length > 0 && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
          {products.map((product) => (
            <NavLink
              key={product.id}
              to={`/admin/settings/pricing-rules/${product.id}`}
              className="card"
              style={{ textDecoration: 'none', color: 'inherit' }}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '16px' }}>
                <div>
                  <h3 style={{ marginBottom: '4px' }}>{product.name}</h3>
                  <p className="muted" style={{ fontSize: '0.9em' }}>
                    {product.size} • ₹{product.price}
                  </p>
                </div>
                <button className="button ghost">Edit</button>
              </div>
            </NavLink>
          ))}
        </div>
      )}
    </div>
  )
}

export default AdminProducts
