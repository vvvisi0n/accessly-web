// src/lib/insights.ts
import { db } from "./firebase";
import { addDoc, collection, serverTimestamp } from "firebase/firestore";

type LogPayload = {
  userId?: string | null;
  userMessage: string;
  aiReply: string;
  language?: string;
  prefs?: { mode: "wheelchair" | "low_vision" | "deaf_hoh" | "none" };
  location?: { lat: number; lng: number } | null;
  intent?: string;
  places?: Array<{
    name: string;
    address: string;
    rating?: number;
    lat: number;
    lng: number;
    place_id: string;
    url: string;
  }>;
};

export async function logAIInteraction(p: LogPayload) {
  try {
    await addDoc(collection(db, "ai_logs"), {
      ...p,
      timestamp: serverTimestamp(),
    });
  } catch (e) {
    console.error("insights.logAIInteraction error:", e);
  }
}
