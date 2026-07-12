import { NavLink } from 'react-router-dom'

export default function Sidebar({ courses }) {
  return (
    <aside className="w-60 shrink-0 border-r border-gray-100 bg-gray-50/60 h-[calc(100vh-4rem)] sticky top-16 overflow-y-auto py-4 hidden md:block">
      <p className="px-4 text-xs font-semibold uppercase tracking-wider text-gray-400 mb-2">Courses</p>
      <ul className="text-sm">
        {courses.map((c) => (
          <li key={c.id} className="px-2">
            <NavLink
              to={`/courses/${c.slug}`}
              className={({ isActive }) =>
                `flex items-center gap-2.5 px-3 py-2 rounded-lg mb-0.5 transition-colors ${
                  isActive
                    ? 'bg-brand-100/70 text-brand-800 font-semibold border-l-2 border-brand-600'
                    : 'text-gray-600 hover:bg-white hover:text-gray-900 border-l-2 border-transparent'
                }`
              }
            >
              <span>{c.icon}</span>
              <span>{c.title}</span>
            </NavLink>
          </li>
        ))}
      </ul>
    </aside>
  )
}
