import { useEffect, useState } from 'react'
import { useParams, Link } from 'react-router-dom'
import { CheckCircle2, Lock, LogIn, UserPlus, Sparkles } from 'lucide-react'
import api from '../api/client'
import { useAuth } from '../context/AuthContext'
import Quiz from '../components/Quiz'
import TryItEditor from '../components/TryItEditor'

export default function LessonView() {
  const { id } = useParams()
  const { user } = useAuth()
  const [lesson, setLesson] = useState(null)
  const [completed, setCompleted] = useState(false)
  const [error, setError] = useState('')

  useEffect(() => {
    setLesson(null)
    setCompleted(false)
    api.get(`/lessons/${id}`)
      .then((res) => setLesson(res.data))
      .catch((err) => setError(err.response?.data?.error || 'Failed to load lesson'))
  }, [id])

  async function markComplete() {
    await api.post(`/progress/${id}/complete`)
    setCompleted(true)
  }

  if (error) return <div className="max-w-3xl mx-auto px-4 py-10 text-red-600">{error}</div>
  if (!lesson) return <div className="max-w-3xl mx-auto px-4 py-10 text-gray-400">Loading...</div>

  if (lesson.requiresAuth) {
    return (
      <div className="max-w-3xl mx-auto px-4 py-12">
        <h1 className="text-3xl font-extrabold text-gray-900 mb-8">{lesson.title}</h1>
        <div className="relative rounded-2xl border border-gray-200 overflow-hidden">
          <div className="px-8 py-5 select-none pointer-events-none blur-sm opacity-60">
            <div className="h-5 w-2/3 bg-gray-300 rounded mb-4" />
            <div className="h-3 w-full bg-gray-200 rounded mb-2.5" />
            <div className="h-3 w-11/12 bg-gray-200 rounded mb-2.5" />
            <div className="h-3 w-4/5 bg-gray-200 rounded mb-6" />
            <div className="h-28 w-full bg-gray-900/90 rounded-xl mb-4" />
            <div className="h-3 w-full bg-gray-200 rounded mb-2.5" />
            <div className="h-3 w-3/5 bg-gray-200 rounded" />
          </div>
          <div className="absolute inset-0 bg-gradient-to-b from-white/10 via-white/70 to-white flex flex-col items-center justify-center text-center px-6">
            <div className="h-12 w-12 rounded-full bg-brand-50 border border-brand-100 flex items-center justify-center text-brand-600 mb-4">
              <Lock size={20} />
            </div>
            <h2 className="text-lg font-bold text-gray-900 mb-1.5">Sign up free to keep reading</h2>
            <p className="text-sm text-gray-500 max-w-xs mb-5">
              Lesson content, the live code playground, and quizzes are unlocked once you're signed in — takes about 20 seconds.
            </p>
            <div className="flex items-center gap-2.5">
              <Link
                to="/signup"
                className="inline-flex items-center gap-1.5 bg-gray-900 hover:bg-gray-800 text-white px-5 py-2.5 rounded-xl font-semibold text-sm shadow-lg shadow-gray-900/10 transition-transform hover:scale-[1.02]"
              >
                <UserPlus size={15} /> Sign up free
              </Link>
              <Link
                to="/login"
                className="inline-flex items-center gap-1.5 bg-white border border-gray-200 hover:border-gray-300 text-gray-800 px-5 py-2.5 rounded-xl font-semibold text-sm transition-colors"
              >
                <LogIn size={15} /> Log in
              </Link>
            </div>
            <p className="text-xs text-gray-400 mt-4 flex items-center gap-1">
              <Sparkles size={12} /> Free forever for students
            </p>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="max-w-3xl mx-auto px-4 py-12">
      <div className="flex items-center gap-2 mb-1">
        <h1 className="text-3xl font-extrabold text-gray-900">{lesson.title}</h1>
        {lesson.status === 'draft' && (
          <span className="text-xs bg-yellow-100 text-yellow-700 px-2 py-0.5 rounded-full font-medium">Draft preview</span>
        )}
      </div>

      <div className="lesson-content prose max-w-none mt-8" dangerouslySetInnerHTML={{ __html: lesson.content_html }} />

      {lesson.playground_langs?.length > 0 && (
        <>
          <h3 className="text-xl font-bold text-gray-900 mt-10 mb-3">Try it Yourself »</h3>
          <TryItEditor languages={lesson.playground_langs} />
        </>
      )}

      {lesson.quizzes?.map((q) => <Quiz key={q.id} quiz={q} />)}

      {user && (
        <button
          onClick={markComplete}
          disabled={completed}
          className={`mt-8 inline-flex items-center gap-2 px-6 py-3 rounded-xl font-semibold transition-all ${
            completed
              ? 'bg-green-50 text-green-700 border border-green-200'
              : 'bg-gray-900 hover:bg-gray-800 text-white shadow-lg shadow-gray-900/10 hover:scale-[1.02]'
          }`}
        >
          <CheckCircle2 size={18} /> {completed ? 'Completed' : 'Mark as complete'}
        </button>
      )}
    </div>
  )
}
