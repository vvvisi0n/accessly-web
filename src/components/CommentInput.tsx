"use client";

import { useState } from "react";
import { db } from "@/lib/firebase";
import { addDoc, collection, serverTimestamp } from "firebase/firestore";
import { useSession } from "next-auth/react";

interface Props {
  reviewId: string;
}

export default function CommentInput({ reviewId }: Props) {
  const { data: session } = useSession();
  const [text, setText] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!text.trim()) return;

    try {
      await addDoc(collection(db, "reviews", reviewId, "comments"), {
        text,
        createdAt: serverTimestamp(),
        userId: session?.user?.id || "",
        userName: session?.user?.name || "Anonymous",
        userPhoto: session?.user?.image || "",
      });
      setText("");
    } catch (err) {
      console.error("Error adding comment:", err);
    }
  };

  if (!session) return null;

  return (
    <form onSubmit={handleSubmit} className="flex gap-2 mt-2">
      <input
        type="text"
        placeholder="Add a comment..."
        value={text}
        onChange={(e) => setText(e.target.value)}
        className="flex-1 border p-2 rounded"
      />
      <button type="submit" className="px-4 bg-blue-600 text-white rounded hover:bg-blue-700">
        Post
      </button>
    </form>
  );
}
