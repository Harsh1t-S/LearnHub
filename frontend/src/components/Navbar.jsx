import { Link, useNavigate } from 'react-router-dom'
import { GraduationCap, LayoutDashboard, LogOut } from 'lucide-react'
import { useAuth } from '../context/AuthContext'

export default function Navbar() {
  const { user, logout, isAdmin } = useAuth()
  const navigate = useNavigate()

  return (
    <header className="sticky top-0 z-40 bg-gray-950/90 backdrop-blur border-b border-white/10 text-white">
      <div className="max-w-7xl mx-auto px-4 h-16 flex items-center justify-between">
        <Link to="/" className="flex items-center gap-2 font-extrabold text-xl tracking-tight">
          <span className="flex items-center justify-center h-8 w-8 rounded-lg bg-gradient-to-br from-brand-500 to-indigo-500 shadow-lg shadow-brand-500/30">
            <GraduationCap size={18} />
          </span>
          <span>
            Learn<span className="bg-gradient-to-r from-brand-400 to-indigo-400 bg-clip-text text-transparent">Hub</span>
          </span>
        </Link>

        <nav className="flex items-center gap-1 text-sm">
          <Link to="/courses" className="px-3 py-2 rounded-lg text-gray-300 hover:text-white hover:bg-white/5 transition-colors">
            Courses
          </Link>
          {isAdmin && (
            <Link to="/admin" className="flex items-center gap-1.5 px-3 py-2 rounded-lg text-gray-300 hover:text-white hover:bg-white/5 transition-colors">
              <LayoutDashboard size={15} /> Admin
            </Link>
          )}

          {user ? (
            <div className="flex items-center gap-2 ml-2">
              <span className="text-gray-400 hidden sm:inline text-xs">Hi, {user.name}</span>
              <button
                onClick={() => { logout(); navigate('/') }}
                className="flex items-center gap-1.5 bg-white/10 hover:bg-white/20 px-3 py-2 rounded-lg font-medium transition-colors"
              >
                <LogOut size={14} /> Log out
              </button>
            </div>
          ) : (
            <div className="flex items-center gap-2 ml-2">
              <Link to="/login" className="px-3 py-2 rounded-lg text-gray-300 hover:text-white hover:bg-white/5 transition-colors">
                Log in
              </Link>
              <Link
                to="/signup"
                className="bg-gradient-to-r from-brand-500 to-indigo-500 hover:from-brand-400 hover:to-indigo-400 px-4 py-2 rounded-lg font-semibold shadow-lg shadow-brand-500/20 transition-all"
              >
                Sign up free
              </Link>
            </div>
          )}
        </nav>
      </div>
    </header>
  )
}
