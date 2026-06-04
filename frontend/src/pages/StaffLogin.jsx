import { useEffect, useRef, useState } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'
import { useAuth, getHomeForRole } from '../contexts/AuthContext.jsx'

const StaffLogin = () => {
  const { sendOtp, verifyOtp } = useAuth()
  const navigate = useNavigate()
  const [params] = useSearchParams()
  const returnTo = params.get('returnTo')
  const [phone, setPhone] = useState('')
  const [name, setName] = useState('')
  const [role, setRole] = useState('MANAGER')
  const [otp, setOtp] = useState('')
  const [status, setStatus] = useState('')
  const [otpSent, setOtpSent] = useState(false)
  const [loading, setLoading] = useState(false)
  const otpInputRef = useRef(null)

  useEffect(() => {
    if (otpSent) {
      otpInputRef.current?.focus()
    }
  }, [otpSent])

  const handleSendOtp = async () => {
    setLoading(true)
    try {
      await sendOtp(phone)
      setOtpSent(true)
      setStatus('OTP sent. Use 123456 for demo login.')
    } catch (error) {
      setStatus('Unable to send OTP. Try again.')
    } finally {
      setLoading(false)
    }
  }

  const handleVerify = async () => {
    setLoading(true)
    try {
      await verifyOtp({ phone, otp, name, role })
      if (returnTo) {
        navigate(returnTo)
      } else {
        navigate(getHomeForRole(role))
      }
    } catch (error) {
      setStatus('OTP verification failed.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="container">
      <section className="section">
        <h2>Staff Login</h2>
        <p className="muted">Login portal for managers, delivery partners, and admins.</p>
      </section>

      <div className="grid two">
        <div className="card">
          <label>
            Full name
            <input
              className="input"
              value={name}
              onChange={(event) => setName(event.target.value)}
              placeholder="Your name"
            />
          </label>
          <label>
            Phone number
            <input
              className="input"
              value={phone}
              onChange={(event) => setPhone(event.target.value)}
              placeholder="+91 90000 00000"
              required
            />
          </label>
          <label>
            Select your role
            <select className="input" value={role} onChange={(event) => setRole(event.target.value)}>
              <option value="MANAGER">Manager</option>
              <option value="DELIVERY">Delivery Partner</option>
              <option value="ADMIN">Admin</option>
            </select>
          </label>
          {otpSent && (
            <label>
              OTP
              <input
                className="input"
                value={otp}
                onChange={(event) => setOtp(event.target.value)}
                placeholder="123456"
                ref={otpInputRef}
              />
            </label>
          )}
          <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap' }}>
            <button className="button ghost" onClick={handleSendOtp} disabled={!phone || loading}>
              {otpSent ? 'Resend OTP' : 'Send OTP'}
            </button>
            {otpSent && (
              <button className="button" onClick={handleVerify} disabled={!otp || loading}>
                Verify & log in
              </button>
            )}
          </div>
          {status && <p className="muted" style={{ marginTop: '12px' }}>{status}</p>}
        </div>
        <div className="card">
          <h3>Staff Portal Access</h3>
          <ul className="muted">
            <li><strong>Managers:</strong> Accept orders and manage assignments.</li>
            <li><strong>Delivery Partners:</strong> Update delivery status in real-time.</li>
            <li><strong>Admins:</strong> Monitor analytics, audit trails, and system settings.</li>
          </ul>
          <p className="muted" style={{ marginTop: '16px', fontSize: '0.9em' }}>
            Select your role above and log in to access the staff portal.
          </p>
        </div>
      </div>
    </div>
  )
}

export default StaffLogin
