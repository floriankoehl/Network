# NutriCompare — Nutrition Dashboard

Evidence-based food comparison tool for nutritionists and dietitians.  
Built with React + Vite + D3.js, data from USDA FoodData Central.

---

## Purpose

Professional nutritionists and dietitians can search for foods, select up to 4 for side-by-side comparison, and explore macro/micronutrient profiles across five linked D3 charts. The goal is faster, evidence-based food selection for meal planning (athletes, diabetes clients, weight-loss clients, general health).

---

## Setup

### 1. Install dependencies
```bash
npm install
```

### 2. Configure API key
Create or edit `.env` in the project root:
```
VITE_USDA_API_KEY=your_key_here
```
Get a free key at: https://fdc.nal.usda.gov/api-guide

### 3. Run locally
```bash
npm run dev
```
Open http://localhost:5173

### 4. Build for deployment
```bash
npm run build
```
Static output is in `dist/` — deploy to any static host (Netlify, GitHub Pages, etc.).

### 5. Preview production build
```bash
npm run preview
```

---

## Assignment Features

| Requirement | Implementation |
|---|---|
| ≥ 4 D3 charts | Scatter, Grouped Bar, Parallel Coordinates, Micronutrient, Nutrient Density (5 total) |
| Pure D3.js SVG | All charts use D3 scales, axes, data binding, SVG elements — no Recharts/Chart.js |
| Brushing + linking | D3 `d3.brush()` on scatter plot; brushed IDs flow via React state to all other charts + results list |
| Static Vite app | `npm run build` → `/dist` folder |
| Tooltips | Every chart element has hover tooltips showing exact values and units |

### Charts

1. **Scatter Plot** (`ScatterBrushChart`) — x/y axes are user-selectable nutrients. Shows all search results as dots; selected foods are larger with a border. Main source of brushing.
2. **Grouped Bar Chart** (`GroupedBarChart`) — 6 macronutrients compared across all selected foods. Brushed foods at full opacity; others fade to 15%.
3. **Parallel Coordinates** (`ParallelCoordinatesChart`) — 10 nutrient axes. Each line = one food. Brushed foods highlighted; others fade. Active food drawn on top with thicker stroke.
4. **Micronutrient Profile** (`MicroNutrientChart`) — Horizontal bar chart showing 6 micronutrients as % of daily recommended value for the focused food. Amber colour warns when sodium exceeds 100% DV.
5. **Nutrient Density** (`NutrientDensityChart`) — Protein, fiber, and sodium density per 100 kcal — the key dietitian metric for food selection quality.

### Brushing + Linking Explained

1. User searches for a food → up to 15 results appear in the sidebar list **and** as scatter dots.
2. User drags a rectangle on the scatter plot → `d3.brush()` fires a `brush` event.
3. The chart computes which dots are inside the extent and calls `onBrush(fdcIds[])`.
4. `brushedIds` is stored as a `Set` in React state (via `useBrushingLinking` hook).
5. Every chart and the results list receives `brushedIds` as a prop and adjusts opacity:
   - Brushed items → full opacity
   - Non-brushed items → 0.08–0.15 opacity
6. Clicking "Clear brush" or clearing the selection in the scatter restores all items to full opacity.
7. Clicking any food anywhere sets `activeId`, which focuses that food in the micronutrient and parallel charts.

### Design Principles Applied

- **Color**: Tableau10 4-color subset (`#4e79a7`, `#f28e2b`, `#59a14f`, `#e15759`). No rainbow scales. Consistent food color across all charts.
- **Gestalt proximity**: Controls grouped in sidebar; charts in main area; insights between selection and charts.
- **Low clutter**: Non-brushed items fade rather than disappear; max 4 foods; axis labels abbreviated in parallel chart.
- **Task-oriented**: Insight panel (Highest Protein, Best Protein/Cal, etc.) directly supports dietitian decision-making.

---

## Project Structure

```
src/
  api.js                        USDA API calls + localStorage cache
  App.jsx                       Root component, all state, layout
  utils/
    nutrientMapping.js          All nutrient IDs, labels, units, DVs
    nutritionCalculations.js    Extraction, normalization, density, insights
    colorScales.js              4-color food palette helpers
  hooks/
    useFoodSearch.js            Search state + fetch
    useFoodDetails.js           Selected food details + color assignment
    useBrushingLinking.js       brushedIds, activeId state
  components/
    SearchBar.jsx
    FoodResults.jsx             Results list with brush highlight
    SelectedFoods.jsx           Food chips with active state
    InsightPanel.jsx            Auto-generated comparison insights
    charts/
      GroupedBarChart.jsx       D3 grouped bar, macronutrients
      ScatterBrushChart.jsx     D3 scatter + d3.brush (main brush source)
      ParallelCoordinatesChart.jsx  D3 parallel coordinates
      MicroNutrientChart.jsx    D3 horizontal bars, % DV micronutrients
      NutrientDensityChart.jsx  D3 horizontal bars, g per 100 kcal
  styles/
    dashboard.css
```

---

## AI Usage Reflection

*[Fill in per assignment requirements — describe how Claude Code was used to scaffold and refine this project, what was accepted as-is, what required manual correction, and how it supported the visualization design decisions.]*
