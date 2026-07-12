import { Link } from 'react-router-dom'
import { GraduationCap, Github, Twitter, Mail } from 'lucide-react'

export default function Footer() {
  return (
    <footer className="bg-gray-950 text-gray-400 mt-24">
      <div className="max-w-6xl mx-auto px-4 py-12 grid grid-cols-1 sm:grid-cols-3 gap-8">
        <div>
          <div className="flex items-center gap-2 font-extrabold text-xl text-white mb-3">
            <span className="flex items-center justify-center h-8 w-8 rounded-lg bg-gradient-to-br from-brand-500 to-indigo-500">
              <GraduationCap size={18} />
            </span>
            <span>Learn<span className="text-brand-400">Hub</span></span>
          </div>
          <p className="text-sm leading-relaxed max-w-xs">
            Free, hands-on tutorials with a live code playground — write once, publish instantly.
          </p>
        </div>

        <div>
          <p className="text-white font-semibold text-sm mb-3">Explore</p>
          <ul className="space-y-2 text-sm">
            <li><Link to="/courses" className="hover:text-white transition-colors">All courses</Link></li>
            <li><Link to="/signup" className="hover:text-white transition-colors">Become an instructor</Link></li>
            <li><Link to="/login" className="hover:text-white transition-colors">Log in</Link></li>
          </ul>
        </div>

        <div>
          <p className="text-white font-semibold text-sm mb-3">Connect</p>
          <div className="flex gap-3">
            <a href="#" className="h-9 w-9 flex items-center justify-center rounded-lg bg-white/5 hover:bg-white/10 transition-colors" title="GitHub">
              <Github size={16} />
            </a>
            <a href="#" className="h-9 w-9 flex items-center justify-center rounded-lg bg-white/5 hover:bg-white/10 transition-colors" title="Twitter">
              <Twitter size={16} />
            </a>
            <a href="#" className="h-9 w-9 flex items-center justify-center rounded-lg bg-white/5 hover:bg-white/10 transition-colors" title="Email">
              <Mail size={16} />
            </a>
          </div>
        </div>
      </div>
      <div className="border-t border-white/5 py-5 text-center text-xs text-gray-500">
        © {new Date().getFullYear()} LearnHub. Built for learning, not for scale (yet).
      </div>
    </footer>
  )
}
