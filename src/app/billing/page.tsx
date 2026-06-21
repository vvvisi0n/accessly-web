"use client";

export const dynamic = "force-dynamic";

import { useState } from "react";
import { Button } from "@/components/ui/button";

export default function BillingPage() {
  const [loading, setLoading] = useState(false);

  const handlePortal = async () => {
    try {
      setLoading(true);
      const res = await fetch("/api/stripe/portal", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
      });

      const { url } = await res.json();
      window.location.href = url;
    } catch (error) {
      console.error("Error opening billing portal:", error);
      alert("Something went wrong while opening the billing portal.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-10 flex flex-col items-center justify-center text-center space-y-4">
      <h1 className="text-3xl font-bold text-neutral-800 dark:text-neutral-100">
        Manage Your Subscription
      </h1>
      <p className="text-neutral-600 dark:text-neutral-400 max-w-md">
        You can update your payment details, view invoices, or cancel your plan anytime from the
        Stripe billing portal.
      </p>

      <Button
        onClick={handlePortal}
        disabled={loading}
        className="mt-4 bg-blue-600 text-white hover:bg-blue-700"
      >
        {loading ? "Loading..." : "Manage Billing"}
      </Button>
    </div>
  );
}
