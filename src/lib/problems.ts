import { connectToDatabase, getDatabase } from "./mongodb";
import { Question } from "@/models/Question";
import { IQuestion, DifficultyLevel } from "@/types";
import { getServerProblem, getAllServerProblems } from "@/data/problems";


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
  const cleanId = idOrSlug.trim();
  const cleanSlug = cleanId.toLowerCase();

  // 1. Try fetching from insidcode.questions first (MongoDB Atlas 330 questions)
  try {
    const insidcodeDb = await getDatabase();
    const rawQuestion = await insidcodeDb.collection("questions").findOne({
      $or: [
        { problemId: cleanId },
        { problemId: Number(cleanId) ? Number(cleanId) : cleanId },
        { slug: cleanSlug },
        { id: cleanId },
      ],
      $and: [{ isPublished: { $ne: false } }],
    });

    if (rawQuestion) {
      return {
        _id: rawQuestion._id.toString(),
        problemId: String(rawQuestion.problemId || rawQuestion.id || cleanId),
        title: rawQuestion.title || "Untitled Problem",
        slug: rawQuestion.slug || cleanSlug,
        difficulty: (rawQuestion.difficulty as DifficultyLevel) || "Easy",
        description: rawQuestion.description || "",
        constraints: Array.isArray(rawQuestion.constraints) ? rawQuestion.constraints : [],
        examples: Array.isArray(rawQuestion.examples) ? rawQuestion.examples : [],
        tags: Array.isArray(rawQuestion.tags) ? rawQuestion.tags : [],
        xp: typeof rawQuestion.xp === "number" ? rawQuestion.xp : 100,
        starterTemplates: rawQuestion.starterTemplates || {},
      };
    }
  } catch (insidcodeErr) {
    console.warn("[getPublicProblem] insidcode lookup warning:", insidcodeErr);
  }

    // 2. Fallback to questions via Mongoose model
    try {
      await connectToDatabase();
      const question = await Question.findOne({
        $or: [
          { problemId: cleanId },
          { slug: cleanSlug },
        ],
        isPublished: true,
      })
        .select("problemId title slug difficulty description constraints examples tags xp starterTemplates")
        .lean<PublicProblemData>();

      if (question) return question;
    } catch (err) {
      console.error("[getPublicProblem] Error:", err);
    }

    // 3. Fallback to server problems
    const fallbackServerProb = getServerProblem(cleanId);
    if (fallbackServerProb) {
      return {
        _id: fallbackServerProb.id,
        problemId: fallbackServerProb.id,
        title: fallbackServerProb.title,
        slug: fallbackServerProb.id,
        difficulty: fallbackServerProb.id.includes("longest") || fallbackServerProb.id.includes("reverse") ? "Medium" : "Easy",
        description: fallbackServerProb.statement,
        constraints: [],
        examples: fallbackServerProb.examples || [],
        tags: ["algorithms", "math"],
        xp: 100,
        starterTemplates: {},
      };
    }

    return null;
  }


export async function getAllPublishedProblems(filter?: {
  difficulty?: string;
  search?: string;
}): Promise<PublicProblemData[]> {
  // 1. Try fetching from insidcode.questions first
  try {
    const insidcodeDb = await getDatabase();
    const query: Record<string, unknown> = {
      isPublished: { $ne: false },
    };

    if (filter?.difficulty && filter.difficulty !== "All") {
      query.difficulty = filter.difficulty;
    }

    if (filter?.search && filter.search.trim() !== "") {
      const regex = new RegExp(filter.search.trim(), "i");
      query.$or = [{ title: regex }, { tags: regex }, { problemId: regex }];
    }

    const insidcodeQuestions = await insidcodeDb
      .collection("questions")
      .find(query)
      .project({
        problemId: 1,
        id: 1,
        title: 1,
        slug: 1,
        difficulty: 1,
        description: 1,
        constraints: 1,
        examples: 1,
        tags: 1,
        xp: 1,
        starterTemplates: 1,
      })
      .sort({ problemId: 1, id: 1 })
      .toArray();

    if (insidcodeQuestions.length > 0) {
      return insidcodeQuestions.map((q) => ({
        _id: q._id.toString(),
        problemId: String(q.problemId || q.id || q._id),
        title: q.title || "Untitled Problem",
        slug: q.slug || String(q.problemId || q.id),
        difficulty: (q.difficulty as DifficultyLevel) || "Easy",
        description: q.description || "",
        constraints: Array.isArray(q.constraints) ? q.constraints : [],
        examples: Array.isArray(q.examples) ? q.examples : [],
        tags: Array.isArray(q.tags) ? q.tags : [],
        xp: typeof q.xp === "number" ? q.xp : 100,
        starterTemplates: q.starterTemplates || {},
      }));
    }
  } catch (insidcodeErr) {
    console.warn("[getAllPublishedProblems] insidcode list warning:", insidcodeErr);
  }

  // 2. Fallback to questions via Mongoose model
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

    if (questions && questions.length > 0) {
      return questions;
    }
  } catch (err) {
    console.error("[getAllPublishedProblems] Error:", err);
  }

  // 3. Guaranteed Fallback to curated server problems
  const serverProbs = getAllServerProblems();
  const mapped = serverProbs.map((sp) => {
    const isMedium = sp.id.includes("longest") || sp.id.includes("reverse");
    const diff: DifficultyLevel = isMedium ? "Medium" : "Easy";
    return {
      _id: sp.id,
      problemId: sp.id,
      title: sp.title,
      slug: sp.id,
      difficulty: diff,
      description: sp.statement,
      constraints: [],
      examples: sp.examples || [],
      tags: ["algorithms"],
      xp: 100,
      starterTemplates: {},
    };
  });

  if (filter?.difficulty && filter.difficulty !== "All") {
    return mapped.filter((p) => p.difficulty.toLowerCase() === filter.difficulty?.toLowerCase());
  }

  return mapped;
}

/**
 * Server-only helper to fetch complete problem with hidden test cases for judge/submission execution
 */
export async function getProblemForJudging(idOrSlug: string): Promise<IQuestion | null> {
  const cleanId = idOrSlug.trim();
  const cleanSlug = cleanId.toLowerCase();

  // 1. Try insidcode.questions
  try {
    const insidcodeDb = await getDatabase();
    const rawQuestion = await insidcodeDb.collection("questions").findOne({
      $or: [
        { problemId: cleanId },
        { problemId: Number(cleanId) ? Number(cleanId) : cleanId },
        { slug: cleanSlug },
        { id: cleanId },
      ],
      $and: [{ isPublished: { $ne: false } }],
    });

    if (rawQuestion) {
      return {
        _id: rawQuestion._id.toString(),
        problemId: String(rawQuestion.problemId || rawQuestion.id || cleanId),
        title: rawQuestion.title || "Untitled Problem",
        slug: rawQuestion.slug || cleanSlug,
        difficulty: (rawQuestion.difficulty as DifficultyLevel) || "Easy",
        description: rawQuestion.description || "",
        constraints: Array.isArray(rawQuestion.constraints) ? rawQuestion.constraints : [],
        examples: Array.isArray(rawQuestion.examples) ? rawQuestion.examples : [],
        starterTemplates: rawQuestion.starterTemplates || {},
        tags: Array.isArray(rawQuestion.tags) ? rawQuestion.tags : [],
        xp: typeof rawQuestion.xp === "number" ? rawQuestion.xp : 100,
        hiddenTestCases: Array.isArray(rawQuestion.hiddenTestCases) ? rawQuestion.hiddenTestCases : [],
        referenceSolution: rawQuestion.referenceSolution,
        isPublished: rawQuestion.isPublished !== false,
        createdAt: rawQuestion.createdAt ? new Date(rawQuestion.createdAt) : new Date(),
        updatedAt: rawQuestion.updatedAt ? new Date(rawQuestion.updatedAt) : new Date(),
      };
    }
  } catch (err) {
    console.warn("[getProblemForJudging] insidcode lookup warning:", err);
  }

  // 2. Fallback to questions via Mongoose model
  try {
    await connectToDatabase();
    const q = await Question.findOne({
      $or: [{ problemId: cleanId }, { slug: cleanSlug }],
      isPublished: true,
    }).lean<IQuestion>();
    if (q) return q;
  } catch (err) {
    console.error("[getProblemForJudging] Error:", err);
  }

  // 3. Fallback to server problems
  const sp = getServerProblem(cleanId);
  if (sp) {
    return {
      _id: sp.id,
      problemId: sp.id,
      title: sp.title,
      slug: sp.id,
      difficulty: sp.id.includes("longest") || sp.id.includes("reverse") ? "Medium" : "Easy",
      description: sp.statement,
      constraints: [],
      examples: sp.examples || [],
      starterTemplates: {},
      tags: ["algorithms"],
      xp: 100,
      hiddenTestCases: sp.hiddenTests.map((t) => ({ input: t.input, expectedOutput: t.expected })),
      referenceSolution: sp.referenceSolution,
      isPublished: true,
      createdAt: new Date(),
      updatedAt: new Date(),
    };
  }

  return null;
}

