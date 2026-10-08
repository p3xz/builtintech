import { NextRequest, NextResponse } from 'next/server';
import { getDatabase } from '@/lib/mongodb';
import { CertificateDoc } from '@/lib/models';
import { renderCertificateSvg } from '@/lib/engine';

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
      return NextResponse.json({ error: 'Certificate not found' }, { status: 404 });
    }

    const svg = renderCertificateSvg({
      certificateId: cert.certificateId,
      recipientName: cert.recipientName,
      title: cert.title,
      scorePercentage: cert.scorePercentage,
      issuedAt: cert.issuedAt,
    });

    return new NextResponse(svg, {
      headers: {
        'Content-Type': 'image/svg+xml',
        'Content-Disposition': `attachment; filename="${cert.certificateId}.svg"`,
      },
    });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
