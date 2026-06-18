import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { submitCivicReport } from "@/lib/civic/seeclickfix";
import type { CivicReportType } from "@/types";

export async function GET(req: NextRequest) {
  const supabase = await createClient();
  const limit = Math.min(Number(req.nextUrl.searchParams.get("limit") ?? 100), 500);

  const { data, error } = await supabase
    .from("civic_reports")
    .select("*")
    .order("created_at", { ascending: false })
    .limit(limit);

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ reports: data ?? [] });
}

interface CivicBody {
  report_type: CivicReportType;
  description: string;
  lat: number;
  lng: number;
  address?: string;
  city?: string;
  state?: string;
  photos?: string[];
}

export async function POST(req: NextRequest) {
  const supabase = await createClient();

  const {
    data: { user },
    error: authError,
  } = await supabase.auth.getUser();
  if (authError || !user) {
    return NextResponse.json({ error: "Authentication required" }, { status: 401 });
  }

  let body: CivicBody;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }

  // ── Validation ────────────────────────────────────────────────────────
  if (!body.report_type) {
    return NextResponse.json({ error: "report_type is required" }, { status: 400 });
  }
  if (!body.description?.trim()) {
    return NextResponse.json({ error: "description is required" }, { status: 400 });
  }
  if (body.lat === undefined || body.lng === undefined) {
    return NextResponse.json({ error: "lat and lng are required" }, { status: 400 });
  }

  // ── Get the reporter's display name for SeeClickFix ───────────────────
  const { data: profile } = await supabase
    .from("users")
    .select("display_name")
    .eq("id", user.id)
    .single();

  // ── Insert civic report ───────────────────────────────────────────────
  const { data: report, error: insertError } = await supabase
    .from("civic_reports")
    .insert({
      user_id: user.id,
      report_type: body.report_type,
      description: body.description.trim(),
      // PostGIS geography point — stored as WKT
      location: `POINT(${body.lng} ${body.lat})`,
      address: body.address?.trim() ?? null,
      city: body.city?.trim() ?? null,
      state: body.state?.trim() ?? null,
      photos: body.photos ?? [],
      status: "open",
    })
    .select()
    .single();

  if (insertError) {
    return NextResponse.json({ error: insertError.message }, { status: 500 });
  }

  // ── Route to SeeClickFix (311) ────────────────────────────────────────
  // Non-blocking: if SeeClickFix is unavailable the report is still saved.
  let seeclickfixId: string | null = null;
  try {
    seeclickfixId = await submitCivicReport({
      summary: `Accessibility issue: ${body.report_type.replace(/_/g, " ")}`,
      description: body.description.trim(),
      lat: body.lat,
      lng: body.lng,
      address: body.address ?? "",
      reporterName: profile?.display_name ?? "Accessana user",
    });

    if (seeclickfixId) {
      await supabase
        .from("civic_reports")
        .update({ seeclickfix_id: seeclickfixId })
        .eq("id", report.id);
    }
  } catch {
    // SeeClickFix errors are non-fatal — the report is already saved locally.
  }

  return NextResponse.json(
    {
      report,
      seeclickfix_id: seeclickfixId,
      reference: report.id,
      routed_to_311: Boolean(seeclickfixId),
    },
    { status: 201 }
  );
}
