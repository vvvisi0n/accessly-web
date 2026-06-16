"use client";

import { useEffect, useState, useRef, useCallback } from "react";
import {
  collection,
  query,
  orderBy,
  limit,
  startAfter,
  getDocs,
  addDoc,
  serverTimestamp,
} from "firebase/firestore";
import { useSession } from "next-auth/react";
import { db } from "@/lib/firebase";
import LikeButton from "./LikeButton";
import { formatDistanceToNow } from "date-fns";
import { motion } from "framer-motion";

export default function CommentThread({ reviewId }: { reviewId: string }) {
  const { data: session } = useSession();
  const [comments, setComments] = useState<any[]>([]);
  const [newComment, setNewComment] = useState("");
  const [loading, setLoading] = useState(false);
  const [hasMore, setHasMore] = useState(true);
  const [lastDoc, setLastDoc] = useState<any>(null);
  const observerRef = useRef<HTMLDivElement | null>(null);

  const loadComments = useCallback(async () => {
    if (loading || !hasMore) return;
    setLoading(true);

    const baseQuery = query(
      collection(db, "reviews", reviewId, "comments"),
      orderBy("createdAt", "desc"),
      ...(lastDoc ? [startAfter(lastDoc)] : []),
      limit(5)
    );

    const snapshot = await getDocs(baseQuery);
    const newComments = snapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
    }));

    setComments((prev) => [...prev, ...newComments]);
    setLastDoc(snapshot.docs[snapshot.docs.length - 1]);
    setHasMore(snapshot.docs.length === 5);
    setLoading(false);
  }, [reviewId, loading, lastDoc, hasMore]);

  useEffect(() => {
    loadComments();
  }, []);

  // Intersection Observer to load more
  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting) loadComments();
      },
      { threshold: 1 }
    );
    if (observerRef.current) observer.observe(observerRef.current);
    return () => observer.disconnect();
  }, [loadComments]);

  const handlePost = async () => {
    if (!newComment.trim()) return;
    await addDoc(collection(db, "reviews", reviewId, "comments"), {
      text: newComment,
      userName: session?.user?.name || "Anonymous",
      userPhoto: session?.user?.image || "",
      userId: session?.user?.id || "",
      likes: 0,
      createdAt: serverTimestamp(),
    });
    setNewComment("");
    setComments([]);
    setLastDoc(null);
    loadComments();
  };

  return (
    <div className="mt-4 space-y-4">
      {/* Comment Input */}
      <div className="flex gap-2">
        <input
          type="text"
          placeholder="Add a comment..."
          value={newComment}
          onChange={(e) => setNewComment(e.target.value)}
          className="flex-1 border p-2 rounded text-sm"
        />
        <button onClick={handlePost} className="bg-blue-500 text-white px-4 py-1 rounded text-sm">
          Post
        </button>
      </div>

      {/* Comments */}
      {comments.map((comment) => (
        <motion.div
          key={comment.id}
          initial={{ opacity: 0, y: 5 }}
          animate={{ opacity: 1, y: 0 }}
          className="border-l-2 pl-3 border-gray-200 py-1"
        >
          <div className="flex items-center gap-2">
            {comment.userPhoto && (
              <img src={comment.userPhoto} alt="avatar" className="w-6 h-6 rounded-full" />
            )}
            <div className="text-sm">
              <span className="font-semibold">{comment.userName}</span>
              <span className="text-xs text-gray-500 ml-2">
                {comment.createdAt?.toDate
                  ? `${formatDistanceToNow(comment.createdAt.toDate())} ago`
                  : "just now"}
              </span>
            </div>
          </div>

          <div className="flex items-center justify-between text-sm text-gray-700 mt-1">
            <span>{comment.text}</span>
            <LikeButton reviewId={reviewId} commentId={comment.id} />
          </div>
        </motion.div>
      ))}

      {/* Load more trigger */}
      <div ref={observerRef} className="h-6" />
      {loading && <p className="text-center text-sm text-gray-500">Loading...</p>}
    </div>
  );
}
