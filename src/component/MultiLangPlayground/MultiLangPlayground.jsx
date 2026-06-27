/**
 * MultiLangPlayground
 * -------------------
 * Allows visitors to write and run code in JavaScript, Python, and Java
 * directly in the browser — no backend required.
 *
 * Execution strategy:
 *   - JavaScript → safe eval() inside try/catch with console.log capture
 *   - Python      → Pyodide (WebAssembly runtime, loaded lazily on first use)
 *   - Java        → Mock simulation (placeholder — no API key needed)
 *
 * This component is self-contained and can be dropped into any React project.
 */

import Editor from '@monaco-editor/react'
import PropTypes from 'prop-types'
import { useCallback, useEffect, useRef, useState } from 'react'
import { FiChevronDown, FiCode, FiPlay, FiRefreshCw, FiSquare } from 'react-icons/fi'
import { SiJavascript, SiPython } from 'react-icons/si'

// ---------------------------------------------------------------------------
// Constants
// ---------------------------------------------------------------------------

/** Default starter code shown when a language is selected */
const DEFAULT_CODE = {
  javascript: `// JavaScript — runs instantly in the browser via eval()
console.log("Hello JS");

// Try some more:
const add = (a, b) => a + b;
console.log("2 + 3 =", add(2, 3));
`,
  python: `# Python — powered by Pyodide (WebAssembly)
# First run takes ~5-10s to load the Python runtime
print("Hello Python")

# Try some more:
numbers = [1, 2, 3, 4, 5]
print("Sum:", sum(numbers))
`,
  java: `// Java — executed via Piston API (real JVM)
import java.util.*;

public class Main {
    public static void main(String[] args) {
        // Declaring array
        int arr[] = {20, 10, 20, 4, 100};

        // Creating new list
        List<Integer> list = new ArrayList<>();

        // Adding elements in list
        for (int i = 0; i < arr.length; i++)
            list.add(arr[i]);

        // Using the method to find the maximum element
        System.out.println(Collections.max(list));
    }
}
`,
}

/** Language display metadata */
const LANGUAGES = [
  {
    id: 'javascript',
    label: 'JavaScript',
    monacoLang: 'javascript',
    Icon: SiJavascript,
    color: '#38bdf8',
    bgColor: 'rgba(56,189,248,0.1)',
    borderColor: 'rgba(56,189,248,0.4)',
  },
  {
    id: 'python',
    label: 'Python',
    monacoLang: 'python',
    Icon: SiPython,
    color: '#3776AB',
    bgColor: 'rgba(55,118,171,0.1)',
    borderColor: 'rgba(55,118,171,0.4)',
  },
]

/**
 * Available versions per language.
 * `note` is shown as a tooltip/badge when the runtime diverges from the label.
 */
const LANGUAGE_VERSIONS = {
  javascript: [
    { label: 'ES2024 (Latest)', value: 'es2024' },
    { label: 'ES2022', value: 'es2022' },
    { label: 'ES2020', value: 'es2020' },
    { label: 'ES2017', value: 'es2017' },
    { label: 'ES6 / ES2015', value: 'es2015' },
    { label: 'ES5', value: 'es5' },
  ],
  python: [
    { label: 'Python 3.12', value: '3.12', note: 'Runs as 3.11 (Pyodide)' },
    { label: 'Python 3.11 ★', value: '3.11' },
    { label: 'Python 3.10', value: '3.10', note: 'Runs as 3.11 (Pyodide)' },
    { label: 'Python 3.9', value: '3.9', note: 'Runs as 3.11 (Pyodide)' },
    { label: 'Python 3.8', value: '3.8', note: 'Runs as 3.11 (Pyodide)' },
    { label: 'Python 2.7 (Legacy)', value: '2.7', note: 'Runs as 3.11 (Pyodide)' },
  ],
}

/** Default version selected for each language */
const DEFAULT_VERSIONS = {
  javascript: 'es2024',
  python: '3.11',
}

/** Runtime governance controls */
const MAX_OUTPUT_LINES = 300
const MAX_OUTPUT_LINE_LENGTH = 2_000
const TELEMETRY_STORAGE_KEY = 'portfolio.playground.telemetry.v1'
const PISTON_PRIMARY_EXECUTE_URL = 'https://emkc.org/api/v2/piston/execute'

/** Per-language runtime isolation profiles */
const EXECUTION_PROFILES = {
  javascript: {
    maxCodeSize: 50_000,
    maxOutputLines: 300,
    maxOutputLineLength: 2_000,
    timeoutMs: 5_000,
  },
  python: {
    maxCodeSize: 30_000,
    maxOutputLines: 250,
    maxOutputLineLength: 2_000,
    timeoutMs: 15_000,
  },
  java: {
    maxCodeSize: 40_000,
    maxOutputLines: 300,
    maxOutputLineLength: 2_000,
    timeoutMs: 10_000,
  },
}

const INITIAL_TELEMETRY = {
  javascript: { runs: 0, success: 0, error: 0, timeouts: 0, stops: 0 },
  python: { runs: 0, success: 0, error: 0, timeouts: 0, stops: 0 },
  java: { runs: 0, success: 0, error: 0, timeouts: 0, stops: 0 },
}

const loadPersistedTelemetry = () => {
  try {
    const localRaw = window.localStorage.getItem(TELEMETRY_STORAGE_KEY)
    if (localRaw) {
      return { ...INITIAL_TELEMETRY, ...JSON.parse(localRaw) }
    }
  } catch {
    // ignore storage errors
  }

  try {
    const sessionRaw = window.sessionStorage.getItem(TELEMETRY_STORAGE_KEY)
    if (sessionRaw) {
      return { ...INITIAL_TELEMETRY, ...JSON.parse(sessionRaw) }
    }
  } catch {
    // ignore storage errors
  }

  return { ...INITIAL_TELEMETRY }
}

// ---------------------------------------------------------------------------
// Language Tab Button
// ---------------------------------------------------------------------------

const LanguageTab = ({ lang, isActive, onClick }) => {
  const { Icon, label, color, bgColor, borderColor } = lang

  return (
    <button
      onClick={() => onClick(lang.id)}
      className="flex items-center gap-2 px-4 py-2 rounded-lg font-semibold text-sm transition-all duration-300 border"
      style={{
        background: isActive ? bgColor : 'transparent',
        borderColor: isActive ? borderColor : 'rgba(255,255,255,0.1)',
        color: isActive ? color : '#9ca3af',
        boxShadow: isActive ? `0 0 12px ${bgColor}` : 'none',
        transform: isActive ? 'translateY(-1px)' : 'none',
      }}
      aria-pressed={isActive}
      aria-label={`Select ${label}`}
    >
      <Icon size={16} style={{ color: isActive ? color : '#9ca3af' }} />
      {label}
    </button>
  )
}

LanguageTab.propTypes = {
  lang: PropTypes.shape({
    id: PropTypes.string,
    label: PropTypes.string,
    Icon: PropTypes.elementType,
    color: PropTypes.string,
    bgColor: PropTypes.string,
    borderColor: PropTypes.string,
  }).isRequired,
  isActive: PropTypes.bool.isRequired,
  onClick: PropTypes.func.isRequired,
}

// ---------------------------------------------------------------------------
// Version Selector Dropdown
// ---------------------------------------------------------------------------

/**
 * A styled <select> dropdown that lists the available versions for the
 * currently selected language. Matches the dark terminal aesthetic.
 */
const VersionSelector = ({ language, version, onChange, activeLang }) => {
  const versions = LANGUAGE_VERSIONS[language] ?? []
  const selected = versions.find((v) => v.value === version)

  return (
    <div className="relative flex items-center">
      {/* Dropdown wrapper — gives us the custom arrow */}
      <div
        className="relative flex items-center gap-1.5 rounded-lg border px-3 py-1.5 text-xs font-mono cursor-pointer transition-all duration-200 hover:border-white/30"
        style={{
          borderColor: 'rgba(255,255,255,0.12)',
          background: 'rgba(255,255,255,0.04)',
          color: activeLang.color,
          minWidth: '160px',
        }}
      >
        {/* Version label prefix */}
        <span className="text-gray-500 shrink-0">v</span>

        {/* Native select — positioned on top of our styled container */}
        <select
          value={version}
          onChange={(e) => onChange(e.target.value)}
          aria-label={`Select ${language} version`}
          className="absolute inset-0 w-full opacity-0 cursor-pointer"
          style={{ zIndex: 1 }}
        >
          {versions.map((v) => (
            <option key={v.value} value={v.value}>
              {v.label}{v.note ? ` (${v.note})` : ''}
            </option>
          ))}
        </select>

        {/* Display label */}
        <span className="flex-1 truncate" style={{ color: activeLang.color }}>
          {selected?.label ?? version}
        </span>

        {/* Chevron icon */}
        <FiChevronDown size={12} className="shrink-0" style={{ color: activeLang.color, opacity: 0.7 }} />
      </div>

      {/* Note badge — appears when selected version has a runtime mismatch note */}
      {selected?.note && (
        <span
          className="ml-2 text-[10px] px-1.5 py-0.5 rounded-full border shrink-0"
          style={{
            borderColor: 'rgba(251,191,36,0.3)',
            color: '#fbbf24',
            background: 'rgba(251,191,36,0.08)',
          }}
          title={selected.note}
        >
          ≈ {selected.note}
        </span>
      )}
    </div>
  )
}

VersionSelector.propTypes = {
  language: PropTypes.string.isRequired,
  version: PropTypes.string.isRequired,
  onChange: PropTypes.func.isRequired,
  activeLang: PropTypes.shape({
    color: PropTypes.string,
  }).isRequired,
}

// ---------------------------------------------------------------------------
// Main Component
// ---------------------------------------------------------------------------

const MultiLangPlayground = () => {
  // Current selected language id
  const [language, setLanguage] = useState('javascript')

  // Selected version per language — persists across tab switches
  const [versionMap, setVersionMap] = useState({ ...DEFAULT_VERSIONS })

  // Code in each editor (maintained separately so switching tabs keeps edits)
  const [codeMap, setCodeMap] = useState({ ...DEFAULT_CODE })

  // Output lines: { text, type: 'log' | 'error' | 'info' | 'system' }
  const [outputLines, setOutputLines] = useState([])

  // Running state (covers Pyodide loading + execution)
  const [isRunning, setIsRunning] = useState(false)

  // Pyodide instance (cached after first load so subsequent runs are fast)
  const pyodideRef = useRef(null)

  // Cached Piston runtime list for Java version resolution
  const javaRuntimesRef = useRef(null)

  // Active JavaScript worker controls (used for cancellation)
  const jsWorkerRef = useRef(null)
  const jsRunFinalizeRef = useRef(null)
  const jsTimeoutRef = useRef(null)
  const [isJsRunActive, setIsJsRunActive] = useState(false)

  // Dynamic output policy (updated per selected language profile at runtime)
  const outputPolicyRef = useRef({
    maxLines: MAX_OUTPUT_LINES,
    maxLineLength: MAX_OUTPUT_LINE_LENGTH,
  })

  // Lightweight runtime telemetry counters (in-memory)
  const [telemetry, setTelemetry] = useState(loadPersistedTelemetry)

  useEffect(() => {
    const payload = JSON.stringify(telemetry)
    try {
      window.localStorage.setItem(TELEMETRY_STORAGE_KEY, payload)
      return
    } catch {
      // fallback below
    }

    try {
      window.sessionStorage.setItem(TELEMETRY_STORAGE_KEY, payload)
    } catch {
      // ignore storage errors
    }
  }, [telemetry])

  // Whether Pyodide is currently being loaded for the first time
  const [pyodideLoading, setPyodideLoading] = useState(false)

  // Whether the Monaco editor has loaded
  const [editorReady, setEditorReady] = useState(false)

  // Current active language object
  const activeLang = LANGUAGES.find((l) => l.id === language)

  // ---------------------------------------------------------------------------
  // Helpers
  // ---------------------------------------------------------------------------

  /** Append a line to the output panel */
  const appendOutput = useCallback((text, type = 'log') => {
    const { maxLineLength, maxLines } = outputPolicyRef.current
    const normalized = String(text)
    const safeText =
      normalized.length > maxLineLength
        ? `${normalized.slice(0, maxLineLength)}… [truncated]`
        : normalized

    setOutputLines((prev) => {
      const next = [...prev, { text: safeText, type }]
      if (next.length <= maxLines) return next

      const trimmed = next.slice(next.length - maxLines)
      if (!trimmed.some((line) => line.text === '[Output capped to latest 300 lines]')) {
        trimmed.unshift({ text: `[Output capped to latest ${maxLines} lines]`, type: 'system' })
      }
      return trimmed.slice(-maxLines)
    })
  }, [])

  /** Set dynamic output caps from language profile */
  const applyOutputPolicy = useCallback((lang) => {
    const profile = EXECUTION_PROFILES[lang] ?? EXECUTION_PROFILES.javascript
    outputPolicyRef.current = {
      maxLines: profile.maxOutputLines,
      maxLineLength: profile.maxOutputLineLength,
    }
  }, [])

  /** Increment telemetry counter for a language */
  const bumpTelemetry = useCallback((lang, key) => {
    setTelemetry((prev) => ({
      ...prev,
      [lang]: {
        ...prev[lang],
        [key]: (prev[lang]?.[key] ?? 0) + 1,
      },
    }))
  }, [])

  /** Clear the output panel */
  const clearOutput = useCallback(() => {
    setOutputLines([])
  }, [])

  // ---------------------------------------------------------------------------
  // JavaScript Execution
  // ---------------------------------------------------------------------------

  /**
   * Runs JS code in a dedicated Web Worker (isolated from the main UI thread).
   * Captures console output and forwards it to the output panel.
   */
  const runJavaScript = useCallback(
    async (code) => {
      const profile = EXECUTION_PROFILES.javascript
      const workerSource = `
const safeSerialize = (value) => {
  if (typeof value !== 'object' || value === null) return String(value)
  try { return JSON.stringify(value, null, 2) } catch { return Object.prototype.toString.call(value) }
}

const emit = (type, text) => postMessage({ type, text: String(text) })

// Block network and script-loading APIs inside playground JS runtime.
self.fetch = () => Promise.reject(new Error('Network access is disabled in this playground runtime.'))
self.importScripts = () => { throw new Error('importScripts is disabled in this playground runtime.') }
self.XMLHttpRequest = undefined
self.WebSocket = undefined
self.EventSource = undefined
self.Worker = undefined

self.console = {
  log: (...args) => emit('log', args.map(safeSerialize).join(' ')),
  warn: (...args) => emit('warn', args.map(safeSerialize).join(' ')),
  error: (...args) => emit('error', args.map(safeSerialize).join(' ')),
  info: (...args) => emit('info', args.map(safeSerialize).join(' ')),
}

self.onmessage = (event) => {
  const code = event?.data?.code ?? ''
  try {
    const runner = new Function('"use strict";\\n' + code)
    const result = runner()
    if (result !== undefined) {
      emit('info', '→ ' + safeSerialize(result))
    }
    emit('system', 'Process exited with code 0')
  } catch (err) {
    emit('error', (err?.name || 'Error') + ': ' + (err?.message || String(err)))
    emit('error', 'Process exited with code 1')
  }
}
`

      const blob = new Blob([workerSource], { type: 'application/javascript' })
      const workerUrl = URL.createObjectURL(blob)

      return new Promise((resolve) => {
        const worker = new Worker(workerUrl)
        jsWorkerRef.current = worker
        setIsJsRunActive(true)
        let finished = false

        const finalize = (status = 'error') => {
          if (finished) return
          finished = true
          if (jsTimeoutRef.current) {
            clearTimeout(jsTimeoutRef.current)
            jsTimeoutRef.current = null
          }
          worker.terminate()
          jsWorkerRef.current = null
          jsRunFinalizeRef.current = null
          setIsJsRunActive(false)
          URL.revokeObjectURL(workerUrl)
          resolve(status)
        }

        jsRunFinalizeRef.current = finalize

        jsTimeoutRef.current = setTimeout(() => {
          appendOutput(`Execution timed out after ${profile.timeoutMs / 1000} seconds.`, 'error')
          finalize('timeout')
        }, profile.timeoutMs)

        worker.onmessage = (event) => {
          const { type = 'log', text = '' } = event?.data ?? {}
          appendOutput(text, type)

          if (text === 'Process exited with code 0') {
            finalize('success')
          }
          if (text === 'Process exited with code 1') {
            finalize('error')
          }
        }

        worker.onerror = (event) => {
          appendOutput(`WorkerError: ${event.message}`, 'error')
          appendOutput('Process exited with code 1', 'error')
          finalize('error')
        }

        worker.postMessage({ code })
      })
    },
    [appendOutput],
  )

  /** Manually stop a running JavaScript worker execution */
  const stopJavaScriptExecution = useCallback(() => {
    if (!jsWorkerRef.current || !jsRunFinalizeRef.current) return
    appendOutput('Execution stopped by user.', 'warn')
    jsRunFinalizeRef.current('stopped')
  }, [appendOutput])

  const resetTelemetry = useCallback(() => {
    setTelemetry({ ...INITIAL_TELEMETRY })
    try {
      window.localStorage.removeItem(TELEMETRY_STORAGE_KEY)
    } catch {
      // ignore
    }
    try {
      window.sessionStorage.removeItem(TELEMETRY_STORAGE_KEY)
    } catch {
      // ignore
    }
  }, [])

  // ---------------------------------------------------------------------------
  // Python Execution via Pyodide
  // ---------------------------------------------------------------------------

  /**
   * Loads Pyodide from CDN on first call (lazy load).
   * Subsequent calls return the cached instance immediately.
   */
  const ensurePyodide = useCallback(async () => {
    // Return cached instance if already loaded
    if (pyodideRef.current) return pyodideRef.current

    setPyodideLoading(true)
    appendOutput('⏳ Loading Python runtime (Pyodide)...', 'system')
    appendOutput('   This may take 5-10 seconds on first run.', 'system')

    try {
      // Dynamically load the Pyodide CDN script
      if (!window.loadPyodide) {
        await new Promise((resolve, reject) => {
          const script = document.createElement('script')
          script.src = 'https://cdn.jsdelivr.net/pyodide/v0.25.1/full/pyodide.js'
          script.onload = resolve
          script.onerror = () => reject(new Error('Failed to load Pyodide script'))
          document.head.appendChild(script)
        })
      }

      // Initialize Pyodide — downloads the WASM runtime
      const pyodide = await window.loadPyodide({
        indexURL: 'https://cdn.jsdelivr.net/pyodide/v0.25.1/full/',
      })

      pyodideRef.current = pyodide
      appendOutput('✅ Python runtime ready!', 'system')
      return pyodide
    } finally {
      setPyodideLoading(false)
    }
  }, [appendOutput])

  /**
   * Runs Python code using Pyodide.
   * Redirects stdout/stderr to our output panel using Pyodide's sys module.
   */
  const runPython = useCallback(
    async (code) => {
      let pyodide
      try {
        pyodide = await ensurePyodide()
      } catch (err) {
        appendOutput(`Python runtime failed to load: ${err.message}`, 'error')
        return 'error'
      }

      try {
        // Redirect Python's stdout to capture print() output
        pyodide.runPython(`
import sys
import io
_stdout_capture = io.StringIO()
sys.stdout = _stdout_capture
sys.stderr = _stdout_capture
`)
        // Run the user's code
        pyodide.runPython(code)

        // Collect captured output
        const output = pyodide.runPython(`
_out = _stdout_capture.getvalue()
sys.stdout = sys.__stdout__
sys.stderr = sys.__stderr__
_out
`)
        if (output) {
          // Split by newlines so each print() appears on its own line
          output
            .split('\n')
            .filter(Boolean)
            .forEach((line) => appendOutput(line, 'log'))
        }
      } catch (err) {
        // Pyodide surfaces Python exceptions with type + message
        appendOutput(`PythonError: ${err.message}`, 'error')
        return 'error'
      }

      return 'success'
    },
    [ensurePyodide, appendOutput],
  )

  /**
   * Resolve requested Java major version against available Piston runtimes.
   * Falls back gracefully to latest available Java runtime.
   */
  const resolveJavaRuntimeVersion = useCallback(
    async (requestedMajor) => {
      if (!javaRuntimesRef.current) {
        const runtimesRes = await fetch('https://emkc.org/api/v2/piston/runtimes')
        if (!runtimesRes.ok) throw new Error(`Unable to fetch runtimes (HTTP ${runtimesRes.status})`)
        const runtimes = await runtimesRes.json()
        javaRuntimesRef.current = runtimes.filter((rt) => rt.language === 'java')
      }

      const runtimes = javaRuntimesRef.current
      if (!runtimes?.length) return '*'

      const requested = Number.parseInt(String(requestedMajor), 10)
      const byExactMajor = runtimes.find((rt) => String(rt.version).startsWith(`${requested}.`))
      if (byExactMajor) return byExactMajor.version

      // If exact major isn't found, select the highest available Java version.
      const sorted = [...runtimes].sort((a, b) => {
        const aNum = Number.parseFloat(a.version)
        const bNum = Number.parseFloat(b.version)
        return bNum - aNum
      })
      return sorted[0]?.version ?? '*'
    },
    [],
  )

  // ---------------------------------------------------------------------------
  // Java Execution via Piston API (real JVM, no API key needed)
  // ---------------------------------------------------------------------------

  /**
   * Fallback: regex-based mock used only when Piston API is unreachable.
   * Only catches string-literal println() calls.
   */
  const runJavaMock = useCallback(
    (code, version) => {
      appendOutput(`⚠ Piston API unreachable — falling back to simulation`, 'warn')
      appendOutput(`☕ Java ${version} (Simulated Execution)`, 'system')
      appendOutput('─'.repeat(50), 'system')

      const printlnRegex = /System\.out\.println\s*\((.*?)\)\s*;/g
      const printRegex = /System\.out\.print\s*\((.*?)\)\s*;/g
      let found = false
      let match

      const emitSimulatedExpression = (expr, endsWithNewline = true) => {
        const trimmed = (expr ?? '').trim()
        // Exact string literal → show plain text.
        if (trimmed.startsWith('"') && trimmed.endsWith('"')) {
          appendOutput(trimmed.slice(1, -1), 'log')
          return
        }

        // Basic numeric literal support.
        if (/^-?\d+(\.\d+)?$/.test(trimmed)) {
          appendOutput(trimmed, 'log')
          return
        }

        // Expression fallback — useful for lines like Collections.max(list)
        appendOutput(`(simulated) ${trimmed}${endsWithNewline ? '' : ' [print]'}`, 'info')
      }

      while ((match = printlnRegex.exec(code)) !== null) {
        emitSimulatedExpression(match[1], true)
        found = true
      }
      while ((match = printRegex.exec(code)) !== null) {
        emitSimulatedExpression(match[1], false)
        found = true
      }

      if (!found) appendOutput('(No string-literal println statements detected)', 'info')

      appendOutput('─'.repeat(50), 'system')
      appendOutput('Process exited with code 0 (simulated)', 'system')
    },
    [appendOutput],
  )

  /**
   * Runs real Java code via the Piston API (https://emkc.org/api/v2/piston).
   *  - Free, no API key required.
   *  - Parses the public class name from code to set the correct filename
   *    (Java requires filename == class name).
   *  - Falls back to the regex mock if the API is unavailable.
   */
  const runJava = useCallback(
    async (code, version) => {
      const profile = EXECUTION_PROFILES.java
      appendOutput(`☕ Compiling Java ${version} via Piston API…`, 'system')

      // Java requires the file name to match the public class name
      const classNameMatch = code.match(/public\s+class\s+(\w+)/)
      const className = classNameMatch ? classNameMatch[1] : 'Main'

      try {
        const resolvedVersion = await resolveJavaRuntimeVersion(version)
        if (resolvedVersion !== '*' && !String(resolvedVersion).startsWith(`${version}.`)) {
          appendOutput(
            `ℹ Requested Java ${version} not available on Piston. Using ${resolvedVersion}.`,
            'info',
          )
        }

        const configuredUrl = import.meta.env.VITE_PISTON_PROXY_EXECUTE_URL
        const executeEndpoints = [configuredUrl, PISTON_PRIMARY_EXECUTE_URL].filter(Boolean)

        let data = null
        const endpointErrors = []

        for (const endpoint of executeEndpoints) {
          const controller = new AbortController()
          const timeoutId = setTimeout(() => controller.abort(), profile.timeoutMs)

          try {
            const res = await fetch(endpoint, {
              method: 'POST',
              signal: controller.signal,
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({
                language: 'java',
                version: resolvedVersion,
                files: [{ name: `${className}.java`, content: code }],
              }),
            })

            clearTimeout(timeoutId)

            if (!res.ok) {
              endpointErrors.push(`${endpoint} → HTTP ${res.status}`)
              continue
            }

            data = await res.json()
            break
          } catch (err) {
            clearTimeout(timeoutId)
            endpointErrors.push(`${endpoint} → ${err.name === 'AbortError' ? 'timeout' : err.message}`)
          }
        }

        if (!data) {
          const hasAuthError = endpointErrors.some((e) => /HTTP 401|HTTP 403/.test(e))
          if (hasAuthError) {
            appendOutput(
              'Java API authentication/authorization rejected (401/403). Configure VITE_PISTON_PROXY_EXECUTE_URL to your backend proxy for reliable Java execution.',
              'warn',
            )
          }
          throw new Error(endpointErrors.join(' | ') || 'No Java execution endpoint available')
        }

        appendOutput('─'.repeat(50), 'system')

        // Show stdout lines
        if (data.run?.stdout) {
          data.run.stdout
            .split('\n')
            .filter(Boolean)
            .forEach((line) => appendOutput(line, 'log'))
        }

        // Show stderr lines (compile errors, runtime exceptions)
        if (data.run?.stderr) {
          data.run.stderr
            .split('\n')
            .filter(Boolean)
            .forEach((line) => appendOutput(line, 'error'))
        }

        if (!data.run?.stdout && !data.run?.stderr) {
          appendOutput('(no output)', 'info')
        }

        appendOutput('─'.repeat(50), 'system')
        const exitCode = data.run?.code ?? '?'
        appendOutput(
          `Process exited with code ${exitCode}`,
          exitCode === 0 ? 'system' : 'error',
        )

        return exitCode === 0 ? 'success' : 'error'
      } catch (err) {
        // Network failure or CORS issue → fall back to mock
        if (err.name === 'AbortError') {
          appendOutput(`Java execution timed out after ${profile.timeoutMs / 1000} seconds.`, 'error')
          return 'timeout'
        }
        appendOutput(`Java API error: ${err.message}`, 'warn')
        runJavaMock(code, version)
        return 'success'
      }
    },
    [appendOutput, runJavaMock, resolveJavaRuntimeVersion],
  )

  // ---------------------------------------------------------------------------
  // Run Handler
  // ---------------------------------------------------------------------------

  /**
   * Main entry point for the Run button.
   * Delegates to the appropriate executor based on selected language.
   */
  const handleRun = useCallback(async () => {
    const profile = EXECUTION_PROFILES[language] ?? EXECUTION_PROFILES.javascript
    const code = codeMap[language]
    if (!code?.trim()) {
      appendOutput('(Nothing to run — editor is empty)', 'info')
      return
    }

    if (code.length > profile.maxCodeSize) {
      appendOutput(
        `Code size exceeds limit (${profile.maxCodeSize.toLocaleString()} chars) for ${language}. Please shorten the snippet.`,
        'error',
      )
      return
    }

    applyOutputPolicy(language)
    clearOutput()
    setIsRunning(true)
    bumpTelemetry(language, 'runs')

    const currentVersion = versionMap[language]
    let status = 'error'

    try {
      if (language === 'javascript') {
        status = await runJavaScript(code)
      } else if (language === 'python') {
        status = await runPython(code)
      } else if (language === 'java') {
        status = await runJava(code, currentVersion)
      }
    } finally {
      setIsRunning(false)
    }

    if (status === 'success') bumpTelemetry(language, 'success')
    if (status === 'error') bumpTelemetry(language, 'error')
    if (status === 'timeout') bumpTelemetry(language, 'timeouts')
    if (status === 'stopped') bumpTelemetry(language, 'stops')
  }, [
    language,
    codeMap,
    versionMap,
    applyOutputPolicy,
    bumpTelemetry,
    clearOutput,
    appendOutput,
    runJavaScript,
    runPython,
    runJava,
  ])

  // ---------------------------------------------------------------------------
  // Editor Handlers
  // ---------------------------------------------------------------------------

  /** Called by Monaco when the editor mounts */
  const handleEditorMount = useCallback(() => {
    setEditorReady(true)
  }, [])

  /** Called on every keystroke in the editor */
  const handleEditorChange = useCallback(
    (value) => {
      setCodeMap((prev) => ({ ...prev, [language]: value ?? '' }))
    },
    [language],
  )

  /** Resets the current language's code to the default snippet */
  const handleReset = useCallback(() => {
    setCodeMap((prev) => ({ ...prev, [language]: DEFAULT_CODE[language] }))
    clearOutput()
  }, [language, clearOutput])

  /** Switch language tab — also clears output so stale results don't show */
  const handleLanguageChange = useCallback((langId) => {
    setLanguage(langId)
    setOutputLines([])
  }, [])

  /** Update the selected version for the current language */
  const handleVersionChange = useCallback(
    (newVersion) => {
      setVersionMap((prev) => ({ ...prev, [language]: newVersion }))
    },
    [language],
  )

  // ---------------------------------------------------------------------------
  // Output line color mapping
  // ---------------------------------------------------------------------------

  const outputColorMap = {
    log: '#e2e8f0',      // white-ish
    warn: '#fbbf24',     // amber
    error: '#f87171',    // red
    info: '#60a5fa',     // blue
    system: '#8b5cf6',   // purple
  }

  const activeProfile = EXECUTION_PROFILES[language] ?? EXECUTION_PROFILES.javascript
  const activeTelemetry = telemetry[language] ?? {
    runs: 0,
    success: 0,
    error: 0,
    timeouts: 0,
    stops: 0,
  }

  // ---------------------------------------------------------------------------
  // Render
  // ---------------------------------------------------------------------------

  return (
    <section
      id="playground"
      className="py-24 px-[12vw] md:px-[7vw] lg:px-[20vw] font-sans"
    >
      {/* ── Section Title ── */}
      <div className="text-center mb-12">
        <h2 className="text-3xl sm:text-4xl font-bold text-white flex items-center justify-center gap-3">
          <FiCode className="text-[#8245ec]" />
          CODE PLAYGROUND
        </h2>
        <div className="w-32 h-1 bg-[#8245ec] mx-auto mt-2" />
        <p className="text-gray-400 mt-4 text-lg font-semibold">
          Write and run JavaScript, Python, and Java directly in your browser —
          no setup required.
        </p>
      </div>

      {/* ── Playground Card ── */}
      <div
        className="rounded-2xl border border-white/10 overflow-hidden"
        style={{
          background: 'rgba(13, 8, 31, 0.8)',
          boxShadow:
            '0 0 40px rgba(130, 69, 236, 0.15), 0 0 1px rgba(255,255,255,0.1)',
          backdropFilter: 'blur(12px)',
        }}
      >
        {/* ── Top Bar: Language Tabs + Version Selector + Action Buttons ── */}
        <div className="flex flex-col gap-3 px-4 py-3 border-b border-white/10">
          {/* Row 1: Language tabs + action buttons */}
          <div className="flex flex-wrap items-center justify-between gap-3">
            {/* Language selector tabs */}
            <div className="flex gap-2 flex-wrap">
              {LANGUAGES.map((lang) => (
                <LanguageTab
                  key={lang.id}
                  lang={lang}
                  isActive={language === lang.id}
                  onClick={handleLanguageChange}
                />
              ))}
            </div>

            {/* Action buttons */}
            <div className="flex items-center gap-2">
              {/* Reset button */}
              <button
                onClick={handleReset}
                disabled={isRunning}
                title="Reset to default code"
                className="flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium text-gray-400 border border-white/10 hover:border-white/30 hover:text-white transition-all duration-200 disabled:opacity-40"
              >
                <FiRefreshCw size={14} />
                Reset
              </button>

              {/* Stop button (JS worker only) */}
              <button
                onClick={stopJavaScriptExecution}
                disabled={!isRunning || !isJsRunActive}
                title="Stop current JavaScript execution"
                className="flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium text-rose-300 border border-rose-500/30 hover:border-rose-400/60 hover:text-rose-200 transition-all duration-200 disabled:opacity-40 disabled:cursor-not-allowed"
              >
                <FiSquare size={12} />
                Stop
              </button>

              {/* Run button */}
              <button
                id="run-code-btn"
                onClick={handleRun}
                disabled={isRunning || !editorReady}
                className="flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-bold text-white transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
                style={{
                  background: isRunning
                    ? 'linear-gradient(90deg, #5b21b6, #7c3aed)'
                    : 'linear-gradient(90deg, #8245ec, #a855f7)',
                  boxShadow: isRunning
                    ? 'none'
                    : '0 0 16px rgba(130,69,236,0.5)',
                }}
              >
                {isRunning ? (
                  <svg className="animate-spin" width={14} height={14} viewBox="0 0 24 24" fill="none">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="white" strokeWidth="4" />
                    <path className="opacity-75" fill="white" d="M4 12a8 8 0 018-8v8H4z" />
                  </svg>
                ) : (
                  <FiPlay size={14} />
                )}
                {pyodideLoading ? 'Loading Python…' : isRunning ? 'Running…' : 'Run Code'}
              </button>
            </div>
          </div>

          {/* Row 2: Version selector — contextual per active language */}
          <div className="flex items-center gap-3">
            <span className="text-xs text-gray-600 shrink-0">Version:</span>
            <VersionSelector
              language={language}
              version={versionMap[language]}
              onChange={handleVersionChange}
              activeLang={activeLang}
            />
          </div>
        </div>

        {/* ── Editor + Output Split ── */}
        <div className="flex flex-col lg:flex-row">
          {/* Editor Panel */}
          <div className="flex-1 min-h-[300px] lg:min-h-[420px] border-b lg:border-b-0 lg:border-r border-white/10">
            {/* File name indicator */}
            <div className="flex items-center gap-2 px-4 py-2 bg-black/20 border-b border-white/5">
              <div
                className="w-2.5 h-2.5 rounded-full"
                style={{ background: activeLang.color }}
              />
              <span className="text-xs text-gray-500 font-mono">
                {language === 'javascript'
                  ? 'main.js'
                  : language === 'python'
                    ? 'main.py'
                    : 'Main.java'}
              </span>
            </div>

            {/* Monaco Editor */}
            <Editor
              height="380px"
              language={activeLang.monacoLang}
              value={codeMap[language]}
              onChange={handleEditorChange}
              onMount={handleEditorMount}
              theme="vs-dark"
              options={{
                fontSize: 14,
                fontFamily: '"Fira Code", "Cascadia Code", monospace',
                fontLigatures: true,
                minimap: { enabled: false },
                scrollBeyondLastLine: false,
                lineNumbers: 'on',
                roundedSelection: true,
                padding: { top: 12, bottom: 12 },
                scrollbar: { verticalScrollbarSize: 6 },
                smoothScrolling: true,
                cursorBlinking: 'smooth',
                renderWhitespace: 'none',
                tabSize: 2,
              }}
            />
          </div>

          {/* Output Panel */}
          <div className="w-full lg:w-[340px] flex flex-col">
            {/* Output header */}
            <div className="flex items-center justify-between px-4 py-2 bg-black/20 border-b border-white/5">
              <div className="flex items-center gap-2">
                {/* Traffic-light dots for terminal feel */}
                <div className="flex gap-1.5">
                  <div className="w-2.5 h-2.5 rounded-full bg-red-500/60" />
                  <div className="w-2.5 h-2.5 rounded-full bg-yellow-500/60" />
                  <div className="w-2.5 h-2.5 rounded-full bg-green-500/60" />
                </div>
                <span className="text-xs text-gray-500 font-mono ml-1">
                  Output
                </span>
              </div>
              {/* Clear output */}
              {outputLines.length > 0 && (
                <button
                  onClick={clearOutput}
                  className="text-xs text-gray-600 hover:text-gray-400 transition-colors"
                >
                  clear
                </button>
              )}
            </div>

            {/* Output content */}
            <div
              className="flex-1 overflow-y-auto font-mono text-sm p-4 space-y-1"
              style={{
                background: 'rgba(0,0,0,0.4)',
                minHeight: '380px',
                maxHeight: '380px',
              }}
            >
              {outputLines.length === 0 ? (
                /* Empty state */
                <div className="h-full flex flex-col items-center justify-center gap-3 text-gray-600">
                  <FiPlay size={28} className="opacity-30" />
                  <p className="text-xs text-center">
                    Click <span className="text-[#8245ec]">Run Code</span> to
                    see output here
                  </p>
                </div>
              ) : (
                outputLines.map((line, idx) => (
                  <div
                    key={idx}
                    className="leading-relaxed break-all"
                    style={{ color: outputColorMap[line.type] ?? '#e2e8f0' }}
                  >
                    {/* Prefix symbols per type */}
                    <span className="opacity-40 mr-1 select-none">
                      {line.type === 'error'
                        ? '✕'
                        : line.type === 'warn'
                          ? '⚠'
                          : line.type === 'system'
                            ? '●'
                            : line.type === 'info'
                              ? '→'
                              : '>'}
                    </span>
                    {line.text}
                  </div>
                ))
              )}
            </div>
          </div>
        </div>

        {/* ── Footer bar: runtime info + selected version badge ── */}
        <div className="px-4 py-2 border-t border-white/5 bg-black/20 flex items-center justify-between gap-3 flex-wrap">
          <span className="text-xs text-gray-600">
            {language === 'javascript' && `⚡ JavaScript runs in an isolated Web Worker sandbox`}
            {language === 'python' &&
              (pyodideRef.current
                ? '🐍 Python runtime loaded (Pyodide v0.25.1)'
                : '🐍 Python powered by Pyodide WebAssembly')}
            {language === 'java' && '☕ Java powered by Piston API — real JVM execution'}
          </span>
          <div className="flex items-center gap-2 flex-wrap justify-end">
            {/* Active version badge */}
            <span
              className="text-[10px] px-2 py-0.5 rounded-full border font-mono"
              style={{
                borderColor: `${activeLang.color}40`,
                color: activeLang.color,
                background: activeLang.bgColor,
              }}
            >
              {LANGUAGE_VERSIONS[language]?.find((v) => v.value === versionMap[language])?.label ?? versionMap[language]}
            </span>

            {/* Active profile badge */}
            <span className="text-[10px] px-2 py-0.5 rounded-full border border-white/10 text-gray-400 font-mono">
              limit:{activeProfile.maxCodeSize / 1000}k • out:{activeProfile.maxOutputLines} • t:{activeProfile.timeoutMs / 1000}s
            </span>

            {/* Telemetry badge */}
            <span className="text-[10px] px-2 py-0.5 rounded-full border border-emerald-500/20 text-emerald-300/90 font-mono">
              runs:{activeTelemetry.runs} ok:{activeTelemetry.success} err:{activeTelemetry.error} to:{activeTelemetry.timeouts} stop:{activeTelemetry.stops}
            </span>

            <button
              onClick={resetTelemetry}
              className="text-[10px] px-2 py-0.5 rounded-full border border-rose-500/30 text-rose-300 hover:border-rose-400/60 hover:text-rose-200 transition-colors font-mono"
              title="Reset runtime telemetry counters"
            >
              Reset Metrics
            </button>
          </div>
        </div>
      </div>
    </section>
  )
}

export default MultiLangPlayground
