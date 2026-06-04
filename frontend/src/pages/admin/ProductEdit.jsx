import { useEffect, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { useAuth } from '../../contexts/AuthContext.jsx'
import { api } from '../../services/api.js'

const ProductEdit = () => {
  const { id } = useParams()
  const { token } = useAuth()
  const navigate = useNavigate()
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [deleting, setDeleting] = useState(false)
  const [product, setProduct] = useState(null)
  const [formData, setFormData] = useState({
    name: '',
    price: '',
    description: '',
    size: '',
    imageUrl: '',
  })

  useEffect(() => {
    loadProduct()
  }, [id, token])

  const loadProduct = async () => {
    setLoading(true)
    try {
      const data = await api.getProductById(id, token)
      setProduct(data)
      setFormData({
        name: data.name,
        price: data.price,
        description: data.description,
        size: data.size,
        imageUrl: data.image?.url || '',
      })
    } catch (error) {
      console.error('Failed to load product:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleChange = (field, value) => {
    setFormData((prev) => ({ ...prev, [field]: value }))
  }

  const handleSave = async () => {
    setSaving(true)
    try {
      await api.updateProduct(id, formData, token)
      alert('Product updated successfully!')
      navigate('/admin/settings/pricing-rules')
    } catch (error) {
      alert('Failed to update product.')
    } finally {
      setSaving(false)
    }
  }

  const handleDelete = async () => {
    const confirmed = window.confirm('Remove this product? This cannot be undone.')
    if (!confirmed) {
      return
    }

    setDeleting(true)
    try {
      await api.deleteProduct(id, token)
      navigate('/admin/settings/pricing-rules')
    } catch (error) {
      alert('Failed to remove product.')
    } finally {
      setDeleting(false)
    }
  }

  if (loading) {
    return (
      <div className="card">
        <p className="muted">Loading product...</p>
      </div>
    )
  }

  if (!product) {
    return (
      <div className="card">
        <p className="muted">Product not found.</p>
      </div>
    )
  }

  return (
    <div>
      <div className="card" style={{ marginBottom: '24px' }}>
        <h2>Edit Product: {product.name}</h2>
        <p className="muted">Update product name, description, size, and pricing.</p>
      </div>

      <div className="card">
        <div style={{ display: 'flex', gap: '16px', marginBottom: '24px', alignItems: 'center' }}>
          <div
            style={{
              width: '80px',
              height: '80px',
              borderRadius: '8px',
              background: product.image?.bg || '#e0e0e0',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontWeight: 'bold',
              fontSize: '1.5em',
              color: '#0c8f7a',
            }}
          >
            {product.image?.label || product.name.slice(0, 2).toUpperCase()}
          </div>
          <div>
            <h3>{product.name}</h3>
            <p className="muted">Product ID: {product.id}</p>
          </div>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          <label>
            Product Name
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
              rows="4"
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

          <div style={{ display: 'flex', gap: '12px', marginTop: '16px' }}>
            <button className="button" onClick={handleSave} disabled={saving}>
              {saving ? 'Saving...' : 'Save Changes'}
            </button>
            <button
              className="button ghost"
              onClick={() => navigate('/admin/settings/pricing-rules')}
              disabled={saving || deleting}
            >
              Cancel
            </button>
            <button
              className="button warning"
              onClick={handleDelete}
              disabled={saving || deleting}
            >
              {deleting ? 'Removing...' : 'Remove Product'}
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}

export default ProductEdit
