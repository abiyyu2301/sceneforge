import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { generateTextToVideo, generateImageToVideo } from '@/lib/pixverse';

function getPrimaryCharacterImgId(
  characters: string[],
  castMembers: { characterName: string; pixverseImgId: string | null }[]
): number | null {
  const castMap = new Map(castMembers.map((c) => [c.characterName.toUpperCase(), c]));
  for (const name of characters) {
    const member = castMap.get(name.toUpperCase());
    if (member?.pixverseImgId) {
      return parseInt(member.pixverseImgId);
    }
  }
  return null;
}

export async function POST(req: NextRequest) {
  try {
    const { sceneId } = await req.json();

    if (!sceneId) {
      return NextResponse.json(
        { error: 'Scene ID is required' },
        { status: 400 }
      );
    }

    // Get the scene with cast members
    const scene = await prisma.scene.findUnique({
      where: { id: sceneId },
      include: {
        project: {
          include: {
            castMembers: true,
          },
        },
      },
    });

    if (!scene) {
      return NextResponse.json(
        { error: 'Scene not found' },
        { status: 404 }
      );
    }

    // Check if prompt is generated
    if (!scene.pixversePrompt) {
      return NextResponse.json(
        { error: 'Scene prompt not generated yet' },
        { status: 400 }
      );
    }

    // Determine if we should use image-to-video (character reference available)
    const primaryImgId = getPrimaryCharacterImgId(
      scene.characters,
      scene.project.castMembers
    );

    let videoId: string;

    try {
      if (primaryImgId) {
        // Use image-to-video with character reference
        console.log(`Using image-to-video with img_id: ${primaryImgId}`);
        const result = await generateImageToVideo({
          imgId: primaryImgId,
          prompt: scene.pixversePrompt,
          cameraMovement: scene.cameraMovement || undefined,
          duration: 5,
        });
        videoId = result.videoId;
      } else {
        // Use text-to-video
        console.log('Using text-to-video generation');
        const result = await generateTextToVideo({
          prompt: scene.pixversePrompt,
          negativePrompt: scene.negativePrompt || undefined,
          cameraMovement: scene.cameraMovement || undefined,
          duration: 5,
          quality: '720p',
        });
        videoId = result.videoId;
      }
    } catch (pixverseError) {
      console.error('PixVerse API error:', pixverseError);
      return NextResponse.json(
        { error: 'Failed to submit to PixVerse: ' + (pixverseError as Error).message },
        { status: 500 }
      );
    }

    // Update the scene with the video ID and status
    await prisma.scene.update({
      where: { id: sceneId },
      data: {
        pixverseVideoId: videoId,
        status: 'RENDERING',
      },
    });

    return NextResponse.json({ 
      success: true, 
      videoId 
    });
  } catch (error) {
    console.error('Error submitting scene:', error);
    return NextResponse.json(
      { error: 'Failed to submit scene' },
      { status: 500 }
    );
  }
}
