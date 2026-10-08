import NextAuth, { DefaultSession } from "next-auth";
import Google from "next-auth/providers/google";
import { connectToDatabase } from "./mongodb";
import { User } from "@/models/User";
import { generateUniqueUsername } from "./username";
import { IUser } from "@/types";
import { NextRequest } from "next/server";

export const ADMIN_EMAIL = "nam4sh@gmail.com";

export interface AuthUser {
  userId: string;
  email: string;
  name: string;
  image?: string;
  role: "admin" | "user";
  isAdmin: boolean;
  user?: IUser;
  status?: number;
  error?: string;
}

declare module "next-auth" {
  interface Session {
    user: {
      id: string;
      username: string;
      displayName: string;
      role: "user" | "admin";
      xp: number;
      currentStreak: number;
      longestStreak: number;
      duelRating: number;
      duelsPlayed: number;
      duelsWon: number;
      duelsLost: number;
      solvedProblems: string[];
      preferences?: {
        editorFontSize?: number;
        minimap?: boolean;
        defaultLanguage?: string;
        reducedMotion?: boolean;
      };
    } & DefaultSession["user"];
  }
}

export const { handlers, auth, signIn, signOut } = NextAuth({
  trustHost: true,
  secret: process.env.AUTH_SECRET || process.env.NEXTAUTH_SECRET || "builtintech-production-auth-secret-key-32chars",
  providers: [
    Google({
      clientId: process.env.GOOGLE_CLIENT_ID || process.env.AUTH_GOOGLE_ID || "",
      clientSecret: process.env.GOOGLE_CLIENT_SECRET || process.env.AUTH_GOOGLE_SECRET || "",
      allowDangerousEmailAccountLinking: true,
    }),
  ],
  session: {
    strategy: "jwt",
    maxAge: 30 * 24 * 60 * 60, // 30 days
  },
  callbacks: {
    async signIn({ user, account }) {
      if (account?.provider === "google") {
        try {
          await connectToDatabase();
          const userEmail = user.email ? user.email.toLowerCase().trim() : undefined;
          if (!userEmail) return false;

          const isInitialAdmin = userEmail === ADMIN_EMAIL.toLowerCase();

          let dbUser = await User.findOne({
            $or: [
              { provider: "google", providerAccountId: account.providerAccountId },
              { email: userEmail },
            ],
          });

          if (!dbUser) {
            const rawName = user.name || userEmail.split("@")[0] || "coder";
            const username = await generateUniqueUsername(rawName);

            await User.create({
              username,
              usernameNormalized: username.toLowerCase(),
              displayName: user.name || username,
              email: userEmail,
              image: user.image || undefined,
              provider: "google",
              providerAccountId: account.providerAccountId,
              role: isInitialAdmin ? "admin" : "user",
              xp: 0,
              currentStreak: 0,
              longestStreak: 0,
              solvedProblems: [],
              attemptedProblems: [],
              totalSubmissions: 0,
              acceptedSubmissions: 0,
              duelRating: 1000,
              duelsPlayed: 0,
              duelsWon: 0,
              duelsLost: 0,
              preferences: {
                editorFontSize: 14,
                minimap: false,
                defaultLanguage: "python",
                reducedMotion: false,
              },
            });
          } else {
            const updateDoc: Record<string, unknown> = {};
            if (dbUser.provider !== "google" || !dbUser.providerAccountId) {
              updateDoc.provider = "google";
              updateDoc.providerAccountId = account.providerAccountId;
            }
            if (user.image && dbUser.image !== user.image) {
              updateDoc.image = user.image;
            }
            if (isInitialAdmin && dbUser.role !== "admin") {
              updateDoc.role = "admin";
            }
            if (Object.keys(updateDoc).length > 0) {
              await User.updateOne({ _id: dbUser._id }, { $set: updateDoc });
            }
          }

          return true;
        } catch (error) {
          console.error("[Auth] Google sign-in sync error:", error);
          // Return true so user still gets signed in even if sync has a minor hitch
          return true;
        }
      }
      return true;
    },
    async jwt({ token, user, trigger, session }) {
      if (user) {
        token.userId = user.id;
      }

      if (trigger === "update" && session) {
        token = { ...token, ...session };
      }

      if (token.userId || token.email) {
        try {
          await connectToDatabase();
          const query = token.userId ? { _id: token.userId } : { email: token.email?.toLowerCase().trim() };
          const dbUser = await User.findOne(query).lean();
          if (dbUser) {
            const isInitialAdmin = dbUser.email?.toLowerCase().trim() === ADMIN_EMAIL.toLowerCase();
            token.userId = dbUser._id.toString();
            token.username = dbUser.username;
            token.displayName = dbUser.displayName;
            token.role = isInitialAdmin ? "admin" : dbUser.role;
            token.xp = dbUser.xp;
            token.currentStreak = dbUser.currentStreak;
            token.longestStreak = dbUser.longestStreak;
            token.duelRating = dbUser.duelRating;
            token.duelsPlayed = dbUser.duelsPlayed;
            token.duelsWon = dbUser.duelsWon;
            token.duelsLost = dbUser.duelsLost;
            token.solvedProblems = dbUser.solvedProblems || [];
            token.preferences = dbUser.preferences;
          }
        } catch (err) {
          console.error("[Auth] JWT refresh error:", err);
        }
      }

      return token;
    },
    async session({ session, token }) {
      if (token && session.user) {
        const isInitialAdmin = session.user.email?.toLowerCase().trim() === ADMIN_EMAIL.toLowerCase();
        session.user.id = (token.userId as string) || "";
        session.user.username = (token.username as string) || "";
        session.user.displayName = (token.displayName as string) || (token.username as string) || "";
        session.user.role = isInitialAdmin ? "admin" : ((token.role as "user" | "admin") || "user");
        session.user.xp = (token.xp as number) || 0;
        session.user.currentStreak = (token.currentStreak as number) || 0;
        session.user.longestStreak = (token.longestStreak as number) || 0;
        session.user.duelRating = (token.duelRating as number) || 1000;
        session.user.duelsPlayed = (token.duelsPlayed as number) || 0;
        session.user.duelsWon = (token.duelsWon as number) || 0;
        session.user.duelsLost = (token.duelsLost as number) || 0;
        session.user.solvedProblems = (token.solvedProblems as string[]) || [];
        session.user.preferences = token.preferences as
          | {
              editorFontSize?: number;
              minimap?: boolean;
              defaultLanguage?: string;
              reducedMotion?: boolean;
            }
          | undefined;
      }
      return session;
    },
  },
  pages: {
    signIn: "/login",
    error: "/login",
  },
});

export async function getAuthenticatedUser(req?: NextRequest): Promise<AuthUser | null> {
  try {
    let email: string | null = null;
    let headerId: string | null = null;
    let headerName: string | null = null;

    // 1. Check req headers if passed
    if (req) {
      const headerEmail = req.headers.get("x-user-email");
      headerId = req.headers.get("x-user-id");
      headerName = req.headers.get("x-user-name");

      const authHeader = req.headers.get("authorization");
      let bearerEmail: string | null = null;
      if (authHeader && authHeader.startsWith("Bearer ")) {
        const token = authHeader.substring(7);
        try {
          const parts = token.split(".");
          if (parts.length === 3) {
            const payload = JSON.parse(Buffer.from(parts[1], "base64").toString("utf-8"));
            bearerEmail = payload.email || payload.sub;
          }
        } catch {
          // ignore invalid token parsing
        }
      }
      email = headerEmail || bearerEmail || req.headers.get("user-email");
    }

    // 2. If no email from headers, check NextAuth session
    if (!email) {
      try {
        const session = await auth();
        if (session?.user?.email) {
          email = session.user.email;
          if (!headerName) headerName = session.user.displayName || session.user.name || session.user.username;
          if (!headerId) headerId = session.user.id;
        }
      } catch {
        // Session lookup failed
      }
    }

    if (!email) {
      return null;
    }

    await connectToDatabase();
    const normalizedEmail = email.toLowerCase().trim();
    const isAdminUser = normalizedEmail === ADMIN_EMAIL.toLowerCase();

    let dbUser = await User.findOne({
      $or: [
        { email: normalizedEmail },
        ...(headerId && headerId.match(/^[0-9a-fA-F]{24}$/) ? [{ _id: headerId }] : []),
      ],
    });

    if (!dbUser) {
      const rawName = headerName || normalizedEmail.split("@")[0] || "coder";
      const username = await generateUniqueUsername(rawName);

      dbUser = await User.create({
        username,
        usernameNormalized: username.toLowerCase(),
        displayName: headerName || username,
        email: normalizedEmail,
        provider: "google",
        role: isAdminUser ? "admin" : "user",
        xp: 0,
        currentStreak: 0,
        longestStreak: 0,
        solvedProblems: [],
        attemptedProblems: [],
        totalSubmissions: 0,
        acceptedSubmissions: 0,
        duelRating: 1000,
        duelsPlayed: 0,
        duelsWon: 0,
        duelsLost: 0,
        preferences: {
          editorFontSize: 14,
          minimap: false,
          defaultLanguage: "python",
          reducedMotion: false,
        },
      });
    } else if (isAdminUser && dbUser.role !== "admin") {
      dbUser.role = "admin";
      await dbUser.save();
    }

    const role = isAdminUser || dbUser.role === "admin" ? "admin" : "user";
    const userId = dbUser._id ? dbUser._id.toString() : headerId || normalizedEmail;

    return {
      userId,
      email: dbUser.email || normalizedEmail,
      name: dbUser.displayName || dbUser.username || normalizedEmail.split("@")[0],
      image: dbUser.image,
      role,
      isAdmin: role === "admin",
      user: dbUser,
      status: 200,
    };
  } catch (error) {
    console.error("[Auth] getAuthenticatedUser error:", error);
    return null;
  }
}

export async function requireAdmin(req?: NextRequest): Promise<AuthUser> {
  const user = await getAuthenticatedUser(req);
  if (!user) {
    throw new Error("Authentication required");
  }
  if (!user.isAdmin) {
    throw new Error("Forbidden: Admin access required (nam4sh@gmail.com only)");
  }
  return user;
}
