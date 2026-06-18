import { NextRequest, NextResponse } from "next/server";
import { stripe } from "@/lib/stripe/config";
import { createServiceClient } from "@/lib/supabase/server";
import type Stripe from "stripe";

// In Next.js App Router the body is NOT auto-parsed, so req.text() gives us
// the raw bytes that Stripe needs for signature verification.

export async function POST(req: NextRequest) {
  const sig = req.headers.get("stripe-signature");
  if (!sig) {
    return NextResponse.json({ error: "Missing stripe-signature header" }, { status: 400 });
  }

  const rawBody = await req.text();
  const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;
  if (!webhookSecret) {
    return NextResponse.json({ error: "Webhook secret not configured" }, { status: 500 });
  }

  let event: Stripe.Event;
  try {
    event = stripe.webhooks.constructEvent(rawBody, sig, webhookSecret);
  } catch (err) {
    const msg = err instanceof Error ? err.message : "Signature verification failed";
    return NextResponse.json({ error: msg }, { status: 400 });
  }

  const supabase = createServiceClient();

  try {
    switch (event.type) {
      case "checkout.session.completed": {
        const session = event.data.object as Stripe.Checkout.Session;
        await handleCheckoutCompleted(supabase, session);
        break;
      }
      case "customer.subscription.updated":
      case "customer.subscription.deleted": {
        const sub = event.data.object as Stripe.Subscription;
        await handleSubscriptionChange(supabase, sub);
        break;
      }
      default:
        // Unhandled event types are acknowledged and ignored.
        break;
    }
  } catch (err) {
    const msg = err instanceof Error ? err.message : "Handler error";
    console.error(`Stripe webhook handler failed [${event.type}]:`, msg);
    return NextResponse.json({ error: msg }, { status: 500 });
  }

  return NextResponse.json({ received: true });
}

// ── Helpers ───────────────────────────────────────────────────────────────

type SupabaseServiceClient = Awaited<ReturnType<typeof createServiceClient>>;

async function handleCheckoutCompleted(
  supabase: SupabaseServiceClient,
  session: Stripe.Checkout.Session
) {
  const customerId = session.customer as string | null;
  const userId = session.metadata?.user_id;
  const plan = planFromPriceId(session);

  if (!plan) return;

  if (userId) {
    await supabase.from("users").update({ plan, stripe_customer_id: customerId }).eq("id", userId);
  } else if (customerId) {
    // Fall back to matching by Stripe customer ID.
    await supabase.from("users").update({ plan }).eq("stripe_customer_id", customerId);
  }
}

async function handleSubscriptionChange(
  supabase: SupabaseServiceClient,
  subscription: Stripe.Subscription
) {
  const customerId = subscription.customer as string;
  const isActive = subscription.status === "active" || subscription.status === "trialing";
  const plan = isActive ? planFromSubscription(subscription) : "free";

  if (!plan) return;

  await supabase.from("users").update({ plan }).eq("stripe_customer_id", customerId);
}

function planFromPriceId(session: Stripe.Checkout.Session): "pro" | "enterprise" | null {
  const priceId =
    (session.line_items?.data[0]?.price?.id as string | undefined) ?? session.metadata?.price_id;

  if (!priceId) return null;
  if (priceId === process.env.STRIPE_PRICE_PRO_MONTHLY) return "pro";
  if (priceId === process.env.STRIPE_PRICE_ENTERPRISE_MONTHLY) return "enterprise";
  return null;
}

function planFromSubscription(subscription: Stripe.Subscription): "pro" | "enterprise" | null {
  const priceId = subscription.items.data[0]?.price?.id;
  if (!priceId) return null;
  if (priceId === process.env.STRIPE_PRICE_PRO_MONTHLY) return "pro";
  if (priceId === process.env.STRIPE_PRICE_ENTERPRISE_MONTHLY) return "enterprise";
  return null;
}
