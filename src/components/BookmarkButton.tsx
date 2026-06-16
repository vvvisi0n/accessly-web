"use client";

import { useSession } from "next-auth/react";
import { useEffect, useState } from "react";
import { db } from "@/lib/firebase";
import { doc, setDoc, deleteDoc, getDoc, onSnapshot } from "firebase/firestore";
import { FaBookmark, FaRegBookmark } from "react-icons/fa";

interface Props {
  reviewId: string;
}

export default function BookmarkButton({ reviewId }: Props) {
  const { data: session } = useSession();
  const [bookmarked, setBookmarked] = useState(false);

  const userId = session?.user?.email;

  useEffect(() => {
    if (!userId) return;

    const docRef = doc(db, "users", userId, "bookmarks", reviewId);

    const unsubscribe = onSnapshot(docRef, (docSnap) => {
      setBookmarked(docSnap.exists());
    });

    return () => unsubscribe();
  }, [userId, reviewId]);

  const toggleBookmark = async () => {
    if (!userId) return;

    const docRef = doc(db, "users", userId, "bookmarks", reviewId);

    if (bookmarked) {
      await deleteDoc(docRef);
    } else {
      await setDoc(docRef, {
        reviewId,
        createdAt: new Date().toISOString(),
      });
    }
  };

  return (
    <button
      onClick={toggleBookmark}
      className="text-blue-600 text-lg hover:opacity-80"
      title={bookmarked ? "Remove Bookmark" : "Save to Bookmarks"}
    >
      {bookmarked ? <FaBookmark /> : <FaRegBookmark />}
    </button>
  );
}
