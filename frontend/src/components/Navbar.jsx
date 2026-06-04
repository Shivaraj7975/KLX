import { NavLink } from 'react-router-dom'
import { useCart } from '../contexts/CartContext.jsx'
import { useAuth } from '../contexts/AuthContext.jsx'

const Navbar = () => {
    const { items } = useCart()
    const { isAuthenticated, role } = useAuth()
    const cartCount = items.reduce((sum, item) => sum + item.quantity, 0)

    if (isAuthenticated && role && role !== 'CUSTOMER') {
        return null
    }

    // ONLY decides active vs not
    const linkClass = ({ isActive }) =>
        `nav-bar-link ${isActive ? "active" : ""}`

    return (
        <nav className="navigation-bar">
            <NavLink to="/" end className={linkClass}>
                <p>🏠︎</p>
                <p>Home</p>
            </NavLink>

            <NavLink to="/cart" className={linkClass}>
                <p>🛒</p>
                <p>Cart ({cartCount})</p>
            </NavLink>
        </nav>
    )
}

export default Navbar
