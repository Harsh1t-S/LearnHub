import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { Plus, Trash2, AlertCircle } from 'lucide-react'
import api from '../api/client'

export default function Admin() {
  const [courses, setCourses] = useState([])
  const [title, setTitle] = useState('')
  const [description, setDescription] = useState('')
  const [icon, setIcon] = useState('📘')
  const [error, setError] = useState('')
  const [submitting, setSubmitting] = useState(false)

  function load() {
    api.get('/courses').then((res) => setCourses(res.data)).catch(() => {})
  }
  useEffect(load, [])

  async function createCourse(e) {
    e.preventDefault()
    if (!title.trim() || submitting) return
    setError('')
    setSubmitting(true)
    try {
      await api.post('/courses', { title, description, icon })
      setTitle(''); setDescription(''); setIcon('📘')
      load()
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to create course. Please try again.')
    } finally {
      setSubmitting(false)
    }
  }

  async function deleteCourse(id) {
    if (!confirm('Delete this course and all its lessons?')) return
    try {
      await api.delete(`/courses/${id}`)
      load()
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to delete course.')
    }
  }

  return (
    <div className="max-w-4xl mx-auto px-4 py-12">
      <h1 className="text-3xl font-extrabold text-gray-900 mb-1">Admin Dashboard</h1>
      <p className="text-gray-500 mb-8">Create courses, then add and publish lessons inside them.</p>

      {error && (
        <p className="flex items-center gap-2 text-sm bg-red-50 text-red-700 border border-red-200 rounded-lg px-3 py-2 mb-4">
          <AlertCircle size={15} /> {error}
        </p>
      )}

      <form onSubmit={createCourse} className="rounded-2xl border border-gray-100 shadow-sm p-5 mb-8 flex gap-3 flex-wrap items-end bg-white">
        <div>
          <label className="block text-xs font-medium text-gray-500 mb-1">Icon</label>
          <input value={icon} onChange={(e) => setIcon(e.target.value)} className="w-16 border border-gray-200 rounded-lg px-2 py-2.5 text-center focus:outline-none focus:ring-2 focus:ring-brand-400" />
        </div>
        <div className="flex-1 min-w-[160px]">
          <label className="block text-xs font-medium text-gray-500 mb-1">Course title</label>
          <input value={title} onChange={(e) => setTitle(e.target.value)} className="w-full border border-gray-200 rounded-lg px-3 py-2.5 focus:outline-none focus:ring-2 focus:ring-brand-400" placeholder="e.g. Python Basics" />
        </div>
        <div className="flex-1 min-w-[200px]">
          <label className="block text-xs font-medium text-gray-500 mb-1">Description</label>
          <input value={description} onChange={(e) => setDescription(e.target.value)} className="w-full border border-gray-200 rounded-lg px-3 py-2.5 focus:outline-none focus:ring-2 focus:ring-brand-400" placeholder="Short description" />
        </div>
        <button disabled={submitting} className="flex items-center gap-1.5 bg-gray-900 hover:bg-gray-800 disabled:opacity-50 text-white px-4 py-2.5 rounded-lg font-semibold transition-colors">
          <Plus size={16} /> {submitting ? 'Adding...' : 'Add course'}
        </button>
      </form>

      <div className="space-y-3">
        {courses.map((c) => (
          <div key={c.id} className="flex items-center justify-between rounded-xl border border-gray-100 p-4 hover:shadow-sm transition-shadow bg-white">
            <div>
              <p className="font-semibold text-gray-900">{c.icon} {c.title}</p>
              <p className="text-sm text-gray-400">{c.lesson_count} {c.lesson_count === 1 ? 'lesson' : 'lessons'}</p>
            </div>
            <div className="flex items-center gap-4">
              <Link to={`/admin/courses/${c.id}`} className="text-brand-700 hover:underline text-sm font-semibold">Manage lessons →</Link>
              <button onClick={() => deleteCourse(c.id)} className="text-gray-400 hover:text-red-600 transition-colors">
                <Trash2 size={16} />
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
