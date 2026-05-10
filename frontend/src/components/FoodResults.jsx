import { useState } from 'react'
import { truncate } from '../utils/nutritionCalculations'

function FoodPopup({ food, rect }) {
  const POP_W = 210

  let left = rect.right + 12
  let top  = rect.top + rect.height / 2 - 120

  if (left + POP_W > window.innerWidth - 8) left = rect.left - POP_W - 12
  top = Math.max(8, Math.min(top, window.innerHeight - 260))

  return (
    <div className="food-popup" style={{ left, top, width: POP_W }}>
      {food.imageUrl
        ? <img src={food.imageUrl} alt="" className="food-popup-img" />
        : <div className="food-popup-img-placeholder">
            {food.description.charAt(0).toUpperCase()}
          </div>
      }
      <p className="food-popup-name">{food.description}</p>
      {food.foodCategory && (
        <p className="food-popup-cat">{food.foodCategory}</p>
      )}
    </div>
  )
}

export default function FoodResults({
  results, selectedIds, brushedIds, loading, onSelect,
  page, totalPages, totalResults, onNext, onPrev,
}) {
  const [popup, setPopup] = useState(null)

  if (loading) return <p className="status-msg loading-msg">Searching Open Food Facts…</p>
  if (!results) return <p className="status-msg hint-msg">Search for a food to begin.</p>
  if (results.length === 0) return <p className="status-msg empty-msg">No results found.</p>

  const hasBrush = brushedIds.size > 0

  return (
    <>
      <ul className="food-results" aria-label="Search results">
        {results.map((food) => {
          const isSelected = selectedIds.has(food.fdcId)
          const isFull     = selectedIds.size >= 4 && !isSelected
          const isBrushed  = brushedIds.has(food.fdcId)

          return (
            <li
              key={food.fdcId}
              className={[
                'food-result-item',
                isSelected ? 'is-selected' : '',
                isBrushed  ? 'is-brushed'  : '',
                hasBrush && !isBrushed ? 'is-faded' : '',
                isFull     ? 'is-disabled' : '',
              ].join(' ')}
              onClick={() => !isFull && onSelect(food)}
              onMouseEnter={(e) => setPopup({ food, rect: e.currentTarget.getBoundingClientRect() })}
              onMouseLeave={() => setPopup(null)}
              title={isFull ? 'Maximum 4 foods selected' : undefined}
            >
              <div className="food-result-thumb">
                {food.imageUrl
                  ? <img src={food.imageUrl} alt="" className="food-result-thumb-img" />
                  : <span className="food-result-thumb-placeholder">
                      {food.description.charAt(0).toUpperCase()}
                    </span>
                }
              </div>
              <div className="food-result-content">
                <span className="food-result-name">{truncate(food.description, 44)}</span>
                {food.foodCategory && (
                  <span className="food-result-category">{truncate(food.foodCategory, 36)}</span>
                )}
              </div>
            </li>
          )
        })}
      </ul>

      {totalPages > 1 && (
        <div className="pagination">
          <button className="page-btn" onClick={onPrev} disabled={page === 1}>‹</button>
          <span className="page-info">{page} / {totalPages} <span className="page-total">({totalResults})</span></span>
          <button className="page-btn" onClick={onNext} disabled={page === totalPages}>›</button>
        </div>
      )}

      {popup && <FoodPopup food={popup.food} rect={popup.rect} />}
    </>
  )
}
