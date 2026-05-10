import { NUTRIENTS } from './nutrientMapping'

// Works for both search-result nutrients ({nutrientId, value})
// and detail-API nutrients ({nutrient: {id}, amount})
export function extractNutrientValue(food, key) {
  const spec = NUTRIENTS[key]
  if (!spec) return 0
  const list = food.foodNutrients || []
  const match = list.find((n) => (n.nutrient?.id ?? n.nutrientId) === spec.id)
  return match ? Math.max(0, match.amount ?? match.value ?? 0) : 0
}

export function extractAllNutrients(food) {
  return Object.fromEntries(
    Object.keys(NUTRIENTS).map((k) => [k, extractNutrientValue(food, k)])
  )
}

// Returns % of daily value, capped at 200
export function normalizeToDV(value, key) {
  const dv = NUTRIENTS[key]?.dv
  if (!dv) return 0
  return Math.min((value / dv) * 100, 200)
}

// Nutrient density per 100 kcal
export function calcDensity(food) {
  const cal = extractNutrientValue(food, 'calories')
  if (cal < 1) return { protein: 0, fiber: 0, sodium: 0 }
  return {
    protein: (extractNutrientValue(food, 'protein') / cal) * 100,
    fiber:   (extractNutrientValue(food, 'fiber')   / cal) * 100,
    sodium:  (extractNutrientValue(food, 'sodium')  / cal) * 100,
  }
}

export function getFoodCategory(food) {
  if (typeof food.foodCategory === 'string') return food.foodCategory
  if (food.foodCategory?.description) return food.foodCategory.description
  return food.dataType || 'Unknown'
}

export function truncate(str, len = 40) {
  if (!str) return ''
  return str.length > len ? str.slice(0, len - 1) + '…' : str
}

export function generateInsights(foods) {
  if (foods.length < 2) return []
  const get = (food, key) => extractNutrientValue(food, key)
  const best = (compareFn) => [...foods].sort(compareFn)[0]
  const insights = []

  const hiPro = best((a, b) => get(b, 'protein') - get(a, 'protein'))
  insights.push({ icon: '💪', label: 'Highest Protein', food: hiPro.description, value: `${get(hiPro, 'protein').toFixed(1)} g` })

  const loCal = best((a, b) => get(a, 'calories') - get(b, 'calories'))
  insights.push({ icon: '🔥', label: 'Lowest Calories', food: loCal.description, value: `${get(loCal, 'calories').toFixed(0)} kcal` })

  const loNa = best((a, b) => get(a, 'sodium') - get(b, 'sodium'))
  insights.push({ icon: '🧂', label: 'Lowest Sodium', food: loNa.description, value: `${get(loNa, 'sodium').toFixed(0)} mg` })

  const hiPtC = best((a, b) => {
    const ra = get(a, 'calories') > 0 ? get(a, 'protein') / get(a, 'calories') : 0
    const rb = get(b, 'calories') > 0 ? get(b, 'protein') / get(b, 'calories') : 0
    return rb - ra
  })
  const ratio = get(hiPtC, 'calories') > 0
    ? ((get(hiPtC, 'protein') / get(hiPtC, 'calories')) * 100).toFixed(1)
    : '—'
  insights.push({ icon: '⚖️', label: 'Best Protein/Cal', food: hiPtC.description, value: `${ratio} g/100 kcal` })

  const hiFib = best((a, b) => get(b, 'fiber') - get(a, 'fiber'))
  insights.push({ icon: '🌾', label: 'Highest Fiber', food: hiFib.description, value: `${get(hiFib, 'fiber').toFixed(1)} g` })

  return insights
}
