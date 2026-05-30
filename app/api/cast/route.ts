import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';

export async function POST(req: NextRequest) {
  try {
    const formData = await req.formData();
    
    const projectId = formData.get('projectId') as string;
    const characterName = formData.get('characterName') as string;
    const actorName = formData.get('actorName') as string | undefined;
    const physicalDescription = formData.get('physicalDescription') as string | undefined;
    const image = formData.get('image') as File | null;

    if (!projectId || !characterName) {
      return NextResponse.json(
        { error: 'Project ID and character name are required' },
        { status: 400 }
      );
    }

    let referenceImagePath = undefined;
    
    // Handle image upload if provided
    if (image) {
      // In a real implementation, upload to GCS here
      // For now, we'll store a placeholder
      referenceImagePath = `/uploads/${projectId}-${characterName}.${image.name.split('.').pop()}`;
    }

    const castMember = await prisma.castMember.upsert({
      where: {
        projectId_characterName: {
          projectId,
          characterName,
        },
      },
      create: {
        projectId,
        characterName,
        actorName: actorName || undefined,
        physicalDescription: physicalDescription || undefined,
        referenceImagePath: referenceImagePath || undefined,
      },
      update: {
        actorName: actorName !== undefined ? actorName || undefined : undefined,
        physicalDescription: physicalDescription !== undefined ? physicalDescription || undefined : undefined,
        referenceImagePath: referenceImagePath || undefined,
      },
    });

    return NextResponse.json(castMember);
  } catch (error) {
    console.error('Error updating cast member:', error);
    return NextResponse.json(
      { error: 'Failed to update cast member' },
      { status: 500 }
    );
  }
}
