import nutritionData from './nutrition-data.json';
import categoryIndex from './category-index.json';
import workoutData from './workout-data.json';
import dietData from './diet-data.json';

export function retrieveContext(userQuery, options = {}) {
    const { topKFoods = 3, topKCategories = 1, topKMeals = 1, topKWorkouts = 2, topKDiet = 2 } = options;
    const query = (userQuery || '').toLowerCase();
    
    const lingoMap = {
        ...(categoryIndex.lingo_map || {}),
        ...(workoutData.lingo_map || {}),
        ...(dietData.lingo_map || {})
    };
    
    const resolvedQuery = lingoMap[query] ? query + ' ' + lingoMap[query] : query;
    const tokens = resolvedQuery.split(/\W+/).filter(t => t.length > 2);

    if (tokens.length === 0 && query.length === 0) {
        return { nutritionContext: 'No relevant data.', categoryContext: 'No relevant data.', workoutContext: 'No relevant data.', dietContext: 'No relevant data.' };
    }

    const levenshtein = (a, b) => {
        if (a === b) return 0;
        if (a.length === 0) return b.length;
        if (b.length === 0) return a.length;
        const dp = Array.from({ length: a.length + 1 }, (_, i) => [i]);
        for (let j = 1; j <= b.length; j++) dp[0][j] = j;
        for (let i = 1; i <= a.length; i++) {
            for (let j = 1; j <= b.length; j++) {
                dp[i][j] = a[i-1] === b[j-1]
                    ? dp[i-1][j-1]
                    : 1 + Math.min(dp[i-1][j], dp[i][j-1], dp[i-1][j-1]);
            }
        }
        return dp[a.length][b.length];
    };

    const scoreItem = (searchableStrings) => {
        let score = 0;
        for (const token of tokens) {
            for (const str of searchableStrings) {
                if (!str) continue;
                const s = str.toString().toLowerCase();
                if (s === token) score += 10;
                else if (s.includes(token)) score += 3;
                else {
                    // fuzzy match — typo tolerance
                    const words = s.split(/\s+/);
                    for (const word of words) {
                        if (word.length < 3) continue;
                        const dist = levenshtein(token, word);
                        const maxLen = Math.max(token.length, word.length);
                        if (dist === 1) score += 6;       // 1 typo
                        else if (dist === 2 && maxLen > 5) score += 3; // 2 typos on longer words
                    }
                }
            }
        }
        // full query match boost (unchanged)
        for (const str of searchableStrings) {
            if (!str) continue;
            const s = str.toString().toLowerCase();
            if (s === query) score += 50;
            else if (query.includes(s) && s.length > 3) score += 20;
        }
        return score;
    };

    // --- food_lookup ---
    const foodScores = [];
    const foods = nutritionData.food_lookup || {};
    for (const [foodName, foodObj] of Object.entries(foods)) {
        const searchables = [foodName, foodObj.category, foodObj.branch, ...(foodObj.lingo || [])];
        const score = scoreItem(searchables);
        if (score > 0) foodScores.push({ foodName, foodObj, score });
    }
    foodScores.sort((a, b) => b.score - a.score);
    const topFoods = foodScores.slice(0, topKFoods);

    // --- prepared_meals ---
    const mealScores = [];
    const meals = nutritionData.prepared_meals || {};
    for (const [mealName, mealObj] of Object.entries(meals)) {
        const searchables = [mealName, ...(mealObj.lingo || [])];
        const score = scoreItem(searchables);
        if (score > 0) mealScores.push({ mealName, mealObj, score });
    }
    mealScores.sort((a, b) => b.score - a.score);
    const topMeals = mealScores.slice(0, topKMeals);

    // --- goals_index ---
    const goalScores = [];
    const goals = nutritionData.goals_index || {};
    for (const [goalName, goalObj] of Object.entries(goals)) {
        const searchables = [goalName, goalName.replace(/_/g, ' '), ...goalName.split('_')];
        const score = scoreItem(searchables);
        if (score > 0) goalScores.push({ goalName, goalObj, score });
    }
    goalScores.sort((a, b) => b.score - a.score);
    const topGoal = goalScores[0] || null;

    // --- category-index ---
    const categoryScores = [];
    const categories = categoryIndex.categories || {};
    for (const [branch, branchObj] of Object.entries(categories)) {
        for (const [catName, catItems] of Object.entries(branchObj)) {
            const searchables = [branch, catName, ...catItems];
            const score = scoreItem(searchables);
            if (score > 0) categoryScores.push({ branch, catName, catItems, score });
        }
    }
    categoryScores.sort((a, b) => b.score - a.score);
    const topCategories = categoryScores.slice(0, topKCategories);

    // --- Build nutritionContext ---
    let parts = [];

    if (topFoods.length > 0) {
        parts.push(topFoods.map(f => {
            const obj = f.foodObj;
            const compact = {
                category: obj.category,
                raw: obj.raw?.per_100g ? { per_100g: { calories: obj.raw.per_100g.calories, protein: obj.raw.per_100g.protein, carbs: obj.raw.per_100g.carbs, fat: obj.raw.per_100g.fat } } : undefined,
                cooked: obj.cooked ? {
                    per_100g: obj.cooked.per_100g ? { calories: obj.cooked.per_100g.calories, protein: obj.cooked.per_100g.protein, carbs: obj.cooked.per_100g.carbs, fat: obj.cooked.per_100g.fat } : undefined,
                    methods: obj.cooked.methods ? Object.fromEntries(Object.entries(obj.cooked.methods).map(([k, v]) => [k, { calories: v.calories }])) : undefined
                } : undefined,
                cooking_note: obj.cooking_note
            };
            return `Item: ${f.foodName}\nData: ${JSON.stringify(compact)}`;
        }).join('\n\n'));
    }

    if (topMeals.length > 0) {
        parts.push('PREPARED MEALS:\n' + topMeals.map(m =>
            `Meal: ${m.mealName}\nMacros per serving: ${JSON.stringify(m.mealObj.combined_per_serving)}\nNote: ${m.mealObj.serving_note}`
        ).join('\n\n'));
    }

    if (topGoal) {
        parts.push(`GOAL CONTEXT (${topGoal.goalName}):\n${JSON.stringify(topGoal.goalObj)}`);
    }

    const nutritionContext = parts.length > 0 ? parts.join('\n\n---\n\n') : 'No specific food items found.';

    // --- Build categoryContext ---
    let categoryContext = 'No specific categories found.';
    if (topCategories.length > 0) {
        categoryContext = topCategories.map(c =>
            `Category: ${c.catName} (${c.branch})\nItems: ${c.catItems.join(', ')}`
        ).join('\n\n');
    }

    // --- workoutData ---
    const workoutScores = [];
    for (const [categoryName, categoryObj] of Object.entries(workoutData)) {
        if (categoryName === 'lingo_map') continue;
        for (const [itemName, itemObj] of Object.entries(categoryObj)) {
            const searchables = [categoryName, itemName, ...(itemObj.lingo || []), itemObj.name || '', itemObj.description || '', itemObj.goal || ''];
            const score = scoreItem(searchables);
            if (score > 0) workoutScores.push({ category: categoryName, itemName, itemObj, score });
        }
    }
    workoutScores.sort((a, b) => b.score - a.score);
    const topWorkouts = workoutScores.slice(0, topKWorkouts);

    let workoutContext = 'No specific workout data found.';
    if (topWorkouts.length > 0) {
        workoutContext = topWorkouts.map(w =>
            `[${w.category.toUpperCase()}] ${w.itemName}:\n${JSON.stringify(w.itemObj)}`
        ).join('\n\n');
    }

    // --- dietData ---
    const dietScores = [];
    for (const [categoryName, categoryObj] of Object.entries(dietData)) {
        if (categoryName === 'lingo_map') continue;
        for (const [itemName, itemObj] of Object.entries(categoryObj)) {
            const searchables = [categoryName, itemName, ...(itemObj.lingo || []), itemObj.name || '', itemObj.description || '', itemObj.goal || ''];
            const score = scoreItem(searchables);
            if (score > 0) dietScores.push({ category: categoryName, itemName, itemObj, score });
        }
    }
    dietScores.sort((a, b) => b.score - a.score);
    const topDiet = dietScores.slice(0, topKDiet);

    let dietContext = 'No specific diet data found.';
    if (topDiet.length > 0) {
        dietContext = topDiet.map(d =>
            `[${d.category.toUpperCase()}] ${d.itemName}:\n${JSON.stringify(d.itemObj)}`
        ).join('\n\n');
    }

    return { nutritionContext, categoryContext, workoutContext, dietContext };
}

export function buildSystemPrompt(basePrompt, nutritionContext, categoryContext, workoutContext, dietContext) {
    return basePrompt
        .replace('{{NUTRITION_CONTEXT}}', nutritionContext)
        .replace('{{CATEGORY_CONTEXT}}', categoryContext)
        .replace('{{WORKOUT_CONTEXT}}', workoutContext)
        .replace('{{DIET_CONTEXT}}', dietContext);
}
