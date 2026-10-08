import { NextRequest, NextResponse } from 'next/server';
import { getDatabase } from '@/lib/mongodb';
import { CourseDoc, ModuleDoc, LessonDoc, UserDoc } from '@/lib/models';
import { getAuthenticatedUser } from '@/lib/auth';

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ courseId: string }> }
) {
  try {
    const { courseId } = await params;
    const db = await getDatabase();
    const coursesCollection = db.collection<CourseDoc>('courses');
    const modulesCollection = db.collection<ModuleDoc>('modules');
    const lessonsCollection = db.collection<LessonDoc>('lessons');
    const usersCollection = db.collection<UserDoc>('users');

    const course = await coursesCollection.findOne({
      $or: [{ courseId }, { slug: courseId }],
      published: true,
    });

    if (!course) {
      return NextResponse.json({ error: 'Course not found' }, { status: 404 });
    }

    const authUser = await getAuthenticatedUser(req);
    let level = 'Beginner';
    if (authUser) {
      const user = await usersCollection.findOne({ email: authUser.email });
      level = user?.experienceLevel || 'Beginner';
    }

    const modules = await modulesCollection
      .find({ courseId: course.courseId, published: true })
      .sort({ ordering: 1 })
      .toArray();

    if (modules.length === 0) {
      return NextResponse.json({ error: 'No modules available' }, { status: 404 });
    }

    let targetModule = modules[0];
    let reason = 'Starting at Foundational syntax and basic coding constructs.';

    if (level === 'Intermediate' && modules.length > 1) {
      targetModule = modules[1];
      reason = 'Skipped basic syntax. Recommended starting at Data Structures, Collections & OOP.';
    } else if (level === 'Advanced' && modules.length > 2) {
      targetModule = modules[modules.length - 1];
      reason = 'Skipped beginner & intermediate topics. Recommended starting at Advanced Architecture & Concurrency.';
    }

    const firstLesson = await lessonsCollection.findOne({
      moduleId: targetModule.moduleId,
      published: true,
    });

    return NextResponse.json({
      courseId: course.courseId,
      experienceLevel: level,
      recommendedModuleId: targetModule.moduleId,
      recommendedModuleTitle: targetModule.title,
      recommendedLessonId: firstLesson ? firstLesson.lessonId : null,
      recommendedLessonTitle: firstLesson ? firstLesson.title : null,
      reason,
    });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
