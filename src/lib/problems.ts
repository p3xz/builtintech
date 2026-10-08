import { connectToDatabase } from "./mongodb";
import { Question } from "@/models/Question";
import { IQuestion, DifficultyLevel } from "@/types";

export interface PublicProblemData {
  _id: string;
  problemId: string;
  title: string;
  slug: string;
  difficulty: DifficultyLevel;
  description: string;
  constraints: string[];
  examples: Array<{
    input: string;
    output: string;
    explanation?: string;
  }>;
  tags: string[];
  xp: number;
  starterTemplates: {
    python?: string;
    javascript?: string;
    c?: string;
    cpp?: string;
    java?: string;
  };
}

export async function getPublicProblem(idOrSlug: string): Promise<PublicProblemData | null> {
  try {
    await connectToDatabase();
    const question = await Question.findOne({
      $or: [
        { problemId: idOrSlug },
        { slug: idOrSlug.toLowerCase() },
      ],
      isPublished: true,
    })
      .select("problemId title slug difficulty description constraints examples tags xp starterTemplates")
      .lean<PublicProblemData>();

    return question || null;
  } catch (err) {
    console.error("[getPublicProblem] Error:", err);
    return null;
  }
}

export async function getAllPublishedProblems(filter?: {
  difficulty?: string;
  search?: string;
}): Promise<PublicProblemData[]> {
  try {
    await connectToDatabase();
    const query: Record<string, unknown> = { isPublished: true };

    if (filter?.difficulty && filter.difficulty !== "All") {
      query.difficulty = filter.difficulty;
    }

    if (filter?.search && filter.search.trim() !== "") {
      const regex = new RegExp(filter.search.trim(), "i");
      query.$or = [{ title: regex }, { tags: regex }, { problemId: regex }];
    }

    const questions = await Question.find(query)
      .select("problemId title slug difficulty description constraints examples tags xp starterTemplates")
      .sort({ problemId: 1 })
      .lean<PublicProblemData[]>();

    return questions;
  } catch (err) {
    console.error("[getAllPublishedProblems] Error:", err);
    return [];
  }
}
