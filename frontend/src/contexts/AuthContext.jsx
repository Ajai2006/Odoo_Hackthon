import React, { createContext, useContext, useState, useEffect, useCallback } from 'react'
import api from '@/services/api'

const AuthContext = createContext(null)

export function AuthProvider({ children }) {
  const [user, setUser]       = useState(null)      // { id, username, first_name, last_name, role, employee_id }
  const [loading, setLoading] = useState(true)

  // ── Restore session from localStorage ─────────────────────
  useEffect(() => {
    const token = localStorage.getItem('access_token')
    if (token) {
      api.defaults.headers.common['Authorization'] = `Bearer ${token}`
      api.get('/api/accounts/me/')
        .then(({ data }) => setUser(data))
        .catch(() => { localStorage.clear(); delete api.defaults.headers.common['Authorization'] })
        .finally(() => setLoading(false))
    } else {
      setLoading(false)
    }
  }, [])

  // ── Login ──────────────────────────────────────────────────
  const login = useCallback(async (username, password) => {
    const { data } = await api.post('/api/token/', { username, password })
    localStorage.setItem('access_token',  data.access)
    localStorage.setItem('refresh_token', data.refresh)
    api.defaults.headers.common['Authorization'] = `Bearer ${data.access}`
    const me = await api.get('/api/accounts/me/')
    setUser(me.data)
    return me.data
  }, [])

  // ── Logout ─────────────────────────────────────────────────
  const logout = useCallback(() => {
    localStorage.removeItem('access_token')
    localStorage.removeItem('refresh_token')
    delete api.defaults.headers.common['Authorization']
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
