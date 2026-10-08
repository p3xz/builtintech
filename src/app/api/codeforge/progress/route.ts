import { NextRequest, NextResponse } from 'next/server';
import { getDatabase } from '@/lib/mongodb';
import { CourseDoc, ModuleDoc, LessonDoc } from '@/lib/models';
import { getAuthenticatedUser } from '@/lib/auth';
import { getUserProgress } from '@/lib/services';

export async function GET(req: NextRequest) {
  try {
    const authUser = await getAuthenticatedUser(req);
    if (!authUser) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const db = await getDatabase();
    const coursesCollection = db.collection<CourseDoc>('courses');
    const lessonsCollection = db.collection<LessonDoc>('lessons');

    const progress = await getUserProgress(authUser.userId, authUser.email);
    const totalPlatformLessons = await lessonsCollection.countDocuments({ published: true });
    const completedLessonsCount = progress.completedLessons?.length || 0;
    const completedCoursesCount = progress.completedCourses?.length || 0;

    const overallPct = totalPlatformLessons > 0 ? Math.round((completedLessonsCount / totalPlatformLessons) * 1000) / 10 : 0;

    return NextResponse.json({
      userId: authUser.userId,
      email: authUser.email,
      name: authUser.name,
      currentCourse: progress.currentCourse,
      currentModule: progress.currentModule,
      currentLesson: progress.currentLesson,
      completedLessonsCount,
      totalPlatformLessons,
      overallProgressPercentage: overallPct,
      completedLessons: progress.completedLessons || [],
      completedExercises: progress.completedExercises || [],
      completedModules: progress.completedModules || [],
      passedQuizzes: progress.passedQuizzes || [],
      completedCourses: progress.completedCourses || [],
    });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
