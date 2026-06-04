import { useEffect, useState, useMemo } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext.jsx'
import { api } from '../services/api.js'

const RequestCard = ({ request, isOwner, onContactClick }) => {
  const daysAgo = (date) => {
    const now = new Date()
    const created = new Date(date)
    const days = Math.floor((now - created) / (1000 * 60 * 60 * 24))
    if (days === 0) return 'Today'
    if (days === 1) return 'Yesterday'
    return `${days} days ago`
  }

  return (
    <article className="card product-card">
      <div className="card__header">
        <h3>{request.name}</h3>
        <span className="pill">{request.category}</span>
      </div>

      <div className="card__body">
        <p className="muted">{request.description}</p>

        <div className="specs-list">
          <div className="spec">
            <strong>Budget:</strong>
            <span>{request.budget || 'Not specified'}</span>
          </div>
          <div className="spec">
            <strong>Location:</strong>
            <span>{request.campus}</span>
          </div>
          <div className="spec">
            <strong>Posted:</strong>
            <span>{daysAgo(request.createdAt)}</span>
          </div>
          <div className="spec">
            <strong>Responses:</strong>
            <span>{request.responses?.length || 0} seller(s)</span>
          </div>
        </div>
      </div>

      <div className="card__footer">
        <div className="seller-info">
          <div>
            <h4>{request.requesterName}</h4>
            <p className="muted small">{request.college}</p>
          </div>
        </div>

        {!isOwner && (
          <button className="button small" type="button" onClick={() => onContactClick(request)}>
            I have this →
          </button>
        )}
      </div>
    </article>
  )
}

const Requests = () => {
  const navigate = useNavigate()
  const { isAuthenticated, user } = useAuth()
  const [requests, setRequests] = useState([])
  const [loading, setLoading] = useState(true)
  const [category, setCategory] = useState('All')
  const [query, setQuery] = useState('')
  const [selectedRequest, setSelectedRequest] = useState(null)
  const [responseMsg, setResponseMsg] = useState('')
  const [responseBudget, setResponseBudget] = useState('')
  const [respondingId, setRespondingId] = useState(null)

  useEffect(() => {
    const loadRequests = async () => {
      try {
        const data = await api.getRequests()
        setRequests(data)
      } catch (error) {
        console.error('Failed to load requests:', error)
      } finally {
        setLoading(false)
      }
    }

    loadRequests()
  }, [])

  const categories = ['All', 'Books', 'Electronics', 'Accessories', 'Transport', 'Academic']

  const filteredRequests = useMemo(() => {
    const term = query.trim().toLowerCase()
    return requests.filter((request) => {
      const matchesCategory = category === 'All' || request.category === category
      const haystack = `${request.name} ${request.description} ${request.category}`.toLowerCase()
      const matchesQuery = !term || haystack.includes(term)
      return matchesCategory && matchesQuery
    })
  }, [category, requests, query])

  const handleContactClick = (request) => {
    if (!isAuthenticated) {
      navigate('/login?returnTo=/requests')
      return
    }
    setSelectedRequest(request)
  }

  const handleSendResponse = async () => {
    if (!selectedRequest || !responseMsg.trim()) {
      return
    }

    setRespondingId(selectedRequest.id)
    try {
      await api.addRequestResponse(selectedRequest.id, {
        message: responseMsg,
        price: responseBudget || null,
      })

      // Reload requests
      const updated = await api.getRequests()
      setRequests(updated)

      setSelectedRequest(null)
      setResponseMsg('')
      setResponseBudget('')
      alert('Response sent! The requester will contact you soon.')
    } catch (error) {
      alert(error?.message || 'Failed to send response.')
    } finally {
      setRespondingId(null)
    }
  }

  const isOwnerOfSelectedRequest = selectedRequest?.requesterId === user?.id

  if (loading) {
    return (
      <div className="container page">
        <div className="card empty-state">
          <p>Loading requests...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="container page">
      <section className="hero-lite section">
        <div>
          <span className="pill">Product requests</span>
          <h1>See what campus is looking for.</h1>
          <p className="muted">Browse open requests and respond if you have what they need.</p>
        </div>
      </section>

      <section className="section">
        <label className="search-bar">
          <input
            className="input"
            type="search"
            placeholder="Search requests..."
            value={query}
            onChange={(event) => setQuery(event.target.value)}
          />
        </label>
      </section>

      <section className="section">
        <div className="chip-row">
          {categories.map((cat) => (
            <button
              key={cat}
              className={`chip ${category === cat ? 'active' : ''}`}
              type="button"
              onClick={() => setCategory(cat)}
            >
              {cat}
            </button>
          ))}
        </div>
      </section>

      {filteredRequests.length === 0 ? (
        <div className="card empty-state">
          <h2>No requests found</h2>
          <p className="muted">No one has posted a request yet for "{query || 'these filters'}".</p>
          {isAuthenticated && (
            <button className="button" type="button" onClick={() => navigate('/request')}>
              Post a request instead
            </button>
          )}
        </div>
      ) : (
        <section className="grid grid--3">
          {filteredRequests.map((request) => (
            <RequestCard
              key={request.id}
              request={request}
              isOwner={request.requesterId === user?.id}
              onContactClick={handleContactClick}
            />
          ))}
        </section>
      )}

      {/* Response Modal */}
      {selectedRequest && (
        <div className="modal-overlay" onClick={() => setSelectedRequest(null)}>
          <div className="modal" onClick={(e) => e.stopPropagation()}>
            <div className="modal__header">
              <h2>{selectedRequest.name}</h2>
              <button
                className="button ghost small"
                type="button"
                onClick={() => setSelectedRequest(null)}
              >
                ✕
              </button>
            </div>

            <div className="modal__body">
              {isOwnerOfSelectedRequest ? (
                <div className="card empty-state">
                  <h3>Your own request</h3>
                  <p className="muted">This is your request. Check responses below.</p>
                  <div className="responses-list">
                    {selectedRequest.responses?.length > 0 ? (
                      selectedRequest.responses.map((response) => (
                        <div key={response.id} className="response-item">
                          <h4>{response.responderName}</h4>
                          <p>{response.message}</p>
                          {response.price && <p className="muted">Asking: ₹{response.price}</p>}
                          <p className="muted small">
                            <a href={`tel:${response.responderPhone}`}>{response.responderPhone}</a>
                            {' | '}
                            <a href={`mailto:${response.responderEmail}`}>{response.responderEmail}</a>
                          </p>
                        </div>
                      ))
                    ) : (
                      <p className="muted">No responses yet. Wait for sellers to respond.</p>
                    )}
                  </div>
                </div>
              ) : (
                <>
                  <p className="muted">
                    <strong>Budget:</strong> {selectedRequest.budget || 'Not specified'}
                  </p>
                  <p className="muted">
                    <strong>Location:</strong> {selectedRequest.campus}
                  </p>
                  <p className="muted">
                    <strong>Full description:</strong>
                  </p>
                  <p>{selectedRequest.description}</p>

                  <div className="form-grid">
                    <label className="form-grid__full">
                      Your message
                      <textarea
                        className="input"
                        rows="3"
                        placeholder="Tell them about what you have, condition, price you're asking..."
                        value={responseMsg}
                        onChange={(event) => setResponseMsg(event.target.value)}
                      />
                    </label>
                    <label>
                      Your asking price (optional)
                      <input
                        className="input"
                        placeholder="1500"
                        value={responseBudget}
                        onChange={(event) => setResponseBudget(event.target.value)}
                        inputMode="numeric"
                      />
                    </label>
                  </div>
                </>
              )}
            </div>

            {!isOwnerOfSelectedRequest && (
              <div className="modal__footer">
                <button
                  className="button ghost"
                  type="button"
                  onClick={() => setSelectedRequest(null)}
                >
                  Cancel
                </button>
                <button
                  className="button"
                  type="button"
                  disabled={respondingId === selectedRequest.id || !responseMsg.trim()}
                  onClick={handleSendResponse}
                >
                  {respondingId === selectedRequest.id ? 'Sending...' : 'Send response'}
                </button>
              </div>
            )}
          </div>
        </div>
      )}

      <style>{`
        .modal-overlay {
          position: fixed;
          inset: 0;
          background: rgba(0, 0, 0, 0.5);
          display: flex;
          align-items: center;
          justify-content: center;
          z-index: 1000;
        }

        .modal {
          background: white;
          border-radius: 8px;
          box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
          width: 90%;
          max-width: 500px;
          max-height: 80vh;
          overflow-y: auto;
          display: flex;
          flex-direction: column;
        }

        .modal__header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          padding: 20px;
          border-bottom: 1px solid #eee;
        }

        .modal__body {
          padding: 20px;
          flex: 1;
        }

        .modal__footer {
          display: flex;
          gap: 10px;
          justify-content: flex-end;
          padding: 20px;
          border-top: 1px solid #eee;
        }

        .responses-list {
          display: flex;
          flex-direction: column;
          gap: 12px;
          margin-top: 12px;
        }

        .response-item {
          padding: 12px;
          border: 1px solid #eee;
          border-radius: 6px;
          background: #fafafa;
        }

        .response-item h4 {
          margin: 0 0 4px 0;
          font-size: 14px;
        }

        .response-item p {
          margin: 4px 0;
          font-size: 13px;
        }

        .response-item a {
          color: #0066cc;
          text-decoration: none;
        }

        .response-item a:hover {
          text-decoration: underline;
        }
      `}</style>
    </div>
  )
}

export default Requests
