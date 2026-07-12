import { useEffect, useState } from 'react'
import { useParams, Link, useNavigate } from 'react-router-dom'
import { ArrowLeft, Plus, Trash2, AlertCircle } from 'lucide-react'
import api from '../api/client'

export default function AdminCourseManage() {
  const { courseId } = useParams()
  const navigate = useNavigate()
  const [course, setCourse] = useState(null)
  const [title, setTitle] = useState('')
  const [error, setError] = useState('')
  const [submitting, setSubmitting] = useState(false)

  const [allCourses, setAllCourses] = useState([])
  useEffect(() => {
    api.get('/courses').then((res) => {
      setAllCourses(res.data)
      const c = res.data.find((x) => String(x.id) === String(courseId))
      if (c) {
        api.get(`/courses/${c.slug}`).then((r) => setCourse(r.data))
      }
    })
  }, [courseId])

  function refresh() {
    const c = allCourses.find((x) => String(x.id) === String(courseId))
    if (c) api.get(`/courses/${c.slug}`).then((r) => setCourse(r.data))
  }

  async function createLesson(e) {
    e.preventDefault()
    if (!title.trim() || submitting) return
    setError('')
    setSubmitting(true)
    try {
      const { data } = await api.post('/lessons', { course_id: Number(courseId), title, content_html: '', status: 'draft' })
      setTitle('')
      navigate(`/admin/lessons/${data.id}`)
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to create lesson. Please try again.')
    } finally {
      setSubmitting(false)
    }
  }

  async function deleteLesson(id) {
    if (!confirm('Delete this lesson?')) return
    try {
      await api.delete(`/lessons/${id}`)
      refresh()
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to delete lesson.')
    }
  }

  if (!course) return <div className="max-w-4xl mx-auto px-4 py-10 text-gray-400">Loading...</div>

  return (
    <div className="max-w-4xl mx-auto px-4 py-12">
      <Link to="/admin" className="inline-flex items-center gap-1.5 text-sm text-brand-700 hover:underline font-medium">
        <ArrowLeft size={14} /> Back to courses
      </Link>
      <h1 className="text-3xl font-extrabold text-gray-900 mt-3 mb-6">{course.icon} {course.title} — Lessons</h1>

      {error && (
        <p className="flex items-center gap-2 text-sm bg-red-50 text-red-700 border border-red-200 rounded-lg px-3 py-2 mb-4">
          <AlertCircle size={15} /> {error}
        </p>
      )}

      <form onSubmit={createLesson} className="flex gap-2 mb-6">
        <input value={title} onChange={(e) => setTitle(e.target.value)} placeholder="New lesson title"
          className="flex-1 border border-gray-200 rounded-lg px-3.5 py-2.5 focus:outline-none focus:ring-2 focus:ring-brand-400" />
        <button disabled={submitting} className="flex items-center gap-1.5 bg-gray-900 hover:bg-gray-800 disabled:opacity-50 text-white px-4 py-2.5 rounded-lg font-semibold transition-colors">
          <Plus size={16} /> {submitting ? 'Creating...' : 'Add lesson'}
        </button>
      </form>

      <div className="space-y-2">
        {course.lessons.map((l) => (
          <div key={l.id} className="flex items-center justify-between rounded-xl border border-gray-100 px-4 py-3.5 bg-white hover:shadow-sm transition-shadow">
            <div className="flex items-center gap-2.5">
              <span className="text-gray-900 font-medium">{l.title}</span>
              <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${l.status === 'published' ? 'bg-green-100 text-green-700' : 'bg-yellow-100 text-yellow-700'}`}>
                {l.status}
              </span>
            </div>
            <div className="flex items-center gap-4">
              <Link to={`/admin/lessons/${l.id}`} className="text-brand-700 hover:underline text-sm font-semibold">Edit →</Link>
              <button onClick={() => deleteLesson(l.id)} className="text-gray-400 hover:text-red-600 transition-colors">
                <Trash2 size={15} />
              </button>
            </div>
          </div>
        ))}
        {course.lessons.length === 0 && <p className="text-gray-500">No lessons yet.</p>}
      </div>
    </div>
  )
}
