import { NextResponse } from "next/server";
import OpenAI from "openai";

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY!,
});

export async function POST(req: Request) {
  try {
    const { imageUrl } = await req.json();

    const prompt = `
      You are an accessibility compliance expert.
      Analyze the photo and describe any accessibility features or issues visible.
      Focus on:
      - ramps, stairs, entrances
      - signage, lighting, restrooms
      - wheelchair accessibility, door width, pathways
      Respond in JSON with fields:
      {
        "summary": "...",
        "accessibility_features": ["..."],
        "issues_detected": ["..."]
      }`;

    const result = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      messages: [
        {
          role: "user",
          content: [
            { type: "text", text: prompt },
            { type: "image_url", image_url: imageUrl },
          ],
        },
      ],
      response_format: { type: "json_object" },
    });

    const analysis = JSON.parse(result.choices[0].message?.content || "{}");

    // 🧮 Compute an Accessibility Score
    const base = 50;
    const features = analysis.accessibility_features?.length || 0;
    const issues = analysis.issues_detected?.length || 0;
    let score = base + features * 10 - issues * 10;
    score = Math.min(100, Math.max(0, score)); // clamp 0–100

    // Attach score
    const enriched = { ...analysis, score };

    return NextResponse.json({ success: true, analysis: enriched });
  } catch (err: any) {
    console.error("AI Analysis Error:", err);
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}
