// src/components/CommentThread.tsx
"use client";

import { useState, useEffect } from "react";
import { db } from "@/lib/firebase";
import {
  collection,
  addDoc,
  onSnapshot,
  query,
  orderBy,
  serverTimestamp,
} from "firebase/firestore";
import { useSession } from "next-auth/react";
import { AnimatePresence, motion } from "framer-motion";

export default function CommentThread({ reviewId }: { reviewId: string }) {
  const { data: session } = useSession();
  const [comments, setComments] = useState<any[]>([]);
  const [newComment, setNewComment] = useState("");

  useEffect(() => {
    const q = query(collection(db, "reviews", reviewId, "comments"), orderBy("createdAt", "asc"));

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const fetched = snapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }));
      setComments(fetched);
    });

    return () => unsubscribe();
  }, [reviewId]);

  const handleAddComment = async () => {
    if (!newComment.trim()) return;

    await addDoc(collection(db, "reviews", reviewId, "comments"), {
      text: newComment,
      createdAt: serverTimestamp(),
      user: session?.user?.name || "Anonymous",
      photo: session?.user?.image || null,
    });

    setNewComment("");
  };

  return (
    <div className="mt-4">
      <div className="space-y-2">
        <AnimatePresence>
          {comments.map((comment) => (
            <motion.div
              key={comment.id}
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              transition={{ duration: 0.3 }}
              className="flex items-start space-x-2"
            >
              {comment.photo && (
                <img src={comment.photo} alt="avatar" className="w-8 h-8 rounded-full" />
              )}
              <div className="bg-gray-100 p-2 rounded">
                <p className="text-sm font-semibold">{comment.user}</p>
                <p className="text-sm">{comment.text}</p>
              </div>
            </motion.div>
          ))}
        </AnimatePresence>
      </div>

      {/* New Comment Input */}
      {session && (
        <div className="flex items-center mt-2 space-x-2">
          <input
            type="text"
            placeholder="Add a comment..."
            value={newComment}
            onChange={(e) => setNewComment(e.target.value)}
            className="border px-3 py-1 rounded w-full"
          />
          <button onClick={handleAddComment} className="bg-blue-600 text-white px-3 py-1 rounded">
            Post
          </button>
        </div>
      )}
    </div>
  );
}
