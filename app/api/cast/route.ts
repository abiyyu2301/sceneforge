import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { mkdir, writeFile } from 'fs/promises';
import path from 'path';
import { uploadImageToPixVerse } from '@/lib/pixverse';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

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
    let pixverseImgId = undefined;
    
    // Handle image upload if provided
    if (image) {
      const allowedTypes = new Set(['image/jpeg', 'image/png', 'image/webp']);
      if (!allowedTypes.has(image.type)) {
        return NextResponse.json(
          { error: 'Unsupported image type. Use JPG, PNG, or WEBP.' },
          { status: 400 }
        );
      }

      if (image.size > 20 * 1024 * 1024) {
        return NextResponse.json(
          { error: 'Image must be 20MB or smaller.' },
          { status: 400 }
        );
      }

      const ext = image.name.split('.').pop() || 'jpg';
      const safeCharacterName = characterName.replace(/[^a-z0-9-_]/gi, '_');
      const fileName = `${projectId}-${safeCharacterName}-${Date.now()}.${ext}`;
      const uploadsDir = path.join(process.cwd(), 'public', 'uploads');
      const filePath = path.join(uploadsDir, fileName);
      const imageBuffer = Buffer.from(await image.arrayBuffer());

      await mkdir(uploadsDir, { recursive: true });
      await writeFile(filePath, imageBuffer);

      referenceImagePath = `/uploads/${fileName}`;

      try {
        const uploadResult = await uploadImageToPixVerse(
          imageBuffer,
          image.name,
          image.type || 'image/jpeg'
        );
        pixverseImgId = String(uploadResult.imgId);
      } catch (uploadError) {
        console.error('PixVerse image upload failed:', uploadError);
      }
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
          pixverseImgId,
      },
      update: {
        actorName: actorName !== undefined ? actorName || undefined : undefined,
        physicalDescription: physicalDescription !== undefined ? physicalDescription || undefined : undefined,
        referenceImagePath: referenceImagePath || undefined,
        pixverseImgId: pixverseImgId || undefined,
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
