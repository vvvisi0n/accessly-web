import Stripe from "stripe";

export async function POST() {
  const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, { apiVersion: "2023-10-16" });
  const session = await stripe.checkout.sessions.create({
    payment_method_types: ["card"],
    mode: "subscription",
    line_items: [{ price: process.env.STRIPE_PRO_PLAN_ID!, quantity: 1 }],
    success_url: `${process.env.NEXT_PUBLIC_URL}/dashboard/pro?success=true`,
    cancel_url: `${process.env.NEXT_PUBLIC_URL}/billing?canceled=true`,
  });

  return Response.json({ url: session.url });
}
