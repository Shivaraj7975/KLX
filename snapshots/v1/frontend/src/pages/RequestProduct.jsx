import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext.jsx'
import { api } from '../services/api.js'

const emptyForm = {
  name: '',
  category: 'Books',
  description: '',
  budget: '',
  campus: '',
}

const RequestProduct = () => {
  const navigate = useNavigate()
  const { user } = useAuth()
  const [form, setForm] = useState(emptyForm)
  const [status, setStatus] = useState('')
  const [saving, setSaving] = useState(false)

  const handleChange = (field, value) => {
    setForm((current) => ({ ...current, [field]: value }))
  }

  const handleSubmit = async (event) => {
    event.preventDefault()
    setSaving(true)

    try {
      const created = await api.createRequest(form)
      navigate('/requests')
    } catch (error) {
      setStatus(error?.message || 'Unable to post request.')
    } finally {
      setSaving(false)
    }
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
          <span className="pill">Post a request</span>
          <h1>Tell campus what product you need.</h1>
          <p className="muted">Post what you're looking for and let sellers reach out. You'll be notified when someone responds.</p>
        </div>
        <div className="card">
          <h3>Request tips</h3>
          <p className="muted">Be specific about what you need and your budget. Add details like brand, condition preference, or specific features. This helps sellers respond quickly.</p>
        </div>
      </section>

      <form className="card form-shell" onSubmit={handleSubmit}>
        <div className="form-grid">
          <label>
            What are you looking for?
            <input className="input" value={form.name} onChange={(event) => handleChange('name', event.target.value)} placeholder="MacBook, calculator, textbook, bicycle..." />
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
            Budget (optional)
            <input className="input" value={form.budget} onChange={(event) => handleChange('budget', event.target.value)} placeholder="e.g., 1000-2000, 500 or less" />
          </label>
          <label>
            Campus pickup location
            <input className="input" value={form.campus} onChange={(event) => handleChange('campus', event.target.value)} placeholder="Hostel block, library gate, cafe..." />
          </label>
          <label className="form-grid__full">
            Details
            <textarea 
              className="input" 
              rows="4" 
              value={form.description} 
              onChange={(event) => handleChange('description', event.target.value)} 
              placeholder="Describe what you need: brand, model, condition preference, features, etc." 
            />
          </label>
        </div>

        <button className="button" type="submit" disabled={saving || !form.name}>
          {saving ? 'Posting request...' : 'Post request'}
        </button>
        {status && <p className="muted">{status}</p>}
      </form>
    </div>
  )
}

export default RequestProduct
