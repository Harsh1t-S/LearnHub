import { useEffect, useState } from 'react'
import { useParams, Link } from 'react-router-dom'
import { CheckCircle2, ChevronRight, PlayCircle } from 'lucide-react'
import api from '../api/client'

export default function CourseView() {
  const { slug } = useParams()
  const [course, setCourse] = useState(null)

  useEffect(() => {
    api.get(`/courses/${slug}`).then((res) => setCourse(res.data))
  }, [slug])

  if (!course) return <div className="max-w-4xl mx-auto px-4 py-10 text-gray-400">Loading...</div>

  return (
    <div className="max-w-4xl mx-auto px-4 py-12">
      <div className="flex items-center gap-3 mb-2">
        <span className="text-4xl">{course.icon}</span>
        <h1 className="text-3xl font-extrabold text-gray-900">{course.title}</h1>
      </div>
      <p className="text-gray-500 mb-8">{course.description}</p>

      <ol className="space-y-2.5">
        {course.lessons.map((l, i) => (
          <li key={l.id}>
            <Link
              to={`/lessons/${l.id}`}
              className="group flex items-center justify-between border border-gray-100 rounded-xl px-5 py-4 hover:border-brand-200 hover:bg-brand-50/40 hover:shadow-sm transition-all"
            >
              <span className="flex items-center gap-3">
                <PlayCircle size={18} className="text-brand-400 group-hover:text-brand-600 transition-colors" />
                <span className="text-gray-800 font-medium">{i + 1}. {l.title}</span>
              </span>
              <span className="flex items-center gap-2">
                {l.status === 'draft' && (
                  <span className="text-xs bg-yellow-100 text-yellow-700 px-2 py-0.5 rounded-full font-medium">Draft</span>
                )}
                <ChevronRight size={16} className="text-gray-300 group-hover:text-brand-500 group-hover:translate-x-0.5 transition-all" />
              </span>
            </Link>
          </li>
        ))}
        {course.lessons.length === 0 && <p className="text-gray-500">No lessons published yet.</p>}
      </ol>
    </div>
  )
}
