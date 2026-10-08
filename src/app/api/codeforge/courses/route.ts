import { NextRequest, NextResponse } from 'next/server';
import { getDatabase } from '@/lib/mongodb';
import { CourseDoc, ModuleDoc, LessonDoc } from '@/lib/models';
import { getAuthenticatedUser } from '@/lib/auth';
import { getUserProgress } from '@/lib/services';

export async function GET(req: NextRequest) {
  try {
    const db = await getDatabase();
    const coursesCollection = db.collection<CourseDoc>('courses');
    const modulesCollection = db.collection<ModuleDoc>('modules');
    const lessonsCollection = db.collection<LessonDoc>('lessons');

    const authUser = await getAuthenticatedUser(req);
    const progress = authUser ? await getUserProgress(authUser.userId, authUser.email) : null;
    const completedLessonsSet = new Set(progress?.completedLessons || []);

    const courses = await coursesCollection.find({ published: true }).sort({ ordering: 1 }).toArray();

    const response = await Promise.all(
      courses.map(async (c) => {
        const modules = await modulesCollection.find({ courseId: c.courseId, published: true }).toArray();
        const moduleIds = modules.map((m) => m.moduleId);
        const lessons = await lessonsCollection.find({ moduleId: { $in: moduleIds }, published: true }).toArray();

        const totalLessons = lessons.length;
        const completedCount = lessons.filter((l) => completedLessonsSet.has(l.lessonId)).length;
        const progressPercentage = totalLessons > 0 ? Math.round((completedCount / totalLessons) * 1000) / 10 : 0;

        return {
          courseId: c.courseId,
          slug: c.slug,
          title: c.title,
          language: c.language,
          description: c.description,
          icon: c.icon,
          color: c.color,
          difficulty: c.difficulty,
          totalModules: modules.length,
          totalLessons,
          completedLessons: completedCount,
          progressPercentage,
          isCompleted: progress?.completedCourses?.includes(c.courseId) || false,
        };
      })
    );

    return NextResponse.json(response);
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
