// src/components/BookmarkReviewButton.tsx
"use client";

import { useState } from "react";
import { doc, updateDoc, arrayUnion } from "firebase/firestore";
import { db } from "@/lib/firebase";
import { useSession } from "next-auth/react";
import { BsBookmark, BsBookmarkFill } from "react-icons/bs";

interface Props {
  reviewId: string;
}

export default function BookmarkReviewButton({ reviewId }: Props) {
  const { data: session } = useSession();
  const [bookmarked, setBookmarked] = useState(false);

  const handleBookmark = async () => {
    if (!session?.user?.email) return;

    try {
      const userRef = doc(db, "users", session.user.email);
      await updateDoc(userRef, {
        bookmarks: arrayUnion(reviewId),
      });
      setBookmarked(true);
    } catch (err) {
      console.error("Failed to bookmark:", err);
    }
  };

  return (
    <button
      onClick={handleBookmark}
      className="text-gray-600 hover:text-yellow-600"
      title="Bookmark"
    >
      {bookmarked ? <BsBookmarkFill /> : <BsBookmark />}
    </button>
  );
}
