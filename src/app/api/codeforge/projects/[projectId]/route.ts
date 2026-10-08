import { NextRequest, NextResponse } from 'next/server';
import { getDatabase } from '@/lib/mongodb';
import { ProjectDoc } from '@/lib/models';
import { getAuthenticatedUser } from '@/lib/auth';
import { ObjectId } from 'mongodb';

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ projectId: string }> }
) {
  try {
    const { projectId } = await params;
    const db = await getDatabase();
    const projectsCollection = db.collection<ProjectDoc>('projects');

    const project = await projectsCollection.findOne({
      $or: [
        { projectId },
        { _id: ObjectId.isValid(projectId) ? new ObjectId(projectId) : undefined },
      ],
    });

    if (!project) {
      return NextResponse.json({ error: 'Project not found' }, { status: 404 });
    }

    const authUser = await getAuthenticatedUser(req);

    // Private project check
    if (!project.isPublic) {
      if (!authUser || authUser.userId !== project.userId) {
        return NextResponse.json({ error: 'Access denied: Project is private' }, { status: 403 });
      }
    }

    // Increment views
    await projectsCollection.updateOne({ _id: project._id }, { $inc: { viewsCount: 1 } });

    return NextResponse.json(project);
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function PUT(
  req: NextRequest,
  { params }: { params: Promise<{ projectId: string }> }
) {
  try {
    const authUser = await getAuthenticatedUser(req);
    if (!authUser) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { projectId } = await params;
    const db = await getDatabase();
    const projectsCollection = db.collection<ProjectDoc>('projects');

    const project = await projectsCollection.findOne({
      $or: [
        { projectId },
        { _id: ObjectId.isValid(projectId) ? new ObjectId(projectId) : undefined },
      ],
    });

    if (!project) {
      return NextResponse.json({ error: 'Project not found' }, { status: 404 });
    }

    // Ownership check
    if (project.userId !== authUser.userId && !authUser.isAdmin) {
      return NextResponse.json({ error: 'Forbidden: You can only edit your own projects' }, { status: 403 });
    }

    const body = await req.json();
    const updateFields: any = { updatedAt: new Date() };

    if (body.title !== undefined) updateFields.title = body.title;
    if (body.description !== undefined) updateFields.description = body.description;
    if (body.language !== undefined) updateFields.language = body.language.toLowerCase();
    if (body.code !== undefined) updateFields.code = body.code;
    if (body.files !== undefined) updateFields.files = body.files;
    if (body.isPublic !== undefined) updateFields.isPublic = Boolean(body.isPublic);

    await projectsCollection.updateOne({ _id: project._id }, { $set: updateFields });
    const updated = await projectsCollection.findOne({ _id: project._id });

    return NextResponse.json(updated);
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ projectId: string }> }
) {
  try {
    const authUser = await getAuthenticatedUser(req);
    if (!authUser) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { projectId } = await params;
    const db = await getDatabase();
    const projectsCollection = db.collection<ProjectDoc>('projects');

    const project = await projectsCollection.findOne({
      $or: [
        { projectId },
        { _id: ObjectId.isValid(projectId) ? new ObjectId(projectId) : undefined },
      ],
    });

    if (!project) {
      return NextResponse.json({ error: 'Project not found' }, { status: 404 });
    }

    if (project.userId !== authUser.userId && !authUser.isAdmin) {
      return NextResponse.json({ error: 'Forbidden: You can only delete your own projects' }, { status: 403 });
    }

    await projectsCollection.deleteOne({ _id: project._id });
    return NextResponse.json({ success: true, message: 'Project deleted successfully' });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
