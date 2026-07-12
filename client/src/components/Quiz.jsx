import { useState } from 'react'
import { Brain, CheckCircle2, XCircle } from 'lucide-react'
import api from '../api/client'
import { useAuth } from '../context/AuthContext'

export default function Quiz({ quiz }) {
  const { user } = useAuth()
  const [selected, setSelected] = useState(null)
  const [result, setResult] = useState(null)
  const options = typeof quiz.options === 'string' ? JSON.parse(quiz.options) : quiz.options

  async function submit() {
    if (selected == null) return
    if (!user) {
      setResult({ error: 'Log in to submit your answer.' })
      return
    }
    const { data } = await api.post(`/lessons/quizzes/${quiz.id}/attempt`, { selected_index: selected })
    setResult(data)
  }

  return (
    <div className="not-prose rounded-2xl border border-gray-100 p-5 my-8 bg-gradient-to-br from-brand-50/60 to-indigo-50/40">
      <p className="flex items-center gap-2 font-bold text-gray-900 mb-4">
        <Brain size={18} className="text-brand-600" /> Quick check: {quiz.question}
      </p>
      <div className="space-y-2">
        {options.map((opt, i) => (
          <label
            key={i}
            className={`flex items-center gap-2.5 px-3 py-2.5 rounded-lg border cursor-pointer transition-colors ${
              selected === i ? 'border-brand-400 bg-white' : 'border-transparent hover:bg-white/60'
            }`}
          >
            <input type="radio" name={`quiz-${quiz.id}`} checked={selected === i} onChange={() => setSelected(i)} />
            <span className="text-sm text-gray-800">{opt}</span>
          </label>
        ))}
      </div>
      <button
        onClick={submit}
        className="mt-4 bg-gray-900 hover:bg-gray-800 text-white px-5 py-2 rounded-lg text-sm font-semibold transition-colors"
      >
        Submit answer
      </button>
      {result && !result.error && (
        <p className={`mt-3 flex items-center gap-1.5 text-sm font-medium ${result.correct ? 'text-green-600' : 'text-red-600'}`}>
          {result.correct ? <CheckCircle2 size={16} /> : <XCircle size={16} />}
          {result.correct ? 'Correct!' : `Not quite. The correct answer was: ${options[result.correct_index]}`}
        </p>
      )}
      {result?.error && <p className="mt-3 text-sm text-red-600">{result.error}</p>}
    </div>
  )
}
