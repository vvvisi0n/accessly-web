// src/components/ReplyThread.tsx
"use client";

import { useEffect, useState } from "react";
import { db } from "@/lib/firebase";
import { collection, onSnapshot, orderBy, query } from "firebase/firestore";
import { formatDistanceToNow } from "date-fns";
import ReplyForm from "./ReplyForm";

interface Props {
  reviewId: string;
  commentId: string;
}

export default function ReplyThread({ reviewId, commentId }: Props) {
  const [replies, setReplies] = useState<any[]>([]);

  useEffect(() => {
    const repliesRef = collection(db, "reviews", reviewId, "comments", commentId, "replies");
    const q = query(repliesRef, orderBy("createdAt", "asc"));

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const updated = snapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }));
      setReplies(updated);
    });

    return () => unsubscribe();
  }, [reviewId, commentId]);

  return (
    <div className="ml-6 mt-2 space-y-2">
      {replies.map((reply) => (
        <div key={reply.id} className="text-sm text-gray-700 border-l pl-3">
          <div className="flex items-center gap-2 mb-1">
            {reply.userPhoto && (
              <img src={reply.userPhoto} alt="avatar" className="w-5 h-5 rounded-full" />
            )}
            <p className="font-medium">{reply.userName || "Anonymous"}</p>
            <span className="text-xs text-gray-400">
              {reply.createdAt?.seconds
                ? formatDistanceToNow(new Date(reply.createdAt.seconds * 1000)) + " ago"
                : "Just now"}
            </span>
          </div>
          <p className="ml-7">{reply.text}</p>
        </div>
      ))}

      {/* 💬 Reply form */}
      <ReplyForm reviewId={reviewId} commentId={commentId} />
    </div>
  );
}
