// src/app/reviews/[id]/page.tsx
"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { doc, getDoc } from "firebase/firestore";
import { db } from "@/lib/firebase";
import { formatDistanceToNow } from "date-fns";
import CommentThread from "@/components/CommentThread";
import CommentInput from "@/components/CommentInput";

export default function ReviewDetailPage() {
  const { id } = useParams();
  const [review, setReview] = useState<any>(null);

  useEffect(() => {
    if (!id) return;
    const fetchReview = async () => {
      const docRef = doc(db, "reviews", id as string);
      const docSnap = await getDoc(docRef);
      if (docSnap.exists()) {
        setReview({ id: docSnap.id, ...docSnap.data() });
      }
    };
    fetchReview();
  }, [id]);

  if (!review) return <p className="p-4">Loading review...</p>;

  return (
    <div className="max-w-2xl mx-auto p-4 space-y-6">
      <div className="bg-white p-4 rounded shadow">
        <div className="flex items-center mb-2">
          {review.userPhoto && (
            <img src={review.userPhoto} alt="User avatar" className="w-8 h-8 rounded-full mr-2" />
          )}
          <div>
            <p className="font-semibold">{review.userName || "Anonymous"}</p>
            <p className="text-sm text-gray-500">
              {formatDistanceToNow(new Date(review.createdAt))} ago
            </p>
          </div>
        </div>

        <h2 className="text-xl font-bold">{review.title}</h2>
        <p className="text-sm text-gray-600">{review.location}</p>
        <p className="mt-2">{review.description}</p>

        {review.imageUrl && (
          <img
            src={review.imageUrl}
            alt="Uploaded"
            className="mt-4 rounded max-h-96 object-cover"
          />
        )}

        <div className="mt-4 text-sm text-gray-500">
          <span>👍 {review.likes || 0} likes</span>
        </div>
      </div>

      {/* 💬 Live Comments Section */}
      <CommentThread reviewId={review.id} />
      <CommentInput reviewId={review.id} />
    </div>
  );
}
