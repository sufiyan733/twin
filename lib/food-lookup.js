import categories from "@/lib/category-index.json";
import nutritionData from "@/lib/nutrition-data.json";

/**
 * Fast O(1) lingo resolution.
 * Hits lingo_map first. If found, returns the exact food from food_lookup.
 */
export function getFoodByTerm(term) {
  if (!term) return null;
  const canonical = categories.lingo_map[term.toLowerCase().trim()];
  if (canonical) {
    return nutritionData.food_lookup[canonical] || null;
  }
  return null;
}

/**
 * Retrieves foods by category with specific handling for mixed categories like oils_fats.
 */
export function getFoodsByCategory(categoryName, typeFilter = null) {
  const results = [];
  for (const [name, food] of Object.entries(nutritionData.food_lookup)) {
    if (food.category === categoryName || food.branch === categoryName) {
      // Handle the "oils_fats" category carefully
      if (categoryName === "oils_fats") {
        const fat = food.raw.per_100g.fat;
        const cals = food.raw.per_100g.calories;
        
        if (typeFilter === "cooking_oil" && fat >= 80) {
          results.push(food);
        } else if (typeFilter === "milk_alternative" && cals < 100) {
          results.push(food);
        } else if (!typeFilter) {
          results.push(food);
        }
      } else {
        results.push(food);
      }
    }
  }
  return results;
}

/**
 * Given a user message, find all Indian food items mentioned.
 * Returns an array of matching food objects.
 */
export function findFoodsInMessage(message) {
  if (!message || typeof message !== "string") return [];

  const lower = message.toLowerCase();
  const matched = new Map(); // name → food item

  // We scan all lingo terms to see if the message includes them
  // This isn't O(1) for a full sentence, but allows detecting foods within prose
  for (const lingo of Object.keys(categories.lingo_map)) {
    if (lower.includes(lingo)) {
      const canonical = categories.lingo_map[lingo];
      if (!matched.has(canonical)) {
        const food = nutritionData.food_lookup[canonical];
        if (food) matched.set(canonical, food);
      }
    }
  }

  // Also check prepared meals
  for (const [mealName, mealData] of Object.entries(nutritionData.prepared_meals)) {
    if (lower.includes(mealName)) {
      matched.set(mealName, { isPreparedMeal: true, ...mealData, name: mealName });
    } else {
      for (const lingo of mealData.lingo || []) {
        if (lower.includes(lingo)) {
          matched.set(mealName, { isPreparedMeal: true, ...mealData, name: mealName });
          break;
        }
      }
    }
  }

  return Array.from(matched.values()).slice(0, 20);
}

/**
 * Build a compact reference block to inject into the system prompt.
 * Only injects foods that were detected in the message.
 */
export function buildFoodReferenceBlock(message) {
  const matches = findFoodsInMessage(message);
  if (matches.length === 0) return "";

  const lines = matches.map(f => {
    if (f.isPreparedMeal) {
      const p = f.combined_per_serving;
      return `- ${f.name} (Prepared Meal): ${p.calories} kcal, ${p.protein}g protein, ${p.fat}g fat, ${p.carbs}g carbs (per serving: ${f.serving_note})`;
    } else {
      const p = f.raw.per_100g;
      return `- ${f.lingo[0]}: ${p.calories} kcal, ${p.protein}g protein, ${p.fat}g fat, ${p.carbs}g carbs (per 100g raw) - cooked ratio: ${f.raw_to_cooked_ratio}`;
    }
  });

  return (
    "\n\nDETECTED FOOD REFERENCE (per 100g, use these EXACT values, scale by actual weight mentioned):\n" +
    lines.join("\n")
  );
}
