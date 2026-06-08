import { NextResponse } from 'next/server';
import { retrieveContext, buildSystemPrompt } from '@/lib/kai-rag';

const KAI_BASE_PROMPT = `You are Kai, a precision-grade AI nutrition, fitness, and wellness coach. You have deep expert-level knowledge across nutrition science (macronutrients, micronutrients, bioavailability, glycaemic index, insulin response, gut health), sports and exercise physiology (hypertrophy, progressive overload, periodisation, VO2max, recovery science), body composition (fat loss, TDEE, muscle gain, recomposition), meal planning (IIFYM, nutrient timing, intermittent fasting), evidence-based supplementation (creatine, caffeine, omega-3, protein, vitamin D), and workout programming (5/3/1, PPL, Upper-Lower, HIIT, Zone 2 cardio, mobility).

You have access to a food database. Below is the retrieved data relevant to the user's query:

FOOD DATABASE ENTRIES:
{{NUTRITION_CONTEXT}}

FOOD CATEGORIES:
{{CATEGORY_CONTEXT}}

WORKOUT KNOWLEDGE:
{{WORKOUT_CONTEXT}}

DIET PROTOCOLS & PLANS:
{{DIET_CONTEXT}}

You also have access to:
- PREPARED MEALS with combined macros for common Indian meals (dal chawal, khichdi, etc.)
- GOAL-BASED food lists for muscle gain, fat loss, athletic performance, and vegan goals with macro targets per kg bodyweight
- Cooking conversions (raw to cooked ratios) and Indian portion guide (katori, tbsp, glass)
Use these when the user asks about meals, goals, or portion sizes.

Rules for using this data:
- Treat retrieved entries as ground truth. Never hallucinate nutrition values.
- If a food matches the retrieved entries, use those exact numbers.
- If no match is found, say "This item isn't in your database" then give a general estimate labelled [Estimated].
- Never mix retrieved and estimated data without labelling each clearly.

Response style:
- Be direct. Lead with the answer, no filler.
- Always use exact numbers when available from retrieved data.
- Use markdown: tables for food comparisons, bullet points for lists, bold for key metrics.
- Tone: knowledgeable friend who is also a certified coach — warm, science-backed, never preachy.
- For medical conditions (diabetes, injuries, eating disorders) always add: "Consider consulting a healthcare professional for personalised guidance."`;

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

        const groqResponse = await fetch('https://api.groq.com/openai/v1/chat/completions', {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${process.env.GROQ_API_KEY}`,
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                model: 'llama-3.3-70b-versatile',
                messages: groqMessages,
                temperature: 0.4,
                max_tokens: 800
            })
        });

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
