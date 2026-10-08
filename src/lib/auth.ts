import NextAuth, { DefaultSession } from "next-auth";
import GoogleProvider from "next-auth/providers/google";
import CredentialsProvider from "next-auth/providers/credentials";
import { connectToDatabase } from "./mongodb";
import { User } from "@/models/User";
import { EmailOtp } from "@/models/EmailOtp";
import { hashOtp } from "./email";
import { generateUniqueUsername } from "./username";
import { IUser } from "@/types";

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
    CredentialsProvider({
      id: "email-otp",
      name: "Email OTP",
      credentials: {
        email: { label: "Email", type: "email" },
        otp: { label: "OTP", type: "text" },
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.otp) {
          throw new Error("Email and verification code are required");
        }

        const email = String(credentials.email).toLowerCase().trim();
        const otp = String(credentials.otp).trim();

        await connectToDatabase();

        // 1. Verify OTP record
        const incomingHash = hashOtp(otp, email);
        const otpRecord = await EmailOtp.findOne({ email }).sort({ createdAt: -1 });

        if (!otpRecord) {
          throw new Error("No pending verification code found for this email");
        }

        if (otpRecord.expiresAt < new Date()) {
          await EmailOtp.deleteMany({ email });
          throw new Error("Verification code has expired. Please request a new one.");
        }

        if (otpRecord.attempts >= 3) {
          await EmailOtp.deleteMany({ email });
          throw new Error("Too many failed attempts. Please request a new code.");
        }

        if (otpRecord.otpHash !== incomingHash) {
          otpRecord.attempts += 1;
          await otpRecord.save();
          throw new Error("Invalid verification code");
        }

        // Clean up verified OTP
        await EmailOtp.deleteMany({ email });

        // 2. Find or create user
        let dbUser = await User.findOne({ email });

        if (!dbUser) {
          const rawName = email.split("@")[0] || "coder";
          const username = await generateUniqueUsername(rawName);

          dbUser = await User.create({
            username,
            usernameNormalized: username.toLowerCase(),
            displayName: rawName,
            email,
            provider: "email",
            role: "user",
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
        }

        return {
          id: dbUser._id.toString(),
          email: dbUser.email,
          name: dbUser.displayName,
          username: dbUser.username,
        };
      },
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
              role: "user",
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
            // Update providerAccountId if needed
            if (dbUser.provider !== "google" || !dbUser.providerAccountId) {
              dbUser.provider = "google";
              dbUser.providerAccountId = account.providerAccountId;
              if (user.image) dbUser.image = user.image;
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
      if (token.userId) {
        try {
          await connectToDatabase();
          const dbUser = await User.findById(token.userId).lean();
          if (dbUser) {
            token.userId = dbUser._id.toString();
            token.username = dbUser.username;
            token.displayName = dbUser.displayName;
            token.role = dbUser.role;
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
        session.user.id = (token.userId as string) || "";
        session.user.username = (token.username as string) || "";
        session.user.displayName = (token.displayName as string) || (token.username as string) || "";
        session.user.role = (token.role as "user" | "admin") || "user";
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

    return { user: dbUser, status: 200 };
  } catch (error) {
    console.error("[Auth] Verification error:", error);
    return { user: null, error: "Authentication check failed.", status: 500 };
  }
}
