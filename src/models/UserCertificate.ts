import mongoose, { Schema, Model } from "mongoose";

export interface IUserCertificateDocument {
  _id?: string;
  userId: string;
  username: string;
  displayName: string;
  courseId: string;
  courseTitle: string;
  language: string;
  certificateId: string;
  verificationHash: string;
  grade: string;
  issuedAt: Date;
  createdAt?: Date;
  updatedAt?: Date;
}

const UserCertificateSchema = new Schema<IUserCertificateDocument>(
  {
    userId: {
      type: String,
      required: true,
      index: true,
    },
    username: {
      type: String,
      required: true,
    },
    displayName: {
      type: String,
      required: true,
    },
    courseId: {
      type: String,
      required: true,
      index: true,
    },
    courseTitle: {
      type: String,
      required: true,
    },
    language: {
      type: String,
      required: true,
    },
    certificateId: {
      type: String,
      required: true,
      unique: true,
      index: true,
    },
    verificationHash: {
      type: String,
      required: true,
    },
    grade: {
      type: String,
      default: "Passed",
    },
    issuedAt: {
      type: Date,
      default: Date.now,
    },
  },
  {
    timestamps: true,
  }
);

UserCertificateSchema.index({ userId: 1, courseId: 1 }, { unique: true });

export const UserCertificate: Model<IUserCertificateDocument> =
  mongoose.models.UserCertificate ||
  mongoose.model<IUserCertificateDocument>("UserCertificate", UserCertificateSchema);
