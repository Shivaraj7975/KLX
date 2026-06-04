import { NavLink } from 'react-router-dom'

const NotFound = () => (
  <div className="container">
    <div className="card empty-state">
      <h2>Page not found</h2>
      <p className="muted">That campus listing or page no longer exists.</p>
      <NavLink to="/" className="button">
        Go home
      </NavLink>
    </div>
  </div>
)

export default NotFound
