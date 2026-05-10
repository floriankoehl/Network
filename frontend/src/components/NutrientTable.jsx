import { useState } from 'react'
import { NUTRIENTS } from '../utils/nutrientMapping'
import { extractNutrientValue, truncate } from '../utils/nutritionCalculations'
import { foodColor } from '../utils/colorScales'

const ROW_GROUPS = [
  { label: 'Energy & Macros', keys: ['calories', 'protein', 'fat', 'carbs', 'fiber', 'sugar'], defaultOpen: true  },
  { label: 'Minerals',        keys: ['sodium', 'calcium', 'iron', 'potassium'],                defaultOpen: false },
  { label: 'Vitamins',        keys: ['vitaminA', 'vitaminC'],                                  defaultOpen: false },
]

export default function NutrientTable({ foods, activeId, onActivate }) {
  const [open, setOpen] = useState(() =>
    Object.fromEntries(ROW_GROUPS.map(g => [g.label, g.defaultOpen]))
  )

  if (!foods.length) return null

  const toggle = (label) => setOpen(prev => ({ ...prev, [label]: !prev[label] }))

  return (
    <div className="nutrient-table-wrap">
      <div className="nutrient-table-header">
        <span className="section-label">Nutrition facts</span>
        <span className="chart-hint">per 100 g serving</span>
      </div>
      <div style={{ overflowX: 'auto' }}>
        <table className="nutrient-table">
          <thead>
            <tr>
              <th className="nt-label-col">Nutrient</th>
              <th className="nt-unit-col">Unit</th>
              {foods.map((food) => {
                const ci       = food._colorIndex ?? 0
                const isActive = food.fdcId === activeId
                return (
                  <th
                    key={food.fdcId}
                    className={`nt-food-col ${isActive ? 'is-active' : ''}`}
                    style={{ borderTop: `3px solid ${foodColor(ci)}` }}
                    onClick={() => onActivate(food.fdcId)}
                  >
                    {food.imageUrl && (
                      <img src={food.imageUrl} alt="" className="nt-food-img" />
                    )}
                    <span>{truncate(food.description, 22)}</span>
                  </th>
                )
              })}
            </tr>
          </thead>
          <tbody>
            {ROW_GROUPS.map((group) => (
              <>
                <tr
                  key={group.label}
                  className="nt-group-row"
                  onClick={() => toggle(group.label)}
                >
                  <td colSpan={2 + foods.length}>
                    <span className="nt-group-chevron">{open[group.label] ? '▾' : '▸'}</span>
                    {group.label}
                  </td>
                </tr>
                {open[group.label] && group.keys.map((key) => {
                  const nutrient = NUTRIENTS[key]
                  const values   = foods.map((f) => extractNutrientValue(f, key))
                  const max      = Math.max(...values)
                  return (
                    <tr key={key} className="nt-data-row">
                      <td className="nt-label">{nutrient.label}</td>
                      <td className="nt-unit">{nutrient.unit}</td>
                      {foods.map((food, i) => {
                        const val      = values[i]
                        const isActive = food.fdcId === activeId
                        const isMax    = max > 0 && val === max && foods.length > 1
                        return (
                          <td
                            key={food.fdcId}
                            className={`nt-value ${isActive ? 'is-active' : ''} ${isMax ? 'is-max' : ''}`}
                          >
                            {val > 0 ? val.toFixed(key === 'calories' ? 0 : 1) : '—'}
                          </td>
                        )
                      })}
                    </tr>
                  )
                })}
              </>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}
