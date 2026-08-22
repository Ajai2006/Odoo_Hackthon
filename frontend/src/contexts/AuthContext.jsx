import React, { createContext, useContext, useState, useEffect, useCallback } from 'react'
import api from '@/services/api'

// Enable credentials for httpOnly cookie transport
api.defaults.withCredentials = true

const AuthContext = createContext(null)

export function AuthProvider({ children }) {
  const [user, setUser]         = useState(null)
  const [employee, setEmployee] = useState(null)
  const [loading, setLoading]   = useState(true)

  // Restore session on page load
  useEffect(() => {
    const token = localStorage.getItem('auth_token')
    const headers = token ? { Authorization: `Bearer ${token}` } : {}

    api.get('/api/users/me', { headers })
      .then(({ data }) => {
        if (data.user) {
          setUser(data.user)
          setEmployee(data.employee || null)
        }
      })
      .catch(() => {
        localStorage.removeItem('auth_token')
        setUser(null)
        setEmployee(null)
      })
      .finally(() => setLoading(false))
  }, [])

  // Login via API
  const login = useCallback(async (emailOrUsername, password) => {
    const { data } = await api.post('/api/users/login', {
      email: emailOrUsername,
      password
    })

    if (data.token) {
      localStorage.setItem('auth_token', data.token)
      api.defaults.headers.common['Authorization'] = `Bearer ${data.token}`
    }

    if (data.user) {
      setUser(data.user)
      setEmployee(data.employee || null)
      return data.user
    }
  }, [])

  // Logout via API
  const logout = useCallback(async () => {
    try {
      await api.post('/api/users/logout')
    } catch (e) {
      // Ignore network errors on logout
    }
    localStorage.removeItem('auth_token')
    delete api.defaults.headers.common['Authorization']
    setUser(null)
    setEmployee(null)
  }, [])

  const isAdmin    = user?.role === 'admin'
  const isEmployee = user?.role === 'employee' || user?.role === 'manager'

  return (
    <AuthContext.Provider value={{ user, employee, loading, login, logout, isAdmin, isEmployee }}>
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
