"use client";

import { useState } from "react";
import { useSession } from "next-auth/react";
import { submitReview } from "@/lib/submitReview";
import toast from "react-hot-toast";
import dynamic from "next/dynamic";

const PlaceMap = dynamic(() => import("./PlaceMap"), { ssr: false });

export default function ReviewForm() {
  const { data: session } = useSession();

  const [formData, setFormData] = useState({
    title: "",
    description: "",
    location: "",
    image: null as File | null,
  });

  if (!session) {
    return (
      <div className="bg-yellow-100 border-l-4 border-yellow-500 text-yellow-700 p-4 rounded">
        <p>Please sign in to submit a review.</p>
      </div>
    );
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    toast.promise(submitReview(formData, session), {
      loading: "Submitting...",
      success: "Review submitted!",
      error: "Something went wrong.",
    });
    setFormData({ title: "", description: "", location: "", image: null });
  };

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

      {/* Google Maps Autocomplete + Map */}
      <PlaceMap
        onPlaceSelect={(placeName: string) => setFormData({ ...formData, location: placeName })}
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
