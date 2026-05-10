import { useEffect, useRef, useMemo } from 'react'
import * as d3 from 'd3'
import { NUTRIENTS, MACRO_KEYS } from '../../utils/nutrientMapping'
import { extractNutrientValue } from '../../utils/nutritionCalculations'
import { foodColor } from '../../utils/colorScales'

export default function GroupedBarChart({ foods, brushedIds, activeId, onActivate }) {
  const svgRef = useRef(null)
  const ttRef  = useRef(null)

  const chartData = useMemo(() => {
    return MACRO_KEYS.map((key) => {
      const entry = { key, label: NUTRIENTS[key].label, unit: NUTRIENTS[key].unit }
      foods.forEach((f) => { entry[f.fdcId] = extractNutrientValue(f, key) })
      return entry
    })
  }, [foods])

  useEffect(() => {
    if (!foods.length || !svgRef.current) return

    const margin = { top: 16, right: 16, bottom: 64, left: 52 }
    const totalW = svgRef.current.clientWidth || 460
    const totalH = 320
    const W = totalW - margin.left - margin.right
    const H = totalH - margin.top - margin.bottom

    d3.select(svgRef.current).selectAll('*').remove()

    const svg = d3.select(svgRef.current)
      .attr('width', totalW).attr('height', totalH)
      .append('g').attr('transform', `translate(${margin.left},${margin.top})`)

    const nutrientLabels = MACRO_KEYS.map((k) => NUTRIENTS[k].label)
    const fdcIds         = foods.map((f) => String(f.fdcId))
    const hasBrush       = brushedIds.size > 0

    const x0 = d3.scaleBand().domain(nutrientLabels).range([0, W]).paddingInner(0.22)
    const x1 = d3.scaleBand().domain(fdcIds).range([0, x0.bandwidth()]).padding(0.06)

    const maxVal = d3.max(chartData, (d) => d3.max(foods, (f) => d[f.fdcId])) || 1
    const y = d3.scaleLinear().domain([0, maxVal * 1.12]).nice().range([H, 0])

    // Grid lines
    const grid = svg.append('g').attr('class', 'grid')
      .call(d3.axisLeft(y).ticks(5).tickSize(-W).tickFormat(''))
    grid.select('.domain').remove()
    grid.selectAll('line').attr('stroke', '#e8eaee').attr('stroke-dasharray', '3,3')

    // Axes
    svg.append('g')
      .call(d3.axisLeft(y).ticks(5).tickFormat((v) => v >= 1000 ? `${v/1000}k` : v))
      .select('.domain').remove()

    // Tooltip (ref-based, position: fixed)
    const tt = d3.select(ttRef.current)

    // Nutrient groups
    const groups = svg.selectAll('.ng')
      .data(chartData)
      .join('g').attr('class', 'ng')
      .attr('transform', (d) => `translate(${x0(d.label)},0)`)

    groups.selectAll('rect')
      .data((d) => foods.map((f) => ({
        fdcId: f.fdcId, desc: f.description, value: d[f.fdcId],
        label: d.label, unit: d.unit, ci: f._colorIndex ?? 0,
      })))
      .join('rect')
      .attr('x',      (d) => x1(String(d.fdcId)))
      .attr('y',      (d) => y(d.value))
      .attr('width',  x1.bandwidth())
      .attr('height', (d) => H - y(d.value))
      .attr('fill',   (d) => foodColor(d.ci))
      .attr('rx', 2)
      .attr('opacity', (d) => {
        if (hasBrush && !brushedIds.has(d.fdcId)) return 0.15
        if (activeId && d.fdcId !== activeId) return 0.55
        return 1
      })
      .style('cursor', 'pointer')
      .on('mouseover', (event, d) => {
        tt.style('opacity', 1)
          .html(`<strong>${d3.select(event.currentTarget.parentNode).datum().label}</strong><br/>
                 ${d.desc.slice(0, 40)}<br/>
                 <b>${d.value.toFixed(1)} ${d.unit}</b>`)
      })
      .on('mousemove', (event) => {
        tt.style('left', `${event.clientX + 14}px`).style('top', `${event.clientY - 36}px`)
      })
      .on('mouseout', () => tt.style('opacity', 0))
      .on('click', (event, d) => onActivate(d.fdcId))

    // Bottom axis — re-render labels with rotation for long text
    svg.append('g').attr('transform', `translate(0,${H})`)
      .call(d3.axisBottom(x0).tickSize(0))
      .call((g) => {
        g.select('.domain').attr('stroke', '#d1d5db')
        g.selectAll('text')
          .attr('dy', '1.2em')
          .style('font-size', '11px')
          .style('fill', '#374151')
      })

    // Legend
    const legend = svg.append('g').attr('transform', `translate(0,${H + 44})`)
    foods.forEach((f, i) => {
      const gx = i * Math.min(W / foods.length, 180)
      const lg = legend.append('g').attr('transform', `translate(${gx},0)`)
      lg.append('rect').attr('width', 10).attr('height', 10)
        .attr('fill', foodColor(f._colorIndex ?? i)).attr('rx', 2)
      lg.append('text').attr('x', 14).attr('y', 9)
        .text(f.description.slice(0, 22))
        .style('font-size', '10px').style('fill', '#4b5563')
    })
  }, [foods, chartData, brushedIds, activeId])

  if (!foods.length) {
    return (
      <div className="chart-card chart-empty">
        <h3>Macronutrient Comparison</h3>
        <p>Select 1–4 foods to compare macronutrients.</p>
      </div>
    )
  }

  return (
    <div className="chart-card">
      <div className="chart-header">
        <h3>Macronutrient Comparison</h3>
        <span className="chart-hint">Per 100 g serving · click a bar to focus</span>
      </div>
      <svg ref={svgRef} style={{ width: '100%', display: 'block' }} />
      <div ref={ttRef} className="chart-tooltip" />
    </div>
  )
}
