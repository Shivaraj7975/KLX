import { useMemo, useState } from 'react'
import { Link, useNavigate, useSearchParams } from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext.jsx'

const Login = () => {
  const { login, getHomeForRole } = useAuth()
  const navigate = useNavigate()
  const [params] = useSearchParams()
  const returnTo = params.get('returnTo')
  const [form, setForm] = useState({
    email: '',
    password: '',
  })
  const [status, setStatus] = useState('')
  const [loading, setLoading] = useState(false)

  const canSubmit = useMemo(() => {
    return form.email.trim() && form.password.trim()
  }, [form])

  const handleChange = (field, value) => {
    setForm((current) => ({ ...current, [field]: value }))
  }

  const handleSubmit = async (event) => {
    event.preventDefault()
    setLoading(true)

    try {
      const response = await login(form)
      const destination = returnTo && returnTo !== '/login' ? returnTo : getHomeForRole(response.user.role)
      navigate(destination)
    } catch (error) {
      setStatus(error?.message || 'Unable to sign in.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="container auth-shell">
      <section className="auth-grid">
        <div className="auth-copy">
          <span className="pill">Student login</span>
          <h1>Sign in with your email and password.</h1>
          <p className="muted">Use the password you set during sign up. OTP is only used when creating a new account.</p>
          <div className="card auth-preview">
            <h3>Who can use Sell Product?</h3>
            <ul className="muted">
              <li>Students who want to buy or sell items.</li>
              <li>Admins who need to moderate listings and users.</li>
              <li>No payments inside the app. Buyers contact sellers directly.</li>
            </ul>
          </div>
        </div>

        <form className="card auth-form" onSubmit={handleSubmit}>
          <h2>Continue to Sell Product</h2>
          <label>
            Email
            <input className="input" type="email" value={form.email} onChange={(event) => handleChange('email', event.target.value)} placeholder="name@college.edu" />
          </label>
          <label>
            Password
            <input className="input" type="password" value={form.password} onChange={(event) => handleChange('password', event.target.value)} placeholder="Your password" />
          </label>
          <button className="button" type="submit" disabled={!canSubmit || loading}>
            {loading ? 'Signing in...' : 'Sign in'}
          </button>
          {status && <p className="muted">{status}</p>}
          <p className="muted">
            New here? <Link to="/signup">Create an account</Link>
          </p>
        </form>
      </section>
    </div>
  )
}

export default Login
