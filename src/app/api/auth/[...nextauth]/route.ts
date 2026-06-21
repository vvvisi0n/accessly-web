import NextAuth from "next-auth";
import GoogleProvider from "next-auth/providers/google";
import { FirestoreAdapter } from "@auth/firebase-adapter";
import { cert } from "firebase-admin/app";
import { db } from "@/lib/firebase";

// Only initialize the Firestore adapter when the required Firebase credentials
// are present. During CI/CD builds without credentials the adapter is omitted
// so Next.js can collect page data without throwing.
const firebaseCredentials =
  process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID &&
  process.env.FIREBASE_CLIENT_EMAIL &&
  process.env.FIREBASE_PRIVATE_KEY;

const adapter = firebaseCredentials
  ? FirestoreAdapter({
      credential: cert({
        projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
        clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
        privateKey: process.env.FIREBASE_PRIVATE_KEY?.replace(/\\n/g, "\n"),
      }),
    })
  : undefined;

const handler = NextAuth({
  ...(adapter ? { adapter } : {}),
  providers: [
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID!,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
    }),
  ],
  callbacks: {
    async session({ session, token }) {
      session.user.role = token.role || "free";
      return session;
    },
    async jwt({ token, user }) {
      if (user) {
        const ref = db.collection("users").doc(user.id);
        const snap = await ref.get();
        token.role = snap.exists ? snap.data()?.role || "free" : "free";
      }
      return token;
    },
  },
});

export { handler as GET, handler as POST };
