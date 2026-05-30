import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';

// Force dynamic rendering - don't try to statically generate this route
export const dynamic = 'force-dynamic';

// Dynamically import gemini to avoid build-time initialization
async function generatePixversePromptWithGemini(
  scene: any,
  castContext: string,
  adjustments?: Record<string, string>
) {
  const { generatePixversePrompt } = await import('@/lib/gemini');
  return generatePixversePrompt(scene, castContext, adjustments);
}

function buildCharacterContext(
  characters: string[],
  castMembers: { characterName: string; physicalDescription: string | null; actorName: string | null }[]
): string {
  const castMap = new Map(castMembers.map((c) => [c.characterName.toUpperCase(), c]));
  const lines: string[] = [];

  for (const name of characters) {
    const member = castMap.get(name.toUpperCase());
    if (member?.physicalDescription) {
      const actorNote = member.actorName ? ` (played by ${member.actorName})` : '';
      lines.push(`${name}${actorNote}: ${member.physicalDescription}`);
    }
  }

  return lines.length > 0
    ? lines.join('\n')
    : 'No character details available. Use generic physical descriptions appropriate to age/gender implied by names.';
}

export async function POST(req: NextRequest) {
  try {
    const { sceneId, castContext: providedCastContext, adjustments } = await req.json();

    if (!sceneId) {
      return NextResponse.json(
        { error: 'Scene ID is required' },
        { status: 400 }
      );
    }

    await prisma.scene.update({
      where: { id: sceneId },
      data: {
        status: 'GENERATING_PROMPT',
        errorMessage: null,
      },
    });

    // Fetch the scene
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

    // Build character context from cast members
    const castContext =
      providedCastContext ||
      buildCharacterContext(scene.characters, scene.project.castMembers);

    // Generate PixVerse prompt using Gemini
    const promptData = await generatePixversePromptWithGemini(
      scene,
      castContext,
      adjustments
    );

    // Update the scene with the generated prompt
    await prisma.scene.update({
      where: { id: sceneId },
      data: {
        pixversePrompt: promptData.prompt,
        negativePrompt: promptData.negative_prompt,
        shotType: promptData.shot_type,
        cameraMovement: promptData.camera_movement,
        focalLength: promptData.focal_length,
        mood: promptData.mood,
        lightingDesc: promptData.lighting,
        audioAmbient: promptData.audio_direction.ambient,
        audioMusic: promptData.audio_direction.music,
        audioPacing: promptData.audio_direction.pacing,
        status: 'SUBMITTING',
      },
    });

    return NextResponse.json({ success: true, data: promptData });
  } catch (error) {
    console.error('Error generating prompt:', error);
    return NextResponse.json(
      { error: 'Failed to generate prompt' },
      { status: 500 }
    );
  }
}
