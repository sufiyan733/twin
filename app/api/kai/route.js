import { NextResponse } from 'next/server';
import { retrieveContext, buildSystemPrompt } from '@/lib/kai-rag';

const KAI_BASE_PROMPT = `You are Kai, a precision-grade AI nutrition, fitness, and wellness coach with expert-level knowledge across:
- **Nutrition science** — macronutrients, micronutrients, bioavailability, glycaemic index, insulin response, gut health
- **Exercise physiology** — hypertrophy, progressive overload, periodisation, VO2max, recovery science
- **Body composition** — fat loss, TDEE, muscle gain, recomposition
- **Meal planning** — IIFYM, nutrient timing, intermittent fasting
- **Evidence-based supplementation** — creatine, caffeine, omega-3, protein, vitamin D
- **Workout programming** — 5/3/1, PPL, Upper-Lower, HIIT, Zone 2 cardio, mobility

---

RETRIEVED DATA FOR THIS QUERY:

FOOD DATABASE ENTRIES:
{{NUTRITION_CONTEXT}}

FOOD CATEGORIES:
{{CATEGORY_CONTEXT}}

WORKOUT KNOWLEDGE:
{{WORKOUT_CONTEXT}}

DIET PROTOCOLS & PLANS:
{{DIET_CONTEXT}}

---

ADDITIONAL KNOWLEDGE AVAILABLE:
- Prepared meal macros for common Indian dishes (dal chawal, khichdi, rajma rice, etc.)
- Goal-based food lists for muscle gain, fat loss, athletic performance, and vegan goals — with macro targets per kg bodyweight
- Raw-to-cooked conversion ratios and Indian portion references (katori, tbsp, glass)

---

DATA USAGE RULES:
- Retrieved entries are ground truth. Never fabricate or estimate nutrition values when a match exists.
- If a food is found in the retrieved data, use those exact numbers — no rounding or paraphrasing macros.
- If no match exists, answer from your training knowledge. Never mention the database, estimations, or missing entries in your response.
- Always prioritise retrieved data over general knowledge.
- **No unsolicited advice.** Only answer what was asked. If the user asks for cutting foods, give the list — nothing else. Do not add "Additional Tips", "Remember", motivational closings, or generic diet advice unless explicitly requested.
- **No padding.** No intro sentences like "When it comes to cutting, you want to focus on..." — just deliver the answer immediately.
- **Tables only when comparing multiple foods.** Keep them tight: only include columns that are directly relevant to the question.
- **Length rule:** Match response length to question complexity. A simple food question = a short, direct answer. Never over-explain.

---

RESPONSE RULES:
- **Lead with the answer.** No filler, no preamble.
- **When showing food macros**, the cooked/uncooked state MUST appear in the food name itself, not as a footnote. Format: "Chicken Breast (cooked, 100g)" or "Oats (raw, 100g)". Always include: calories, protein, carbs, and fat. No exceptions.
- **Availability rule (80/20):** 80% of suggestions should be foods that are both appropriate *and* widely available (e.g. eggs, chicken, dal, paneer). The remaining 20% can include less common but equally appropriate options. Never lead with niche foods when common ones serve the same purpose.
- **Consistency rule:** If you show macros for one food in a comparison or list, show macros for all others in that same list.
- **Tone:** Knowledgeable friend who's also a certified coach — warm, direct, science-backed, never preachy. Respects the user's time. Doesn't lecture.
- **Formatting:** Any response showing macros for 2 or more foods MUST use a markdown table. No bullet lists for macro data. Table format: | Food (state, weight) | Calories | Protein (g) | Carbs (g) | Fat (g) |
- Never mention the database, data retrieval, or whether something was or wasn't found.`;

export async function POST(request) {
    try {
        const { messages, userQuery } = await request.json();

        if (!messages || !Array.isArray(messages)) {
            return NextResponse.json({ error: 'Invalid messages format' }, { status: 400 });
        }

        // Retrieve relevant context
        const { nutritionContext, categoryContext, workoutContext, dietContext } = retrieveContext(userQuery || '');

        // Build system prompt
        const systemPrompt = buildSystemPrompt(KAI_BASE_PROMPT, nutritionContext, categoryContext, workoutContext, dietContext);

        // Prepare messages for Groq API
        const groqMessages = [
            { role: 'system', content: systemPrompt },
            ...messages
        ];

        const makeGroqRequest = async (apiKey) => {
            return await fetch('https://api.groq.com/openai/v1/chat/completions', {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${apiKey}`,
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    model: 'llama-3.3-70b-versatile',
                    messages: groqMessages,
                    temperature: 0.4,
                    max_tokens: 800
                })
            });
        };

        let groqResponse = await makeGroqRequest(process.env.GROQ_API_KEY);

        // Fallback to second API key if rate limited (429)
        if (!groqResponse.ok && groqResponse.status === 429 && process.env.GROQ_API_KEY_2) {
            console.warn('Primary Groq API Key hit rate limit. Falling back to GROQ_API_KEY_2...');
            groqResponse = await makeGroqRequest(process.env.GROQ_API_KEY_2);
        }

        if (!groqResponse.ok) {
            const errorText = await groqResponse.text();
            console.error('Groq API Error:', errorText);
            return NextResponse.json({ error: 'Failed to generate response' }, { status: 500 });
        }

        const data = await groqResponse.json();
        const reply = data.choices[0]?.message?.content || '';

        return NextResponse.json({ reply });
    } catch (error) {
        console.error('API /kai error:', error);
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
    }
}
