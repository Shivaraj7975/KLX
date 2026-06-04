import { useEffect, useState } from 'react'
import { Link, useNavigate, useParams } from 'react-router-dom'
import ImageUploadField from '../components/ImageUploadField.jsx'
import { useAuth } from '../contexts/AuthContext.jsx'
import { api } from '../services/api.js'

const ADMIN_EMAIL = 'shivarajas79757@gmail.com'
const isAdminEmail = (email) => String(email || '').trim().toLowerCase() === ADMIN_EMAIL

const buildFormFromListing = (listing) => ({
  name: listing?.name || '',
  category: listing?.category || 'Books',
  condition: listing?.condition || 'Good',
  price: listing?.price ?? '',
  description: listing?.description || '',
  campus: listing?.campus || '',
  imageUrl: listing?.image?.url || '',
  videoUrl: listing?.videoUrl || '',
})

const EditListing = () => {
  const { id } = useParams()
  const navigate = useNavigate()
  const { user, isAdmin } = useAuth()
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [status, setStatus] = useState('')
  const [listing, setListing] = useState(null)
  const [form, setForm] = useState(buildFormFromListing())

  useEffect(() => {
    let active = true

    api
      .getListingById(id)
      .then((data) => {
        if (!active) return
        if (!data) {
          setStatus('Listing not found.')
          setLoading(false)
          return
        }

        const canEdit = data.sellerId === user?.id || (isAdmin && isAdminEmail(user?.email))
        if (!canEdit) {
          setStatus('You can edit only your own listings.')
          setLoading(false)
          return
        }

        setListing(data)
        setForm(buildFormFromListing(data))
        setLoading(false)
      })
      .catch(() => {
        if (active) {
          setStatus('Unable to load listing.')
          setLoading(false)
        }
      })

    return () => {
      active = false
    }
  }, [id, user?.id, user?.role])

  const handleChange = (field, value) => {
    setForm((current) => ({ ...current, [field]: value }))
  }

  const handleSubmit = async (event) => {
    event.preventDefault()
    setSaving(true)
    setStatus('')

    try {
      const updated = await api.updateMyListing(id, form)
      navigate(`/products/${updated.id}`)
    } catch (error) {
      setStatus(error?.message || 'Unable to update listing.')
    } finally {
      setSaving(false)
    }
  }

  if (loading) {
    return <div className="container"><div className="card">Loading listing...</div></div>
  }

  if (!listing) {
    return (
      <div className="container">
        <div className="card empty-state">
          <h2>Cannot edit this listing</h2>
          <p className="muted">{status || 'The listing does not exist or access is restricted.'}</p>
          <Link className="button" to="/profile">Back to profile</Link>
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
          <span className="pill">Edit listing</span>
          <h1>Update your product details.</h1>
          <p className="muted">Change price, media links, or description and keep your listing up to date.</p>
        </div>
      </section>

      <form className="card form-shell" onSubmit={handleSubmit}>
        <div className="form-grid">
          <label>
            Item name
            <input className="input" value={form.name} onChange={(event) => handleChange('name', event.target.value)} />
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
            <input className="input" inputMode="numeric" value={form.price} onChange={(event) => handleChange('price', event.target.value)} />
          </label>
          <label className="form-grid__full">
            Description
            <textarea className="input" rows="4" value={form.description} onChange={(event) => handleChange('description', event.target.value)} />
          </label>
          <label>
            Campus pickup spot
            <input className="input" value={form.campus} onChange={(event) => handleChange('campus', event.target.value)} />
          </label>
          <ImageUploadField
            value={form.imageUrl}
            onChange={(value) => handleChange('imageUrl', value)}
            label="Replace product image"
            hint="Upload a new photo from this device or drag one in to update the listing image."
          />
          <label className="form-grid__full">
            Video URL (optional)
            <input className="input" value={form.videoUrl} onChange={(event) => handleChange('videoUrl', event.target.value)} placeholder="https://...mp4 or YouTube link" />
          </label>
        </div>

        <button className="button" type="submit" disabled={saving || !form.name || !form.price}>
          {saving ? 'Saving...' : 'Save changes'}
        </button>
        {status && <p className="muted">{status}</p>}
      </form>
    </div>
  )
}

export default EditListing
