import { useState, useCallback } from 'react'

export function useBrushingLinking() {
  const [brushedIds, setBrushedIds] = useState(new Set())
  const [activeId, setActiveId] = useState(null)

  const brush = useCallback((ids) => setBrushedIds(new Set(ids)), [])

  const clearBrush = useCallback(() => setBrushedIds(new Set()), [])

  const activate = useCallback((id) => {
    setActiveId((prev) => (prev === id ? null : id))
  }, [])

  // Called when a food is removed so we can clear stale state
  const removeFood = useCallback((fdcId) => {
    setBrushedIds((prev) => {
      if (!prev.has(fdcId)) return prev
      const next = new Set(prev)
      next.delete(fdcId)
      return next
    })
    setActiveId((prev) => (prev === fdcId ? null : prev))
  }, [])

  return { brushedIds, activeId, brush, clearBrush, activate, removeFood }
}
