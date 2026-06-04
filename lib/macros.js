/**
 * @typedef {Object} Macros
 * @property {number} protein - Protein in grams (20% of calories)
 * @property {number} fats - Fats in grams (20% of calories)
 * @property {number} carbs - Carbohydrates in grams (60% of calories)
 */

/**
 * Calculates daily macronutrient targets based on a daily calorie goal.
 * Uses a fixed ratio: 20% Protein, 20% Fat, 60% Carbs.
 * 
 * @param {number|null|undefined} dailyCalories - The daily calorie goal
 * @returns {Macros} Calculated macros rounded to the nearest whole number
 */
export function calculateMacros(dailyCalories) {
  // Handle invalid values: Negative, Zero, Null, or Undefined
  if (
    dailyCalories === null || 
    dailyCalories === undefined || 
    typeof dailyCalories !== 'number' || 
    dailyCalories <= 0 ||
    isNaN(dailyCalories)
  ) {
    return {
      protein: 0,
      fats: 0,
      carbs: 0
    };
  }

  // Calculate grams based on calories per gram
  // Protein: 4 kcal/g, Fats: 9 kcal/g, Carbs: 4 kcal/g
  const proteinGrams = (dailyCalories * 0.20) / 4;
  const fatGrams = (dailyCalories * 0.20) / 9;
  const carbGrams = (dailyCalories * 0.60) / 4;

  // Round values to the nearest whole number
  return {
    protein: Math.round(proteinGrams),
    fats: Math.round(fatGrams),
    carbs: Math.round(carbGrams)
  };
}
