// Client-side Firebase SDK only.
// firebase-admin (server-only) was removed from this file because it
// cannot be bundled for the browser. If you need admin SDK access,
// import from src/lib/firebase-admin.ts in server-only contexts (API routes,
// Server Components) — never in "use client" files.
import { initializeApp, getApps, getApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";
import { getStorage } from "firebase/storage";

const clientCreds = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY!,
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN!,
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID!,
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET!,
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID!,
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID!,
};

const app = getApps().length ? getApp() : initializeApp(clientCreds);
const db = getFirestore(app);
const storage = getStorage(app);

export { app, db, storage };
