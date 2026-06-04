import { NavLink } from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext.jsx'

const Header = () => {
  const { isAuthenticated, isAdmin } = useAuth()

  return (
    <>
      <header className="site-header">
        <div className="site-header__inner container">
          <NavLink to="/" className="brand">
            <span className="brand-mark">KLX</span>
            <span>
              <strong>KLX - KLE Online Exchange</strong>
              <small>Campus marketplace</small>
            </span>
          </NavLink>

          <div className="site-header__actions">
            {isAuthenticated ? (
              <NavLink to="/profile" className="button small">
                Profile
              </NavLink>
            ) : (
              <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
                <NavLink to="/login" className="button small">
                  Login
                </NavLink>
                <NavLink to="/signup" className="button secondary small">
                  Sign up
                </NavLink>
              </div>
            )}
          </div>
        </div>
      </header>

      <nav className="site-nav">
        <div className="container site-nav__inner">
          <NavLink to="/" className="nav-button">
            Home
          </NavLink>
          
          {isAuthenticated && (
            <>
              <NavLink to="/sell" className="nav-button">
                Sell
              </NavLink>
              <NavLink to="/requests" className="nav-button">
                Browse Requests
              </NavLink>
              <NavLink to="/request" className="nav-button">
                Raise Request
              </NavLink>
              {isAdmin && (
                <NavLink to="/admin" className="nav-button">
                  Admin
                </NavLink>
              )}
            </>
          )}

          {!isAuthenticated && (
            <NavLink to="/requests" className="nav-button">
              Browse Requests
            </NavLink>
          )}
        </div>
      </nav>
    </>
  )
}

export default Header
