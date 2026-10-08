import { NextRequest, NextResponse } from 'next/server';
import { getDatabase } from '@/lib/mongodb';
import { CertificateDoc } from '@/lib/models';

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ certificateId: string }> }
) {
  try {
    const { certificateId } = await params;
    const db = await getDatabase();
    const certsCollection = db.collection<CertificateDoc>('certificates');

    const cert = await certsCollection.findOne({ certificateId });
    if (!cert) {
      return NextResponse.json({ valid: false, error: 'Invalid Certificate ID' }, { status: 404 });
    }

    return NextResponse.json({
      valid: true,
      certificateId: cert.certificateId,
      recipientName: cert.recipientName,
      title: cert.title,
      language: cert.language,
      scorePercentage: cert.scorePercentage,
      issuedAt: cert.issuedAt,
      issuer: 'CodeForge Academy & Built In Tech',
    });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
