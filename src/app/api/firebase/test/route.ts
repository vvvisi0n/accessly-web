// src/app/api/firebase/test/route.ts
import { NextResponse } from "next/server";
import { getFirestore } from "firebase-admin/firestore";
import admin from "firebase-admin";

if (!admin.apps.length) {
  admin.initializeApp({
    credential: admin.credential.cert({
      projectId: process.env.FIREBASE_PROJECT_ID,
      clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
      privateKey: process.env.FIREBASE_PRIVATE_KEY?.replace(/\\n/g, "\n"),
    }),
  });
}

const db = getFirestore();

export async function GET() {
  try {
    const ref = db.collection("test_connections").doc("health_check");
    await ref.set({
      ok: true,
      timestamp: new Date().toISOString(),
    });

    const doc = await ref.get();
    const data = doc.exists ? doc.data() : null;

    return NextResponse.json({
      success: true,
      message: "✅ Firebase Admin SDK connected successfully!",
      data,
    });
  } catch (error: any) {
    console.error("❌ Firebase test error:", error);
    return NextResponse.json({
      success: false,
      error: error.message,
    });
  }
}
