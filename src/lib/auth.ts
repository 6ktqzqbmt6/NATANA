import "server-only";
import type { NextAuthOptions } from "next-auth";
import GoogleProvider from "next-auth/providers/google";
import { isAllowedEmail, isVerifiedGoogleProfile } from "./access";

export const authConfigured = Boolean(process.env.NEXTAUTH_SECRET && process.env.GOOGLE_CLIENT_ID && process.env.GOOGLE_CLIENT_SECRET && process.env.ALLOWED_EMAILS?.trim());

export const authOptions: NextAuthOptions = {
  secret: process.env.NEXTAUTH_SECRET,
  providers: [GoogleProvider({
    clientId: process.env.GOOGLE_CLIENT_ID ?? "",
    clientSecret: process.env.GOOGLE_CLIENT_SECRET ?? "",
    authorization: { params: { prompt: "select_account" } },
  })],
  session: { strategy: "jwt", maxAge: 60 * 60 * 8 },
  pages: { signIn: "/login", error: "/login" },
  callbacks: {
    async signIn({ account, profile }) {
      return authConfigured && account?.provider === "google" &&
        isVerifiedGoogleProfile(profile) && isAllowedEmail(profile.email);
    },
    async session({ session }) {
      // Recheck the allowlist on every session lookup, including existing sessions.
      if (!isAllowedEmail(session.user?.email)) session.user = undefined;
      return session;
    },
  },
};
