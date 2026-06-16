"use client";

import { useEffect, useState } from "react";
import { collection, onSnapshot, orderBy, query } from "firebase/firestore";
import { db } from "@/lib/firebase";
import { formatDistanceToNow } from "date-fns";
import { motion } from "framer-motion";
import Link from "next/link";
import LiveCommentCount from "@/components/LiveCommentCount";

export default function ReviewList() {
  const [reviews, setReviews] = useState<any[]>([]);
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
    <div className="space-y-6">
      <div className="flex flex-wrap gap-4 mb-4">
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
        <Link key={review.id} href={`/reviews/${review.id}`}>
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4 }}
            className="bg-white p-4 rounded shadow"
          >
            <div className="flex items-center mb-2">
              {review.userPhoto && (
                <img
                  src={review.userPhoto}
                  alt="User avatar"
                  className="w-8 h-8 rounded-full mr-2"
                />
              )}
              <div>
                <p className="font-semibold">{review.userName || "Anonymous"}</p>
                <p className="text-sm text-gray-500">
                  {formatDistanceToNow(new Date(review.createdAt))} ago
                </p>
              </div>
            </div>

            <h3 className="text-lg font-bold">{review.title}</h3>
            <p className="text-sm text-gray-600">{review.location}</p>
            <p className="mt-2">{review.description}</p>

            {review.imageUrl && (
              <img
                src={review.imageUrl}
                alt="Uploaded"
                className="mt-2 rounded max-h-64 object-cover"
              />
            )}

            <div className="mt-4 text-sm text-gray-500 flex items-center gap-4">
              <span>👍 {review.likes || 0} likes</span>
              <LiveCommentCount reviewId={review.id} />
            </div>
          </motion.div>
        </Link>
      ))}
    </div>
  );
}
