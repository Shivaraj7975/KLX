import { useMemo, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext.jsx'

const Signup = () => {
  const { sendOtp, verifyOtp, getHomeForRole } = useAuth()
  const navigate = useNavigate()
  const ADMIN_EMAIL = 'shivarajas79757@gmail.com'
  const [form, setForm] = useState({
    name: '',
    phone: '',
    email: '',
    password: '',
    otp: '',
  })
  const [otpSent, setOtpSent] = useState(false)
  const [status, setStatus] = useState('')
  const [loading, setLoading] = useState(false)

  const canRequestOtp = useMemo(() => {
    const email = form.email.trim().toLowerCase()
    const isCampusEmail = email.endsWith('@kletech.ac.in') || email === ADMIN_EMAIL
    return form.name.trim() && form.phone.trim() && isCampusEmail && form.password.trim()
  }, [form])

  const handleChange = (field, value) => {
    setForm((current) => ({ ...current, [field]: value }))
    if (otpSent && field !== 'otp') {
      setOtpSent(false)
      setStatus('')
      setForm((current) => ({ ...current, otp: '' }))
    }
  }

  const handleSendOtp = async (event) => {
    event.preventDefault()
    setLoading(true)
    setStatus('')

    try {
      await sendOtp(form)
      setOtpSent(true)
      setStatus('OTP sent to your email. Enter it to finish sign up.')
    } catch (error) {
      setStatus(error?.message || 'Unable to send OTP.')
    } finally {
      setLoading(false)
    }
  }

  const handleVerify = async (event) => {
    event.preventDefault()
    setLoading(true)
    setStatus('')

    try {
      const response = await verifyOtp(form)
      navigate(getHomeForRole(response.user.role))
    } catch (error) {
      setStatus(error?.message || 'Unable to verify OTP.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="container auth-shell">
      <section className="auth-grid">
        <div className="auth-copy">
          <span className="pill">Create account</span>
          <h1>Sign up once, then log in with your password.</h1>
          <p className="muted">Use your @kletech.ac.in email during sign up. After that, you sign in with email and password.</p>
          <div className="card auth-preview">
            <h3>Why we verify email</h3>
            <ul className="muted">
              <li>Stops fake signups.</li>
              <li>Lets sellers receive notifications reliably.</li>
              <li>Only the verified admin email can access the admin area.</li>
            </ul>
          </div>
        </div>

        <form className="card auth-form" onSubmit={otpSent ? handleVerify : handleSendOtp}>
          <h2>Create your account</h2>
          <label>
            Full name
            <input className="input" value={form.name} onChange={(event) => handleChange('name', event.target.value)} placeholder="Your name" />
          </label>
          <label>
            Phone number
            <input className="input" inputMode="numeric" value={form.phone} onChange={(event) => handleChange('phone', event.target.value)} placeholder="10-digit phone number" />
          </label>
          <label>
            College email
            <input className="input" type="email" value={form.email} onChange={(event) => handleChange('email', event.target.value)} placeholder="name@kletech.ac.in" />
          </label>
          <label>
            Password
            <input className="input" type="password" value={form.password} onChange={(event) => handleChange('password', event.target.value)} placeholder="Create a password" />
          </label>
          {otpSent && (
            <label>
              OTP
              <input className="input" value={form.otp} onChange={(event) => handleChange('otp', event.target.value)} placeholder="OTP" inputMode="numeric" />
            </label>
          )}
          <button className="button" type="submit" disabled={loading || (!otpSent && !canRequestOtp) || (otpSent && !form.otp.trim())}>
            {loading ? (otpSent ? 'Verifying...' : 'Sending OTP...') : otpSent ? 'Verify and create account' : 'Send OTP'}
          </button>
          {status && <p className="muted">{status}</p>}
          <p className="muted">
            Already have an account? <Link to="/login">Sign in</Link>
          </p>
        </form>
      </section>
    </div>
  )
}

export default Signup
