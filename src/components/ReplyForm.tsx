// src/components/ReplyForm.tsx
"use client";

import { useState } from "react";
import { db } from "@/lib/firebase";
import { addDoc, collection, serverTimestamp } from "firebase/firestore";
import { useSession } from "next-auth/react";

interface Props {
  reviewId: string;
  commentId: string;
}

export default function ReplyForm({ reviewId, commentId }: Props) {
  const [replyText, setReplyText] = useState("");
  const { data: session } = useSession();

  const handleReply = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!replyText.trim() || !session) return;

    await addDoc(collection(db, "reviews", reviewId, "comments", commentId, "replies"), {
      text: replyText,
      createdAt: serverTimestamp(),
      userId: session.user?.id || "",
      userName: session.user?.name || "Anonymous",
      userPhoto: session.user?.image || "",
    });

    setReplyText("");
  };

  return (
    <form onSubmit={handleReply} className="flex gap-2 mt-2 items-center">
      <input
        className="flex-1 border px-2 py-1 rounded text-sm"
        placeholder="Reply..."
        value={replyText}
        onChange={(e) => setReplyText(e.target.value)}
      />
      <button type="submit" className="text-blue-600 hover:underline text-sm">
        Reply
      </button>
    </form>
  );
}
