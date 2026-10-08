import mongoose, { Schema, Model } from "mongoose";
import { IDuelRoom, IDuelPlayer } from "@/types";

const DuelPlayerSchema = new Schema<IDuelPlayer>(
  {
    userId: { type: String },
    username: { type: String, required: true },
    displayName: { type: String, required: true },
    image: { type: String },
    status: {
      type: String,
      enum: ["CODING", "SUBMITTED", "SOLVED"],
      default: "CODING",
    },
    code: { type: String, default: "" },
    submittedAt: { type: Date },
    testsPassed: { type: Number, default: 0 },
    totalTests: { type: Number, default: 0 },
    runtimeMs: { type: Number },
  },
  { _id: false }
);

const DuelJudgeResultSchema = new Schema(
  {
    winner: { type: String, default: null },
    verdict: { type: String, required: true },
    player1: {
      name: { type: String, required: true },
      testsPassed: { type: Number, required: true },
      totalTests: { type: Number, required: true },
      runtimeMs: { type: Number, required: true },
      readability: {
        score: { type: Number, required: true },
        reason: { type: String, required: true },
      },
      feedback: {
        mistakes: { type: [String], default: [] },
        improvements: { type: [String], default: [] },
        betterApproach: { type: String, default: "" },
      },
    },
    player2: {
      name: { type: String, required: true },
      testsPassed: { type: Number, required: true },
      totalTests: { type: Number, required: true },
      runtimeMs: { type: Number, required: true },
      readability: {
        score: { type: Number, required: true },
        reason: { type: String, required: true },
      },
      feedback: {
        mistakes: { type: [String], default: [] },
        improvements: { type: [String], default: [] },
        betterApproach: { type: String, default: "" },
      },
    },
    judgedAt: { type: Number, required: true },
  },
  { _id: false }
);

const DuelRoomSchema = new Schema<IDuelRoom>(
  {
    roomCode: {
      type: String,
      required: true,
      unique: true,
      uppercase: true,
      trim: true,
      index: true,
    },
    problemId: {
      type: String,
      required: true,
      index: true,
    },
    problemTitle: {
      type: String,
    },
    status: {
      type: String,
      enum: ["WAITING", "ACTIVE", "FINISHED", "CANCELLED"],
      default: "WAITING",
      index: true,
    },
    endsAt: {
      type: Date,
    },
    player1: {
      type: DuelPlayerSchema,
      required: true,
    },
    player2: {
      type: DuelPlayerSchema,
    },
    judgeResult: {
      type: DuelJudgeResultSchema,
    },
    winner: {
      type: String,
      default: null,
    },
    expiresAt: {
      type: Date,
      required: true,
      index: { expires: 0 }, // MongoDB TTL auto-cleanup after 24h
    },
  },
  {
    timestamps: true,
  }
);

DuelRoomSchema.index({ roomCode: 1, status: 1 });
DuelRoomSchema.index({ createdAt: -1 });

export const DuelRoom: Model<IDuelRoom> =
  mongoose.models.DuelRoom ||
  mongoose.model<IDuelRoom>("DuelRoom", DuelRoomSchema);
