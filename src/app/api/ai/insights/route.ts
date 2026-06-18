import { NextResponse } from "next/server";
import OpenAI from "openai";

/**
 * Accessana AI Revenue Insights API Route
 * --------------------------------------
 * This backend route securely communicates with OpenAI using your server-side key.
 * It summarizes Stripe logs into clear, human-readable business insights.
 */

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY, // <-- Uses secure, server-side key
});

export async function POST(req: Request) {
  try {
    // Parse incoming request body
    const { events } = await req.json();

    if (!events || !Array.isArray(events)) {
      return NextResponse.json({ error: "Invalid or missing 'events' payload." }, { status: 400 });
    }

    // Compose AI prompt for revenue summary
    const prompt = `
You are an expert financial analytics assistant for Accessana Pro.
Your goal is to analyze Stripe event logs and summarize trends.

Guidelines:
- Mention revenue changes (growth, decline, anomalies)
- Include subscription performance (new, canceled, or churned)
- Highlight any notable opportunities or risks
- Tone should be concise, positive, and data-driven (max 4 sentences)

Here are the last few logs:
${JSON.stringify(events.slice(0, 10), null, 2)}
`;

    // Call OpenAI securely
    const completion = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      messages: [{ role: "system", content: prompt }],
    });

    const insight =
      completion.choices?.[0]?.message?.content ||
      "⚠️ No insights could be generated at this time.";

    return NextResponse.json({ insight });
  } catch (error: any) {
    console.error("❌ AI Insights API Error:", error);
    return NextResponse.json(
      {
        error: error.message || "An unexpected error occurred while generating AI insights.",
      },
      { status: 500 }
    );
  }
}
