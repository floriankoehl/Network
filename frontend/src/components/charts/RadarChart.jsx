import { useEffect, useRef } from 'react'
import * as d3 from 'd3'
import { NUTRIENTS } from '../../utils/nutrientMapping'
import { extractNutrientValue, truncate } from '../../utils/nutritionCalculations'
import { foodColor } from '../../utils/colorScales'

const RADAR_KEYS = ['calories', 'protein', 'fat', 'carbs', 'fiber', 'sugar', 'sodium']

// Realistic upper bounds per 100 g of food — axes fill meaningfully for real foods.
// (Cooking oil ≈ 900 kcal, pure fat = 100 g, pure sugar = 100 g, very salty = 3 000 mg, etc.)
const RADAR_MAX = {
  calories: 900,
  protein:  35,
  fat:      100,
  carbs:    100,
  fiber:    40,
  sugar:    100,
  sodium:   3000,
}

export default function RadarChart({ foods, activeId, onActivate }) {
  const svgRef = useRef(null)
  const ttRef  = useRef(null)

  useEffect(() => {
    if (!foods.length || !svgRef.current) return

    const totalW = svgRef.current.clientWidth || 460
    const totalH = 320
    const cx = totalW / 2
    const cy = totalH / 2
    const R  = Math.min(cx, cy) - 64

    d3.select(svgRef.current).selectAll('*').remove()

    const svg = d3.select(svgRef.current)
      .attr('width', totalW)
      .attr('height', totalH)

    const numAxes = RADAR_KEYS.length
    // Angle for each axis: start at top (−π/2), go clockwise
    const angleFor = (i) => (i / numAxes) * 2 * Math.PI - Math.PI / 2

    // Cartesian point for a given axis index at a given radius
    const pt = (i, r) => ({
      x: cx + r * Math.cos(angleFor(i)),
      y: cy + r * Math.sin(angleFor(i)),
    })

    const tt = d3.select(ttRef.current)

    // ── Grid rings ────────────────────────────────────────────────────────── //
    const ringLevels = [0.2, 0.4, 0.6, 0.8, 1.0]
    const gridG = svg.append('g').attr('class', 'radar-grid')

    ringLevels.forEach((frac) => {
      const pts = RADAR_KEYS.map((_, i) => pt(i, R * frac))
      const polygon = pts.map((p) => `${p.x},${p.y}`).join(' ')
      gridG.append('polygon')
        .attr('points', polygon)
        .attr('fill', 'none')
        .attr('stroke', '#e5e7eb')
        .attr('stroke-width', 1)
    })

    // ── Axis lines ────────────────────────────────────────────────────────── //
    const axisG = svg.append('g').attr('class', 'radar-axes')

    RADAR_KEYS.forEach((_, i) => {
      const edge = pt(i, R)
      axisG.append('line')
        .attr('x1', cx).attr('y1', cy)
        .attr('x2', edge.x).attr('y2', edge.y)
        .attr('stroke', '#e5e7eb')
        .attr('stroke-width', 1)
    })

    // ── "max" label on the outermost ring ────────────────────────────────── //
    // Place it on the axis closest to the right side
    const rightmostIdx = RADAR_KEYS.reduce((best, _, i) => {
      const angle = angleFor(i)
      return Math.cos(angle) > Math.cos(angleFor(best)) ? i : best
    }, 0)
    const dvLabelPt = pt(rightmostIdx, R)
    svg.append('text')
      .attr('x', dvLabelPt.x + (Math.cos(angleFor(rightmostIdx)) >= 0 ? 4 : -4))
      .attr('y', dvLabelPt.y - 6)
      .attr('text-anchor', Math.cos(angleFor(rightmostIdx)) >= 0 ? 'start' : 'end')
      .text('max / 100 g')
      .style('font-size', '9px')
      .style('fill', '#9ca3af')

    // ── Axis labels ───────────────────────────────────────────────────────── //
    const labelG = svg.append('g').attr('class', 'radar-labels')

    RADAR_KEYS.forEach((key, i) => {
      const angle = angleFor(i)
      const labelR = R + 18
      const lx = cx + labelR * Math.cos(angle)
      const ly = cy + labelR * Math.sin(angle)

      let anchor = 'middle'
      if (lx < cx - 10) anchor = 'end'
      else if (lx > cx + 10) anchor = 'start'

      labelG.append('text')
        .attr('x', lx)
        .attr('y', ly)
        .attr('text-anchor', anchor)
        .attr('dominant-baseline', 'middle')
        .text(NUTRIENTS[key].short)
        .style('font-size', '12px')
        .style('fill', '#6b7280')
    })

    // ── Food polygons ─────────────────────────────────────────────────────── //
    // Render non-active foods first so active food renders on top
    const sorted = [...foods].sort((a, b) => {
      if (a.fdcId === activeId) return 1
      if (b.fdcId === activeId) return -1
      return 0
    })

    const polyG = svg.append('g').attr('class', 'radar-polys')

    sorted.forEach((food) => {
      const ci       = food._colorIndex ?? 0
      const isActive = food.fdcId === activeId
      const color    = foodColor(ci)

      // Nutrient data for this food — normalize against per-100g max, not daily value
      const nutrientData = RADAR_KEYS.map((key) => {
        const raw  = extractNutrientValue(food, key)
        const frac = Math.min(raw / RADAR_MAX[key], 1)
        return { key, raw, frac }
      })

      const polyPts    = nutrientData.map((d, i) => pt(i, R * d.frac))
      const polygonStr = polyPts.map((p) => `${p.x},${p.y}`).join(' ')

      const ttHtml = `
        <strong>${truncate(food.description, 40)}</strong><br/>
        ${nutrientData.map((d) =>
          `${NUTRIENTS[d.key].label}: <b>${d.raw.toFixed(1)} ${NUTRIENTS[d.key].unit}</b>`
        ).join('<br/>')}
      `

      polyG.append('polygon')
        .attr('points', polygonStr)
        .attr('fill', color)
        .attr('fill-opacity', isActive ? 0.25 : 0.15)
        .attr('stroke', color)
        .attr('stroke-width', isActive ? 2.5 : 1.5)
        .style('cursor', 'pointer')
        .on('mouseover', function (event) {
          d3.select(this).attr('fill-opacity', 0.35)
          tt.style('opacity', 1).html(ttHtml)
        })
        .on('mousemove', (event) => {
          tt.style('left', `${event.clientX + 14}px`).style('top', `${event.clientY - 36}px`)
        })
        .on('mouseout', function () {
          d3.select(this).attr('fill-opacity', isActive ? 0.25 : 0.15)
          tt.style('opacity', 0)
        })
        .on('click', () => onActivate(food.fdcId))
    })

    // ── Legend ────────────────────────────────────────────────────────────── //
    const legendY = totalH - 18
    const legendG = svg.append('g').attr('class', 'radar-legend')
    const itemW   = Math.min(totalW / foods.length, 150)

    foods.forEach((food, i) => {
      const ci  = food._colorIndex ?? i
      const lgx = (totalW - foods.length * itemW) / 2 + i * itemW
      const lg  = legendG.append('g').attr('transform', `translate(${lgx},${legendY})`)

      lg.append('circle')
        .attr('r', 5)
        .attr('cx', 5)
        .attr('cy', 0)
        .attr('fill', foodColor(ci))

      lg.append('text')
        .attr('x', 14)
        .attr('y', 4)
        .text(truncate(food.description, 18))
        .style('font-size', '10px')
        .style('fill', '#4b5563')
    })

  }, [foods, activeId])

  if (!foods.length) {
    return (
      <div className="chart-card chart-empty">
        <h3>Nutritional Fingerprint</h3>
        <p>Select 1–4 foods to see their radar profile.</p>
      </div>
    )
  }

  return (
    <div className="chart-card">
      <div className="chart-header">
        <h3>Nutritional Fingerprint</h3>
        <span className="chart-hint">per 100 g · outer ring = realistic max · click to focus</span>
      </div>
      <svg ref={svgRef} style={{ width: '100%', display: 'block' }} />
      <div ref={ttRef} className="chart-tooltip" />
    </div>
  )
}
