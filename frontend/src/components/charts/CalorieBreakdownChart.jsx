import { useEffect, useRef, useMemo, useCallback } from 'react'
import * as d3 from 'd3'
import { extractNutrientValue, truncate } from '../../utils/nutritionCalculations'
import { foodColor } from '../../utils/colorScales'

// Fixed nutrient-segment colors — consistent across all foods
const SEG = {
  protein: { key: 'protein', label: 'Protein', color: '#4e79a7', kcalPerG: 4 },
  carbs:   { key: 'carbs',   label: 'Carbs',   color: '#f28e2b', kcalPerG: 4 },
  fat:     { key: 'fat',     label: 'Fat',      color: '#e15759', kcalPerG: 9 },
}
const SEG_ORDER = ['protein', 'carbs', 'fat']

function buildData(foods) {
  return foods.map((food) => {
    const p = extractNutrientValue(food, 'protein')
    const c = extractNutrientValue(food, 'carbs')
    const f = extractNutrientValue(food, 'fat')
    const total = p * 4 + c * 4 + f * 9
    if (total < 1) return { food, protein: 0, carbs: 0, fat: 0, proteinG: p, carbsG: c, fatG: f, total: 0 }
    return {
      food,
      protein: (p * 4 / total) * 100,
      carbs:   (c * 4 / total) * 100,
      fat:     (f * 9 / total) * 100,
      proteinG: p, carbsG: c, fatG: f,
      total,
    }
  })
}

export default function CalorieBreakdownChart({ foods, activeId, onActivate, brushedIds, onBrush }) {
  const svgRef    = useRef(null)
  const ttRef     = useRef(null)
  const onBrushRef = useRef(onBrush)
  useEffect(() => { onBrushRef.current = onBrush }, [onBrush])

  const chartData = useMemo(() => buildData(foods), [foods])

  const draw = useCallback(() => {
    if (!foods.length || !svgRef.current) return

    const ROW_H  = 48
    const margin = { top: 12, right: 90, bottom: 36, left: 140 }
    const totalW = svgRef.current.clientWidth || 460
    const totalH = foods.length * ROW_H + margin.top + margin.bottom
    const W = totalW - margin.left - margin.right
    const H = foods.length * ROW_H

    d3.select(svgRef.current).selectAll('*').remove()

    const outerSvg = d3.select(svgRef.current)
      .attr('width', totalW).attr('height', totalH)

    const innerG = outerSvg.append('g')
      .attr('transform', `translate(${margin.left},${margin.top})`)

    const x       = d3.scaleLinear().domain([0, 100]).range([0, W])
    const hasBrush = brushedIds.size > 0
    const tt      = d3.select(ttRef.current)

    chartData.forEach((d, i) => {
      const rowY    = i * ROW_H
      const isActive  = d.food.fdcId === activeId
      const isBrushed = !hasBrush || brushedIds.has(d.food.fdcId)

      // Active sidebar accent
      if (isActive) {
        innerG.append('rect')
          .attr('x', -margin.left + 2).attr('y', rowY + 4)
          .attr('width', 3).attr('height', ROW_H - 10)
          .attr('fill', foodColor(d.food._colorIndex ?? i))
          .attr('rx', 1.5)
      }

      // Food label
      innerG.append('text')
        .attr('x', -10).attr('y', rowY + ROW_H / 2)
        .attr('text-anchor', 'end').attr('dominant-baseline', 'middle')
        .text(truncate(d.food.description, 20))
        .style('font-size', isActive ? '11px' : '10px')
        .style('font-weight', isActive ? '600' : '400')
        .style('fill', isActive ? '#111827' : '#374151')
        .style('opacity', isBrushed ? 1 : 0.25)

      // Stacked bar segments
      let xOff = 0
      SEG_ORDER.forEach((k) => {
        const seg  = SEG[k]
        const barW = x(d[k])

        innerG.append('rect')
          .attr('x', xOff).attr('y', rowY + 8)
          .attr('width', Math.max(0, barW)).attr('height', ROW_H - 18)
          .attr('fill', seg.color)
          .attr('rx', 2)
          .attr('opacity', isBrushed ? 0.88 : 0.12)
          .style('cursor', 'pointer')
          .on('mouseover', (event) => {
            tt.style('opacity', 1)
              .html(`<strong>${truncate(d.food.description, 42)}</strong><br/>
                     ${seg.label}: <b>${d[k].toFixed(1)}%</b> of calories<br/>
                     ${d[k + 'G'].toFixed(1)} g per 100 g serving`)
          })
          .on('mousemove', (event) => {
            tt.style('left', `${event.clientX + 14}px`).style('top', `${event.clientY - 38}px`)
          })
          .on('mouseout', () => tt.style('opacity', 0))
          .on('click', () => onActivate(d.food.fdcId))

        // % label inside bar
        if (barW > 26) {
          innerG.append('text')
            .attr('x', xOff + barW / 2).attr('y', rowY + ROW_H / 2)
            .attr('text-anchor', 'middle').attr('dominant-baseline', 'middle')
            .text(`${Math.round(d[k])}%`)
            .style('font-size', '10px').style('font-weight', '600')
            .style('fill', '#fff').style('pointer-events', 'none')
            .style('opacity', isBrushed ? 1 : 0.2)
        }

        xOff += barW
      })
    })

    // x-axis tick labels
    ;[0, 25, 50, 75, 100].forEach((v) => {
      innerG.append('text')
        .attr('x', x(v)).attr('y', H + 18)
        .attr('text-anchor', 'middle')
        .text(`${v}%`)
        .style('font-size', '9px').style('fill', '#9ca3af')
      innerG.append('line')
        .attr('x1', x(v)).attr('x2', x(v))
        .attr('y1', 0).attr('y2', H)
        .attr('stroke', v === 0 ? '#d1d5db' : '#f3f4f6')
        .attr('stroke-width', 1)
    })

    // Legend (right side)
    const legendG = outerSvg.append('g')
      .attr('transform', `translate(${margin.left + W + 12}, ${margin.top + H / 2 - 28})`)
    SEG_ORDER.forEach((k, i) => {
      legendG.append('rect')
        .attr('y', i * 20).attr('width', 10).attr('height', 10)
        .attr('fill', SEG[k].color).attr('rx', 2)
      legendG.append('text')
        .attr('x', 14).attr('y', i * 20 + 9)
        .text(SEG[k].label)
        .style('font-size', '10px').style('fill', '#6b7280')
    })

    // D3 brush — draw over rows to highlight foods across all charts
    const brush = d3.brush()
      .extent([[0, 0], [W, H]])
      .on('start brush end', ({ selection, type }) => {
        if (!selection) {
          if (type === 'end') onBrushRef.current([])
          return
        }
        const [[, y0], [, y1]] = selection
        const brushed = chartData.filter((_, i) => {
          const rowCentre = i * ROW_H + ROW_H / 2
          return rowCentre >= y0 && rowCentre <= y1
        })
        onBrushRef.current(brushed.map((d) => d.food.fdcId))
      })

    innerG.append('g').attr('class', 'brush').call(brush)

  }, [foods, chartData, activeId, brushedIds, onActivate])

  useEffect(() => { draw() }, [draw])

  if (!foods.length) {
    return (
      <div className="chart-card chart-empty">
        <h3>Calorie Breakdown</h3>
        <p>Select foods to see where their calories come from.</p>
      </div>
    )
  }

  return (
    <div className="chart-card">
      <div className="chart-header">
        <h3>Calorie Breakdown</h3>
        <span className="chart-hint">% of calories from protein, carbs, fat · drag to brush</span>
      </div>
      <svg ref={svgRef} style={{ width: '100%', display: 'block' }} />
      <div ref={ttRef} className="chart-tooltip" />
    </div>
  )
}
