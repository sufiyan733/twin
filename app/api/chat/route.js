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
  "2. NEVER emit the action block for follow-up questions about food they already reported.\n" +
  "3. NEVER emit the action block for hypothetical, future, or advice-seeking messages.\n" +
  "4. Each distinct meal/food the user reports should only be logged ONCE.\n\n" +
  "USE THESE ACCURATE PER-100g REFERENCE VALUES for common foods (scale by actual weight):\n" +
  "- White rice (cooked): 130 kcal, 2.7g protein, 0.3g fat, 28g carbs\n" +
  "- Brown rice (cooked): 122 kcal, 2.6g protein, 0.9g fat, 26g carbs\n" +
  "- Soya chunks (dry/raw): 336 kcal, 52g protein, 0.5g fat, 33g carbs\n" +
  "- Soya chunks (cooked/rehydrated): 112 kcal, 17g protein, 0.2g fat, 11g carbs\n" +
  "- Whole egg (1 large = 50g): 72 kcal, 6g protein, 5g fat, 0.4g carbs\n" +
  "- Chicken breast (cooked): 165 kcal, 31g protein, 3.6g fat, 0g carbs\n" +
  "- Oats (dry): 389 kcal, 17g protein, 7g fat, 66g carbs\n" +
  "- Whole milk (100ml): 61 kcal, 3.2g protein, 3.3g fat, 4.8g carbs\n" +
  "- Banana (medium 120g): 107 kcal, 1.3g protein, 0.4g fat, 27g carbs\n" +
  "- Chapati/roti (1 medium 40g): 120 kcal, 3g protein, 3g fat, 20g carbs\n" +
  "- Paneer (100g): 265 kcal, 18g protein, 20g fat, 3g carbs\n" +
  "- Dal (cooked, 100g): 116 kcal, 9g protein, 0.4g fat, 20g carbs\n\n" +
  "RULES for estimation:\n" +
  "- Always scale by the ACTUAL quantity the user mentions.\n" +
  "- Add up each food item separately then sum for the total.\n" +
  "- Round to nearest whole number.\n" +
  "- If a food is not in the list, use your best knowledge from nutritional databases.\n\n" +
  "When the user's CURRENT message IS a new food consumption report, append this block at the very end — no extra text, no markdown around it:\n\n" +
  "<<<ACTION>>>\n" +
  "{\"type\":\"UPDATE_NUTRITION\",\"calories\":0,\"protein\":0,\"fat\":0,\"carbs\":0}\n" +
  "<<<END_ACTION>>>\n\n" +
  "Replace the 0s with your calculated totals. If you are not adding the block, do not mention it at all.";

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
