"use client";

import { useSession } from "next-auth/react";
import { useEffect, useState } from "react";
import { db } from "@/lib/firebase";
import { collection, query, where, onSnapshot, doc, deleteDoc } from "firebase/firestore";
import toast from "react-hot-toast";
import { formatDistanceToNow } from "date-fns";
import Link from "next/link";

interface Bookmark {
  id: string;
  reviewId: string;
  title: string;
  createdAt: string;
  userName?: string;
  userPhoto?: string;
}

export default function BookmarksPage() {
  const { data: session } = useSession();
  const [bookmarks, setBookmarks] = useState<Bookmark[]>([]);

  useEffect(() => {
    if (!session?.user?.email) return;

    const q = query(collection(db, "bookmarks"), where("userEmail", "==", session.user.email));

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const fetched = snapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      })) as Bookmark[];

      setBookmarks(fetched);
    });

    return () => unsubscribe();
  }, [session?.user?.email]);

  const handleRemove = async (id: string) => {
    await deleteDoc(doc(db, "bookmarks", id));
    toast.success("Removed from bookmarks");
  };

  return (
    <div className="max-w-2xl mx-auto p-4">
      <h1 className="text-2xl font-bold mb-4">🔖 My Bookmarks</h1>

      {bookmarks.length === 0 && <p className="text-gray-500">No bookmarks yet.</p>}

      <ul className="space-y-4">
        {bookmarks.map((bookmark) => (
          <li key={bookmark.id} className="bg-white shadow p-4 rounded border border-gray-200">
            <Link href={`/reviews/${bookmark.reviewId}`}>
              <div className="flex items-center gap-3 mb-2">
                {bookmark.userPhoto && (
                  <img
                    src={bookmark.userPhoto}
                    alt="User avatar"
                    className="w-8 h-8 rounded-full"
                  />
                )}
                <div>
                  <p className="font-semibold">{bookmark.userName || "Anonymous"}</p>
                  <p className="text-sm text-gray-500">
                    {formatDistanceToNow(new Date(bookmark.createdAt))} ago
                  </p>
                </div>
              </div>

              <h3 className="text-lg font-bold">{bookmark.title}</h3>
            </Link>

            <button
              onClick={() => handleRemove(bookmark.id)}
              className="mt-2 text-sm text-red-500 hover:underline"
            >
              Remove from Bookmarks
            </button>
          </li>
        ))}
      </ul>
    </div>
  );
}
