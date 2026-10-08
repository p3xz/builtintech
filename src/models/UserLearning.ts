import mongoose, { Schema, Model } from "mongoose";

export interface IUserLearningDocument {
  _id?: string;
  userId: string;
  username: string;
  preferredLanguage?: string;
  experienceLevel?: string;
  enrolledCourseIds: string[];
  completedLessonIds: string[];
  completedModuleIds: string[];
  passedQuizIds: string[];
  currentCourseId?: string;
  currentModuleId?: string;
  currentLessonId?: string;
  solvedCases: string[];
  architectCompletedPhases: Record<string, number[]>;
  dailyMissionDate?: string;
  dailyMissionCurrent: number;
  dailyMissionCompleted: boolean;
  createdAt?: Date;
  updatedAt?: Date;
}

const UserLearningSchema = new Schema<IUserLearningDocument>(
  {
    userId: {
      type: String,
      required: true,
      unique: true,
      index: true,
    },
    username: {
      type: String,
      required: true,
      index: true,
    },
    preferredLanguage: {
      type: String,
      default: "python",
    },
    experienceLevel: {
      type: String,
      default: "Beginner",
    },
    enrolledCourseIds: {
      type: [String],
      default: [],
    },
    completedLessonIds: {
      type: [String],
      default: [],
    },
    completedModuleIds: {
      type: [String],
      default: [],
    },
    passedQuizIds: {
      type: [String],
      default: [],
    },
    currentCourseId: {
      type: String,
    },
    currentModuleId: {
      type: String,
    },
    currentLessonId: {
      type: String,
    },
    solvedCases: {
      type: [String],
      default: [],
    },
    architectCompletedPhases: {
      type: Schema.Types.Mixed,
      default: {},
    },
    dailyMissionDate: {
      type: String,
    },
    dailyMissionCurrent: {
      type: Number,
      default: 0,
    },
    dailyMissionCompleted: {
      type: Boolean,
      default: false,
    },
  },
  {
    timestamps: true,
  }
);

export const UserLearning: Model<IUserLearningDocument> =
  mongoose.models.UserLearning ||
  mongoose.model<IUserLearningDocument>("UserLearning", UserLearningSchema);
