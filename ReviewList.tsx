// src/components/ReviewList.tsx
"use client";

import { useState, useEffect } from "react";
import { db } from "@/lib/firebase";
import {
  collection,
  query,
  onSnapshot,
  orderBy
} from "firebase/firestore";
import CommentThread from "@/components/CommentThread"; // ✅ Import live comments

export default function ReviewList() {
  const [reviews, setReviews] = useState([]);
  const [sortOption, setSortOption] = useState("recent");

  useEffect(() => {
    const baseQuery = collection(db, "reviews");
    const sortQuery =
      sortOption === "popular"
        ? query(baseQuery, orderBy("likes", "desc"))
        : query(baseQuery, orderBy("createdAt", "desc"));

    const unsubscribe = onSnapshot(sortQuery, (snapshot) => {
      const newReviews = snapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }));
      setReviews(newReviews);
    });

    return () => unsubscribe();
  }, [sortOption]);

  return (
    <div className="space-y-4">
      {/* 🔽 Sorting Dropdown */}
      <div className="flex justify-end">
        <select
          className="border p-2 rounded"
          value={sortOption}
          onChange={(e) => setSortOption(e.target.value)}
        >
          <option value="recent">Recent</option>
          <option value="popular">Popular</option>
        </select>
      </div>
{reviews.map((review) => (
  <div key={review.id} className="border p-4 rounded shadow">
    <h3 className="text-lg font-semibold">{review.title}</h3>
    <p>{review.description}</p>

    {/* You can add likes, timestamp, etc. here */}

    {/* 🔽 Comment Thread goes right here */}
    <div className="mt-4">
      <CommentThread reviewId={review.id} />
    </div>
  </div>
))}
