import { NextResponse } from "next/server";
import Stripe from "stripe";
import { db } from "@/lib/firebase";
import { collection, addDoc, serverTimestamp } from "firebase/firestore";

/**
 * Accessly Stripe Webhook
 * -----------------------
 * Receives all Stripe events and logs them to Firestore.
 */

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY as string, {
  apiVersion: "2025-10-29.clover", // match Stripe CLI version
});

export async function POST(req: Request) {
  try {
    const sig = req.headers.get("stripe-signature");
    if (!sig) {
      return NextResponse.json({ error: "Missing Stripe signature" }, { status: 400 });
    }

    const body = await req.text();
    const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET!;
    let event: Stripe.Event;

    if (event.type === "checkout.session.completed") {
      const session = event.data.object;
      const userEmail = session.customer_email;

      if (userEmail) {
        const usersRef = db.collection("users");
        const snapshot = await usersRef.where("email", "==", userEmail).get();
        snapshot.forEach(async (doc) => {
          await doc.ref.update({ role: "pro" });
        });
      }
    }

    try {
      event = stripe.webhooks.constructEvent(body, sig, webhookSecret);
    } catch (err: any) {
      console.error("❌ Webhook signature verification failed:", err.message);
      return NextResponse.json({ error: err.message }, { status: 400 });
    }

    // Log all events to Firestore
    const eventData = {
      id: event.id,
      type: event.type,
      data: event.data.object,
      createdAt: serverTimestamp(),
    };

    await addDoc(collection(db, "stripe_logs"), eventData);

    console.log(`📦 Logged Stripe event: ${event.type}`);

    return NextResponse.json({ received: true });
  } catch (error: any) {
    console.error("❌ Stripe webhook error:", error.message);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

// Ensure Next.js doesn’t parse the body automatically
export const config = {
  api: {
    bodyParser: false,
  },
};
