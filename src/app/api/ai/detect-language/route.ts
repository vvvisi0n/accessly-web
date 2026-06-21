import { NextResponse } from "next/server";
import OpenAI from "openai";


export async function POST(req: Request) {
  const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY! });
  try {
    const { text } = await req.json();

    const completion = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      messages: [
        {
          role: "system",
          content: "Detect the ISO 639-1 language code of this text only.",
        },
        { role: "user", content: text },
      ],
    });

    const language = completion.choices[0].message?.content?.trim() || "en";
    return NextResponse.json({ language });
  } catch (error: any) {
    console.error("Language detection error:", error);
    return NextResponse.json({ language: "en" });
  }
}
