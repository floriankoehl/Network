import { useState, useCallback } from 'react'
import { getFoodDetail } from '../api'

export function useFoodDetails() {
  // Map<fdcId, { ...foodDetail, _colorIndex: number }>
  const [foods, setFoods] = useState(new Map())
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)

  const addFood = useCallback(async (fdcId) => {
    // Check against current closure value (foods is in the dep array so it's always fresh)
    if (foods.has(fdcId) || foods.size >= 4) return

    setLoading(true)
    setError(null)
    try {
      const detail = await getFoodDetail(fdcId)
      setFoods((prev) => {
        // Double-check inside the updater in case of concurrent adds
        if (prev.has(fdcId) || prev.size >= 4) return prev
        const usedIndices = new Set([...prev.values()].map((f) => f._colorIndex))
        const colorIndex = [0, 1, 2, 3].find((i) => !usedIndices.has(i)) ?? 0
        return new Map(prev).set(fdcId, { ...detail, _colorIndex: colorIndex })
      })
    } catch (e) {
      setError(e.message)
    } finally {
      setLoading(false)
    }
  }, [foods]) // foods in deps so the pre-check always sees current state

  const addFoodDirect = useCallback((food) => {
    setFoods((prev) => {
      if (prev.has(food.fdcId) || prev.size >= 4) return prev
      const usedIndices = new Set([...prev.values()].map((f) => f._colorIndex))
      const colorIndex = [0, 1, 2, 3].find((i) => !usedIndices.has(i)) ?? 0
      return new Map(prev).set(food.fdcId, { ...food, _colorIndex: colorIndex })
    })
  }, [])

  const removeFood = useCallback((fdcId) => {
    setFoods((prev) => {
      const next = new Map(prev)
      next.delete(fdcId)
      return next
    })
  }, [])

  return { foods, loading, error, addFood, addFoodDirect, removeFood }
}
