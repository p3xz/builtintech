import mongoose, { Schema, Model } from "mongoose";
import { IEmailOtp } from "@/types";

const EmailOtpSchema = new Schema<IEmailOtp>(
  {
    email: {
      type: String,
      required: true,
      lowercase: true,
      trim: true,
      index: true,
    },
    otpHash: {
      type: String,
      required: true,
    },
    attempts: {
      type: Number,
      default: 0,
    },
    expiresAt: {
      type: Date,
      required: true,
      index: { expires: 0 }, // TTL index auto-deletes expired OTPs
    },
  },
  {
    timestamps: true,
  }
);

EmailOtpSchema.index({ email: 1, createdAt: -1 });

export const EmailOtp: Model<IEmailOtp> =
  mongoose.models.EmailOtp ||
  mongoose.model<IEmailOtp>("EmailOtp", EmailOtpSchema);
