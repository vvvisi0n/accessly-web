// src/lib/bookmark.ts
import { db } from "./firebase";
import { doc, getDoc, setDoc, deleteDoc } from "firebase/firestore";

export async function toggleBookmark(userId: string, reviewId: string) {
  const ref = doc(db, "users", userId, "bookmarks", reviewId);
  const snap = await getDoc(ref);

  if (snap.exists()) {
    await deleteDoc(ref);
    return false;
  } else {
    await setDoc(ref, { savedAt: new Date().toISOString() });
    return true;
  }
}

export async function isBookmarked(userId: string, reviewId: string) {
  const ref = doc(db, "users", userId, "bookmarks", reviewId);
  const snap = await getDoc(ref);
  return snap.exists();
}
