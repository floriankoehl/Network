import { useEffect, useRef, useCallback } from 'react'
import * as d3 from 'd3'
import { NUTRIENTS, SCATTER_OPTIONS } from '../../utils/nutrientMapping'
import { extractNutrientValue, truncate } from '../../utils/nutritionCalculations'
import { foodColor, UNSELECTED_DOT_COLOR } from '../../utils/colorScales'

export default function ScatterBrushChart({
  foods,        // search results (FoodSummary[])
  selectedIds,  // Set<fdcId> — which are in the detail panel
  foodColorMap, // Map<fdcId, colorIndex>
  brushedIds,
  activeId,
  xKey, yKey,
  onXChange, onYChange,
  onBrush,
  onActivate,
}) {
  const svgRef    = useRef(null)
  const ttRef     = useRef(null)
  const onBrushRef = useRef(onBrush)
  useEffect(() => { onBrushRef.current = onBrush }, [onBrush])

  const draw = useCallback(() => {
    if (!svgRef.current || !foods.length) return

    const margin = { top: 16, right: 20, bottom: 52, left: 56 }
    const totalW = svgRef.current.clientWidth || 460
    const totalH = 320
    const W = totalW - margin.left - margin.right
    const H = totalH - margin.top - margin.bottom

    d3.select(svgRef.current).selectAll('*').remove()

    const outerSvg = d3.select(svgRef.current)
      .attr('width', totalW).attr('height', totalH)

    const innerG = outerSvg.append('g')
      .attr('transform', `translate(${margin.left},${margin.top})`)

    // Scales
    const xVals = foods.map((f) => extractNutrientValue(f, xKey))
    const yVals = foods.map((f) => extractNutrientValue(f, yKey))
    const xMax  = d3.max(xVals) || 1
    const yMax  = d3.max(yVals) || 1

    const xScale = d3.scaleLinear().domain([0, xMax * 1.1]).range([0, W]).nice()
    const yScale = d3.scaleLinear().domain([0, yMax * 1.1]).range([H, 0]).nice()

    // Grid
    const xGrid = innerG.append('g').attr('class', 'grid')
      .attr('transform', `translate(0,${H})`)
      .call(d3.axisBottom(xScale).ticks(5).tickSize(-H).tickFormat(''))
    xGrid.select('.domain').remove()
    xGrid.selectAll('line').attr('stroke', '#e8eaee').attr('stroke-dasharray', '3,3')

    const yGrid = innerG.append('g').attr('class', 'grid')
      .call(d3.axisLeft(yScale).ticks(5).tickSize(-W).tickFormat(''))
    yGrid.select('.domain').remove()
    yGrid.selectAll('line').attr('stroke', '#e8eaee').attr('stroke-dasharray', '3,3')

    // Axes
    innerG.append('g').attr('transform', `translate(0,${H})`)
      .call(d3.axisBottom(xScale).ticks(5))
      .call((g) => { g.select('.domain').attr('stroke', '#d1d5db'); g.selectAll('text').style('font-size', '10px') })

    innerG.append('g')
      .call(d3.axisLeft(yScale).ticks(5))
      .call((g) => { g.select('.domain').remove(); g.selectAll('text').style('font-size', '10px') })

    // Axis labels
    innerG.append('text')
      .attr('x', W / 2).attr('y', H + 42)
      .attr('text-anchor', 'middle')
      .text(`${NUTRIENTS[xKey].label} (${NUTRIENTS[xKey].unit})`)
      .style('font-size', '11px').style('fill', '#6b7280')

    innerG.append('text')
      .attr('transform', 'rotate(-90)')
      .attr('x', -H / 2).attr('y', -44)
      .attr('text-anchor', 'middle')
      .text(`${NUTRIENTS[yKey].label} (${NUTRIENTS[yKey].unit})`)
      .style('font-size', '11px').style('fill', '#6b7280')

    const hasBrush = brushedIds.size > 0
    const tt = d3.select(ttRef.current)

    // Dots — drawn before brush so brush overlay sits on top
    const dotsG = innerG.append('g').attr('class', 'dots')
    dotsG.selectAll('circle')
      .data(foods)
      .join('circle')
      .attr('cx', (d) => xScale(extractNutrientValue(d, xKey)))
      .attr('cy', (d) => yScale(extractNutrientValue(d, yKey)))
      .attr('r',  (d) => selectedIds.has(d.fdcId) ? 8 : 5)
      .attr('fill', (d) => {
        if (selectedIds.has(d.fdcId)) return foodColor(foodColorMap.get(d.fdcId) ?? 0)
        return UNSELECTED_DOT_COLOR
      })
      .attr('stroke', (d) => selectedIds.has(d.fdcId) ? '#1f2937' : 'none')
      .attr('stroke-width', 1.5)
      .attr('opacity', (d) => {
        if (hasBrush) return brushedIds.has(d.fdcId) ? 1 : 0.12
        if (activeId === d.fdcId) return 1
        return 0.75
      })
      .style('cursor', 'pointer')

    // Labels for selected foods
    dotsG.selectAll('.dot-label')
      .data(foods.filter((f) => selectedIds.has(f.fdcId)))
      .join('text')
      .attr('class', 'dot-label')
      .attr('x', (d) => xScale(extractNutrientValue(d, xKey)) + 10)
      .attr('y', (d) => yScale(extractNutrientValue(d, yKey)) + 4)
      .text((d) => truncate(d.description, 18))
      .style('font-size', '9px')
      .style('fill', '#374151')
      .style('pointer-events', 'none')

    // D3 Brush — appended after dots so it captures drag events
    const brush = d3.brush()
      .extent([[0, 0], [W, H]])
      .on('start brush end', ({ selection, type }) => {
        if (!selection) {
          if (type === 'end') onBrushRef.current([])
          return
        }
        const [[x0, y0], [x1, y1]] = selection
        const brushed = foods.filter((f) => {
          const fx = xScale(extractNutrientValue(f, xKey))
          const fy = yScale(extractNutrientValue(f, yKey))
          return fx >= x0 && fx <= x1 && fy >= y0 && fy <= y1
        })
        onBrushRef.current(brushed.map((f) => f.fdcId))
      })

    innerG.append('g').attr('class', 'brush').call(brush)

    // Tooltip via SVG-level mousemove — works even with brush overlay on top
    outerSvg.on('mousemove', (event) => {
      const [mx, my] = d3.pointer(event, innerG.node())
      let closest = null, minDist = 28
      foods.forEach((f) => {
        const fx = xScale(extractNutrientValue(f, xKey))
        const fy = yScale(extractNutrientValue(f, yKey))
        const dist = Math.hypot(mx - fx, my - fy)
        if (dist < minDist) { minDist = dist; closest = f }
      })
      if (closest) {
        const xv = extractNutrientValue(closest, xKey)
        const yv = extractNutrientValue(closest, yKey)
        tt.style('opacity', 1)
          .style('left', `${event.clientX + 14}px`)
          .style('top',  `${event.clientY - 36}px`)
          .html(`<strong>${truncate(closest.description, 44)}</strong><br/>
                 ${NUTRIENTS[xKey].label}: <b>${xv.toFixed(1)} ${NUTRIENTS[xKey].unit}</b><br/>
                 ${NUTRIENTS[yKey].label}: <b>${yv.toFixed(1)} ${NUTRIENTS[yKey].unit}</b>
                 ${selectedIds.has(closest.fdcId) ? '<br/><em>Selected ✓</em>' : ''}`)
      } else {
        tt.style('opacity', 0)
      }
    }).on('mouseleave', () => tt.style('opacity', 0))

    // Click on SVG to activate nearest food
    outerSvg.on('click', (event) => {
      if (d3.select(event.target).classed('selection')) return
      const [mx, my] = d3.pointer(event, innerG.node())
      let closest = null, minDist = 20
      foods.forEach((f) => {
        const fx = xScale(extractNutrientValue(f, xKey))
        const fy = yScale(extractNutrientValue(f, yKey))
        const dist = Math.hypot(mx - fx, my - fy)
        if (dist < minDist) { minDist = dist; closest = f }
      })
      if (closest) onActivate(closest.fdcId)
    })
  }, [foods, selectedIds, foodColorMap, brushedIds, activeId, xKey, yKey, onActivate])

  useEffect(() => { draw() }, [draw])

  const empty = !foods.length

  return (
    <div className="chart-card">
      <div className="chart-header">
        <h3>Nutrient Scatter — Brush to Link</h3>
        <span className="chart-hint">Drag a rectangle to highlight foods across all views</span>
      </div>
      {!empty && (
        <div className="scatter-controls">
          <label>
            X&nbsp;
            <select value={xKey} onChange={(e) => onXChange(e.target.value)}>
              {SCATTER_OPTIONS.map((k) => (
                <option key={k} value={k}>{NUTRIENTS[k].label} ({NUTRIENTS[k].unit})</option>
              ))}
            </select>
          </label>
          <label>
            Y&nbsp;
            <select value={yKey} onChange={(e) => onYChange(e.target.value)}>
              {SCATTER_OPTIONS.map((k) => (
                <option key={k} value={k}>{NUTRIENTS[k].label} ({NUTRIENTS[k].unit})</option>
              ))}
            </select>
          </label>
        </div>
      )}
      {empty ? (
        <div className="chart-empty-inner">
          <p>Search for foods — they will appear here as scatter dots.</p>
          <p className="hint">Selected foods are highlighted; drag to brush-select across charts.</p>
        </div>
      ) : (
        <svg ref={svgRef} style={{ width: '100%', display: 'block' }} />
      )}
      <div ref={ttRef} className="chart-tooltip" />
    </div>
  )
}
