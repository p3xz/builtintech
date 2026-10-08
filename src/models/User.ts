import mongoose, { Schema, Model } from "mongoose";
import { IUser } from "@/types";

const UserSchema = new Schema<IUser>(
  {
    username: {
      type: String,
      required: true,
      trim: true,
      minlength: 3,
      maxlength: 24,
      match: /^[A-Za-z0-9_]{3,24}$/,
    },
    usernameNormalized: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
      index: true,
    },
    displayName: {
      type: String,
      required: true,
      trim: true,
      maxlength: 40,
    },
    email: {
      type: String,
      trim: true,
      lowercase: true,
      index: true,
    },
    image: {
      type: String,
      trim: true,
    },
    provider: {
      type: String,
      required: true,
      enum: ["google", "email", "credentials"],
    },
    providerAccountId: {
      type: String,
      index: true,
    },
    role: {
      type: String,
      enum: ["user", "admin"],
      default: "user",
    },
    xp: {
      type: Number,
      default: 0,
      min: 0,
      index: true,
    },
    currentStreak: {
      type: Number,
      default: 0,
      min: 0,
    },
    longestStreak: {
      type: Number,
      default: 0,
      min: 0,
    },
    lastActiveDate: {
      type: String,
    },
    solvedProblems: {
      type: [String],
      default: [],
    },
    attemptedProblems: {
      type: [String],
      default: [],
    },
    totalSubmissions: {
      type: Number,
      default: 0,
    },
    acceptedSubmissions: {
      type: Number,
      default: 0,
    },
    duelRating: {
      type: Number,
      default: 1000,
      min: 0,
      index: true,
    },
    duelsPlayed: {
      type: Number,
      default: 0,
      min: 0,
      index: true,
    },
    duelsWon: {
      type: Number,
      default: 0,
      min: 0,
      index: true,
    },
    duelsLost: {
      type: Number,
      default: 0,
      min: 0,
    },
    termsAccepted: {
      type: Boolean,
      default: true,
    },
    privacyPolicyAccepted: {
      type: Boolean,
      default: true,
    },
    preferences: {
      editorFontSize: { type: Number, default: 14 },
      minimap: { type: Boolean, default: false },
      defaultLanguage: { type: String, default: "python" },
      reducedMotion: { type: Boolean, default: false },
    },
  },
  {
    timestamps: true,
  }
);

UserSchema.index({ xp: -1, solvedProblems: -1 });
UserSchema.index({ duelRating: -1 });
UserSchema.index({ duelsWon: -1, duelsPlayed: -1 });

export const User: Model<IUser> =
  mongoose.models.User || mongoose.model<IUser>("User", UserSchema);
