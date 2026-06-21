"use server";

import { db, storage } from "./firebase";
import { ref, uploadBytes, getDownloadURL } from "firebase/storage";
import { addDoc, collection, serverTimestamp } from "firebase/firestore";
import { v4 as uuidv4 } from "uuid";

export async function submitReview({
  userId,
  placeName,
  description,
  rating,
  imageFile,
}: {
  userId: string;
  placeName: string;
  description: string;
  rating: number;
  imageFile?: File | null;
}) {
  try {
    let imageUrl = null;
    let aiAnalysis = null;

    // ✅ 1. Upload image if available
    if (imageFile) {
      const imageRef = ref(storage, `reviews/${userId}/${uuidv4()}-${imageFile.name}`);
      const snapshot = await uploadBytes(imageRef, imageFile);
      imageUrl = await getDownloadURL(snapshot.ref);

      // ✅ 2. Send to AI analysis API
      const res = await fetch(`${process.env.NEXT_PUBLIC_BASE_URL}/api/ai/analyze-image`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ imageUrl }),
      });
      const data = await res.json();
      aiAnalysis = data.analysis || null;
    }
    const userLocation = { lat: 40.7128, lng: -74.006 }; // temporary - replace with actual user coordinates later

    // ✅ 3. Store review + AI insights in Firestore
    await addDoc(collection(db, "reviews"), {
      userId,
      placeName,
      description,
      rating,
      imageUrl,
      aiAnalysis,
      location: userLocation, // ✅ add this
      createdAt: serverTimestamp(),
    });

    console.log("✅ Review + AI analysis submitted!");
    return { success: true, aiAnalysis };
  } catch (error) {
    console.error("🔥 Error submitting review:", error);
    return { success: false, error };
  }
}
