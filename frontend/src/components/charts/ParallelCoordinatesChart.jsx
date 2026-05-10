import { useEffect, useRef } from 'react'
import * as d3 from 'd3'
import { NUTRIENTS, PARALLEL_KEYS } from '../../utils/nutrientMapping'
import { extractNutrientValue, truncate } from '../../utils/nutritionCalculations'
import { foodColor } from '../../utils/colorScales'

const AXES = PARALLEL_KEYS.map((k) => ({ key: k, ...NUTRIENTS[k] }))

export default function ParallelCoordinatesChart({ foods, brushedIds, activeId, onActivate }) {
  const svgRef = useRef(null)
  const ttRef  = useRef(null)

  useEffect(() => {
    if (!foods.length || !svgRef.current) return

    const margin = { top: 36, right: 24, bottom: 8, left: 24 }
    const totalW  = svgRef.current.clientWidth || 760
    const totalH  = 260
    const W = totalW - margin.left - margin.right
    const H = totalH - margin.top - margin.bottom

    d3.select(svgRef.current).selectAll('*').remove()

    const svg = d3.select(svgRef.current)
      .attr('width', totalW).attr('height', totalH)
      .append('g').attr('transform', `translate(${margin.left},${margin.top})`)

    // x — one position per axis, point scale
    const x = d3.scalePoint().domain(PARALLEL_KEYS).range([0, W]).padding(0.05)

    // y — one linear scale per axis, normalized to its own max
    const yScales = {}
    PARALLEL_KEYS.forEach((k) => {
      const vals = foods.map((f) => extractNutrientValue(f, k))
      yScales[k] = d3.scaleLinear()
        .domain([0, d3.max(vals) * 1.1 || 1])
        .range([H, 0])
        .nice()
    })

    const hasBrush = brushedIds.size > 0
    const tt = d3.select(ttRef.current)

    // Line path for a single food
    const makePath = (food) => {
      const pts = PARALLEL_KEYS.map((k) => [x(k), yScales[k](extractNutrientValue(food, k))])
      return d3.line()(pts)
    }

    // Render non-active foods first, active food last (on top)
    const sorted = [...foods].sort((a, b) => {
      if (a.fdcId === activeId) return 1
      if (b.fdcId === activeId) return -1
      return 0
    })

    sorted.forEach((food) => {
      const ci = food._colorIndex ?? 0
      const isActive = food.fdcId === activeId
      const isBrushed = !hasBrush || brushedIds.has(food.fdcId)

      svg.append('path')
        .datum(food)
        .attr('d', makePath(food))
        .attr('fill', 'none')
        .attr('stroke', foodColor(ci))
        .attr('stroke-width', isActive ? 2.8 : 1.6)
        .attr('stroke-dasharray', isActive ? null : null)
        .attr('opacity', isBrushed ? (isActive ? 1 : 0.72) : 0.08)
        .style('cursor', 'pointer')
        .on('mouseover', function (event) {
          d3.select(this).attr('stroke-width', 3).attr('opacity', 1)
          tt.style('opacity', 1)
            .html(`<strong>${truncate(food.description, 46)}</strong>`)
        })
        .on('mousemove', (event) => {
          tt.style('left', `${event.clientX + 14}px`).style('top', `${event.clientY - 36}px`)
        })
        .on('mouseout', function () {
          d3.select(this)
            .attr('stroke-width', isActive ? 2.8 : 1.6)
            .attr('opacity', isBrushed ? (isActive ? 1 : 0.72) : 0.08)
          tt.style('opacity', 0)
        })
        .on('click', () => onActivate(food.fdcId))
    })

    // Draw axes on top of lines
    PARALLEL_KEYS.forEach((k) => {
      const xPos = x(k)
      const axisG = svg.append('g').attr('transform', `translate(${xPos},0)`)

      axisG.call(
        d3.axisLeft(yScales[k])
          .ticks(4)
          .tickSize(4)
          .tickFormat((v) => v >= 1000 ? `${(v/1000).toFixed(1)}k` : v)
      )
      axisG.select('.domain').attr('stroke', '#9ca3af')
      axisG.selectAll('.tick line').attr('stroke', '#d1d5db')
      axisG.selectAll('.tick text')
        .style('font-size', '9px')
        .style('fill', '#6b7280')

      // Axis label at top
      axisG.append('text')
        .attr('y', -14)
        .attr('text-anchor', 'middle')
        .text(AXES.find((a) => a.key === k)?.short ?? k)
        .style('font-size', '11px')
        .style('font-weight', '600')
        .style('fill', '#374151')

      // Unit sub-label
      axisG.append('text')
        .attr('y', -4)
        .attr('text-anchor', 'middle')
        .text(NUTRIENTS[k].unit)
        .style('font-size', '8px')
        .style('fill', '#9ca3af')
    })

  }, [foods, brushedIds, activeId])

  if (!foods.length) {
    return (
      <div className="chart-card chart-empty">
        <h3>Parallel Nutrient Profile</h3>
        <p>Select foods to see their multi-axis nutrient profile.</p>
      </div>
    )
  }

  return (
    <div className="chart-card">
      <div className="chart-header">
        <h3>Parallel Nutrient Profile</h3>
        <span className="chart-hint">Each line = one food · click a line to focus · brushed foods highlighted</span>
      </div>
      <svg ref={svgRef} style={{ width: '100%', display: 'block', overflow: 'visible' }} />
      <div ref={ttRef} className="chart-tooltip" />
    </div>
  )
}
