import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';

export async function PATCH(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const body = await req.json();
    
    const scene = await prisma.scene.update({
      where: { id: params.id },
      data: {
        ...body,
        updatedAt: new Date(),
      },
    });

    return NextResponse.json(scene);
  } catch (error) {
    console.error('Error updating scene:', error);
    return NextResponse.json(
      { error: 'Failed to update scene' },
      { status: 500 }
    );
  }
}

export async function GET(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const scene = await prisma.scene.findUnique({
      where: { id: params.id },
    });

    if (!scene) {
      return NextResponse.json(
        { error: 'Scene not found' },
        { status: 404 }
      );
    }

    return NextResponse.json(scene);
  } catch (error) {
    console.error('Error fetching scene:', error);
    return NextResponse.json(
      { error: 'Failed to fetch scene' },
      { status: 500 }
    );
  }
}
