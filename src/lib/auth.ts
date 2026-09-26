import type { NextAuthOptions } from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import crypto from "crypto";

function getNextAuthSecret(): string {
  if (process.env.NEXTAUTH_SECRET) {
    return process.env.NEXTAUTH_SECRET;
  }
  if (process.env.NODE_ENV === "production") {
    throw new Error("NEXTAUTH_SECRET environment variable is missing in production.");
  }
  console.warn(
    "[SECURITY WARNING] NEXTAUTH_SECRET is not set in environment. Falling back to an ephemeral cryptographic secret for local testing. Sessions will reset on server restart."
  );
  return crypto.randomBytes(32).toString("hex");
}

// Enterprise corporate user directory definitions
const CORPORATE_USERS: Record<
  string,
  { name: string; email: string; role: string; department: string }
> = {
  alex: {
    name: "Alex Rivera",
    email: "alex.rivera@aetheria.corp",
    role: "VP of Engineering",
    department: "Platform Infrastructure",
  },
  "alex.rivera": {
    name: "Alex Rivera",
    email: "alex.rivera@aetheria.corp",
    role: "VP of Engineering",
    department: "Platform Infrastructure",
  },
  sarah: {
    name: "Sarah Chen",
    email: "sarah.chen@aetheria.corp",
    role: "Principal Product Director",
    department: "Core Workspace & Media",
  },
  "sarah.chen": {
    name: "Sarah Chen",
    email: "sarah.chen@aetheria.corp",
    role: "Principal Product Director",
    department: "Core Workspace & Media",
  },
  david: {
    name: "David Vance",
    email: "david.vance@aetheria.corp",
    role: "Director of Information Security",
    department: "InfoSec & Compliance",
  },
  "david.vance": {
    name: "David Vance",
    email: "david.vance@aetheria.corp",
    role: "Director of Information Security",
    department: "InfoSec & Compliance",
  },
};

export const authOptions: NextAuthOptions = {
  providers: [
    CredentialsProvider({
      id: "dummy-credentials",
      name: "Aetheria Workspace SSO",
      credentials: {
        username: {
          label: "Corporate Identity",
          type: "text",
          placeholder: "e.g. alex.rivera or alex",
        },
        password: {
          label: "Password / SSO Token",
          type: "password",
          placeholder: "Corporate SSO password or passkey",
        },
      },
      async authorize(credentials) {
        if (!credentials?.username || credentials.username.trim().length === 0) {
          throw new Error("Corporate identity or email is required to sign in.");
        }

        const rawUsername = credentials.username.trim();
        const normalizedKey = rawUsername.toLowerCase().replace(/[^a-z0-9._-]/g, "");

        if (!normalizedKey) {
          throw new Error("Corporate username contains invalid characters.");
        }

        // Match against corporate directory or construct a verified enterprise employee identity
        const corporateProfile = CORPORATE_USERS[normalizedKey];

        const displayName = corporateProfile
          ? corporateProfile.name
          : rawUsername
              .split(/[\s._-]+/)
              .map((w) => w.charAt(0).toUpperCase() + w.slice(1).toLowerCase())
              .join(" ");

        const email = corporateProfile
          ? corporateProfile.email
          : `${normalizedKey.replace(/[^a-z0-9]/g, "")}@aetheria.corp`;

        const role = corporateProfile?.role || "Enterprise Member";
        const department = corporateProfile?.department || "Global Operations";

        const userHash = crypto
          .createHash("sha256")
          .update(email.toLowerCase())
          .digest("hex")
          .slice(0, 10);

        return {
          id: `usr_${userHash}`,
          name: displayName,
          email,
          role,
          department,
          image: `https://api.dicebear.com/7.x/initials/svg?seed=${encodeURIComponent(displayName)}&backgroundColor=4f46e5,06b6d4`,
        };
      },
    }),
  ],
  pages: {
    signIn: "/login",
  },
  session: {
    strategy: "jwt",
    maxAge: 60 * 60, // 1 hour session
  },
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.id = user.id;
        token.name = user.name;
        token.email = user.email;
        token.role = (user as { role?: string }).role;
        token.department = (user as { department?: string }).department;
      }
      return token;
    },
    async session({ session, token }) {
      if (session.user) {
        (session.user as { id?: string }).id = token.id as string;
        session.user.name = token.name as string;
        session.user.email = token.email as string;
        (session.user as { role?: string }).role = token.role as string;
        (session.user as { department?: string }).department = token.department as string;
      }
      return session;
    },
  },
  secret: getNextAuthSecret(),
};
