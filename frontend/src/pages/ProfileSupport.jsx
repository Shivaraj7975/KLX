import { useNavigate } from 'react-router-dom'

const ProfileSupport = () => {
  const navigate = useNavigate()

  return (
    <div className="container">
      <button 
        onClick={() => navigate('/profile')} 
        className="button ghost small" 
        style={{ marginBottom: '16px' }}
      >
        {'《 Profile'}
      </button>
      
      <section className="section">
        <h2>Customer Support</h2>
        <p className="muted">We're here to help with any questions</p>
      </section>

      <div className="grid two">
        <div className="card">
          <h3>Contact Us</h3>
          <div style={{ marginBottom: '16px' }}>
            <p style={{ marginBottom: '4px', color: '#666' }}>WhatsApp</p>
            <p style={{ margin: 0, fontSize: '1.1em' }}>+91 90000 00000</p>
          </div>
          <div style={{ marginBottom: '16px' }}>
            <p style={{ marginBottom: '4px', color: '#666' }}>Email</p>
            <p style={{ margin: 0, fontSize: '1.1em' }}>care@dfreshy.app</p>
          </div>
          <div>
            <p style={{ marginBottom: '4px', color: '#666' }}>Hours</p>
            <p style={{ margin: 0, fontSize: '1.1em' }}>7 AM - 11 PM (All days)</p>
          </div>
        </div>

        <div className="card">
          <h3>Quick Help</h3>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            <div>
              <strong>Order Issues</strong>
              <p className="muted" style={{ marginTop: '4px' }}>
                Late delivery? Wrong items? Contact us immediately.
              </p>
            </div>
            <div>
              <strong>Payment Questions</strong>
              <p className="muted" style={{ marginTop: '4px' }}>
                We accept COD and online payments via Razorpay.
              </p>
            </div>
            <div>
              <strong>Product Quality</strong>
              <p className="muted" style={{ marginTop: '4px' }}>
                Not satisfied? We'll replace or refund - no questions asked.
              </p>
            </div>
          </div>
        </div>
      </div>

      <div className="card" style={{ marginTop: '24px' }}>
        <h3>Frequently Asked Questions</h3>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          <div>
            <strong>How long does delivery take?</strong>
            <p className="muted" style={{ marginTop: '4px' }}>
              Most orders are delivered within 45 minutes. You'll get real-time tracking once your order is dispatched.
            </p>
          </div>
          <div>
            <strong>What areas do you deliver to?</strong>
            <p className="muted" style={{ marginTop: '4px' }}>
              We currently serve selected areas in Bangalore. Enter your address at checkout to confirm availability.
            </p>
          </div>
          <div>
            <strong>Can I modify my order after placing it?</strong>
            <p className="muted" style={{ marginTop: '4px' }}>
              Contact us immediately on WhatsApp. If the order hasn't been dispatched, we can help modify it.
            </p>
          </div>
          <div>
            <strong>Is cash on delivery available?</strong>
            <p className="muted" style={{ marginTop: '4px' }}>
              Yes! We accept cash on delivery for all orders. Online payment via Razorpay is also available.
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}

export default ProfileSupport
