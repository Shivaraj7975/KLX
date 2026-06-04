import { lazy, Suspense } from 'react'
import { BrowserRouter, Navigate, Route, Routes } from 'react-router-dom'
import ProtectedRoute from './components/ProtectedRoute.jsx'
import PublicCustomerRoute from './components/PublicCustomerRoute.jsx'
import ScrollToTop from './components/ScrollToTop.jsx'
import MainLayout from './layouts/MainLayout.jsx'

const Home = lazy(() => import('./pages/Home.jsx'))
const ProductDetails = lazy(() => import('./pages/ProductDetails.jsx'))
const Login = lazy(() => import('./pages/Login.jsx'))
const Signup = lazy(() => import('./pages/Signup.jsx'))
const SellListing = lazy(() => import('./pages/SellListing.jsx'))
const EditListing = lazy(() => import('./pages/EditListing.jsx'))
const RequestProduct = lazy(() => import('./pages/RequestProduct.jsx'))
const Requests = lazy(() => import('./pages/Requests.jsx'))
const Profile = lazy(() => import('./pages/Profile.jsx'))
const AdminDashboard = lazy(() => import('./pages/AdminDashboard.jsx'))
const NotFound = lazy(() => import('./pages/NotFound.jsx'))

function App() {
  return (
    <BrowserRouter>
      <ScrollToTop />
      <Suspense fallback={<div className="page"><div className="container card">Loading Sell Product...</div></div>}>
        <Routes>
          <Route element={<MainLayout />}>
            <Route index element={<Home />} />
            <Route path="/products" element={<Home />} />
            <Route path="/products/:id" element={<ProductDetails />} />
            <Route path="/requests" element={<Requests />} />
            <Route
              path="/sell"
              element={
                <ProtectedRoute roles={['STUDENT', 'ADMIN']}>
                  <SellListing />
                </ProtectedRoute>
              }
            />
            <Route
              path="/products/:id/edit"
              element={
                <ProtectedRoute roles={['STUDENT', 'ADMIN']}>
                  <EditListing />
                </ProtectedRoute>
              }
            />
            <Route
              path="/request"
              element={
                <ProtectedRoute roles={['STUDENT', 'ADMIN']}>
                  <RequestProduct />
                </ProtectedRoute>
              }
            />
            <Route
              path="/profile"
              element={
                <ProtectedRoute roles={['STUDENT', 'ADMIN']}>
                  <Profile />
                </ProtectedRoute>
              }
            />
            <Route
              path="/admin"
              element={
                <ProtectedRoute adminOnly>
                  <AdminDashboard />
                </ProtectedRoute>
              }
            />
            <Route
              path="/login"
              element={
                <PublicCustomerRoute>
                  <Login />
                </PublicCustomerRoute>
              }
            />
            <Route
              path="/signup"
              element={
                <PublicCustomerRoute>
                  <Signup />
                </PublicCustomerRoute>
              }
            />
          </Route>

          <Route path="/home" element={<Navigate to="/" replace />} />
          <Route path="*" element={<NotFound />} />
        </Routes>
      </Suspense>
    </BrowserRouter>
  )
}

export default App
