import { useEffect, useRef, useMemo } from 'react'
import * as d3 from 'd3'
import { calcDensity, truncate } from '../../utils/nutritionCalculations'
import { foodColor } from '../../utils/colorScales'

const DENSITY_METRICS = [
  { key: 'protein', label: 'Protein density',  unit: 'g / 100 kcal', color: null },
  { key: 'fiber',   label: 'Fiber density',    unit: 'g / 100 kcal', color: null },
  { key: 'sodium',  label: 'Sodium density',   unit: 'mg / 100 kcal', color: '#f59e0b' },
]

export default function NutrientDensityChart({ foods, brushedIds }) {
  const svgRef = useRef(null)
  const ttRef  = useRef(null)

  const data = useMemo(() => {
    return foods.map((f) => ({ food: f, density: calcDensity(f) }))
  }, [foods])

  useEffect(() => {
    if (!data.length || !svgRef.current) return

    const nMetrics = DENSITY_METRICS.length
    const margin   = { top: 8, right: 16, bottom: 40, left: 130 }
    const rowH     = 20
    const groupGap = 10
    const totalH   = nMetrics * (foods.length * rowH + groupGap) + margin.top + margin.bottom
    const totalW   = svgRef.current.clientWidth || 440
    const W = totalW - margin.left - margin.right

    d3.select(svgRef.current).selectAll('*').remove()

    const svg = d3.select(svgRef.current)
      .attr('width', totalW).attr('height', Math.max(totalH, 120))
      .append('g').attr('transform', `translate(${margin.left},${margin.top})`)

    const hasBrush = brushedIds.size > 0
    const tt = d3.select(ttRef.current)

    let yOffset = 0

    DENSITY_METRICS.forEach(({ key, label, unit, color: fixedColor }) => {
      const vals = data.map((d) => d.density[key])
      const maxVal = d3.max(vals) || 1

      const x = d3.scaleLinear().domain([0, maxVal * 1.12]).range([0, W]).nice()

      // Group label
      svg.append('text')
        .attr('x', -margin.left + 4).attr('y', yOffset + 12)
        .text(label)
        .style('font-size', '11px').style('font-weight', '600').style('fill', '#374151')

      // x-axis for this group (bottom of group)
      svg.append('g')
        .attr('transform', `translate(0,${yOffset + foods.length * rowH + 2})`)
        .call(d3.axisBottom(x).ticks(4).tickSize(3))
        .call((g) => {
          g.select('.domain').attr('stroke', '#e5e7eb')
          g.selectAll('text').style('font-size', '9px').style('fill', '#9ca3af')
        })

      data.forEach(({ food, density }, fi) => {
        const ci   = food._colorIndex ?? fi
        const barW = Math.max(0, x(density[key]))
        const y    = yOffset + fi * rowH + 14
        const isBrushed = !hasBrush || brushedIds.has(food.fdcId)

        // Bar
        svg.append('rect')
          .attr('x', 0).attr('y', y)
          .attr('width', barW).attr('height', rowH - 4)
          .attr('fill', fixedColor ?? foodColor(ci))
          .attr('rx', 2)
          .attr('opacity', isBrushed ? 0.85 : 0.15)

        // Food name label (left)
        svg.append('text')
          .attr('x', -4).attr('y', y + (rowH - 4) / 2 + 1)
          .attr('text-anchor', 'end').attr('dominant-baseline', 'middle')
          .text(truncate(food.description, 18))
          .style('font-size', '10px').style('fill', '#6b7280')

        // Value label
        svg.append('text')
          .attr('x', barW + 4).attr('y', y + (rowH - 4) / 2 + 1)
          .attr('dominant-baseline', 'middle')
          .text(density[key].toFixed(1))
          .style('font-size', '9px').style('fill', '#9ca3af')

        // Hover area
        svg.append('rect')
          .attr('x', 0).attr('y', y)
          .attr('width', W).attr('height', rowH - 4)
          .attr('fill', 'transparent')
          .on('mouseover', (event) => {
            tt.style('opacity', 1)
              .html(`<strong>${food.description.slice(0, 44)}</strong><br/>
                     ${label}: <b>${density[key].toFixed(2)} ${unit}</b>`)
          })
          .on('mousemove', (event) => {
            tt.style('left', `${event.clientX + 14}px`).style('top', `${event.clientY - 36}px`)
          })
          .on('mouseout', () => tt.style('opacity', 0))
      })

      yOffset += foods.length * rowH + groupGap + 18
    })
  }, [data, brushedIds])

  if (!foods.length) {
    return (
      <div className="chart-card chart-empty">
        <h3>Nutrient Density</h3>
        <p>Select foods to compare nutrient density per 100 kcal.</p>
      </div>
    )
  }

  return (
    <div className="chart-card">
      <div className="chart-header">
        <h3>Nutrient Density</h3>
        <span className="chart-hint">Per 100 kcal — useful for dietitian food selection</span>
      </div>
      <svg ref={svgRef} style={{ width: '100%', display: 'block' }} />
      <div ref={ttRef} className="chart-tooltip" />
    </div>
  )
}
