import { createContext, useContext, useEffect, useState } from 'react'
import api from '../api/client'

const AuthContext = createContext(null)

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null)
  const [loading, setLoading] = useState(true)

  const isAuthenticated = !!localStorage.getItem('access_token')

  useEffect(() => {
    if (isAuthenticated) {
      api
        .get('users/me/')
        .then((res) => setUser(res.data))
        .catch(() => {
          localStorage.removeItem('access_token')
          localStorage.removeItem('refresh_token')
          setUser(null)
        })
        .finally(() => setLoading(false))
    } else {
      setLoading(false)
    }
  }, [])

  const login = async (email, password) => {
    const { data } = await api.post('users/login/', { email, password })
    localStorage.setItem('access_token', data.access)
    localStorage.setItem('refresh_token', data.refresh)
    setUser(data.user)
    return data
  }

  const register = async (form) => {
    await api.post('users/register/', form)
    return login(form.email, form.password)
  }

  const logout = async () => {
    const refresh = localStorage.getItem('refresh_token')
    try {
      if (refresh) await api.post('users/logout/', { refresh })
    } catch {
      /* ignore */
    }
    localStorage.removeItem('access_token')
    localStorage.removeItem('refresh_token')
    setUser(null)
  }

  return (
    <AuthContext.Provider
      value={{ user, loading, isAuthenticated, login, register, logout }}
    >
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error('useAuth must be used inside AuthProvider')
  return ctx
}
