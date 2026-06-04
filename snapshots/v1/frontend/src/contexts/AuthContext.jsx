import { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react'
import { api } from '../services/api.js'
import { clearAuth, getStoredAuth, storeAuth } from '../services/storage.js'

const AuthContext = createContext(null)
const ADMIN_EMAIL = 'shivarajas79757@gmail.com'

const isAdminUser = (user) => String(user?.email || '').trim().toLowerCase() === ADMIN_EMAIL

const getHomeForRole = (role) => {
  switch (role) {
    case 'ADMIN':
      return '/admin'
    case 'STUDENT':
      return '/'
    default:
      return '/'
  }
}

export const AuthProvider = ({ children }) => {
  const [auth, setAuth] = useState(() => getStoredAuth())

  useEffect(() => {
    const syncProfile = async () => {
      if (!auth?.token) {
        return
      }

      try {
        const user = await api.getProfile(auth.token)
        if (!user) {
          return
        }

        const nextAuth = { token: auth.token, user }
        setAuth(nextAuth)
        storeAuth(nextAuth)
      } catch {
        setAuth(null)
        clearAuth()
      }
    }

    syncProfile()
  }, [])

  const login = useCallback(async (payload) => {
    const response = await api.loginWithPassword(payload)
    const nextAuth = {
      token: response.token,
      user: response.user,
    }
    setAuth(nextAuth)
    storeAuth(nextAuth)
    return response
  }, [])

  const sendOtp = useCallback(async (payload) => api.sendOtp(payload), [])

  const verifyOtp = useCallback(async (payload) => {
    const response = await api.verifyOtp(payload)
    const nextAuth = {
      token: response.token,
      user: response.user,
    }
    setAuth(nextAuth)
    storeAuth(nextAuth)
    return response
  }, [])

  const logout = useCallback(() => {
    setAuth(null)
    clearAuth()
  }, [])

  const value = useMemo(() => {
    const role = auth?.user?.role || null
    const isAdmin = isAdminUser(auth?.user)
    return {
      auth,
      user: auth?.user || null,
      token: auth?.token || null,
      role: isAdmin ? 'ADMIN' : role,
      isAdmin,
      isAuthenticated: Boolean(auth?.token),
      login,
      sendOtp,
      verifyOtp,
      logout,
      getHomeForRole,
    }
  }, [auth, login, sendOtp, verifyOtp, logout])

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

export const useAuth = () => {
  const context = useContext(AuthContext)
  if (!context) {
    throw new Error('useAuth must be used within AuthProvider')
  }
  return context
}

export { getHomeForRole }
