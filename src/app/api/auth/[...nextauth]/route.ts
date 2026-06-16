import NextAuth from "next-auth";
import GoogleProvider from "next-auth/providers/google";
import { FirestoreAdapter } from "@auth/firebase-adapter";
import { cert } from "firebase-admin/app";
import { db } from "@/lib/firebase";

// 🔥 Uses Firebase as adapter for user sessions
const handler = NextAuth({
  adapter: FirestoreAdapter({
    credential: cert({
      projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
      clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
      privateKey: process.env.FIREBASE_PRIVATE_KEY?.replace(/\\n/g, "\n"),
    }),
  }),

  providers: [
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID!,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
    }),
  ],

  // 🔐 Add custom fields (role)
  callbacks: {
    async session({ session, token }) {
      session.user.role = token.role || "free"; // default
      return session;
    },
    async jwt({ token, user }) {
      if (user) {
        // Fetch role from Firestore (or set default)
        const ref = db.collection("users").doc(user.id);
        const snap = await ref.get();
        token.role = snap.exists ? snap.data()?.role || "free" : "free";
      }
      return token;
    },
  },
});

export { handler as GET, handler as POST };
