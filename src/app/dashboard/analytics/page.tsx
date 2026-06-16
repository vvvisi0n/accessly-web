import StripeAnalytics from "@/components/analytics/StripeAnalytics";

export const metadata = {
  title: "Accessly Pro Analytics",
  description: "Stripe revenue and subscription dashboard",
};

export default function AnalyticsPage() {
  return (
    <main className="max-w-6xl mx-auto p-6">
      <h1 className="text-2xl font-semibold mb-6">💳 Accessly Pro Analytics</h1>
      <StripeAnalytics />
    </main>
  );
}
