import { NextResponse } from "next/server";
import OpenAI from "openai";


export async function POST(req: Request) {
  const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY!,
});
  try {
    const { text, language = "en" } = await req.json();

    // Translate input if not English
    let englishText = text;
    if (language !== "en") {
      const translation = await openai.chat.completions.create({
        model: "gpt-4o-mini",
        messages: [
          {
            role: "system",
            content:
              "Translate the user text into English only, without commentary.",
          },
          { role: "user", content: text },
        ],
      });
      englishText = translation.choices[0].message?.content || text;
    }

    // AI reasoning
    const completion = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      messages: [
        {
          role: "system",
          content: `You are Accessana AI, an accessibility assistant.
            Respond conversationally, helping users with navigation, accessibility,
            and nearby recommendations.`,
        },
        { role: "user", content: englishText },
      ],
    });

    let reply = completion.choices[0].message?.content?.trim() || "I'm not sure.";

    // Translate reply back if needed
    if (language !== "en") {
      const retranslation = await openai.chat.completions.create({
        model: "gpt-4o-mini",
        messages: [
          {
            role: "system",
            content: `Translate this text from English to ${language} only.`,
          },
          { role: "user", content: reply },
        ],
      });
      reply = retranslation.choices[0].message?.content?.trim() || reply;
    }

    return NextResponse.json({ reply });
  } catch (error: any) {
    console.error("AI Voice API error:", error);
    return NextResponse.json(
      { error: error.message || "Voice AI service failed." },
      { status: 500 }
    );
  }
}
