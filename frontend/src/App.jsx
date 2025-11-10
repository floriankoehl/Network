import React, { useState } from 'react'

// Falls du eine .env nutzen willst, kannst du VITE_API_BASE setzen.
// Sonst fällt es auf 127.0.0.1:8000 zurück.
const API_BASE = import.meta.env?.VITE_API_BASE || 'http://127.0.0.1:8000'

export default function App() {
  const [serverData, setServerData] = useState(null)
  const [text, setText] = useState('hello')
  const [times, setTimes] = useState(1)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)

  const callApi = async () => {
    setLoading(true)
    setError(null)
    setServerData(null)

    try {
      const url = `${API_BASE}/api/echo/${encodeURIComponent(text)}/?times=${times}`
      const res = await fetch(url)
      if (!res.ok) throw new Error(`HTTP ${res.status}`)
      const data = await res.json()
      setServerData(data)
    } catch (e) {
      setError(String(e))
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-black flex items-center justify-center bg-gray-100 p-6">
      <div className="w-full max-w-xl space-y-4">
        <h1 className="text-2xl font-bold">Django ↔ React (Vite + Tailwind)</h1>

        <div className="bg-white p-4 rounded-lg shadow space-y-3">
          <div>
            <label className="block text-sm font-medium mb-1">Text (path param)</label>
            <input
              className="w-full border rounded p-2"
              value={text}
              onChange={(e) => setText(e.target.value)}
              placeholder="hello"
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">Times (query param)</label>
            <input
              type="number"
              min="1"
              className="w-full border rounded p-2"
              value={times}
              onChange={(e) => setTimes(e.target.value)}
              placeholder="1"
            />
          </div>

          <button
            onClick={callApi}
            className="px-4 py-2 rounded bg-black text-white disabled:opacity-50"
            disabled={loading}
          >
            {loading ? 'Loading…' : 'Call API'}
          </button>
        </div>

        <div className="text-sm text-gray-600">API Base: <code>{API_BASE}</code></div>

        {error && (
          <div className="bg-red-100 text-red-800 p-3 rounded">{error}</div>
        )}

        <pre className="bg-black text-green-200 p-3 rounded overflow-auto">
{JSON.stringify(serverData, null, 2)}
        </pre>
      </div>
    </div>
  )
}
