// src/app/api/summarizeComments/route.ts
import { NextRequest, NextResponse } from "next/server";
import { OpenAI } from "openai";
import { db } from "@/lib/firebase";
import { collection, getDocs } from "firebase/firestore";

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

export async function POST(req: NextRequest) {
  const { reviewId } = await req.json();

  try {
    const snapshot = await getDocs(collection(db, "reviews", reviewId, "comments"));
    const comments = snapshot.docs.map((doc) => doc.data().text).filter(Boolean);

    const prompt = `
Summarize the following comments on a user review into 2-3 bullet points:

${comments.map((c, i) => `${i + 1}. ${c}`).join("\n")}

Summary:
`;

    const completion = await openai.chat.completions.create({
      model: "gpt-4",
      messages: [{ role: "user", content: prompt }],
      temperature: 0.7,
    });

    const summary = completion.choices[0].message.content;
    return NextResponse.json({ summary });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: "Failed to summarize" }, { status: 500 });
  }
}
