// src/components/CommentThread.tsx
"use client";

import { useEffect, useState } from "react";
import { db } from "@/lib/firebase";
import { collection, addDoc, onSnapshot, serverTimestamp } from "firebase/firestore";
import { useSession } from "next-auth/react";
import CommentSummary from "./CommentSummary"; // ✅ Add this at the top

export default function CommentThread({ reviewId }: { reviewId: string }) {
  const { data: session } = useSession();
  const [comments, setComments] = useState<any[]>([]);
  const [newComment, setNewComment] = useState("");

  useEffect(() => {
    const unsubscribe = onSnapshot(collection(db, "reviews", reviewId, "comments"), (snapshot) => {
      const newComments = snapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }));
      setComments(newComments);
    });

    return () => unsubscribe();
  }, [reviewId]);

  const handleComment = async () => {
    if (!newComment.trim()) return;
    await addDoc(collection(db, "reviews", reviewId, "comments"), {
      text: newComment,
      likes: 0,
      user: {
        name: session?.user?.name || "Anonymous",
        image: session?.user?.image || null,
      },
      createdAt: serverTimestamp(),
    });
    setNewComment("");
  };

  return (
    <div className="mt-4 space-y-3">
      {/* 💬 AI Summary goes here */}
      <CommentSummary reviewId={reviewId} /> {/* ✅ PLACEMENT */}
      {/* 🧵 Comment List */}
      {comments.map((comment) => (
        <div key={comment.id} className="flex items-start gap-3">
          {comment.user?.image && (
            <img src={comment.user.image} alt="avatar" className="w-8 h-8 rounded-full" />
          )}
          <div>
            <p className="text-sm font-semibold">{comment.user?.name}</p>
            <p className="text-sm">{comment.text}</p>
          </div>
        </div>
      ))}
      {/* ➕ Add Comment */}
      <div className="flex mt-2 gap-2">
        <input
          type="text"
          placeholder="Write a comment..."
          className="flex-1 border rounded p-2 text-sm"
          value={newComment}
          onChange={(e) => setNewComment(e.target.value)}
        />
        <button
          onClick={handleComment}
          className="bg-blue-600 text-white px-3 py-1 rounded text-sm"
        >
          Send
        </button>
      </div>
    </div>
  );
}
