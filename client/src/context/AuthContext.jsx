import { createContext, useContext, useState, useEffect } from 'react'
import api from '../api/client'

const AuthContext = createContext(null)

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const stored = localStorage.getItem('learnhub_user')
    if (stored) setUser(JSON.parse(stored))
    setLoading(false)
  }, [])

  async function login(email, password) {
    const { data } = await api.post('/auth/login', { email, password })
    localStorage.setItem('learnhub_token', data.token)
    localStorage.setItem('learnhub_user', JSON.stringify(data.user))
    setUser(data.user)
    return data.user
  }

  async function signup(name, email, password, adminCode) {
    const { data } = await api.post('/auth/signup', { name, email, password, adminCode })
    localStorage.setItem('learnhub_token', data.token)
    localStorage.setItem('learnhub_user', JSON.stringify(data.user))
    setUser(data.user)
    return data.user
  }

  function logout() {
    localStorage.removeItem('learnhub_token')
    localStorage.removeItem('learnhub_user')
    setUser(null)
  }

  const isAdmin = user?.role === 'admin'

  return (
    <AuthContext.Provider value={{ user, loading, login, signup, logout, isAdmin }}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  return useContext(AuthContext)
}
