import { NextRequest, NextResponse } from "next/server";
import Anthropic from "@anthropic-ai/sdk";
import { createClient } from "@/lib/supabase/server";
import { createServiceClient } from "@/lib/supabase/server";
import { buildSystemPrompt } from "@/lib/ana/system-prompt";
import { ANA_TOOLS, executeTool } from "@/lib/ana/tools";

// Ana API — server-side only. ANTHROPIC_API_KEY never leaves this file.


interface AnaRequestBody {
  message: string;
  conversationId?: string;
  imageBase64?: string; // base64-encoded image for read_image tasks
  imageMediaType?: "image/jpeg" | "image/png" | "image/webp";
  imageTask?: "menu" | "sign" | "mail" | "describe_room" | "hazard_check" | "find_item";
  lat?: number;
  lng?: number;
}

export async function POST(req: NextRequest) {
  const anthropic = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });
  if (!process.env.ANTHROPIC_API_KEY) {
    return NextResponse.json(
      { error: "Ana is not configured yet. Add ANTHROPIC_API_KEY to .env.local." },
      { status: 503 }
    );
  }

  const supabase = await createClient();
  const {
    data: { user },
    error: authError,
  } = await supabase.auth.getUser();

  if (authError || !user) {
    return NextResponse.json({ error: "Authentication required" }, { status: 401 });
  }

  let body: AnaRequestBody;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }

  const { message, conversationId, imageBase64, imageMediaType, imageTask, lat, lng } = body;

  if (!message?.trim() && !imageBase64) {
    return NextResponse.json({ error: "message or image is required" }, { status: 400 });
  }

  // ── Load user profile ─────────────────────────────────────
  const { data: profile } = await supabase
    .from("users")
    .select("disability_types, preferred_language, display_name")
    .eq("id", user.id)
    .single();

  // ── Load conversation history ─────────────────────────────
  const convId = conversationId ?? crypto.randomUUID();
  const { data: history } = await supabase
    .from("ana_messages")
    .select("role, content")
    .eq("user_id", user.id)
    .eq("conversation_id", convId)
    .order("created_at", { ascending: true })
    .limit(20);

  // ── Build Anthropic messages ──────────────────────────────
  type AnthropicMessage = Anthropic.Messages.MessageParam;

  const messages: AnthropicMessage[] = (history ?? []).map((h) => ({
    role: h.role as "user" | "assistant",
    content: h.content,
  }));

  // Build current user message content (text + optional image)
  const userContent: Anthropic.Messages.ContentBlockParam[] = [];
  if (imageBase64 && imageMediaType) {
    userContent.push({
      type: "image",
      source: {
        type: "base64",
        media_type: imageMediaType,
        data: imageBase64,
      },
    });
    if (imageTask) {
      userContent.push({
        type: "text",
        text: message?.trim() || `Please ${imageTask.replace(/_/g, " ")} this image.`,
      });
    }
  } else {
    userContent.push({ type: "text", text: message.trim() });
  }
  messages.push({ role: "user", content: userContent });

  // ── Agentic loop ──────────────────────────────────────────
  const serviceSupabase = createServiceClient();
  const ctx = {
    userId: user.id,
    userLat: lat ?? null,
    userLng: lng ?? null,
    supabase: serviceSupabase,
    appUrl: process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000",
  };

  let finalText = "";
  const toolsUsed: string[] = [];
  let iterations = 0;
  const MAX_ITERATIONS = 5;

  while (iterations < MAX_ITERATIONS) {
    iterations++;

    const response = await anthropic.messages.create({
      model: "claude-sonnet-4-6",
      max_tokens: 1024,
      system: buildSystemPrompt(profile),
      messages,
      tools: ANA_TOOLS,
    });

    if (response.stop_reason === "end_turn") {
      finalText = response.content
        .filter((b): b is Anthropic.Messages.TextBlock => b.type === "text")
        .map((b) => b.text)
        .join("\n")
        .trim();
      break;
    }

    if (response.stop_reason === "tool_use") {
      const toolResults: Anthropic.Messages.ToolResultBlockParam[] = [];

      for (const block of response.content) {
        if (block.type === "tool_use") {
          toolsUsed.push(block.name);
          const result = await executeTool(
            block.name,
            block.input as Record<string, unknown>,
            ctx
          );
          toolResults.push({
            type: "tool_result",
            tool_use_id: block.id,
            content: JSON.stringify(result),
          });
        }
      }

      messages.push({ role: "assistant", content: response.content });
      messages.push({ role: "user", content: toolResults });
    } else {
      // Unexpected stop reason
      break;
    }
  }

  if (!finalText) {
    finalText = "I ran into a problem processing that. Please try again.";
  }

  // ── Persist conversation ──────────────────────────────────
  await supabase.from("ana_messages").insert([
    {
      user_id: user.id,
      conversation_id: convId,
      role: "user",
      content: message?.trim() || `[Image: ${imageTask}]`,
    },
    {
      user_id: user.id,
      conversation_id: convId,
      role: "assistant",
      content: finalText,
    },
  ]);

  return NextResponse.json({ response: finalText, conversationId: convId, toolsUsed });
}
