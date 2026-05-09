import type { NextAuthConfig } from "next-auth";
import GoogleProvider from "next-auth/providers/google";

export const authConfig: NextAuthConfig = {
  pages: { signIn: "/sign-in" },
  providers: [
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID ?? "",
      clientSecret: process.env.GOOGLE_CLIENT_SECRET ?? "",
      allowDangerousEmailAccountLinking: true,
      checks: ["state"],
    }),
  ],
  callbacks: {
    authorized({ auth, request }) {
      const isLoggedIn = !!auth?.user;
      const isProtected =
        request.nextUrl.pathname.startsWith("/dashboard") ||
        request.nextUrl.pathname === "/setup";
      if (isProtected) return isLoggedIn;
      return true;
    },
  },
};
