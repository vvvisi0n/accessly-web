"use client";

import { useEffect, useState } from "react";
import { db } from "@/lib/firebase";
import { collection, onSnapshot } from "firebase/firestore";

interface Props {
  reviewId: string;
}

export default function LiveCommentCount({ reviewId }: Props) {
  const [count, setCount] = useState(0);

  useEffect(() => {
    const unsubscribe = onSnapshot(collection(db, "reviews", reviewId, "comments"), (snapshot) => {
      setCount(snapshot.size);
    });

    return () => unsubscribe();
  }, [reviewId]);

  return <span>💬 {count} comments</span>;
}
