import { useEffect, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import ProductCard from '../components/ProductCard.jsx'
import { useAuth } from '../contexts/AuthContext.jsx'
import { api } from '../services/api.js'

const Profile = () => {
  const { user, token, logout } = useAuth()
  const navigate = useNavigate()
  const [listings, setListings] = useState([])

  useEffect(() => {
    let active = true
    api.getMyListings(token).then((data) => {
      if (active) {
        setListings(data)
      }
    })

    return () => {
      active = false
    }
  }, [token])

  const handleLogout = () => {
    logout()
    navigate('/')
  }

  return (
    <div className="container profile-page">
      <button className="button ghost small" type="button" onClick={() => navigate(-1)}>
        Back
      </button>

      <section className="profile-hero card profile-hero--styled">
        <div>
          <span className="pill">My account</span>
          <h1>{user?.name || 'Campus member'}</h1>
          <p className="muted">{user?.email || 'No email saved'} • {user?.phone || 'No phone saved'}</p>
        </div>
        <div className="profile-hero__badges">
          <span className="status-pill">{user?.role || 'STUDENT'}</span>
          <span className="status-pill">{user?.blockedSell ? 'Selling blocked' : 'Can sell'}</span>
          <span className="status-pill">{user?.blockedBuy ? 'Buying blocked' : 'Can buy'}</span>
        </div>
      </section>

      <section className="section grid two profile-summary-grid">
        <div className="card profile-panel">
          <h3>Account summary</h3>
          <p className="muted">College: {user?.college || 'Campus'}</p>
          <p className="muted">Joined: {user?.createdAt ? new Date(user.createdAt).toLocaleDateString() : 'Recently'}</p>
          <div className="listing-card__actions">
            <Link to="/sell" className="button small">
              Post listing
            </Link>
            <Link to="/products" className="button ghost small">
              Browse campus
            </Link>
          </div>
        </div>

        <div className="card profile-panel">
          <h3>Safety status</h3>
          <p className="muted">
            If admin blocks your account from buying or selling, the relevant actions are disabled until the block is removed.
          </p>
        </div>
      </section>

      <section className="section">
          <div className="section__header profile-listings__header">
          <div>
            <span className="pill">My listings</span>
            <h2>Your posted items</h2>
          </div>
        </div>

        {listings.length === 0 ? (
          <div className="card empty-state">
            <p className="muted">You have not posted anything yet.</p>
            <Link to="/sell" className="button">
              Create your first listing
            </Link>
          </div>
        ) : (
          <div className="grid three profile-listings-grid">
            {listings.map((listing) => (
              <ProductCard
                key={listing.id}
                product={listing}
                actionLabel="Edit"
                onAction={(product) => navigate(`/products/${product.id}/edit`)}
              />
            ))}
          </div>
        )}
      </section>

        <section className="section profile-logout-row">
        <button className="button ghost" type="button" onClick={handleLogout}>
          Logout
        </button>
      </section>
    </div>
  )
}

export default Profile
