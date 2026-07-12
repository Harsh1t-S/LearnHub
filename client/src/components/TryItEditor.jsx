import { useState, useCallback, useRef, useEffect } from 'react'
import Editor from '@monaco-editor/react'
import { Play, Loader2, Circle } from 'lucide-react'

let pyodidePromise = null
function loadPyodide() {
  if (pyodidePromise) return pyodidePromise
  pyodidePromise = new Promise((resolve, reject) => {
    if (window.loadPyodide) return resolve(window.loadPyodide)
    const script = document.createElement('script')
    script.src = 'https://cdn.jsdelivr.net/pyodide/v0.26.2/full/pyodide.js'
    script.onload = () => resolve(window.loadPyodide)
    script.onerror = () => reject(new Error('Failed to load the Python runtime'))
    document.head.appendChild(script)
  })
  return pyodidePromise
}

const TAB_META = {
  html: { label: 'HTML', dot: 'bg-orange-400' },
  css: { label: 'CSS', dot: 'bg-blue-400' },
  js: { label: 'JS', dot: 'bg-yellow-400' },
  python: { label: 'Python', dot: 'bg-emerald-400' }
}

export default function TryItEditor({
  languages = ['html', 'css', 'js'],
  initialHtml = '<h1>Hello world</h1>',
  initialCss = 'h1 { color: #2563eb; }',
  initialJs = 'console.log("Hello from LearnHub!")',
  initialPython = 'name = "LearnHub"\nfor i in range(3):\n    print(f"Hello, {name}! ({i + 1})")',
  height = 260
}) {
  const [html, setHtml] = useState(languages.includes('html') ? initialHtml : '')
  const [css, setCss] = useState(languages.includes('css') ? initialCss : '')
  const [js, setJs] = useState(languages.includes('js') ? initialJs : '')
  const [python, setPython] = useState(languages.includes('python') ? initialPython : '')
  const allTabs = [
    { key: 'html', value: html, setter: setHtml, lang: 'html' },
    { key: 'css', value: css, setter: setCss, lang: 'css' },
    { key: 'js', value: js, setter: setJs, lang: 'javascript' },
    { key: 'python', value: python, setter: setPython, lang: 'python' }
  ]
  const tabs = allTabs.filter((t) => languages.includes(t.key))
  const [tab, setTab] = useState(tabs[0]?.key || 'js')
  const [srcDoc, setSrcDoc] = useState('')
  const [pyOutput, setPyOutput] = useState(null)
  const [pyLoading, setPyLoading] = useState(false)
  const [pyLoadingMsg, setPyLoadingMsg] = useState('')
  const pyodideRef = useRef(null)
  const [hasRunOnce, setHasRunOnce] = useState(false)

  const runWeb = useCallback(() => {
    const doc = `<!doctype html><html><head><style>${css}</style></head><body>${html}
<div id="__log" style="font-family:'JetBrains Mono',monospace;font-size:13px;white-space:pre-wrap;padding:8px;"></div>
<script>
  const __log = document.getElementById('__log');
  function __write(type, args) {
    const line = document.createElement('div');
    line.style.color = type === 'error' ? '#dc2626' : type === 'warn' ? '#d97706' : '#111827';
    line.textContent = Array.prototype.map.call(args, function (a) {
      try { return typeof a === 'object' ? JSON.stringify(a) : String(a); } catch (e) { return String(a); }
    }).join(' ');
    __log.appendChild(line);
  }
  const __origLog = console.log, __origErr = console.error, __origWarn = console.warn;
  console.log = function() { __write('log', arguments); __origLog.apply(console, arguments); };
  console.error = function() { __write('error', arguments); __origErr.apply(console, arguments); };
  console.warn = function() { __write('warn', arguments); __origWarn.apply(console, arguments); };
  try {
${js}
  } catch (e) { __write('error', [e.message]); }
<\/script></body></html>`
    setSrcDoc(doc)
  }, [html, css, js])

  const runPython = useCallback(async () => {
    setPyLoading(true)
    setPyOutput(null)
    try {
      if (!pyodideRef.current) {
        setPyLoadingMsg('Downloading Python runtime (first run only)...')
        const loadPyodideFn = await loadPyodide()
        pyodideRef.current = await loadPyodideFn({ indexURL: 'https://cdn.jsdelivr.net/pyodide/v0.26.2/full/' })
      }
      setPyLoadingMsg('Running...')
      const pyodide = pyodideRef.current
      let out = []
      pyodide.setStdout({ batched: (s) => out.push(s) })
      pyodide.setStderr({ batched: (s) => out.push(s) })
      try {
        await pyodide.runPythonAsync(python)
        setPyOutput({ text: out.join('\n'), error: false })
      } catch (err) {
        out.push(String(err.message || err))
        setPyOutput({ text: out.join('\n'), error: true })
      }
    } catch (err) {
      setPyOutput({ text: 'Could not start the Python runtime: ' + err.message, error: true })
    } finally {
      setPyLoading(false)
      setPyLoadingMsg('')
    }
  }, [python])

  const run = tab === 'python' ? runPython : runWeb

  function handleRunClick() {
    setHasRunOnce(true)
    run()
  }

  useEffect(() => {
    function onKey(e) {
      if ((e.metaKey || e.ctrlKey) && e.key === 'Enter') {
        e.preventDefault()
        handleRunClick()
      }
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [tab, html, css, js, python])

  const active = tabs.find((t) => t.key === tab) || tabs[0]
  if (!active) return null

  const isPython = tab === 'python'
  const isRunning = isPython && pyLoading

  return (
    <div className="not-prose rounded-2xl overflow-hidden my-6 shadow-xl shadow-gray-900/10 border border-gray-800/80 bg-gray-950">
      <div className="flex items-center justify-between bg-gradient-to-r from-gray-900 to-gray-950 text-gray-300 text-sm border-b border-gray-800">
        <div className="flex items-center pl-3 gap-1.5">
          <span className="h-2.5 w-2.5 rounded-full bg-red-500/70" />
          <span className="h-2.5 w-2.5 rounded-full bg-yellow-500/70" />
          <span className="h-2.5 w-2.5 rounded-full bg-green-500/70" />
          <div className="flex ml-3">
            {tabs.map((t) => (
              <button
                key={t.key}
                onClick={() => setTab(t.key)}
                className={`flex items-center gap-1.5 px-3.5 py-2.5 font-medium transition-colors border-b-2 ${
                  tab === t.key
                    ? 'bg-gray-950 text-white border-brand-500'
                    : 'border-transparent hover:bg-gray-800/60 hover:text-white'
                }`}
              >
                <Circle size={7} className={`${TAB_META[t.key].dot} fill-current`} />
                {TAB_META[t.key].label}
              </button>
            ))}
          </div>
        </div>
        <button
          onClick={handleRunClick}
          disabled={isRunning}
          title="Run (Ctrl/Cmd + Enter)"
          className="mr-2 my-1.5 flex items-center gap-1.5 px-4 py-1.5 bg-brand-600 hover:bg-brand-500 disabled:opacity-60 disabled:cursor-wait rounded-lg text-white font-semibold transition-colors shadow-sm shadow-brand-900/40"
        >
          {isRunning ? <Loader2 size={14} className="animate-spin" /> : <Play size={14} />}
          {isRunning ? 'Running' : 'Run'}
        </button>
      </div>

      <Editor
        height={height}
        language={active.lang}
        theme="vs-dark"
        value={active.value}
        onChange={(v) => active.setter(v || '')}
        options={{
          minimap: { enabled: false },
          fontSize: 13,
          wordWrap: 'on',
          padding: { top: 14 },
          fontFamily: "'JetBrains Mono', ui-monospace, monospace",
          smoothScrolling: true,
          cursorBlinking: 'smooth',
          scrollBeyondLastLine: false
        }}
      />

      <div className="border-t border-gray-800">
        <div className="bg-gray-950 text-[11px] text-gray-500 px-3 py-1.5 font-semibold tracking-widest uppercase flex items-center justify-between">
          <span>Result</span>
          {!hasRunOnce && <span className="normal-case font-normal text-gray-600">Press Run or Ctrl/Cmd + Enter</span>}
        </div>

        {isPython ? (
          <div className="bg-[#0b0f1a] min-h-[120px] max-h-[220px] overflow-auto font-mono text-[13px] px-4 py-3 whitespace-pre-wrap">
            {pyLoading && (
              <span className="text-gray-400 flex items-center gap-2">
                <Loader2 size={13} className="animate-spin" /> {pyLoadingMsg}
              </span>
            )}
            {!pyLoading && pyOutput && (
              <span className={pyOutput.error ? 'text-red-400' : 'text-gray-100'}>
                {pyOutput.text || <span className="text-gray-600 italic">(no output — try a print() statement)</span>}
              </span>
            )}
            {!pyLoading && !pyOutput && (
              <span className="text-gray-600 italic">Nothing run yet. This executes real CPython in your browser via WebAssembly.</span>
            )}
          </div>
        ) : (
          <iframe
            title="try-it-preview"
            srcDoc={srcDoc}
            sandbox="allow-scripts"
            className="w-full bg-white"
            style={{ height: 180 }}
          />
        )}
      </div>
    </div>
  )
}
