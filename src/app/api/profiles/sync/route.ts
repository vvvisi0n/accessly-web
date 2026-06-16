import { NextResponse } from "next/server";

export async function POST(req: Request) {
  try {
    const body = await req.json();
    console.log("📡 Received profiles for sync:", body.profiles?.length);

    // TODO: Replace with secure DB storage (Supabase, Firestore, etc.)
    // Here we just echo success for now.
    return NextResponse.json({ success: true, message: "Profiles synced successfully" });
  } catch (error: any) {
    console.error("Sync error:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
