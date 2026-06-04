import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import ImageUploadField from '../components/ImageUploadField.jsx'
import { useAuth } from '../contexts/AuthContext.jsx'
import { api } from '../services/api.js'
import { detectCategory } from '../utils/categoryDetector.js'

const emptyForm = {
  name: '',
  category: 'Books',
  condition: 'Good',
  price: '',
  availableQuantity: '1',
  description: '',
  campus: '',
  imageUrl: '',
  videoUrl: '',
}

const SellListing = () => {
  const navigate = useNavigate()
  const { user } = useAuth()
  const [form, setForm] = useState(emptyForm)
  const [status, setStatus] = useState('')
  const [saving, setSaving] = useState(false)

  const handleChange = (field, value) => {
    setForm((current) => ({ ...current, [field]: value }))

    // Auto-detect category if changing item name (3+ characters)
    if (field === 'name' && value.length > 2) {
      const detected = detectCategory(value)
      if (detected) {
        setForm((current) => ({
          ...current,
          category: detected
        }))
      }
    }
  }

  const handleSubmit = async (event) => {
    event.preventDefault()
    setSaving(true)

    try {
      const created = await api.createListing(form)
      navigate(`/products/${created.id}`)
    } catch (error) {
      setStatus(error?.message || 'Unable to create listing.')
    } finally {
      setSaving(false)
    }
  }

  if (user?.blockedSell) {
    return (
      <div className="container">
        <div className="card empty-state">
          <h2>You are blocked from selling</h2>
          <p className="muted">An admin has temporarily disabled your account from posting new items.</p>
          <button className="button" type="button" onClick={() => navigate('/')}>Back to home</button>
        </div>
      </div>
    )
  }

  return (
    <div className="container">
      <section className="section section--tight">
        <button className="button ghost small" type="button" onClick={() => navigate(-1)}>
          Back
        </button>
      </section>

      <section className="hero-lite section">
        <div>
          <span className="pill">Sell your item</span>
          <h1>Post a campus listing in a few fields.</h1>
          <p className="muted">Add a product image, name, price, description, and available quantity. Buyers will contact you directly and you will mark a deal done when the item is sold.</p>
        </div>
        <div className="card">
          <h3>Seller note</h3>
          <p className="muted">Use clear photos and a fair price. Contact details come from your logged-in profile.</p>
        </div>
      </section>

      <form className="card form-shell" onSubmit={handleSubmit}>
        <div className="form-grid">
          <label>
            Item name
            <input className="input" value={form.name} onChange={(event) => handleChange('name', event.target.value)} placeholder="Calculator, bicycle, notes..." />
          </label>
          <label>
            Category
            <select className="input" value={form.category} onChange={(event) => handleChange('category', event.target.value)}>
              <option>Books</option>
              <option>Electronics</option>
              <option>Accessories</option>
              <option>Transport</option>
              <option>Academic</option>
            </select>
          </label>
          <label>
            Condition
            <select className="input" value={form.condition} onChange={(event) => handleChange('condition', event.target.value)}>
              <option>Excellent</option>
              <option>Good</option>
              <option>Fair</option>
            </select>
          </label>
          <label>
            Price
            <input className="input" value={form.price} onChange={(event) => handleChange('price', event.target.value)} placeholder="1500" inputMode="numeric" />
          </label>
          <label>
            Available quantity
            <input className="input" value={form.availableQuantity} onChange={(event) => handleChange('availableQuantity', event.target.value)} placeholder="1" inputMode="numeric" min="1" type="number" />
          </label>
          <label className="form-grid__full">
            Description
            <textarea className="input" rows="4" value={form.description} onChange={(event) => handleChange('description', event.target.value)} placeholder="Add a short description for buyers." />
          </label>
          <label>
            Campus pickup spot
            <input className="input" value={form.campus} onChange={(event) => handleChange('campus', event.target.value)} placeholder="Hostel block, library gate, cafe..." />
          </label>
          <ImageUploadField
            value={form.imageUrl}
            onChange={(value) => handleChange('imageUrl', value)}
            label="Product image"
            hint="Add a clear photo so buyers can see the item before they contact you."
          />
          <label className="form-grid__full">
            Video URL (optional)
            <input
              className="input"
              value={form.videoUrl}
              onChange={(event) => handleChange('videoUrl', event.target.value)}
              placeholder="https://...mp4 or YouTube link"
            />
          </label>
        </div>

        <button className="button" type="submit" disabled={saving || !form.name || !form.price || !form.availableQuantity}>
          {saving ? 'Publishing...' : 'Publish listing'}
        </button>
        {status && <p className="muted">{status}</p>}
      </form>
    </div>
  )
}

export default SellListing