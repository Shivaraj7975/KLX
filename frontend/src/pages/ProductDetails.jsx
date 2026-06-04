import { useEffect, useMemo, useState } from 'react'
import { Link, useNavigate, useParams } from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext.jsx'
import { api } from '../services/api.js'
import { formatCurrency, formatDate } from '../utils/format.js'

const ProductDetails = () => {
  const { id } = useParams()
  const navigate = useNavigate()
  const { isAuthenticated, user } = useAuth()
  const [product, setProduct] = useState(null)
  const [loading, setLoading] = useState(true)
  const [contactOpen, setContactOpen] = useState(false)
  const [note, setNote] = useState('')
  const [sendingContact, setSendingContact] = useState(false)
  const [dealStatus, setDealStatus] = useState('')

  useEffect(() => {
    window.scrollTo({ top: 0, left: 0, behavior: 'instant' })
  }, [id])

  useEffect(() => {
    let active = true
    api
      .getListingById(id)
      .then((data) => {
        if (active) {
          setProduct(data)
          setLoading(false)
        }
      })
      .catch(() => {
        if (active) {
          setProduct(null)
          setLoading(false)
        }
      })

    return () => {
      active = false
    }
  }, [id])

  const canContactSeller = Boolean(isAuthenticated && !user?.blockedBuy)

  const specs = useMemo(() => {
    if (!product) return []
    return [
      { label: 'Condition', value: product.condition || 'Good' },
      { label: 'Pickup spot', value: product.campus || 'Campus pickup' },
      { label: 'Seller', value: product.sellerName || 'Student seller' },
      { label: 'Quantity', value: String(product.availableQuantity ?? 1) },
      { label: 'Posted', value: formatDate(product.createdAt) },
    ]
  }, [product])

  const hasVideo = Boolean(product?.videoUrl)
  const isSeller = Boolean(isAuthenticated && user?.id && product?.sellerId === user?.id)
  const contactRequests = product?.contactRequests || []

  const handleContact = () => {
    if (!product) return
    if (!isAuthenticated) {
      navigate(`/login?returnTo=/products/${product.id}`)
      return
    }

    if (user?.blockedBuy) {
      return
    }

    setContactOpen((current) => !current)
  }

  const handleNotifySeller = async () => {
    if (!product) return
    setSendingContact(true)
    setDealStatus('')

    try {
      await api.contactSeller(product.id, note)
      setDealStatus('Seller notified by email. Wait for a response and then mark the deal done after the item is sold.')
      setNote('')
    } catch (error) {
      setDealStatus(error?.message || 'Unable to notify seller.')
    } finally {
      setSendingContact(false)
    }
  }

  const handleDealDone = async (contactId) => {
    if (!product) return

    try {
      const updated = await api.markDealDone(product.id, contactId)
      setProduct(updated)
      setDealStatus('Deal marked done. Available quantity has been reduced by 1.')
    } catch (error) {
      setDealStatus(error?.message || 'Unable to mark deal done.')
    }
  }

  if (loading) {
    return <div className="container"><div className="card">Loading listing...</div></div>
  }

  if (!product) {
    return (
      <div className="container">
        <div className="card empty-state">
          <h2>Listing not found</h2>
          <p className="muted">The item may have been removed by an admin.</p>
          <Link to="/products" className="button">
            Back to listings
          </Link>
        </div>
      </div>
    )
  }

  return (
    <div className="container">
      <button className="button ghost small" type="button" onClick={() => navigate(-1)}>
        Back
      </button>

      <section className="product-layout">
        <div className="card product-visual">
          <div className="product-visual__image" style={{ background: product.image?.bg }}>
            {product.image?.url ? (
              <img src={product.image.url} alt={product.image?.alt || product.name} />
            ) : (
              <span className="product-mark">{product.image?.label || 'CS'}</span>
            )}
          </div>

          {hasVideo && (
            <div className="product-video-block">
              <div className="section__header product-video-block__header">
                <h3>Product video</h3>
                <span className="pill">Optional</span>
              </div>

              {product.videoUrl.match(/(youtube\.com|youtu\.be)/i) ? (
                <div className="product-video-frame">
                  <iframe
                    src={product.videoUrl.replace('watch?v=', 'embed/').replace('youtu.be/', 'www.youtube.com/embed/')}
                    title={`${product.name} video`}
                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                    allowFullScreen
                  />
                </div>
              ) : (
                <video className="product-video-player" controls preload="metadata">
                  <source src={product.videoUrl} />
                  Your browser does not support the video tag.
                </video>
              )}
            </div>
          )}
        </div>

        <div className="product-detail-panel">
          <div className="product-detail-panel__tags">
            <span className="pill">{product.category || 'Campus item'}</span>
            <span className="status-pill">{product.condition || 'Good'}</span>
          </div>

          <h1>{product.name}</h1>
          <p className="product-price">{formatCurrency(product.price)}</p>
          <p className="muted">Available quantity: {product.availableQuantity ?? 1}</p>
          <p className="muted product-detail-panel__description">{product.description}</p>

          <div className="notice notice--warm">
            Sell Product never asks for payment in-app. Use the contact button to connect with the seller directly.
          </div>

          <div className="grid two product-specs">
            {specs.map((item) => (
              <div key={item.label} className="card spec-card">
                <p className="muted">{item.label}</p>
                <strong>{item.value}</strong>
              </div>
            ))}
          </div>

          <div className="listing-card__actions">
            <button className="button" type="button" onClick={handleContact} disabled={!canContactSeller && isAuthenticated}>
              Contact seller
            </button>
            <Link to="/sell" className="button secondary">
              Post similar item
            </Link>
          </div>

          {!isAuthenticated && <p className="muted">Sign in with your phone number and college email to contact sellers.</p>}
          {isAuthenticated && user?.blockedBuy && <p className="muted">Your account is blocked from buying right now.</p>}

          {contactOpen && canContactSeller && (
            <div className="card contact-panel">
              <h3>Seller contact</h3>
              <p className="muted">Open this directly in your phone or email app, or send the seller a short note so they can track the deal.</p>
              <label>
                Message for seller
                <textarea className="input" rows="3" value={note} onChange={(event) => setNote(event.target.value)} placeholder="Hi, I am interested in buying this item. Please call me back." />
              </label>
              <div className="contact-panel__links">
                <a className="button small" href={`tel:${product.sellerPhone}`}>
                  Call {product.sellerPhone}
                </a>
                <a className="button secondary small" href={`mailto:${product.sellerEmail}?subject=Sell%20Product%20enquiry%20for%20${encodeURIComponent(product.name)}`}>
                  Email seller
                </a>
              </div>
              <button className="button" type="button" onClick={handleNotifySeller} disabled={sendingContact}>
                {sendingContact ? 'Notifying...' : 'Notify seller by email'}
              </button>
              <div className="divider" />
              <p className="muted">Seller: {product.sellerName}</p>
              <p className="muted">College: {product.college}</p>
              <p className="muted">Pickup: {product.campus}</p>
            </div>
          )}

          {isSeller && contactRequests.length > 0 && (
            <div className="card contact-panel">
              <h3>Buyer contacts</h3>
              <p className="muted">When the deal is finished, click deal done and the quantity will decrease by 1.</p>
              <div className="divider" />
              <div style={{ display: 'grid', gap: '12px' }}>
                {contactRequests.map((contact) => (
                  <div key={contact.id} className="card" style={{ padding: '12px' }}>
                    <strong>{contact.buyerName}</strong>
                    <p className="muted">{contact.buyerPhone} • {contact.buyerEmail}</p>
                    {contact.note && <p>{contact.note}</p>}
                    <p className="muted">Status: {contact.status}</p>
                    {contact.status !== 'DEAL_DONE' && (
                      <button className="button small" type="button" onClick={() => handleDealDone(contact.id)}>
                        Deal done
                      </button>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}

          {dealStatus && <p className="muted">{dealStatus}</p>}
        </div>
      </section>

      <section className="section grid two">
        <div className="card">
          <h3>Listing details</h3>
          <p className="muted">This is a direct student-to-student exchange. There is no checkout flow or payment gateway in the app. Buyers contact sellers directly and the seller marks the deal complete when the item is sold.</p>
          <div className="divider" />
          <div className="tag-stack">
            {(product.highlights || []).map((item) => (
              <span key={item} className="tag">
                {item}
              </span>
            ))}
          </div>
        </div>

        <div className="card">
          <h3>Seller profile</h3>
          <p className="muted">{product.sellerName}</p>
          <p className="muted">{product.sellerEmail}</p>
          <p className="muted">{product.college}</p>
          <p className="muted">Posted {formatDate(product.createdAt)}</p>
        </div>
      </section>
    </div>
  )
}

export default ProductDetails
