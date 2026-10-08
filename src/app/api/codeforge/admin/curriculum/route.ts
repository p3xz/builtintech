import { NextRequest, NextResponse } from 'next/server';
import { getDatabase } from '@/lib/mongodb';
import { CourseDoc, ModuleDoc, LessonDoc } from '@/lib/models';
import { requireAdmin } from '@/lib/auth';

export async function POST(req: NextRequest) {
  try {
    // Strictly verify admin role server-side (nam4sh@gmail.com)
    const adminUser = await requireAdmin(req);
    const body = await req.json();
    const { type, data } = body; // type: 'course' | 'module' | 'lesson'

    const db = await getDatabase();

    if (type === 'course') {
      const collection = db.collection<CourseDoc>('courses');
      const courseId = data.courseId || `course_${data.slug || Date.now()}`;
      const newCourse: CourseDoc = {
        ...data,
        courseId,
        published: data.published ?? true,
        createdAt: new Date(),
        updatedAt: new Date(),
      };
      await collection.insertOne(newCourse);
      return NextResponse.json({ success: true, item: newCourse }, { status: 201 });
    } else if (type === 'module') {
      const collection = db.collection<ModuleDoc>('modules');
      const moduleId = data.moduleId || `mod_${Date.now()}`;
      const newModule: ModuleDoc = {
        ...data,
        moduleId,
        published: data.published ?? true,
        createdAt: new Date(),
        updatedAt: new Date(),
      };
      await collection.insertOne(newModule);
      return NextResponse.json({ success: true, item: newModule }, { status: 201 });
    } else if (type === 'lesson') {
      const collection = db.collection<LessonDoc>('lessons');
      const lessonId = data.lessonId || `les_${Date.now()}`;
      const newLesson: LessonDoc = {
        ...data,
        lessonId,
        published: data.published ?? true,
        createdAt: new Date(),
        updatedAt: new Date(),
      };
      await collection.insertOne(newLesson);
      return NextResponse.json({ success: true, item: newLesson }, { status: 201 });
    } else {
      return NextResponse.json({ error: 'Invalid curriculum entity type' }, { status: 400 });
    }
  } catch (error: any) {
    const status = error.message.includes('Forbidden') ? 403 : error.message.includes('Authentication') ? 401 : 500;
    return NextResponse.json({ error: error.message }, { status });
  }
}

export async function PUT(req: NextRequest) {
  try {
    await requireAdmin(req);
    const body = await req.json();
    const { type, id, updates } = body;

    const db = await getDatabase();

    if (type === 'course') {
      const collection = db.collection<CourseDoc>('courses');
      await collection.updateOne({ courseId: id }, { $set: { ...updates, updatedAt: new Date() } });
      return NextResponse.json({ success: true, message: 'Course updated' });
    } else if (type === 'module') {
      const collection = db.collection<ModuleDoc>('modules');
      await collection.updateOne({ moduleId: id }, { $set: { ...updates, updatedAt: new Date() } });
      return NextResponse.json({ success: true, message: 'Module updated' });
    } else if (type === 'lesson') {
      const collection = db.collection<LessonDoc>('lessons');
      await collection.updateOne({ lessonId: id }, { $set: { ...updates, updatedAt: new Date() } });
      return NextResponse.json({ success: true, message: 'Lesson updated' });
    }

    return NextResponse.json({ error: 'Invalid type' }, { status: 400 });
  } catch (error: any) {
    const status = error.message.includes('Forbidden') ? 403 : 400;
    return NextResponse.json({ error: error.message }, { status });
  }
}

export async function DELETE(req: NextRequest) {
  try {
    await requireAdmin(req);
    const { searchParams } = new URL(req.url);
    const type = searchParams.get('type');
    const id = searchParams.get('id');

    if (!type || !id) {
      return NextResponse.json({ error: 'Type and ID are required' }, { status: 400 });
    }

    const db = await getDatabase();

    if (type === 'course') {
      await db.collection('courses').deleteOne({ courseId: id });
    } else if (type === 'module') {
      await db.collection('modules').deleteOne({ moduleId: id });
    } else if (type === 'lesson') {
      await db.collection('lessons').deleteOne({ lessonId: id });
    }

    return NextResponse.json({ success: true, message: `${type} deleted successfully` });
  } catch (error: any) {
    const status = error.message.includes('Forbidden') ? 403 : 400;
    return NextResponse.json({ error: error.message }, { status });
  }
}
