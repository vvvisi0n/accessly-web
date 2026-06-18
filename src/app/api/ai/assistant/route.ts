import { NextResponse } from "next/server";
import OpenAI from "openai";
import { logAIInteraction } from "@/lib/insights";

const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY! });

const GOOGLE_KEY = process.env.GOOGLE_MAPS_API_KEY!;
const SYSTEM_PROMPT = `
You are Accessana AI — a multilingual accessibility companion.
Be concise, empathetic, and practical. Tailor tips to the user's need (wheelchair, low_vision, deaf_hoh).
If coordinates are present and user asks "near me" (or similar), you may rely on provided place results (if any) and give short, actionable picks + tips.
If no live data, provide what to ask the venue or how to verify accessibility.
`;

// --- Simple intent detector
function inferIntent(text: string) {
  const t = text.toLowerCase();
  const near = /(near me|nearby|closest|around here|in my area)/.test(t);
  const types = [
    { key: "restaurant", re: /(restaurant|food|eat|diner|cafe|coffee|breakfast|lunch|dinner)/ },
    { key: "hotel", re: /(hotel|motel|lodge|inn|stay|accommodation)/ },
    { key: "bathroom", re: /(bathroom|restroom|toilet|wc)/ },
    { key: "park", re: /(park|playground|green|trail)/ },
    { key: "hospital", re: /(hospital|clinic|urgent|er|medical|health)/ },
    { key: "museum", re: /(museum|library|gallery)/ },
    { key: "transport", re: /(station|metro|subway|bus|train|transit)/ },
  ];
  const found = types.find((x) => x.re.test(t))?.key || "general";
  return { near, kind: found };
}

// --- Compose an accessibility-aware query for Google Places
function placesQuery(kind: string, mode: string) {
  const base =
    kind === "restaurant"
      ? "wheelchair accessible restaurant"
      : kind === "hotel"
        ? "wheelchair accessible hotel"
        : kind === "bathroom"
          ? "accessible public restroom"
          : kind === "park"
            ? "accessible park"
            : kind === "hospital"
              ? "hospital accessible entrance"
              : kind === "museum"
                ? "accessible museum"
                : kind === "transport"
                  ? "accessible transit station"
                  : "accessible place";

  // Add mode-specific hints (these bias textsearch)
  const hint =
    mode === "low_vision"
      ? " tactile signage high contrast lighting "
      : mode === "deaf_hoh"
        ? " captioning visual alerts quiet seating "
        : ""; // wheelchair is default term above

  return `${base} ${hint}`.trim();
}

// --- Fetch nearby places via Text Search
async function fetchPlaces(
  kind: string,
  mode: string,
  location?: { lat: number; lng: number } | null
) {
  if (!location) return [];
  const query = placesQuery(kind, mode);
  const url = new URL("https://maps.googleapis.com/maps/api/place/textsearch/json");
  url.searchParams.set("query", query);
  url.searchParams.set("location", `${location.lat},${location.lng}`);
  url.searchParams.set("radius", "4000"); // 4km default
  url.searchParams.set("key", GOOGLE_KEY);

  const res = await fetch(url.toString());
  const data = await res.json();
  if (!data?.results?.length) return [];

  // Normalize to a compact structure (and build a direct Google Maps URL)
  return data.results.slice(0, 6).map((r: any) => {
    const lat = r.geometry?.location?.lat ?? 0;
    const lng = r.geometry?.location?.lng ?? 0;
    const url = `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(
      r.name
    )}&query_place_id=${r.place_id}`;
    return {
      name: r.name,
      address: r.formatted_address || r.vicinity || "",
      rating: r.rating,
      lat,
      lng,
      place_id: r.place_id,
      url,
    };
  });
}

export async function POST(req: Request) {
  try {
    const { message, userLanguage = "auto", location, prefs, history = [] } = await req.json();

    const { near, kind } = inferIntent(message || "");
    let places: any[] = [];

    // If user asked "near me" and we have coordinates, fetch places
    if (near && location && GOOGLE_KEY) {
      places = await fetchPlaces(kind, prefs?.mode || "wheelchair", location);
    }

    // Build a short context snippet for the model
    const locHint = location ? `User coordinates present.` : `No coordinates.`;
    const need =
      prefs?.mode === "wheelchair"
        ? "Wheelchair user"
        : prefs?.mode === "low_vision"
          ? "Low-vision user"
          : prefs?.mode === "deaf_hoh"
            ? "Deaf/Hard-of-hearing user"
            : "General accessibility";

    // Summarize place options for the model to reference in its answer
    const placeBrief = places.length
      ? `Nearby results:\n${places.map((p) => `- ${p.name} (${p.rating ?? "N/A"}⭐) – ${p.address}`).join("\n")}`
      : "No live nearby results fetched.";

    const system = `
${SYSTEM_PROMPT}
User Need: ${need}. Language: ${userLanguage}. ${locHint}
When place results are provided, pick 3 helpful options with 1 actionable tip each.
`;

    const prior = (history as Array<{ role: string; content: string }>).slice(-12);
    const messages: OpenAI.Chat.Completions.ChatCompletionMessageParam[] = [
      { role: "system", content: system },
      ...prior.map((m) => ({ role: m.role as any, content: m.content })),
      { role: "user", content: `${message}\n\n${placeBrief}` },
    ];

    const completion = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      messages,
    });

    const reply = completion.choices[0]?.message?.content ?? "…";

    // log to Firestore
    await logAIInteraction({
      userId: null,
      userMessage: message,
      aiReply: reply,
      language: userLanguage,
      prefs: { mode: prefs?.mode || "none" },
      location: location ?? null,
      intent: near ? `places:${kind}` : "general",
      places,
    });

    return NextResponse.json({ reply, places });
  } catch (err: any) {
    console.error("assistant route error:", err);
    if (err?.code === "insufficient_quota" || err?.status === 429) {
      return NextResponse.json({
        reply:
          "Accessana AI is temporarily offline due to server limits. Please try again shortly.",
        places: [],
      });
    }
    return NextResponse.json({ error: "Assistant failed." }, { status: 500 });
  }
}
