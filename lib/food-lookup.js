import foods from "./indian-foods.json";

/**
 * Given a user message, find all Indian food items mentioned.
 * Returns an array of matching food objects (up to 20 matches).
 * Uses alias matching — very fast, zero API cost.
 */
export function findFoodsInMessage(message) {
  if (!message || typeof message !== "string") return [];

  const lower = message.toLowerCase();
  const matched = new Map(); // name → food item (deduped)

  for (const food of foods) {
    for (const alias of food.aliases) {
      if (lower.includes(alias.toLowerCase())) {
        if (!matched.has(food.name)) {
          matched.set(food.name, food);
        }
        break; // no need to check more aliases for this food
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

  const lines = matches.map(f =>
    `- ${f.name}: ${f.kcal} kcal, ${f.protein}g protein, ${f.fat}g fat, ${f.carbs}g carbs (per 100g)`
  );

  return (
    "\n\nDETECTED FOOD REFERENCE (per 100g, use these EXACT values, scale by actual weight mentioned):\n" +
    lines.join("\n")
  );
}
