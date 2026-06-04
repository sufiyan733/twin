import { NextResponse } from "next/server";

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

    const systemPrompt = `You are Kai, a helpful, encouraging AI fitness & productivity assistant inside a mobile dashboard app. The user is Alex Johnson.
Alex's goal today is to stick to 2,400 kcal (currently consumed 1,850 kcal, 550 kcal left).
His daily tasks today include:
- Morning Workout: 30 min Strength Training (Completed - 350 kcal burned)
- Drink 2L Water: Stay Hydrated (Completed - 2/2 Liters)
- Read 20 Pages: Self Growth (Not completed - 0/20 Pages)
- Meditate: 10 min Mindfulness (Not completed - 0/10 min)
- Take Vitamins: Health First (Completed - 1/1 Done)

Respond concisely, in 1-2 brief paragraphs or bullet points, keeping messages readable on a small mobile device screen. Focus on actionable, motivational advice.`;

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
