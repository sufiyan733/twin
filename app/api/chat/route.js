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

// Nutrition action suffix appended to every system prompt
const NUTRITION_SUFFIX = "\n\nIMPORTANT - NUTRITION TRACKING RULES:\n" +
  "1. Only emit the action block when the user's CURRENT message explicitly reports they are eating or drinking something NEW right now (e.g. 'I just ate...', 'I had...', 'I consumed...', 'I drank...').\n" +
  "2. NEVER emit the action block for follow-up questions about food they already reported (e.g. 'did I get omega-3?', 'was that healthy?', 'how much protein did that have?' are NOT new consumption events).\n" +
  "3. NEVER emit the action block for hypothetical, future, or advice-seeking messages.\n" +
  "4. Each distinct meal/food the user reports should only be logged ONCE.\n\n" +
  "When the user's CURRENT message IS a new food consumption report, append this block at the very end — no extra text, no markdown around it:\n\n" +
  "<<<ACTION>>>\n" +
  "{\"type\":\"UPDATE_NUTRITION\",\"calories\":0,\"protein\":0,\"fat\":0,\"carbs\":0}\n" +
  "<<<END_ACTION>>>\n\n" +
  "Replace the 0s with your best estimate of the nutritional values. If you are not adding the block, do not mention it at all.";

function buildSystemPrompt(userData) {
  if (!userData || !userData.profile) {
    return "You are Kai, a helpful, encouraging AI fitness & productivity assistant inside a mobile dashboard app.\n" +
      "Respond concisely, in 1-2 brief paragraphs or bullet points, keeping messages readable on a small mobile device screen. " +
      "Focus on actionable, motivational advice." +
      NUTRITION_SUFFIX;
  }

  const { user, profile } = userData;
  const name = user?.name || "the user";
  const calorieTarget = profile.calorieTarget
    ? profile.calorieTarget.toLocaleString() + " kcal"
    : "not yet calculated";
  const weight = profile.weight ? profile.weight + " kg" : "not set";
  const height = profile.height ? profile.height + " cm" : "not set";
  const age = profile.age || "unknown";
  const gender = profile.gender || "not specified";
  const bodyFat = profile.bodyFat ? profile.bodyFat + "%" : "not set";
  const workoutDays = profile.workoutDays || 3;
  const proteinBudget = profile.proteinBudget ? profile.proteinBudget + "g/day" : "not set";
  const trainingField = profile.trainingField || "not set";
  const goalWeight = profile.goalWeight ? profile.goalWeight + " kg" : "not set";
  const goalBodyFat = profile.goalBodyFat ? profile.goalBodyFat + "%" : "not set";

  return "You are Kai, a helpful, encouraging AI fitness & productivity assistant inside a mobile dashboard app.\n\n" +
    "The user's name is " + name + ". Here are their stats:\n" +
    "- Age: " + age + ", Gender: " + gender + "\n" +
    "- Weight: " + weight + ", Height: " + height + ", Current Body Fat: " + bodyFat + "\n" +
    "- Daily Calorie Target: " + calorieTarget + " (auto-calculated by Kai based on their stats)\n" +
    "- Protein Budget: " + proteinBudget + "\n" +
    "- Workout Days/week: " + workoutDays + "\n" +
    "- Training Focus: " + trainingField + "\n" +
    "- Goal Weight: " + goalWeight + ", Goal Body Fat: " + goalBodyFat + "\n\n" +
    "Use this data to give personalised, evidence-based advice. When discussing calories, always refer to their calculated target of " + calorieTarget + ". Be encouraging but honest.\n" +
    "Respond concisely, in 1-2 brief paragraphs or bullet points, keeping messages readable on a small mobile device screen. Focus on actionable, motivational advice." +
    NUTRITION_SUFFIX;
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
            { type: "text", text: "[System Context: " + systemPrompt + "]\n\nUser: " + (msg.text || "Explain this image.") },
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
        "Authorization": "Bearer " + apiKey
      },
      body: JSON.stringify({
        model: model,
        messages: formattedMessages,
        temperature: 0.7,
        max_tokens: 600
      })
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error("Groq API Error Response:", errorText);
      return NextResponse.json(
        { error: "Groq API Error: " + errorText },
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
