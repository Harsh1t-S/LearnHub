import { useState } from 'react'
import { useNavigate, Link, useSearchParams } from 'react-router-dom'
import { LogIn } from 'lucide-react'
import { useAuth } from '../context/AuthContext'

export default function Login() {
  const { login } = useAuth()
  const navigate = useNavigate()
  const [searchParams] = useSearchParams()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')

  async function handleSubmit(e) {
    e.preventDefault()
    setError('')
    try {
      await login(email, password)
      navigate('/')
    } catch (err) {
      setError(err.response?.data?.error || 'Login failed')
    }
  }

  return (
    <div className="hero-gradient min-h-[calc(100vh-4rem)] flex items-center justify-center px-4">
      <div className="w-full max-w-sm bg-white rounded-2xl shadow-xl shadow-gray-900/5 border border-gray-100 p-8">
        <div className="h-11 w-11 rounded-xl bg-gradient-to-br from-brand-500 to-indigo-500 flex items-center justify-center text-white mb-4">
          <LogIn size={20} />
        </div>
        <h1 className="text-2xl font-extrabold text-gray-900 mb-1">Welcome back</h1>
        <p className="text-sm text-gray-500 mb-4">Log in as a student or an instructor.</p>
        {searchParams.get('sessionExpired') && (
          <p className="text-sm bg-yellow-50 text-yellow-800 border border-yellow-200 rounded-lg px-3 py-2 mb-4">
            Your session expired — log in again to continue.
          </p>
        )}
        <form onSubmit={handleSubmit} className="space-y-3.5 mt-4">
          <input className="w-full border border-gray-200 rounded-xl px-3.5 py-2.5 focus:outline-none focus:ring-2 focus:ring-brand-400 focus:border-brand-400 transition" type="email" placeholder="Email"
            value={email} onChange={(e) => setEmail(e.target.value)} required />
          <input className="w-full border border-gray-200 rounded-xl px-3.5 py-2.5 focus:outline-none focus:ring-2 focus:ring-brand-400 focus:border-brand-400 transition" type="password" placeholder="Password"
            value={password} onChange={(e) => setPassword(e.target.value)} required />
          {error && <p className="text-red-600 text-sm">{error}</p>}
          <button className="w-full bg-gray-900 hover:bg-gray-800 text-white rounded-xl py-2.5 font-semibold transition-colors">
            Log in
          </button>
        </form>
        <p className="text-sm text-gray-500 mt-5">
          No account? <Link to="/signup" className="text-brand-700 font-semibold hover:underline">Sign up</Link>
        </p>
      </div>
    </div>
  )
}
