// Central nutrient registry — single source of truth for all IDs, labels, units, DVs
export const NUTRIENTS = {
  calories:  { id: 1008, label: 'Calories',   short: 'Cal',   unit: 'kcal', dv: 2000 },
  protein:   { id: 1003, label: 'Protein',    short: 'Pro',   unit: 'g',    dv: 50   },
  fat:       { id: 1004, label: 'Fat',         short: 'Fat',   unit: 'g',    dv: 78   },
  carbs:     { id: 1005, label: 'Carbs',       short: 'Carbs', unit: 'g',    dv: 275  },
  fiber:     { id: 1079, label: 'Fiber',       short: 'Fiber', unit: 'g',    dv: 28   },
  sugar:     { id: 2000, label: 'Sugar',       short: 'Sugar', unit: 'g',    dv: 50   },
  sodium:    { id: 1093, label: 'Sodium',      short: 'Na',    unit: 'mg',   dv: 2300 },
  calcium:   { id: 1087, label: 'Calcium',     short: 'Ca',    unit: 'mg',   dv: 1300 },
  iron:      { id: 1089, label: 'Iron',        short: 'Fe',    unit: 'mg',   dv: 18   },
  potassium: { id: 1092, label: 'Potassium',   short: 'K',     unit: 'mg',   dv: 4700 },
  vitaminA:  { id: 1106, label: 'Vitamin A',   short: 'VitA',  unit: 'µg',   dv: 900  },
  vitaminC:  { id: 1162, label: 'Vitamin C',   short: 'VitC',  unit: 'mg',   dv: 90   },
}

export const MACRO_KEYS     = ['calories', 'protein', 'fat', 'carbs', 'fiber', 'sugar']
export const MICRO_KEYS     = ['vitaminA', 'vitaminC', 'calcium', 'iron', 'potassium', 'sodium']
export const PARALLEL_KEYS  = ['calories', 'protein', 'fat', 'carbs', 'fiber', 'sugar', 'sodium', 'calcium', 'iron', 'potassium']
export const SCATTER_OPTIONS = ['calories', 'protein', 'fat', 'carbs', 'fiber', 'sugar', 'sodium']
