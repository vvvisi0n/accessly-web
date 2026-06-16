"use client";

import { useEffect, useState } from "react";
import { db } from "@/lib/firebase";
import { collection, query, where, getDocs, deleteDoc, doc, orderBy } from "firebase/firestore";
import { useSession } from "next-auth/react";
import { formatDistanceToNow } from "date-fns";

export default function MyReviews() {
  const { data: session } = useSession();
  const [myReviews, setMyReviews] = useState<any[]>([]);

  useEffect(() => {
    if (!session?.user?.email) return;

    const fetchReviews = async () => {
      const q = query(
        collection(db, "reviews"),
        where("userEmail", "==", session.user.email),
        orderBy("createdAt", "desc")
      );

      const snapshot = await getDocs(q);
      const data = snapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }));
      setMyReviews(data);
    };

    fetchReviews();
  }, [session]);

  const handleDelete = async (id: string) => {
    await deleteDoc(doc(db, "reviews", id));
    setMyReviews((prev) => prev.filter((r) => r.id !== id));
  };

  if (!session) return null;

  return (
    <div className="space-y-4 mt-8">
      <h2 className="text-xl font-bold">My Reviews</h2>

      {myReviews.length === 0 && <p>You haven’t submitted any reviews yet.</p>}

      {myReviews.map((review) => (
        <div key={review.id} className="border p-4 rounded shadow">
          <div className="flex justify-between items-center">
            <div>
              <h3 className="font-semibold">{review.title}</h3>
              <p className="text-sm text-gray-600">{review.location}</p>
              <p className="text-sm text-gray-500">
                Posted {formatDistanceToNow(new Date(review.createdAt))} ago
              </p>
            </div>
            <button
              onClick={() => handleDelete(review.id)}
              className="text-red-500 hover:underline text-sm"
            >
              Delete
            </button>
          </div>
          <p className="mt-2">{review.description}</p>
          {review.imageUrl && (
            <img src={review.imageUrl} alt="Review image" className="mt-2 max-h-48 rounded" />
          )}
        </div>
      ))}
    </div>
  );
}
