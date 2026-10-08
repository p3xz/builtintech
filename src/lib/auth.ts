import NextAuth, { DefaultSession } from "next-auth";
import GoogleProvider from "next-auth/providers/google";
import { connectToDatabase } from "./mongodb";
import { User } from "@/models/User";
import { generateUniqueUsername } from "./username";
import { IUser } from "@/types";

const ADMIN_EMAIL = "nam4sh@gmail.com";

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
  providers: [
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID || "",
      clientSecret: process.env.GOOGLE_CLIENT_SECRET || "",
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

          let dbUser = await User.findOne({
            $or: [
              { provider: "google", providerAccountId: account.providerAccountId },
              { email: userEmail },
            ],
          });

          const isInitialAdmin = userEmail === ADMIN_EMAIL;

          if (!dbUser) {
            const rawName = user.name || userEmail.split("@")[0] || "coder";
            const username = await generateUniqueUsername(rawName);

            dbUser = await User.create({
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
            // Update providerAccountId or admin role if needed
            let modified = false;
            if (dbUser.provider !== "google" || !dbUser.providerAccountId) {
              dbUser.provider = "google";
              dbUser.providerAccountId = account.providerAccountId;
              modified = true;
            }
            if (user.image && dbUser.image !== user.image) {
              dbUser.image = user.image;
              modified = true;
            }
            if (isInitialAdmin && dbUser.role !== "admin") {
              dbUser.role = "admin";
              modified = true;
            }
            if (modified) {
              await dbUser.save();
            }
          }

          return true;
        } catch (error) {
          console.error("[Auth] Google sign-in sync error:", error);
          return false;
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

      // Sync user data on JWT lookup
      if (token.userId || token.email) {
        try {
          await connectToDatabase();
          const query = token.userId ? { _id: token.userId } : { email: token.email?.toLowerCase().trim() };
          const dbUser = await User.findOne(query).lean();
          if (dbUser) {
            const isInitialAdmin = dbUser.email?.toLowerCase().trim() === ADMIN_EMAIL;
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
        const isInitialAdmin = session.user.email?.toLowerCase().trim() === ADMIN_EMAIL;
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

export async function getAuthenticatedUser(): Promise<{
  user: IUser | null;
  error?: string;
  status: number;
}> {
  try {
    const session = await auth();
    if (!session || !session.user || !session.user.id) {
      return { user: null, error: "Unauthorized. Please sign in.", status: 401 };
    }

    await connectToDatabase();
    const dbUser = await User.findById(session.user.id);
    if (!dbUser) {
      return { user: null, error: "User account not found.", status: 404 };
    }

    if (dbUser.email?.toLowerCase().trim() === ADMIN_EMAIL && dbUser.role !== "admin") {
      dbUser.role = "admin";
      await dbUser.save();
    }

    return { user: dbUser, status: 200 };
  } catch (error) {
    console.error("[Auth] Verification error:", error);
    return { user: null, error: "Authentication check failed.", status: 500 };
  }
}
