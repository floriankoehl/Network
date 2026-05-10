// Tableau10 subset — accessible, no rainbow, colorblind-friendly
// Keep this array in sync with FOOD_COLORS_LIGHT for chip backgrounds
export const FOOD_COLORS = ['#4e79a7', '#f28e2b', '#59a14f', '#e15759']
export const FOOD_COLORS_LIGHT = ['#dde8f4', '#fde8cc', '#d4edcc', '#fad5d5']

export function foodColor(colorIndex) {
  return FOOD_COLORS[colorIndex % FOOD_COLORS.length]
}

export function foodColorLight(colorIndex) {
  return FOOD_COLORS_LIGHT[colorIndex % FOOD_COLORS_LIGHT.length]
}

// Muted color for unselected scatter dots
export const UNSELECTED_DOT_COLOR = '#94a3b8'
export const BRUSHED_HIGHLIGHT = '#fbbf24'
