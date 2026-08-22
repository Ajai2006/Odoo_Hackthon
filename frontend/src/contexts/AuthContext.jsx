import React, { createContext, useContext, useState, useEffect, useCallback } from 'react'
import api from '@/services/api'

// Enable credentials for httpOnly cookie transport
api.defaults.withCredentials = true

const AuthContext = createContext(null)

export function AuthProvider({ children }) {
  const [user, setUser]       = useState(null)      // { id, username, first_name, last_name, role, employee_id }
  const [loading, setLoading] = useState(true)

  // ── Restore session from httpOnly cookie ────────────────────
  useEffect(() => {
    api.get('/api/accounts/me/')
      .then(({ data }) => setUser(data))
      .catch(() => { setUser(null) })
      .finally(() => setLoading(false))
  }, [])

  // ── Login — Backend sets httpOnly cookie ────────────────────
  const login = useCallback(async (username, password) => {
    await api.post('/api/token/', { username, password })
    const me = await api.get('/api/accounts/me/')
    setUser(me.data)
    return me.data
  }, [])

  // ── Logout — Backend clears httpOnly cookie ──────────────────
  const logout = useCallback(async () => {
    try {
      await api.post('/api/users/logout')
    } catch (e) {
      // Ignore network errors on logout
    }
    setUser(null)
  }, [])

  const isAdmin    = user?.role === 'admin'
  const isEmployee = user?.role === 'employee'

  return (
    <AuthContext.Provider value={{ user, loading, login, logout, isAdmin, isEmployee }}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error('useAuth must be used inside <AuthProvider>')
  return ctx
}

export default AuthContext
