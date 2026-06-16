// src/components/LikeReviewButton.tsx
"use client";

import { useState } from "react";
import { doc, updateDoc, increment } from "firebase/firestore";
import { db } from "@/lib/firebase";
import { AiOutlineLike } from "react-icons/ai";

interface Props {
  reviewId: string;
  initialLikes: number;
}

export default function LikeReviewButton({ reviewId, initialLikes }: Props) {
  const [likes, setLikes] = useState(initialLikes);
  const [liked, setLiked] = useState(false);

  const handleLike = async () => {
    if (liked) return; // Prevent multiple likes for now
    try {
      const reviewRef = doc(db, "reviews", reviewId);
      await updateDoc(reviewRef, {
        likes: increment(1),
      });
      setLikes((prev) => prev + 1);
      setLiked(true);
    } catch (error) {
      console.error("Failed to like review:", error);
    }
  };

  return (
    <button
      onClick={handleLike}
      className="flex items-center gap-1 text-gray-600 hover:text-blue-600"
    >
      <AiOutlineLike /> {likes}
    </button>
  );
}
