import { useState } from 'react'

export default function SearchBar({ onSearch, loading }) {
  const [query, setQuery] = useState('')

  function handleSubmit(e) {
    e.preventDefault()
    if (query.trim()) onSearch(query.trim())
  }

  return (
    <form className="search-bar" onSubmit={handleSubmit}>
      <input
        type="text"
        placeholder="Search foods (e.g. chicken breast, banana…)"
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        disabled={loading}
        aria-label="Food search"
      />
      <button type="submit" disabled={loading || !query.trim()}>
        {loading ? 'Searching…' : 'Search'}
      </button>
    </form>
  )
}
