// src/app/api/ai/summarize/route.ts
import { NextRequest, NextResponse } from "next/server";
import OpenAI from "openai";

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY, // Set in .env.local
});

export async function POST(req: NextRequest) {
  try {
    const { reviewText } = await req.json();

    if (!reviewText) {
      return NextResponse.json({ error: "Missing reviewText" }, { status: 400 });
    }

    const prompt = `Summarize this accessibility review in 1 short paragraph for display in an app:\n\n"${reviewText}"`;

    const response = await openai.chat.completions.create({
      model: "gpt-4",
      messages: [{ role: "user", content: prompt }],
      max_tokens: 100,
    });

    const summary = response.choices[0]?.message?.content?.trim();

    return NextResponse.json({ summary });
  } catch (error) {
    console.error("AI summary error:", error);
    return NextResponse.json({ error: "Failed to generate summary" }, { status: 500 });
  }
}
