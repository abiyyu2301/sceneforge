import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';

export async function POST(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    // Reset the scene status to PENDING
    const scene = await prisma.scene.update({
      where: { id: params.id },
      data: {
        status: 'PENDING',
        pixverseVideoId: null,
        videoUrl: null,
        errorMessage: null,
        updatedAt: new Date(),
      },
    });

    return NextResponse.json(scene);
  } catch (error) {
    console.error('Error regenerating scene:', error);
    return NextResponse.json(
      { error: 'Failed to regenerate scene' },
      { status: 500 }
    );
  }
}
