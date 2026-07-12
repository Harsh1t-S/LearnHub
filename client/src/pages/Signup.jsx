import { useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { UserPlus, GraduationCap, PenSquare } from 'lucide-react'
import { useAuth } from '../context/AuthContext'

export default function Signup() {
  const { signup } = useAuth()
  const navigate = useNavigate()
  const [role, setRole] = useState('student')
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [adminCode, setAdminCode] = useState('')
  const [error, setError] = useState('')

  async function handleSubmit(e) {
    e.preventDefault()
    setError('')
    try {
      await signup(name, email, password, role === 'instructor' ? adminCode : '')
      navigate('/')
    } catch (err) {
      setError(err.response?.data?.error || 'Signup failed')
    }
  }

  return (
    <div className="hero-gradient min-h-[calc(100vh-4rem)] flex items-center justify-center px-4">
      <div className="w-full max-w-sm bg-white rounded-2xl shadow-xl shadow-gray-900/5 border border-gray-100 p-8">
        <div className="h-11 w-11 rounded-xl bg-gradient-to-br from-brand-500 to-indigo-500 flex items-center justify-center text-white mb-4">
          <UserPlus size={20} />
        </div>
        <h1 className="text-2xl font-extrabold text-gray-900 mb-1">Create your account</h1>
        <p className="text-sm text-gray-500 mb-5">Pick how you want to use LearnHub.</p>

        <div className="grid grid-cols-2 gap-2 mb-5">
          <button
            type="button"
            onClick={() => setRole('student')}
            className={`flex flex-col items-center gap-1.5 rounded-xl border py-3.5 text-sm font-semibold transition-colors ${
              role === 'student' ? 'border-brand-500 bg-brand-50 text-brand-700' : 'border-gray-200 text-gray-500 hover:border-gray-300'
            }`}
          >
            <GraduationCap size={18} />
            Student
          </button>
          <button
            type="button"
            onClick={() => setRole('instructor')}
            className={`flex flex-col items-center gap-1.5 rounded-xl border py-3.5 text-sm font-semibold transition-colors ${
              role === 'instructor' ? 'border-brand-500 bg-brand-50 text-brand-700' : 'border-gray-200 text-gray-500 hover:border-gray-300'
            }`}
          >
            <PenSquare size={18} />
            Instructor
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-3.5">
          <input className="w-full border border-gray-200 rounded-xl px-3.5 py-2.5 focus:outline-none focus:ring-2 focus:ring-brand-400 focus:border-brand-400 transition" placeholder="Name"
            value={name} onChange={(e) => setName(e.target.value)} required />
          <input className="w-full border border-gray-200 rounded-xl px-3.5 py-2.5 focus:outline-none focus:ring-2 focus:ring-brand-400 focus:border-brand-400 transition" type="email" placeholder="Email"
            value={email} onChange={(e) => setEmail(e.target.value)} required />
          <input className="w-full border border-gray-200 rounded-xl px-3.5 py-2.5 focus:outline-none focus:ring-2 focus:ring-brand-400 focus:border-brand-400 transition" type="password" placeholder="Password (min 6 chars)"
            value={password} onChange={(e) => setPassword(e.target.value)} required />

          {role === 'instructor' && (
            <div>
              <input
                className="w-full border border-gray-200 rounded-xl px-3.5 py-2.5 focus:outline-none focus:ring-2 focus:ring-brand-400 focus:border-brand-400 transition"
                placeholder="Instructor invite code"
                value={adminCode}
                onChange={(e) => setAdminCode(e.target.value)}
                required
              />
              <p className="text-xs text-gray-400 mt-1.5">
                Demo code: <span className="font-mono text-gray-600">{import.meta.env.VITE_DEMO_INVITE_CODE || 'letmein-admin'}</span>
              </p>
            </div>
          )}

          {error && <p className="text-red-600 text-sm">{error}</p>}
          <button className="w-full bg-gray-900 hover:bg-gray-800 text-white rounded-xl py-2.5 font-semibold transition-colors">
            Sign up as {role === 'instructor' ? 'an instructor' : 'a student'}
          </button>
        </form>
        <p className="text-sm text-gray-500 mt-5">
          Already have an account? <Link to="/login" className="text-brand-700 font-semibold hover:underline">Log in</Link>
        </p>
      </div>
    </div>
  )
}
