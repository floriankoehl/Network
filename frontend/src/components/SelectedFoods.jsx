import { useState } from 'react'
import { foodColor, foodColorLight } from '../utils/colorScales'
import { truncate, extractNutrientValue } from '../utils/nutritionCalculations'

function ChipPopup({ food, rect }) {
  const POP_W = 220
  const POP_H = 260

  let left = rect.left + rect.width / 2 - POP_W / 2
  let top  = rect.bottom + 10

  // Keep horizontally on screen
  left = Math.max(8, Math.min(left, window.innerWidth - POP_W - 8))
  // Flip above if too close to bottom
  if (top + POP_H > window.innerHeight - 8) top = rect.top - POP_H - 10

  const macros = [
    { label: 'Calories', value: extractNutrientValue(food, 'calories'), unit: 'kcal', decimals: 0 },
    { label: 'Protein',  value: extractNutrientValue(food, 'protein'),  unit: 'g',    decimals: 1 },
    { label: 'Fat',      value: extractNutrientValue(food, 'fat'),      unit: 'g',    decimals: 1 },
    { label: 'Carbs',    value: extractNutrientValue(food, 'carbs'),    unit: 'g',    decimals: 1 },
    { label: 'Fiber',    value: extractNutrientValue(food, 'fiber'),    unit: 'g',    decimals: 1 },
    { label: 'Sugar',    value: extractNutrientValue(food, 'sugar'),    unit: 'g',    decimals: 1 },
  ]

  return (
    <div className="chip-popup" style={{ left, top, width: POP_W }}>
      {food.imageUrl
        ? <img src={food.imageUrl} alt="" className="chip-popup-img" />
        : <div className="chip-popup-img-placeholder">
            {food.description.charAt(0).toUpperCase()}
          </div>
      }
      <p className="chip-popup-name">{food.description}</p>
      {food.foodCategory && <p className="chip-popup-cat">{food.foodCategory}</p>}
      <table className="chip-popup-table">
        <tbody>
          {macros.map(({ label, value, unit, decimals }) => (
            <tr key={label}>
              <td className="chip-popup-nutrient">{label}</td>
              <td className="chip-popup-value">
                {value > 0 ? `${value.toFixed(decimals)} ${unit}` : '—'}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}

export default function SelectedFoods({ foods, activeId, onActivate, onRemove }) {
  const [popup, setPopup] = useState(null)

  if (!foods.length) return null

  return (
    <>
      <div className="selected-foods">
        <div className="selected-foods-header">
          <span className="section-label">Selected for comparison</span>
          <span className="selected-count">{foods.length} / 4</span>
        </div>
        <div className="food-chips">
          {foods.map((food) => {
            const ci       = food._colorIndex ?? 0
            const isActive = food.fdcId === activeId

            return (
              <div
                key={food.fdcId}
                className={`food-chip ${isActive ? 'is-active' : ''}`}
                style={{
                  borderColor: foodColor(ci),
                  background: isActive ? foodColorLight(ci) : '#fff',
                }}
                onClick={() => onActivate(food.fdcId)}
                onMouseEnter={(e) => setPopup({ food, rect: e.currentTarget.getBoundingClientRect() })}
                onMouseLeave={() => setPopup(null)}
              >
                {food.imageUrl
                  ? <img src={food.imageUrl} alt={food.description} className="chip-img" />
                  : <span className="chip-swatch" style={{ background: foodColor(ci) }} />
                }
                <span className="chip-name">{truncate(food.description, 28)}</span>
                <button
                  className="chip-remove"
                  onClick={(e) => { e.stopPropagation(); onRemove(food.fdcId) }}
                  aria-label={`Remove ${food.description}`}
                >×</button>
              </div>
            )
          })}
        </div>
        <p className="hint">Click a chip to view its micronutrient profile below.</p>
      </div>

      {popup && <ChipPopup food={popup.food} rect={popup.rect} />}
    </>
  )
}
