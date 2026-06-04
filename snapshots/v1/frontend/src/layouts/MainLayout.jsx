import { Outlet } from 'react-router-dom'
import Header from '../components/Header.jsx'
import Footer from '../components/Footer.jsx'

const MainLayout = () => (
    <div className="app-shell">
        <Header />
        <main className="page">
            <Outlet />
        </main>
        <Footer />
    </div>
)

export default MainLayout
