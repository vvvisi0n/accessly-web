"use client";

import { useState } from "react";
import { useSession } from "next-auth/react";
import { submitReview } from "@/lib/submitReview";

export default function ReviewForm() {
  const { data: session } = useSession();
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    location: "",
    image: null as File | null,
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    navigator.geolocation.getCurrentPosition(
      async (position) => {
        try {
          await submitReview(formData, session, position);
          setFormData({ title: "", description: "", location: "", image: null });
        } catch (err) {
          console.error("Review submission failed:", err);
        }
      },
      (error) => {
        console.error("Geolocation error:", error);
        submitReview(formData, session); // fallback
      }
    );
  };

  if (!session) {
    return (
      <div className="bg-yellow-100 border-l-4 border-yellow-500 text-yellow-700 p-4 rounded">
        <p>Please sign in to submit a review.</p>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4 border p-4 rounded shadow bg-white">
      <input
        className="w-full border p-2 rounded"
        placeholder="Title"
        value={formData.title}
        onChange={(e) => setFormData({ ...formData, title: e.target.value })}
        required
      />
      <textarea
        className="w-full border p-2 rounded"
        placeholder="Description"
        value={formData.description}
        onChange={(e) => setFormData({ ...formData, description: e.target.value })}
        required
      />
      <input
        className="w-full border p-2 rounded"
        placeholder="Location"
        value={formData.location}
        onChange={(e) => setFormData({ ...formData, location: e.target.value })}
        required
      />
      <input
        type="file"
        accept="image/*"
        onChange={(e) => setFormData({ ...formData, image: e.target.files?.[0] || null })}
      />
      <button type="submit" className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700">
        Submit Review
      </button>
    </form>
  );
}
