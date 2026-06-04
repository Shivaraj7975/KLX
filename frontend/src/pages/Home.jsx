import { useEffect, useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import ProductCard from '../components/ProductCard.jsx'
import { api } from '../services/api.js'

const campusHighlights = [
  'Login with your college account.',
  'Post items for sale directly from the website.',
  'Browse and contact sellers from live listings only.',
  'Admin access is limited to one exact email account.',
]

const campusStats = [
  { label: 'Live listings', value: 'Real-time' },
  { label: 'Data source', value: 'MongoDB' },
  { label: 'Profile listings', value: 'Owner-only' },
  { label: 'Admin access', value: 'Email-locked' },
]

const Home = () => {
  const [listings, setListings] = useState([])
  const [loading, setLoading] = useState(true)
  const [query, setQuery] = useState('')
  const [category, setCategory] = useState('All')
  const navigate = useNavigate()

  useEffect(() => {
    let active = true
    api
      .getListings()
      .then((data) => {
        if (active) {
          setListings(data)
          setLoading(false)
        }
      })
      .catch(() => {
        if (active) {
          setListings([])
          setLoading(false)
        }
      })

    return () => {
      active = false
    }
  }, [])

  const categories = ['All', 'Books', 'Electronics', 'Accessories', 'Transport', 'Academic']

  const filteredListings = useMemo(() => {
    const term = query.trim().toLowerCase()
    return listings.filter((listing) => {
      const matchesCategory = category === 'All' || (listing.category || listing.size) === category
      const haystack = `${listing.name} ${listing.description} ${listing.category} ${listing.campus}`.toLowerCase()
      const matchesQuery = !term || haystack.includes(term)
      return matchesCategory && matchesQuery
    })
  }, [category, listings, query])

  return (
    <div className="container">
      <section className="section section--tight">
        <span className="pill">Campus marketplace</span>
        <h1 className="home-title">Buy and sell student items in your college community.</h1>
        <p className="muted home-subtitle">
          Browse items without logging in. Sign in only when you want to contact a seller or post your own listing.
        </p>
      </section>

      <section className="card home-search-panel">
        <div className="search-row">
          <input
            className="input"
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            placeholder="Search by item, seller, or campus..."
          />
          <button className="button" type="button">
            Search
          </button>
        </div>

        <div className="chip-group">
          {categories.map((item) => (
            <button
              key={item}
              type="button"
              className={`chip ${category === item ? 'active' : ''}`}
              onClick={() => setCategory(item)}
            >
              {item}
            </button>
          ))}
        </div>
      </section>

      <section className="section">
        <div className="section__header">
          <div>
            <span className="pill">Products</span>
            <h2>Latest campus listings</h2>
          </div>
          <div className="muted">{filteredListings.length} items</div>
        </div>

        {loading ? (
          <div className="card">Loading listings...</div>
        ) : (
          <div className="grid three">
            {filteredListings.map((product) => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>
        )}
      </section>

      <section className="section section--tight">
        <div className="section__header">
          <div>
            <span className="pill">How it works</span>
            <h2>Simple student marketplace flow</h2>
          </div>
        </div>

        <div className="grid two">
          {campusHighlights.map((item) => (
            <div key={item} className="card">
              <p className="muted">{item}</p>
            </div>
          ))}
        </div>
      </section>

      <section className="section grid two">
        {campusStats.map((stat) => (
          <div key={stat.label} className="card">
            <span className="pill">{stat.label}</span>
            <h3>{stat.value}</h3>
          </div>
        ))}
      </section>
    </div>
  )
}

export default Home
