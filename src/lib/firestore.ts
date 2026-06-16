// src/lib/firestore.ts

import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";
import { getStorage } from "firebase/storage";

// ✅ Firebase config from your project
const firebaseConfig = {
  apiKey: "AIzaSyAWS5eY5z67ZbbxHFOIcJiZ52VGgLeU8yk",
  authDomain: "accey-app.firebaseapp.com",
  projectId: "accey-app",
  storageBucket: "accey-app.appspot.com", // 🔧 Fixed typo here
  messagingSenderId: "269020911817",
  appId: "1:269020911817:web:e3916d70d3155c6d7ad518",
};

// 🚀 Initialize Firebase
const app = initializeApp(firebaseConfig);

// 🗂️ Firestore database instance
const db = getFirestore(app);

// ☁️ Firebase Storage instance
const storage = getStorage(app);

export { db, storage };
