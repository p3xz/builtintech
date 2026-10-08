import { NextRequest, NextResponse } from 'next/server';
import { getDatabase } from '@/lib/mongodb';
import { ProjectDoc } from '@/lib/models';
import { getAuthenticatedUser } from '@/lib/auth';
import { ObjectId } from 'mongodb';

export async function GET(req: NextRequest) {
  try {
    const authUser = await getAuthenticatedUser(req);
    if (!authUser) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const db = await getDatabase();
    const projectsCollection = db.collection<ProjectDoc>('projects');

    const projects = await projectsCollection
      .find({ userId: authUser.userId })
      .sort({ updatedAt: -1 })
      .toArray();

    return NextResponse.json(projects);
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const authUser = await getAuthenticatedUser(req);
    if (!authUser) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await req.json();
    const { title, description, language, code, files, isPublic } = body;

    if (!title || !language) {
      return NextResponse.json({ error: 'Title and Language are required' }, { status: 400 });
    }

    const db = await getDatabase();
    const projectsCollection = db.collection<ProjectDoc>('projects');

    const projectId = `proj_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`;

    const newProject: ProjectDoc = {
      projectId,
      userId: authUser.userId,
      userEmail: authUser.email,
      ownerName: authUser.name,
      title,
      description: description || '',
      language: language.toLowerCase(),
      code: code || '',
      files: files || {},
      isPublic: Boolean(isPublic),
      viewsCount: 0,
      likesCount: 0,
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    const result = await projectsCollection.insertOne(newProject);
    return NextResponse.json({ ...newProject, _id: result.insertedId }, { status: 201 });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
