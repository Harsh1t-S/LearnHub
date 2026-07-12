import { useEffect, useRef, useState } from 'react'
import { useParams, Link } from 'react-router-dom'
import { ArrowLeft, Plus, Save, UploadCloud, AlertCircle, History, X } from 'lucide-react'
import api from '../api/client'
import LessonEditor from '../components/LessonEditor'
import TryItEditor from '../components/TryItEditor'

function draftKey(lessonId) {
  return `learnhub_lesson_draft_${lessonId}`
}

const LANGUAGE_OPTIONS = [
  { key: 'html', label: 'HTML' },
  { key: 'css', label: 'CSS' },
  { key: 'js', label: 'JavaScript' },
  { key: 'python', label: 'Python' }
]

export default function AdminLessonEdit() {
  const { lessonId } = useParams()
  const [lesson, setLesson] = useState(null)
  const [content, setContent] = useState('')
  const [savedMsg, setSavedMsg] = useState('')
  const [error, setError] = useState('')
  const [restoredDraft, setRestoredDraft] = useState(false)
  const [playgroundLangs, setPlaygroundLangs] = useState(['html', 'css', 'js'])
  const [editorResetKey, setEditorResetKey] = useState(0)
  const saveTimer = useRef(null)

  const [question, setQuestion] = useState('')
  const [options, setOptions] = useState(['', ''])
  const [correctIndex, setCorrectIndex] = useState(0)

  function load() {
    api.get(`/lessons/${lessonId}`).then((res) => {
      setLesson(res.data)
      setPlaygroundLangs(res.data.playground_langs || ['html', 'css', 'js'])
      const serverContent = res.data.content_html || ''

      const raw = localStorage.getItem(draftKey(lessonId))
      if (raw) {
        try {
          const draft = JSON.parse(raw)
          if (draft.content && draft.content !== serverContent) {
            setContent(draft.content)
            setRestoredDraft(true)
            return
          }
        } catch { /* ignore corrupt draft */ }
      }
      setContent(serverContent)
    }).catch((err) => setError(err.response?.data?.error || 'Failed to load lesson'))
  }
  useEffect(load, [lessonId])

  function handleContentChange(html) {
    setContent(html)
    if (saveTimer.current) clearTimeout(saveTimer.current)
    saveTimer.current = setTimeout(() => {
      localStorage.setItem(draftKey(lessonId), JSON.stringify({ content: html, savedAt: Date.now() }))
    }, 600)
  }

  function discardLocalDraft() {
    localStorage.removeItem(draftKey(lessonId))
    setRestoredDraft(false)
    load()
    setEditorResetKey((k) => k + 1)
  }

  function toggleLanguage(key) {
    setPlaygroundLangs((prev) => (prev.includes(key) ? prev.filter((k) => k !== key) : [...prev, key]))
  }

  async function save(status) {
    setError('')
    try {
      await api.put(`/lessons/${lessonId}`, { content_html: content, status, playground_langs: playgroundLangs })
      localStorage.removeItem(draftKey(lessonId))
      setRestoredDraft(false)
      setSavedMsg(status === 'published' ? 'Published! Students can now see this lesson.' : 'Draft saved.')
      setTimeout(() => setSavedMsg(''), 3000)
      load()
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to save. Your text is still safe in this browser — try again.')
    }
  }

  function updateOption(i, value) {
    const next = [...options]
    next[i] = value
    setOptions(next)
  }

  async function addQuiz(e) {
    e.preventDefault()
    const cleanOptions = options.filter((o) => o.trim() !== '')
    if (!question.trim() || cleanOptions.length < 2) return
    try {
      await api.post(`/lessons/${lessonId}/quizzes`, { question, options: cleanOptions, correct_index: correctIndex })
      setQuestion(''); setOptions(['', '']); setCorrectIndex(0)
      load()
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to add quiz question.')
    }
  }

  if (error && !lesson) return <div className="max-w-3xl mx-auto px-4 py-10 text-red-600">{error}</div>
  if (!lesson) return <div className="max-w-4xl mx-auto px-4 py-10 text-gray-400">Loading...</div>

  return (
    <div className="max-w-4xl mx-auto px-4 py-12">
      <Link to={`/admin/courses/${lesson.course_id}`} className="inline-flex items-center gap-1.5 text-sm text-brand-700 hover:underline font-medium">
        <ArrowLeft size={14} /> Back to lessons
      </Link>
      <div className="flex items-center justify-between mt-3 mb-2 flex-wrap gap-3">
        <h1 className="text-3xl font-extrabold text-gray-900">{lesson.title}</h1>
        <div className="flex gap-2 items-center">
          <span className={`text-xs px-2.5 py-1 rounded-full font-medium ${lesson.status === 'published' ? 'bg-green-100 text-green-700' : 'bg-yellow-100 text-yellow-700'}`}>
            {lesson.status}
          </span>
          <button onClick={() => save('draft')} className="flex items-center gap-1.5 border border-gray-200 px-4 py-2 rounded-lg font-medium text-sm hover:bg-gray-50 transition-colors">
            <Save size={14} /> Save draft
          </button>
          <button onClick={() => save('published')} className="flex items-center gap-1.5 bg-gray-900 hover:bg-gray-800 text-white px-4 py-2 rounded-lg font-semibold text-sm transition-colors">
            <UploadCloud size={14} /> Publish
          </button>
        </div>
      </div>

      {error && (
        <p className="flex items-center gap-2 text-sm bg-red-50 text-red-700 border border-red-200 rounded-lg px-3 py-2 mb-3">
          <AlertCircle size={15} /> {error}
        </p>
      )}
      {savedMsg && <p className="text-green-700 text-sm mb-3 font-medium">{savedMsg}</p>}
      {restoredDraft && (
        <p className="flex items-center gap-2 text-sm bg-blue-50 text-blue-700 border border-blue-200 rounded-lg px-3 py-2 mb-3">
          <History size={15} />
          Restored unsaved changes from this browser.
          <button onClick={discardLocalDraft} className="ml-auto flex items-center gap-1 underline hover:no-underline">
            <X size={13} /> Discard, use last saved version
          </button>
        </p>
      )}

      <p className="text-sm text-gray-500 mb-3">
        Tip: write your lecture in Word/Google Docs, then paste the whole thing here — formatting carries over. Use the toolbar to drop in images, video, or attach any other file. Your work here autosaves to this browser as you type.
      </p>
      <LessonEditor key={editorResetKey} content={content} onChange={handleContentChange} />

      <div className="mt-10 border-t border-gray-100 pt-6">
        <h2 className="text-xl font-bold text-gray-900 mb-1">Try it Yourself playground</h2>
        <p className="text-sm text-gray-500 mb-3">
          Pick which languages are relevant to this lesson.
        </p>
        <div className="flex gap-2 mb-4">
          {LANGUAGE_OPTIONS.map((opt) => {
            const active = playgroundLangs.includes(opt.key)
            return (
              <button
                key={opt.key}
                type="button"
                onClick={() => toggleLanguage(opt.key)}
                className={`px-3 py-1.5 rounded-lg text-sm font-medium border transition-colors ${
                  active ? 'bg-brand-600 border-brand-600 text-white' : 'bg-white border-gray-200 text-gray-600 hover:bg-gray-50'
                }`}
              >
                {opt.label}
              </button>
            )
          })}
        </div>
        {playgroundLangs.length > 0 ? (
          <>
            <p className="text-xs text-gray-400 mb-2">Preview (save to apply to the published lesson):</p>
            <TryItEditor languages={playgroundLangs} />
          </>
        ) : (
          <p className="text-sm text-gray-400 italic">No playground for this lesson — nothing selected above.</p>
        )}
      </div>

      <div className="mt-10 border-t border-gray-100 pt-6">
        <h2 className="text-xl font-bold text-gray-900 mb-4">Quizzes ({lesson.quizzes?.length || 0})</h2>
        <ul className="space-y-2 mb-6">
          {lesson.quizzes?.map((q) => (
            <li key={q.id} className="border border-gray-100 rounded-lg p-3 text-sm bg-white">
              <p className="font-medium text-gray-800">{q.question}</p>
            </li>
          ))}
        </ul>
        <form onSubmit={addQuiz} className="rounded-xl border border-gray-100 p-4 space-y-3 bg-white">
          <input value={question} onChange={(e) => setQuestion(e.target.value)} placeholder="Quiz question"
            className="w-full border border-gray-200 rounded-lg px-3 py-2.5 focus:outline-none focus:ring-2 focus:ring-brand-400" />
          {options.map((o, i) => (
            <div key={i} className="flex items-center gap-2">
              <input type="radio" checked={correctIndex === i} onChange={() => setCorrectIndex(i)} title="Mark as correct answer" />
              <input value={o} onChange={(e) => updateOption(i, e.target.value)} placeholder={`Option ${i + 1}`}
                className="flex-1 border border-gray-200 rounded-lg px-3 py-2.5 focus:outline-none focus:ring-2 focus:ring-brand-400" />
            </div>
          ))}
          <button type="button" onClick={() => setOptions([...options, ''])} className="flex items-center gap-1 text-sm text-brand-700 hover:underline font-medium">
            <Plus size={14} /> Add option
          </button>
          <button className="block bg-gray-900 hover:bg-gray-800 text-white px-4 py-2 rounded-lg font-semibold text-sm transition-colors">
            Add quiz question
          </button>
        </form>
      </div>
    </div>
  )
}
