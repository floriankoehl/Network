import { useState, useCallback } from 'react'
import { searchFoods } from '../api'

const PAGE_SIZE = 10

export function useFoodSearch() {
  const [allResults, setAllResults] = useState(null)
  const [loading, setLoading]       = useState(false)
  const [error, setError]           = useState(null)
  const [page, setPage]             = useState(1)

  const totalPages = allResults ? Math.max(1, Math.ceil(allResults.length / PAGE_SIZE)) : 0
  const results    = allResults
    ? allResults.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE)
    : null

  const search = useCallback(async (query) => {
    setLoading(true)
    setError(null)
    setPage(1)
    try {
      const foods = await searchFoods(query)
      setAllResults(foods)
    } catch (e) {
      setError(e.message)
      setAllResults([])
    } finally {
      setLoading(false)
    }
  }, [])

  const nextPage = useCallback(() => setPage(p => Math.min(p + 1, totalPages)), [totalPages])
  const prevPage = useCallback(() => setPage(p => Math.max(p - 1, 1)), [])

  return {
    results,
    totalResults: allResults?.length ?? 0,
    loading,
    error,
    search,
    page,
    totalPages,
    nextPage,
    prevPage,
  }
}
