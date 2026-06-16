// src/components/LikeButton.tsx
"use client";

import { useState, useEffect } from "react";
import { db } from "@/lib/firebase";
import { doc, updateDoc, getDoc, increment } from "firebase/firestore";
import { AiFillHeart } from "react-icons/ai";

export default function LikeButton({
  reviewId,
  commentId,
}: {
  reviewId: string;
  commentId: string;
}) {
  const [likes, setLikes] = useState(0);

  useEffect(() => {
    const fetchLikes = async () => {
      const ref = doc(db, "reviews", reviewId, "comments", commentId);
      const snap = await getDoc(ref);
      if (snap.exists()) {
        const data = snap.data();
        setLikes(data.likes || 0);
      }
    };

    fetchLikes();
  }, [reviewId, commentId]);

  const handleLike = async () => {
    const ref = doc(db, "reviews", reviewId, "comments", commentId);
    await updateDoc(ref, {
      likes: increment(1),
    });
    setLikes((prev) => prev + 1);
  };

  return (
    <button
      onClick={handleLike}
      className="flex items-center text-red-500 text-sm hover:opacity-80"
    >
      <AiFillHeart className="mr-1" />
      {likes}
    </button>
  );
}
