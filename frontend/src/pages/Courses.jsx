import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { ArrowRight, BookOpen } from 'lucide-react'
import api from '../api/client'

export default function Courses() {
  const [courses, setCourses] = useState([])
  const [loaded, setLoaded] = useState(false)

  useEffect(() => {
    api.get('/courses').then((res) => { setCourses(res.data); setLoaded(true) })
  }, [])

  return (
    <div className="max-w-6xl mx-auto px-4 py-12">
      <h1 className="text-3xl font-extrabold text-gray-900 mb-1">All Courses</h1>
      <p className="text-gray-500 mb-8">Pick a topic and start building.</p>

      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-5">
        {courses.map((c) => (
          <Link
            key={c.id}
            to={`/courses/${c.slug}`}
            className="group relative overflow-hidden rounded-2xl border border-gray-100 p-6 bg-white hover:shadow-xl hover:shadow-brand-500/10 hover:-translate-y-1 hover:border-brand-200 transition-all"
          >
            <div className="text-4xl mb-3">{c.icon}</div>
            <h2 className="font-bold text-lg text-gray-900">{c.title}</h2>
            <p className="text-gray-500 text-sm mt-1.5 line-clamp-2">{c.description}</p>
            <div className="flex items-center justify-between mt-5">
              <span className="text-xs font-medium text-gray-400 flex items-center gap-1">
                <BookOpen size={13} /> {c.lesson_count} {c.lesson_count === 1 ? 'lesson' : 'lessons'}
              </span>
              <ArrowRight size={16} className="text-brand-500 opacity-0 group-hover:opacity-100 -translate-x-1 group-hover:translate-x-0 transition-all" />
            </div>
          </Link>
        ))}
        {loaded && courses.length === 0 && (
          <p className="text-gray-500 col-span-full text-center py-12">No courses published yet. Check back soon!</p>
        )}
      </div>
    </div>
  )
}
