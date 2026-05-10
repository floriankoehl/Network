import { useState, useMemo, useEffect } from 'react'
import SearchBar      from './components/SearchBar'
import FoodResults    from './components/FoodResults'
import SelectedFoods  from './components/SelectedFoods'
import InsightPanel   from './components/InsightPanel'
import NutrientTable  from './components/NutrientTable'
import GroupedBarChart          from './components/charts/GroupedBarChart'
import CalorieBreakdownChart    from './components/charts/CalorieBreakdownChart'
import ParallelCoordinatesChart from './components/charts/ParallelCoordinatesChart'
import NutrientDensityChart     from './components/charts/NutrientDensityChart'
import Chart3D                  from './components/charts/Chart3D'
import RadarChart               from './components/charts/RadarChart'
import { useFoodSearch }        from './hooks/useFoodSearch'
import { useFoodDetails }       from './hooks/useFoodDetails'
import { useBrushingLinking }   from './hooks/useBrushingLinking'
import { searchFoods }          from './api'

export default function App() {
  // ── Data layers ──────────────────────────────────────────────────────────
  const {
    results, totalResults, loading: searchLoading, error: searchError, search,
    page, totalPages, nextPage, prevPage,
  } = useFoodSearch()
  const { foods: selectedFoods, loading: detailLoading, error: detailError, addFood, addFoodDirect, removeFood } = useFoodDetails()

  // ── Brushing + linking state ──────────────────────────────────────────────
  const { brushedIds, activeId, brush, clearBrush, activate, removeFood: removeLinkFood } = useBrushingLinking()

  // ── Derived values ────────────────────────────────────────────────────────
  const foodsArray = useMemo(() => [...selectedFoods.values()], [selectedFoods])
  const selectedIds = useMemo(() => new Set(selectedFoods.keys()), [selectedFoods])

  const activeFood = useMemo(() => {
    if (activeId && selectedFoods.has(activeId)) return selectedFoods.get(activeId)
    return foodsArray[0] ?? null
  }, [activeId, selectedFoods, foodsArray])

  // Auto-activate first food when added
  useEffect(() => {
    if (foodsArray.length === 1 && !activeId) activate(foodsArray[0].fdcId)
  }, [foodsArray.length]) // eslint-disable-line react-hooks/exhaustive-deps

  // Preload demo foods on first mount
  useEffect(() => {
    const DEMO_QUERIES = ['apple', 'nuts', 'chicken breast', 'olive oil']
    async function loadDemo() {
      for (const query of DEMO_QUERIES) {
        try {
          const res = await searchFoods(query)
          if (res.length > 0) addFoodDirect(res[0])
        } catch { /* ignore */ }
      }
    }
    loadDemo()
  }, []) // eslint-disable-line react-hooks/exhaustive-deps

  // ── Handlers ─────────────────────────────────────────────────────────────
  async function handleSelectFood(food) {
    if (selectedFoods.has(food.fdcId)) {
      removeFood(food.fdcId)
      removeLinkFood(food.fdcId)
      return
    }
    if (selectedFoods.size >= 4) return
    await addFood(food.fdcId)
    activate(food.fdcId)
  }

  function handleRemoveFood(fdcId) {
    removeFood(fdcId)
    removeLinkFood(fdcId)
  }

  const anyError = searchError || detailError

  return (
    <div className="app">
      {/* ── Header ─────────────────────────────────────────────────────── */}
      <header className="app-header">
        <div className="header-brand">
          <h1>NutriCompare</h1>
          <p>Evidence-based food comparison for nutritionists &amp; dietitians · USDA FoodData Central</p>
        </div>
        <div className="header-status">
          {detailLoading && <span className="status-badge badge-loading">Loading…</span>}
          {brushedIds.size > 0 && (
            <button className="clear-brush-btn" onClick={clearBrush}>
              Clear brush ({brushedIds.size} highlighted)
            </button>
          )}
        </div>
      </header>

      <div className="dashboard-layout">
        {/* ── Sidebar ───────────────────────────────────────────────────── */}
        <aside className="sidebar">
          <div className="sidebar-section">
            <SearchBar onSearch={search} loading={searchLoading} />
            {anyError && <p className="error-msg">{anyError}</p>}
          </div>

          <div className="sidebar-section sidebar-section-results">
            <span className="section-label">
              Search results
              {totalResults > 0 && <span className="count-badge">{totalResults}</span>}
            </span>
            <p className="hint">Click a result to add it for comparison (max 4).</p>
            <FoodResults
              results={results}
              selectedIds={selectedIds}
              brushedIds={brushedIds}
              loading={searchLoading}
              onSelect={handleSelectFood}
              page={page}
              totalPages={totalPages}
              totalResults={totalResults}
              onNext={nextPage}
              onPrev={prevPage}
            />
          </div>
        </aside>

        {/* ── Main area ─────────────────────────────────────────────────── */}
        <main className="main-area">
          <SelectedFoods
            foods={foodsArray}
            activeId={activeId ?? activeFood?.fdcId}
            onActivate={activate}
            onRemove={handleRemoveFood}
          />

          {foodsArray.length >= 2 && <InsightPanel foods={foodsArray} />}
          <NutrientTable
            foods={foodsArray}
            activeId={activeId ?? activeFood?.fdcId}
            onActivate={activate}
          />

          {/* ── 3D Macro Space (full width) ─────────────────────────────── */}
          <div className="charts-full">
            <Chart3D
              foods={foodsArray}
              activeId={activeId ?? activeFood?.fdcId}
              onActivate={activate}
            />
          </div>

          {/* ── Charts row 1: Calorie Breakdown | Grouped Bar ───────────── */}
          <div className="charts-grid-2">
            <CalorieBreakdownChart
              foods={foodsArray}
              activeId={activeId ?? activeFood?.fdcId}
              onActivate={activate}
              brushedIds={brushedIds}
              onBrush={brush}
            />
            <GroupedBarChart
              foods={foodsArray}
              brushedIds={brushedIds}
              activeId={activeId}
              onActivate={activate}
            />
          </div>

          {/* ── Charts row 2: Parallel coordinates (full width) ─────────── */}
          <div className="charts-full">
            <ParallelCoordinatesChart
              foods={foodsArray}
              brushedIds={brushedIds}
              activeId={activeId ?? activeFood?.fdcId}
              onActivate={activate}
            />
          </div>

          {/* ── Charts row 3: Density | Radar ───────────────────────────── */}
          <div className="charts-grid-2">
            <NutrientDensityChart foods={foodsArray} brushedIds={brushedIds} />
            <RadarChart
              foods={foodsArray}
              activeId={activeId ?? activeFood?.fdcId}
              onActivate={activate}
            />
          </div>

          {!foodsArray.length && !results && (
            <div className="welcome-state">
              <div className="welcome-inner">
                <h2>Start comparing foods</h2>
                <ol>
                  <li>Search for a food in the sidebar (e.g. <em>chicken breast</em>)</li>
                  <li>Click results to add up to 4 foods for comparison</li>
                  <li>Drag over the calorie breakdown bars to brush-link across all charts</li>
                  <li>Click a food chip to view its micronutrient profile</li>
                </ol>
              </div>
            </div>
          )}
        </main>
      </div>
    </div>
  )
}
