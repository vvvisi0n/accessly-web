// src/components/NearbyReviews.tsx
"use client";

import { useEffect, useState } from "react";
import { db } from "@/lib/firebase";
import { collection, getDocs } from "firebase/firestore";
import { getDistance } from "geolib";
import Link from "next/link";

interface Review {
  id: string;
  title: string;
  location: string;
  description: string;
  lat?: number;
  lng?: number;
}

export default function NearbyReviews() {
  const [reviews, setReviews] = useState<Review[]>([]);
  const [nearby, setNearby] = useState<Review[]>([]);

  useEffect(() => {
    navigator.geolocation.getCurrentPosition(async (pos) => {
      const { latitude, longitude } = pos.coords;

      const snapshot = await getDocs(collection(db, "reviews"));
      const all = snapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      })) as Review[];

      const close = all.filter(
        (r) =>
          r.lat &&
          r.lng &&
          getDistance({ latitude, longitude }, { latitude: r.lat, longitude: r.lng }) <= 10000
      );

      setReviews(all);
      setNearby(close);
    });
  }, []);

  return (
    <div className="space-y-4">
      <h2 className="text-lg font-semibold">Nearby Reviews</h2>
      {nearby.length === 0 && <p>No nearby reviews found.</p>}
      {nearby.map((review) => (
        <Link
          key={review.id}
          href={`/reviews/${review.id}`}
          className="block border p-4 rounded shadow hover:bg-gray-50"
        >
          <h3 className="font-bold">{review.title}</h3>
          <p className="text-sm text-gray-600">{review.location}</p>
          <p className="text-sm mt-1 line-clamp-2">{review.description}</p>
        </Link>
      ))}
    </div>
  );
}
