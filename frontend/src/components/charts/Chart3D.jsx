import { useEffect, useRef } from 'react'
import Plotly from 'plotly.js-dist-min'
import { extractNutrientValue, truncate } from '../../utils/nutritionCalculations'
import { foodColor } from '../../utils/colorScales'

export default function Chart3D({ foods, activeId, onActivate }) {
  const divRef      = useRef(null)
  const activateRef = useRef(onActivate)
  useEffect(() => { activateRef.current = onActivate }, [onActivate])

  useEffect(() => {
    if (!divRef.current || !foods.length) return

    const traces = foods.map((food) => {
      const carbs    = extractNutrientValue(food, 'carbs')
      const fat      = extractNutrientValue(food, 'fat')
      const protein  = extractNutrientValue(food, 'protein')
      const calories = extractNutrientValue(food, 'calories')
      const ci       = food._colorIndex ?? 0
      const isActive = food.fdcId === activeId
      const color    = foodColor(ci)

      // Volume ∝ calories ⟹ radius ∝ calories^(1/3)
      const size = Math.max(8, Math.cbrt(Math.max(calories, 0)) * 2.2)

      return {
        type:         'scatter3d',
        mode:         'markers+text',
        name:         truncate(food.description, 22),
        x:            [carbs],
        y:            [fat],
        z:            [protein],
        text:         [truncate(food.description, 18)],
        textposition: 'top center',
        textfont:     { size: 10, color: '#374151' },
        marker: {
          size,
          color,
          opacity:  isActive ? 0.95 : 0.72,
          line:     { color: isActive ? '#111827' : 'rgba(0,0,0,0.1)', width: isActive ? 2 : 1 },
          symbol:   'circle',
        },
        customdata: [food.fdcId],
        hovertemplate:
          `<b>%{text}</b><br>` +
          `Carbs: <b>${carbs.toFixed(1)} g</b><br>` +
          `Fat: <b>${fat.toFixed(1)} g</b><br>` +
          `Protein: <b>${protein.toFixed(1)} g</b><br>` +
          `Calories: <b>${calories.toFixed(0)} kcal</b>` +
          `<extra></extra>`,
      }
    })

    const layout = {
      scene: {
        bgcolor: '#fafafa',
        xaxis: {
          title: { text: 'Carbs (g / 100g)', font: { size: 11, color: '#6b7280' } },
          gridcolor: '#e5e7eb', zerolinecolor: '#d1d5db', tickfont: { size: 10 },
        },
        yaxis: {
          title: { text: 'Fat (g / 100g)', font: { size: 11, color: '#6b7280' } },
          gridcolor: '#e5e7eb', zerolinecolor: '#d1d5db', tickfont: { size: 10 },
        },
        zaxis: {
          title: { text: 'Protein (g / 100g)', font: { size: 11, color: '#6b7280' } },
          gridcolor: '#e5e7eb', zerolinecolor: '#d1d5db', tickfont: { size: 10 },
        },
        camera: { eye: { x: 1.6, y: 1.6, z: 1.1 } },
      },
      margin:          { t: 0, b: 0, l: 0, r: 0 },
      showlegend:      true,
      legend:          { x: 0.01, y: 0.99, bgcolor: 'rgba(255,255,255,0.85)', bordercolor: '#e5e7eb', borderwidth: 1, font: { size: 11 } },
      paper_bgcolor:   'transparent',
      plot_bgcolor:    'transparent',
      height:          440,
    }

    Plotly.react(divRef.current, traces, layout, {
      responsive:     true,
      displayModeBar: false,
      scrollZoom:     true,
    })

    divRef.current.on('plotly_click', (data) => {
      const fdcId = data?.points?.[0]?.customdata
      if (fdcId) activateRef.current(fdcId)
    })

    return () => { if (divRef.current) Plotly.purge(divRef.current) }
  }, [foods, activeId])

  if (!foods.length) {
    return (
      <div className="chart-card chart-empty">
        <h3>3D Macro Space</h3>
        <p>Select foods to plot their macronutrient position in 3D space.</p>
      </div>
    )
  }

  return (
    <div className="chart-card">
      <div className="chart-header">
        <h3>3D Macro Space</h3>
        <span className="chart-hint">
          X = carbs · Y = fat · Z = protein · sphere volume = calories · drag to rotate
        </span>
      </div>
      <div ref={divRef} />
    </div>
  )
}
