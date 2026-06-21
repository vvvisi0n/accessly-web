import { NextResponse } from "next/server";
import OpenAI from "openai";
import nodemailer from "nodemailer";
import { db } from "@/lib/firebase";
import { collection, getDocs, orderBy, query, Timestamp } from "firebase/firestore";


export async function POST() {
  const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });
  try {
    // 1) Pull last 14 days of stripe_logs (simple fetch)
    const since = new Date();
    since.setDate(since.getDate() - 14);
    const q = query(collection(db, "stripe_logs"), orderBy("createdAt", "desc"));
    const snap = await getDocs(q);
    const events = snap.docs
      .map((d) => d.data())
      .filter((e: any) => e.createdAt?.toDate && e.createdAt.toDate() >= since);

    // 2) Summarize with OpenAI
    const prompt = `Summarize stripe events for the past two weeks in 4-6 sentences (revenue, subs, risks, wins). Data:\n${JSON.stringify(events.slice(0, 50))}`;
    const completion = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      messages: [{ role: "system", content: prompt }],
    });
    const summary = completion.choices[0]?.message?.content || "No summary.";

    // 3) Email via SMTP (set env vars below)
    const transporter = nodemailer.createTransport({
      host: process.env.SMTP_HOST!,
      port: Number(process.env.SMTP_PORT || 587),
      secure: false,
      auth: { user: process.env.SMTP_USER!, pass: process.env.SMTP_PASS! },
    });

    await transporter.sendMail({
      from: `"Accessana Pro" <${process.env.SMTP_FROM!}>`,
      to: process.env.SMTP_TO!,
      subject: "Accessana Pro: Weekly Executive Summary",
      text: summary,
      html: `<pre style="font:14px/1.45 ui-monospace, SFMono-Regular, Menlo">${summary}</pre>`,
    });

    return NextResponse.json({ ok: true });
  } catch (e: any) {
    console.error("weekly-summary error:", e);
    return NextResponse.json({ error: e.message }, { status: 500 });
  }
}
