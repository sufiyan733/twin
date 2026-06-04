import { NextResponse } from "next/server";
import { getAuth } from "@/lib/auth";
import { getDb } from "@/lib/mongodb";

// Fetch the user's profile from DB to personalise Kai's system prompt
async function getUserProfile(req) {
  try {
    const auth = getAuth();
    const session = await auth.api.getSession({ headers: req.headers });
    if (!session?.user?.id) return null;

    const db = await getDb();
    const profile = await db.collection("profiles").findOne({ userId: session.user.id });
    return { user: session.user, profile: profile ?? null };
  } catch {
    return null;
  }
}

function buildSystemPrompt(userData) {
  if (!userData || !userData.profile) {
    // Fallback if profile isn't loaded
    return `You are Kai, a helpful, encouraging AI fitness & productivity assistant inside a mobile dashboard app.
Respond concisely, in 1-2 brief paragraphs or bullet points, keeping messages readable on a small mobile device screen. Focus on actionable, motivational advice.`;
  }

  const { user, profile } = userData;
  const name = user?.name || "the user";
  const calorieTarget = profile.calorieTarget
    ? `${profile.calorieTarget.toLocaleString()} kcal`
    : "not yet calculated";
  const weight = profile.weight ? `${profile.weight} kg` : "not set";
  const height = profile.height ? `${profile.height} cm` : "not set";
  const age = profile.age || "unknown";
  const gender = profile.gender || "not specified";
  const bodyFat = profile.bodyFat ? `${profile.bodyFat}%` : "not set";
  const workoutDays = profile.workoutDays || 3;
  const proteinBudget = profile.proteinBudget ? `${profile.proteinBudget}g/day` : "not set";
  const trainingField = profile.trainingField || "not set";
  const goalWeight = profile.goalWeight ? `${profile.goalWeight} kg` : "not set";
  const goalBodyFat = profile.goalBodyFat ? `${profile.goalBodyFat}%` : "not set";

  return `You are Kai, a helpful, encouraging AI fitness & productivity assistant inside a mobile dashboard app.

The user's name is ${name}. Here are their stats:
- Age: ${age}, Gender: ${gender}
- Weight: ${weight}, Height: ${height}, Current Body Fat: ${bodyFat}
- Daily Calorie Target: ${calorieTarget} (auto-calculated by Kai based on their stats)
- Protein Budget: ${proteinBudget}
- Workout Days/week: ${workoutDays}
- Training Focus: ${trainingField}
- Goal Weight: ${goalWeight}, Goal Body Fat: ${goalBodyFat}

Use this data to give personalised, evidence-based advice. When discussing calories, always refer to their calculated target of ${calorieTarget}. Be encouraging but honest.
Respond concisely, in 1-2 brief paragraphs or bullet points, keeping messages readable on a small mobile device screen. Focus on actionable, motivational advice.`;
}

export async function POST(req) {
  try {
    const { messages } = await req.json();

    const apiKey = process.env.GROQ_API_KEY;
    if (!apiKey) {
      return NextResponse.json(
        { error: "Groq API key not configured on the server." },
        { status: 500 }
      );
    }

    // Fetch real user profile to personalise the system prompt
    const userData = await getUserProfile(req);
    const systemPrompt = buildSystemPrompt(userData);

    // Only keep the image from the very last message to avoid token limits and payload size issues
    const lastMessageIndex = messages.length - 1;
    const hasImage = messages[lastMessageIndex]?.image;
    const model = hasImage ? "meta-llama/llama-4-scout-17b-16e-instruct" : "llama-3.3-70b-versatile";

    // Guard against oversized images (> 1MB base64 ≈ ~750KB actual)
    if (hasImage && messages[lastMessageIndex].image.length > 1_100_000) {
      return NextResponse.json(
        { error: "Image is too large. Please use a smaller image." },
        { status: 413 }
      );
    }

    let formattedMessages = [];

    if (hasImage) {
      const msg = messages[lastMessageIndex];
      formattedMessages = [
        {
          role: "user",
          content: [
            { type: "text", text: `[System Context: ${systemPrompt}]\n\nUser: ${msg.text || "Explain this image."}` },
            { type: "image_url", image_url: { url: msg.image } }
          ]
        }
      ];
    } else {
      formattedMessages = [
        { role: "system", content: systemPrompt },
        ...messages.map(msg => ({
          role: msg.sender === "user" ? "user" : "assistant",
          content: msg.text || "Attached an image."
        }))
      ];
    }

    const response = await fetch("https://api.groq.com/openai/v1/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${apiKey}`
      },
      body: JSON.stringify({
        model: model,
        messages: formattedMessages,
        temperature: 0.7,
        max_tokens: 500
      })
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error("Groq API Error Response:", errorText);
      return NextResponse.json(
        { error: `Groq API Error: ${errorText}` },
        { status: response.status }
      );
    }

    const data = await response.json();
    const replyText = data.choices[0]?.message?.content || "Sorry, I couldn't generate a response.";

    return NextResponse.json({ text: replyText });
  } catch (error) {
    console.error("Chat API error:", error);
    return NextResponse.json(
      { error: "Internal server error." },
      { status: 500 }
    );
  }
}
