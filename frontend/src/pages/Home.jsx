import { useEffect, useState, useRef } from 'react'
import { Link } from 'react-router-dom'
import { ArrowRight, BookOpen, Code2, PenSquare, Sparkles, Trophy, UserPlus, FilePenLine, Rocket, Lock, Play } from 'lucide-react'
import api from '../api/client'
import { useAuth } from '../context/AuthContext'

const features = [
  {
    icon: PenSquare,
    title: 'Paste, don’t rebuild',
    desc: 'Write your lecture in Word or Docs, paste the whole thing in, and it publishes with formatting, headings, and lists intact.'
  },
  {
    icon: Code2,
    title: 'Live code playground',
    desc: 'Every lesson ships with a real HTML/CSS/JS editor and an actual in-browser Python runtime — students learn by doing, not just reading.'
  },
  {
    icon: Trophy,
    title: 'Quizzes & progress',
    desc: 'Drop in quiz questions and let students track completion as they move through a course.'
  }
]

const steps = [
  {
    icon: UserPlus,
    title: '1. Sign up as an instructor',
    desc: 'Create an account with an instructor invite code and you can publish immediately — no approval queue.'
  },
  {
    icon: FilePenLine,
    title: '2. Write like you already do',
    desc: 'Paste your lecture from Word or Docs, drag in images and video anywhere, or embed a YouTube clip.'
  },
  {
    icon: Rocket,
    title: '3. Publish and it’s live',
    desc: 'Students see it instantly with a working code playground and quizzes — no build step, no waiting.'
  }
]

const ROTATING_WORDS = ['the easy way.', 'by doing.', 'without the fluff.', 'at your own pace.']

const DEMO_CODE = `def greet(name):
    return f"Hello, {name}! Welcome to LearnHub."

print(greet("future developer"))`

function useTypewriter(words, { typeSpeed = 55, pause = 1400, deleteSpeed = 30 } = {}) {
  const [text, setText] = useState('')
  const [wordIndex, setWordIndex] = useState(0)
  const [deleting, setDeleting] = useState(false)

  useEffect(() => {
    const current = words[wordIndex % words.length]
    let timeout
    if (!deleting && text === current) {
      timeout = setTimeout(() => setDeleting(true), pause)
    } else if (deleting && text === '') {
      setDeleting(false)
      setWordIndex((i) => i + 1)
    } else {
      timeout = setTimeout(() => {
        setText((t) => (deleting ? current.slice(0, t.length - 1) : current.slice(0, t.length + 1)))
      }, deleting ? deleteSpeed : typeSpeed)
    }
    return () => clearTimeout(timeout)
  }, [text, deleting, wordIndex, words, typeSpeed, pause, deleteSpeed])

  return text
}

function useCountUp(target, active, duration = 1200) {
  const [value, setValue] = useState(0)
  const startRef = useRef(null)
  useEffect(() => {
    if (!active) return
    let frame
    function step(ts) {
      if (!startRef.current) startRef.current = ts
      const progress = Math.min((ts - startRef.current) / duration, 1)
      setValue(Math.floor(progress * target))
      if (progress < 1) frame = requestAnimationFrame(step)
    }
    frame = requestAnimationFrame(step)
    return () => cancelAnimationFrame(frame)
  }, [active, target, duration])
  return value
}

function StatsBand() {
  const [visible, setVisible] = useState(false)
  const ref = useRef(null)
  useEffect(() => {
    const obs = new IntersectionObserver(([entry]) => entry.isIntersecting && setVisible(true), { threshold: 0.4 })
    if (ref.current) obs.observe(ref.current)
    return () => obs.disconnect()
  }, [])
  const lessons = useCountUp(8, visible)
  const langs = useCountUp(4, visible)
  const minutes = useCountUp(5, visible)

  return (
    <div ref={ref} className="grid grid-cols-3 divide-x divide-gray-800 max-w-lg mx-auto text-center">
      <div className="px-4">
        <div className="text-3xl font-extrabold text-white">{lessons}+</div>
        <div className="text-xs text-gray-400 mt-1">lessons live</div>
      </div>
      <div className="px-4">
        <div className="text-3xl font-extrabold text-white">{langs}</div>
        <div className="text-xs text-gray-400 mt-1">languages covered</div>
      </div>
      <div className="px-4">
        <div className="text-3xl font-extrabold text-white">&lt;{minutes}</div>
        <div className="text-xs text-gray-400 mt-1">min to publish</div>
      </div>
    </div>
  )
}

export default function Home() {
  const [courses, setCourses] = useState([])
  const { user } = useAuth()
  const typed = useTypewriter(ROTATING_WORDS)

  useEffect(() => {
    api.get('/courses').then((res) => setCourses(res.data.slice(0, 3))).catch(() => {})
  }, [])

  return (
    <div>
      <section className="hero-gradient border-b border-gray-100">
        <div className="max-w-5xl mx-auto px-4 py-24 text-center">
          <span className="animate-fade-up inline-flex items-center gap-1.5 text-xs font-semibold text-brand-700 bg-brand-50 border border-brand-100 px-3 py-1 rounded-full mb-6">
            <Sparkles size={13} /> Built for instructors who'd rather teach than fight with a CMS
          </span>
          <h1 className="animate-fade-up text-5xl sm:text-6xl font-extrabold tracking-tight text-gray-900" style={{ animationDelay: '80ms' }}>
            Learn to code,
            <br />
            <span className="bg-gradient-to-r from-brand-600 to-indigo-600 bg-clip-text text-transparent">
              {typed}
              <span className="inline-block w-[3px] h-[0.9em] bg-brand-500 ml-1 align-middle animate-pulse" />
            </span>
          </h1>
          <p className="animate-fade-up text-lg text-gray-600 mt-6 max-w-2xl mx-auto" style={{ animationDelay: '160ms' }}>
            Free tutorials, live code editors, and quizzes — written, published, and hosted right here.
          </p>
          <div className="animate-fade-up flex items-center justify-center gap-3 mt-9" style={{ animationDelay: '240ms' }}>
            <Link
              to="/courses"
              className="inline-flex items-center gap-2 bg-gray-900 hover:bg-gray-800 text-white px-6 py-3.5 rounded-xl font-semibold shadow-lg shadow-gray-900/10 transition-transform hover:scale-[1.02]"
            >
              Start learning <ArrowRight size={18} />
            </Link>
            <Link
              to="/signup"
              className="inline-flex items-center gap-2 bg-white border border-gray-200 hover:border-gray-300 text-gray-800 px-6 py-3.5 rounded-xl font-semibold transition-colors"
            >
              Become an instructor
            </Link>
          </div>
        </div>
      </section>

      {courses.length > 0 && (
        <section className="max-w-6xl mx-auto px-4 py-16 border-b border-gray-100">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-extrabold text-gray-900">Featured courses</h2>
            <Link to="/courses" className="text-sm font-semibold text-brand-700 hover:underline flex items-center gap-1">
              View all <ArrowRight size={14} />
            </Link>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-5">
            {courses.map((c) => (
              <Link
                key={c.id}
                to={`/courses/${c.slug}`}
                className="group relative overflow-hidden rounded-2xl border border-gray-100 p-6 bg-white hover:shadow-xl hover:shadow-brand-500/10 hover:-translate-y-1 hover:border-brand-200 transition-all"
              >
                <div className="text-4xl mb-3">{c.icon}</div>
                <h3 className="font-bold text-lg text-gray-900">{c.title}</h3>
                <p className="text-gray-500 text-sm mt-1.5 line-clamp-2">{c.description}</p>
                <div className="flex items-center justify-between mt-5">
                  <span className="text-xs font-medium text-gray-400 flex items-center gap-1">
                    <BookOpen size={13} /> {c.lesson_count} {c.lesson_count === 1 ? 'lesson' : 'lessons'}
                  </span>
                  <ArrowRight size={16} className="text-brand-500 opacity-0 group-hover:opacity-100 -translate-x-1 group-hover:translate-x-0 transition-all" />
                </div>
              </Link>
            ))}
          </div>
        </section>
      )}

      <section className="max-w-4xl mx-auto px-4 py-20">
        <div className="text-center mb-8">
          <h2 className="text-2xl font-extrabold text-gray-900 mb-2">This is the actual editor</h2>
          <p className="text-gray-500">Not a mockup — the same playground every lesson ships with. Sign up to type in it yourself.</p>
        </div>
        <div className="relative rounded-2xl overflow-hidden shadow-2xl shadow-gray-900/20 border border-gray-800">
          <div className="flex items-center gap-1.5 bg-gray-900 px-4 py-2.5">
            <span className="h-2.5 w-2.5 rounded-full bg-red-500/70" />
            <span className="h-2.5 w-2.5 rounded-full bg-yellow-500/70" />
            <span className="h-2.5 w-2.5 rounded-full bg-green-500/70" />
            <span className="ml-3 text-xs text-gray-400 font-mono">lesson.py</span>
          </div>
          <pre className="bg-[#0b0f1a] text-gray-100 font-mono text-sm p-6 overflow-x-auto leading-relaxed">
            <code>{DEMO_CODE}</code>
          </pre>
          {!user && (
            <div className="absolute inset-0 bg-gradient-to-t from-gray-950/95 via-gray-950/40 to-transparent flex flex-col items-center justify-end pb-8 text-center">
              <Link
                to="/signup"
                className="inline-flex items-center gap-2 bg-white hover:bg-gray-100 text-gray-900 px-5 py-2.5 rounded-xl font-semibold text-sm shadow-lg transition-transform hover:scale-[1.02]"
              >
                <Lock size={14} /> Sign up to run this <Play size={14} />
              </Link>
            </div>
          )}
        </div>
      </section>

      <section className="max-w-6xl mx-auto px-4 py-20">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {features.map(({ icon: Icon, title, desc }) => (
            <div
              key={title}
              className="group rounded-2xl border border-gray-100 p-6 hover:border-brand-200 hover:shadow-xl hover:shadow-brand-500/5 transition-all bg-white"
            >
              <div className="h-11 w-11 rounded-xl bg-gradient-to-br from-brand-500 to-indigo-500 flex items-center justify-center text-white mb-4 group-hover:scale-110 transition-transform">
                <Icon size={20} />
              </div>
              <h3 className="font-bold text-lg text-gray-900 mb-1.5">{title}</h3>
              <p className="text-gray-600 text-sm leading-relaxed">{desc}</p>
            </div>
          ))}
        </div>
      </section>

      <section className="bg-gray-50 border-y border-gray-100 py-20">
        <div className="max-w-5xl mx-auto px-4">
          <h2 className="text-2xl font-extrabold text-gray-900 text-center mb-2">From blank page to published lesson</h2>
          <p className="text-gray-500 text-center mb-12">Three steps. No CMS to fight with.</p>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 relative">
            {steps.map(({ icon: Icon, title, desc }, i) => (
              <div key={title} className="relative text-center">
                <div className="h-14 w-14 mx-auto rounded-2xl bg-white border border-gray-200 shadow-sm flex items-center justify-center text-brand-600 mb-4">
                  <Icon size={22} />
                </div>
                <h3 className="font-bold text-gray-900 mb-1.5">{title}</h3>
                <p className="text-gray-500 text-sm leading-relaxed max-w-xs mx-auto">{desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="bg-gray-950 py-16">
        <div className="max-w-3xl mx-auto px-4 text-center mb-12">
          <StatsBand />
        </div>
        <div className="max-w-3xl mx-auto px-4 text-center">
          <h2 className="text-3xl font-extrabold text-white mb-3">Got something to teach?</h2>
          <p className="text-gray-400 mb-8">Sign up, paste your first lecture, and it's live in under five minutes.</p>
          <Link
            to="/signup"
            className="inline-flex items-center gap-2 bg-gradient-to-r from-brand-500 to-indigo-500 hover:from-brand-400 hover:to-indigo-400 text-white px-7 py-3.5 rounded-xl font-semibold shadow-lg shadow-brand-500/20 transition-transform hover:scale-[1.02]"
          >
            Become an instructor <ArrowRight size={18} />
          </Link>
        </div>
      </section>
    </div>
  )
}
