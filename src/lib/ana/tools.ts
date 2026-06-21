import type { SupabaseClient } from "@supabase/supabase-js";
import type Anthropic from "@anthropic-ai/sdk";

// ── Tool definitions (passed to Claude) ─────────────────────

export const ANA_TOOLS: Anthropic.Tool[] = [
  {
    name: "search_venues",
    description:
      "Search for venues near a location, filtered by category and the user's accessibility needs",
    input_schema: {
      type: "object" as const,
      properties: {
        query: { type: "string", description: "venue type or name, e.g. 'restaurant' or 'Lilia'" },
        lat: { type: "number" },
        lng: { type: "number" },
        radius_miles: { type: "number" },
        min_access_index: { type: "number" },
      },
      required: ["lat", "lng"],
    },
  },
  {
    name: "get_venue_details",
    description: "Get the full accessibility breakdown for a specific venue by ID",
    input_schema: {
      type: "object" as const,
      properties: { venue_id: { type: "string" } },
      required: ["venue_id"],
    },
  },
  {
    name: "submit_civic_report",
    description:
      "Submit a civic infrastructure report on the user's behalf, only after the user has explicitly confirmed they want to submit it",
    input_schema: {
      type: "object" as const,
      properties: {
        report_type: {
          type: "string",
          enum: [
            "broken_sidewalk",
            "missing_curb_cut",
            "blocked_ramp",
            "broken_elevator",
            "inaccessible_crossing",
            "missing_signage",
            "inaccessible_parking",
            "other",
          ],
        },
        description: { type: "string" },
        lat: { type: "number" },
        lng: { type: "number" },
        photo_url: { type: "string" },
      },
      required: ["report_type", "description", "lat", "lng"],
    },
  },
  {
    name: "request_accessible_ride",
    description:
      "Initiate an accessible ride request to a destination, only after the user has explicitly confirmed",
    input_schema: {
      type: "object" as const,
      properties: {
        destination_venue_id: { type: "string" },
        pickup_lat: { type: "number" },
        pickup_lng: { type: "number" },
      },
      required: ["destination_venue_id"],
    },
  },
  {
    name: "get_weather",
    description: "Get the weather forecast for a location and time range",
    input_schema: {
      type: "object" as const,
      properties: {
        lat: { type: "number" },
        lng: { type: "number" },
        days_ahead: { type: "number" },
      },
      required: ["lat", "lng"],
    },
  },
  {
    name: "read_image",
    description:
      "Read and describe the contents of a photo. Use for menus, signs, mail, describing a room or surroundings, identifying hazards, or finding a dropped item. Never use to identify a specific named individual.",
    input_schema: {
      type: "object" as const,
      properties: {
        image_url: { type: "string" },
        task: {
          type: "string",
          enum: ["menu", "sign", "mail", "describe_room", "hazard_check", "find_item"],
        },
        filter_or_focus: {
          type: "string",
          description: "e.g. dietary filter for a menu, or what item to look for",
        },
      },
      required: ["image_url", "task"],
    },
  },
  {
    name: "draft_message",
    description:
      "Draft a text message or email based on the user's intent, for the user to review and send through their own device. Ana never sends messages directly.",
    input_schema: {
      type: "object" as const,
      properties: {
        message_type: { type: "string", enum: ["text", "email"] },
        intent: { type: "string", description: "what the user wants to communicate" },
        recipient_context: { type: "string" },
      },
      required: ["message_type", "intent"],
    },
  },
  {
    name: "delete_ana_data",
    description:
      "Delete the user's Ana conversation history and any cached images, only after the user has explicitly confirmed",
    input_schema: {
      type: "object" as const,
      properties: { user_id: { type: "string" } },
      required: ["user_id"],
    },
  },
];

// ── Tool execution context ────────────────────────────────────

export interface ToolContext {
  userId: string;
  userLat: number | null;
  userLng: number | null;
  supabase: SupabaseClient;
  appUrl: string;
}

// ── Tool implementations ──────────────────────────────────────

async function searchVenues(input: Record<string, unknown>, ctx: ToolContext) {
  const { query, lat, lng, radius_miles = 2, min_access_index } = input as {
    query?: string;
    lat: number;
    lng: number;
    radius_miles?: number;
    min_access_index?: number;
  };

  const sp = new URLSearchParams({ limit: "10" });
  if (query) sp.set("q", query);
  if (min_access_index !== undefined) sp.set("minScore", String(min_access_index));

  const res = await fetch(`${ctx.appUrl}/api/venues?${sp.toString()}`);
  if (!res.ok) return { error: "Could not fetch venues" };
  const { venues } = (await res.json()) as { venues: Array<Record<string, unknown>> };

  // Filter by radius using Haversine
  const R = 3958.8;
  const toRad = (d: number) => (d * Math.PI) / 180;
  const nearby = venues.filter((v) => {
    const vLat = v.lat as number | null;
    const vLng = v.lng as number | null;
    if (vLat == null || vLng == null) return true; // include if no coords
    const dLat = toRad(vLat - lat);
    const dLng = toRad(vLng - lng);
    const a =
      Math.sin(dLat / 2) ** 2 +
      Math.cos(toRad(lat)) * Math.cos(toRad(vLat)) * Math.sin(dLng / 2) ** 2;
    const dist = R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return dist <= radius_miles;
  });

  return { venues: nearby.slice(0, 5) };
}

async function getVenueDetails(input: Record<string, unknown>, ctx: ToolContext) {
  const { venue_id } = input as { venue_id: string };
  const { data, error } = await ctx.supabase.from("venues").select("*").eq("id", venue_id).single();
  if (error) return { error: "Venue not found" };
  return { venue: data };
}

async function submitCivicReport(input: Record<string, unknown>, ctx: ToolContext) {
  const body = input as {
    report_type: string;
    description: string;
    lat: number;
    lng: number;
    photo_url?: string;
  };

  const res = await fetch(`${ctx.appUrl}/api/civic`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ ...body, user_id: ctx.userId }),
  });

  if (!res.ok) {
    const err = await res.json().catch(() => ({ error: "Unknown error" }));
    return { error: err.error ?? "Failed to submit report" };
  }

  const data = (await res.json()) as { reference: string; routed_to_311: boolean };
  return {
    success: true,
    reference: data.reference,
    routed_to_311: data.routed_to_311,
    message: data.routed_to_311
      ? "Report submitted and routed to your city's 311 system."
      : "Report submitted to Accessana. We will route it when possible.",
  };
}

function requestAccessibleRide(input: Record<string, unknown>) {
  const { destination_venue_id, pickup_lat, pickup_lng } = input as {
    destination_venue_id: string;
    pickup_lat?: number;
    pickup_lng?: number;
  };

  // Build Uber WAV deeplink — the user taps it to open the Uber app
  const params = new URLSearchParams({
    action: "setPickup",
    "pickup[latitude]": String(pickup_lat ?? ""),
    "pickup[longitude]": String(pickup_lng ?? ""),
    "dropoff[nickname]": "Destination",
    product_id: "2832a1f5-cfc0-48bb-ab76-7ef7b9d1b2d6", // UberWAV product ID
  });

  return {
    deeplink: `uber://?${params.toString()}`,
    web_fallback: `https://m.uber.com/ul/?${params.toString()}`,
    venue_id: destination_venue_id,
    note: "This link opens the Uber app with an accessible vehicle (WAV) pre-selected. You will need to confirm the booking in the Uber app.",
  };
}

async function getWeather(input: Record<string, unknown>) {
  const { lat, lng, days_ahead = 3 } = input as {
    lat: number;
    lng: number;
    days_ahead?: number;
  };

  const url =
    `https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lng}` +
    `&daily=weather_code,precipitation_sum,temperature_2m_max,temperature_2m_min` +
    `&forecast_days=${Math.min(days_ahead + 1, 7)}&timezone=auto`;

  const res = await fetch(url);
  if (!res.ok) return { error: "Weather unavailable" };
  const data = (await res.json()) as {
    daily: {
      time: string[];
      weather_code: number[];
      precipitation_sum: number[];
      temperature_2m_max: number[];
      temperature_2m_min: number[];
    };
  };

  return {
    forecast: data.daily.time.map((date, i) => ({
      date,
      weather_code: data.daily.weather_code[i],
      precipitation_mm: data.daily.precipitation_sum[i],
      temp_max_c: data.daily.temperature_2m_max[i],
      temp_min_c: data.daily.temperature_2m_min[i],
    })),
  };
}

async function deleteAnaData(input: Record<string, unknown>, ctx: ToolContext) {
  const { user_id } = input as { user_id: string };
  if (user_id !== ctx.userId) return { error: "Not authorized to delete this data" };

  const { error } = await ctx.supabase
    .from("ana_messages")
    .delete()
    .eq("user_id", ctx.userId);

  if (error) return { error: "Failed to delete conversation history" };
  return {
    success: true,
    deleted: ["Ana conversation history"],
    message: "Your Ana conversation history has been deleted.",
  };
}

// ── Dispatcher ────────────────────────────────────────────────

export async function executeTool(
  name: string,
  input: Record<string, unknown>,
  ctx: ToolContext
): Promise<unknown> {
  switch (name) {
    case "search_venues":
      return searchVenues(input, ctx);
    case "get_venue_details":
      return getVenueDetails(input, ctx);
    case "submit_civic_report":
      return submitCivicReport(input, ctx);
    case "request_accessible_ride":
      return requestAccessibleRide(input);
    case "get_weather":
      return getWeather(input);
    case "read_image":
      // Image is passed directly to Claude as vision content; the tool call
      // just provides task framing. Return a no-op so the loop continues.
      return { note: "Image analysis handled via Claude vision in message context." };
    case "draft_message":
      // Claude generates the draft as text; no external call needed.
      return { note: "Draft generated in Claude response." };
    case "delete_ana_data":
      return deleteAnaData(input, ctx);
    default:
      return { error: `Unknown tool: ${name}` };
  }
}
