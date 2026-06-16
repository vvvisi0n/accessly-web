"use client";

import { useEffect, useState } from "react";
import { collection, addDoc, query, orderBy, onSnapshot, Timestamp } from "firebase/firestore";
import { db } from "@/lib/firebase";
import { useSession } from "next-auth/react";
import { formatDistanceToNow } from "date-fns";

interface Comment {
  id: string;
  text: string;
  user: string;
  createdAt: Timestamp;
}

export default function CommentSection({ reviewId }: { reviewId: string }) {
  const { data: session } = useSession();
  const [comments, setComments] = useState<Comment[]>([]);
  const [input, setInput] = useState("");

  useEffect(() => {
    const q = query(collection(db, "reviews", reviewId, "comments"), orderBy("createdAt", "desc"));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const fetched = snapshot.docs.map((doc) => ({
        id: doc.id,
        ...(doc.data() as any),
      }));
      setComments(fetched);
    });

    return () => unsubscribe();
  }, [reviewId]);

  const handleSubmit = async () => {
    if (!input.trim() || !session) return;

    await addDoc(collection(db, "reviews", reviewId, "comments"), {
      text: input,
      user: session.user?.name || "Anonymous",
      createdAt: Timestamp.now(),
    });

    setInput("");
  };

  return (
    <div className="mt-4">
      <h4 className="text-sm font-semibold mb-1">Comments</h4>
      {comments.map((comment) => (
        <div key={comment.id} className="mb-2 text-sm">
          <strong>{comment.user}</strong> –{" "}
          <span className="text-gray-400 text-xs">
            {formatDistanceToNow(comment.createdAt.toDate())} ago
          </span>
          <p className="ml-2">{comment.text}</p>
        </div>
      ))}
      {session && (
        <div className="flex mt-2 gap-2">
          <input
            value={input}
            onChange={(e) => setInput(e.target.value)}
            className="flex-1 border p-1 rounded text-sm"
            placeholder="Write a comment..."
          />
          <button
            onClick={handleSubmit}
            className="bg-blue-500 text-white px-3 py-1 rounded text-sm"
          >
            Post
          </button>
        </div>
      )}
    </div>
  );
}
