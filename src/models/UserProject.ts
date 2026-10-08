import mongoose, { Schema, Model } from "mongoose";

export interface IUserProjectDocument {
  _id?: string;
  userId: string;
  username: string;
  displayName: string;
  title: string;
  description: string;
  language: string;
  code: string;
  visibility: "public" | "private";
  tags: string[];
  viewsCount: number;
  forksCount: number;
  likesCount: number;
  createdAt?: Date;
  updatedAt?: Date;
}

const UserProjectSchema = new Schema<IUserProjectDocument>(
  {
    userId: {
      type: String,
      required: true,
      index: true,
    },
    username: {
      type: String,
      required: true,
      index: true,
    },
    displayName: {
      type: String,
      required: true,
    },
    title: {
      type: String,
      required: true,
      trim: true,
      maxlength: 100,
    },
    description: {
      type: String,
      default: "",
      maxlength: 500,
    },
    language: {
      type: String,
      required: true,
    },
    code: {
      type: String,
      required: true,
    },
    visibility: {
      type: String,
      enum: ["public", "private"],
      default: "private",
      index: true,
    },
    tags: {
      type: [String],
      default: [],
    },
    viewsCount: {
      type: Number,
      default: 0,
    },
    forksCount: {
      type: Number,
      default: 0,
    },
    likesCount: {
      type: Number,
      default: 0,
    },
  },
  {
    timestamps: true,
  }
);

UserProjectSchema.index({ visibility: 1, createdAt: -1 });

export const UserProject: Model<IUserProjectDocument> =
  mongoose.models.UserProject ||
  mongoose.model<IUserProjectDocument>("UserProject", UserProjectSchema);
