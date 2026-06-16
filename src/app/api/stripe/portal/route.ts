import Stripe from "stripe";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: "2023-10-16",
});

export async function POST(req: Request) {
  const { customerId } = await req.json();

  // Generate Stripe portal session
  const portal = await stripe.billingPortal.sessions.create({
    customer: customerId || process.env.TEST_STRIPE_CUSTOMER!,
    return_url: `${process.env.NEXT_PUBLIC_URL}/dashboard/pro`,
  });

  return Response.json({ url: portal.url });
}
