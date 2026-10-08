import mongoose, { Schema, Model } from "mongoose";

export interface IRank {
  _id: string;
  rankId: string;
  name: string;
  tier: "Bronze" | "Silver" | "Gold" | "Platinum" | "Diamond" | "Master";
  minimumXP: number;
  maximumXP: number;
  order: number;
  icon: string;
  perks: string[];
  createdAt: Date;
  updatedAt: Date;
}

const RankSchema = new Schema<IRank>(
  {
    rankId: { type: String, required: true, unique: true, index: true },
    name: { type: String, required: true },
    tier: {
      type: String,
      enum: ["Bronze", "Silver", "Gold", "Platinum", "Diamond", "Master"],
      default: "Bronze",
    },
    minimumXP: { type: Number, required: true, min: 0 },
    maximumXP: { type: Number, required: true },
    order: { type: Number, required: true, index: true },
    icon: { type: String, default: "sparkles" },
    perks: { type: [String], default: [] },
  },
  { timestamps: true }
);

export const Rank: Model<IRank> =
  mongoose.models.Rank || mongoose.model<IRank>("Rank", RankSchema);
