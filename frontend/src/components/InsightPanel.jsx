import { useMemo } from 'react'
import { generateInsights } from '../utils/nutritionCalculations'
import { truncate } from '../utils/nutritionCalculations'

export default function InsightPanel({ foods }) {
  const insights = useMemo(() => generateInsights(foods), [foods])
  if (!insights.length) return null

  return (
    <div className="insight-panel">
      <div className="insight-panel-header">
        <span className="insight-title">Quick Insights</span>
        <span className="insight-scope">comparing your {foods.length} selected foods</span>
      </div>
      <div className="insight-items">
        {insights.map((ins) => (
          <div key={ins.label} className="insight-item">
            <span className="insight-icon">{ins.icon}</span>
            <div className="insight-body">
              <span className="insight-label">{ins.label}</span>
              <span className="insight-food">{truncate(ins.food, 28)}</span>
              <span className="insight-value">{ins.value}</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
