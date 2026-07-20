import "server-only";

import type { NextAuthOptions, Session } from "next-auth";
import { getServerSession } from "next-auth";
import GoogleProvider, { type GoogleProfile } from "next-auth/providers/google";

import {
  configuredWriterEmails,
  isConfiguredWriterEmail,
  isVerifiedConfiguredWriter
} from "@/lib/blog-writer-policy";

export function isAllowedWriterEmail(value: unknown) {
  return isConfiguredWriterEmail(value, process.env.BLOG_WRITER_EMAILS);
}

export function isBlogWriterAuthConfigured() {
  const hasRequiredValues = [
    "GOOGLE_CLIENT_ID",
    "GOOGLE_CLIENT_SECRET",
    "NEXTAUTH_SECRET"
  ].every((name) => Boolean(process.env[name]?.trim()));

  if (!hasRequiredValues || configuredWriterEmails(process.env.BLOG_WRITER_EMAILS).size === 0) {
    return false;
  }

  if (process.env.NODE_ENV !== "production") {
    return true;
  }

  try {
    return new URL(process.env.NEXTAUTH_URL ?? "").origin === "https://blog.nimdal.xyz";
  } catch {
    return false;
  }
}

export const authOptions: NextAuthOptions = {
  secret: process.env.NEXTAUTH_SECRET,
  session: {
    strategy: "jwt",
    maxAge: 60 * 60 * 8
  },
  providers: [
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID ?? "missing-google-client-id",
      clientSecret: process.env.GOOGLE_CLIENT_SECRET ?? "missing-google-client-secret"
    })
  ],
  pages: {
    signIn: "/write/login",
    error: "/write/forbidden"
  },
  callbacks: {
    async signIn({ account, profile }) {
      if (account?.provider !== "google" || !profile) {
        return false;
      }

      const googleProfile = profile as GoogleProfile;
      return isVerifiedConfiguredWriter(
        {
          email: googleProfile.email,
          emailVerified: googleProfile.email_verified
        },
        process.env.BLOG_WRITER_EMAILS
      );
    },
    async jwt({ token, account, profile }) {
      if (account?.provider === "google" && profile) {
        const googleProfile = profile as GoogleProfile;
        token.emailVerified = googleProfile.email_verified === true;
      }

      return token;
    },
    async session({ session, token }) {
      session.writer =
        token.emailVerified === true && isAllowedWriterEmail(session.user?.email ?? token.email);
      return session;
    },
    async redirect({ url, baseUrl }) {
      if (url.startsWith("/")) {
        return `${baseUrl}${url}`;
      }

      try {
        if (new URL(url).origin === baseUrl) {
          return url;
        }
      } catch {
        return `${baseUrl}/write`;
      }

      return `${baseUrl}/write`;
    }
  }
};

export type WriterAccess =
  | { status: "configuration-required"; session: null }
  | { status: "signed-out"; session: null }
  | { status: "forbidden"; session: Session }
  | { status: "authorized"; session: Session };

export async function getWriterAccess(): Promise<WriterAccess> {
  if (!isBlogWriterAuthConfigured()) {
    return { status: "configuration-required", session: null };
  }

  const session = await getServerSession(authOptions);

  if (!session) {
    return { status: "signed-out", session: null };
  }

  if (!session.writer || !isAllowedWriterEmail(session.user?.email)) {
    return { status: "forbidden", session };
  }

  return { status: "authorized", session };
}
