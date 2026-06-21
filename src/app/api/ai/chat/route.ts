import { NextResponse } from "next/server";
import OpenAI from "openai";

export async function POST(req: Request) {
  const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY! });
  try {
    const { message, language = "en" } = await req.json();

    // 1️⃣ Detect user intent
    const intentPrompt = `
Classify this user message into one intent:
- "travel" → if planning a trip, vacation, accessible route, or itinerary
- "coach" → if asking for daily accessibility updates or recommendations
- "places" → if asking for nearby venues
- "chat" → general conversation
Respond with only one word: travel, coach, places, or chat.
Message: "${message}"
`;

    const intentRes = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      messages: [{ role: "user", content: intentPrompt }],
      temperature: 0,
    });

    const intent = intentRes.choices[0].message?.content?.trim().toLowerCase() || "chat";

    // 2️⃣ Redirect to specialized handlers
    if (intent === "travel") {
      const travelRes = await fetch(`${process.env.NEXT_PUBLIC_BASE_URL}/api/ai/travel`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ message, language }),
      });
      const data = await travelRes.json();
      return NextResponse.json({ reply: "Here’s your accessible travel plan:", data, intent });
    }

    if (intent === "coach") {
      const coachRes = await fetch(`${process.env.NEXT_PUBLIC_BASE_URL}/api/ai/coach`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ message, language }),
      });
      const data = await coachRes.json();
      return NextResponse.json({ reply: "Here’s your daily accessibility update:", data, intent });
    }

    // 3️⃣ Default (normal conversation)
    const aiReply = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      messages: [
        {
          role: "system",
          content: `You are Accessana AI, an accessibility companion. 
          Be kind, concise, and factual.`,
        },
        { role: "user", content: message },
      ],
    });

    const reply = aiReply.choices[0].message?.content?.trim() || "I'm not sure, sorry.";
    return NextResponse.json({ reply, intent: "chat" });
  } catch (error: any) {
    console.error("AI chat error:", error);
    return NextResponse.json({ error: error.message || "AI service failed." }, { status: 500 });
  }
}
