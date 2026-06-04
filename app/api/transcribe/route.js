import { NextResponse } from "next/server";

export async function POST(req) {
  try {
    const formData = await req.formData();
    const file = formData.get("file");

    if (!file) {
      return NextResponse.json({ error: "No file provided" }, { status: 400 });
    }

    const apiKey = process.env.GROQ_API_KEY;
    if (!apiKey) {
      return NextResponse.json({ error: "Groq API key not configured" }, { status: 500 });
    }

    const groqFormData = new FormData();
    groqFormData.append("file", file);
    groqFormData.append("model", "whisper-large-v3");

    const response = await fetch("https://api.groq.com/openai/v1/audio/transcriptions", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${apiKey}`
      },
      body: groqFormData
    });

    if (!response.ok) {
      const errorText = await response.text();
      return NextResponse.json(
        { error: `Groq API Error: ${errorText}` },
        { status: response.status }
      );
    }

    const data = await response.json();
    return NextResponse.json({ text: data.text });
  } catch (error) {
    console.error("Transcription API error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
