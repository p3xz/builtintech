import mongoose, { Schema, Model } from "mongoose";

export interface ICourseDoc {
  _id: string;
  courseId: string;
  slug: string;
  title: string;
  language: string;
  description: string;
  difficulty: "Beginner" | "Intermediate" | "Advanced";
  ordering: number;
  icon?: string;
  color?: string;
  published: boolean;
  moduleIds?: string[];
  createdAt: Date;
  updatedAt: Date;
}

const CourseSchema = new Schema<ICourseDoc>(
  {
    courseId: { type: String, required: true, unique: true, index: true },
    slug: { type: String, required: true, unique: true, index: true },
    title: { type: String, required: true },
    language: { type: String, required: true, index: true },
    description: { type: String, default: "" },
    difficulty: {
      type: String,
      enum: ["Beginner", "Intermediate", "Advanced"],
      default: "Beginner",
    },
    ordering: { type: Number, required: true, index: true },
    icon: { type: String },
    color: { type: String },
    published: { type: Boolean, default: false, index: true },
    moduleIds: { type: [String], default: [] },
  },
  { timestamps: true }
);

export const Course: Model<ICourseDoc> =
  mongoose.models.Course || mongoose.model<ICourseDoc>("Course", CourseSchema);
