import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';

export async function POST(req: NextRequest) {
  try {
    const { sceneId } = await req.json();

    if (!sceneId) {
      return NextResponse.json(
        { error: 'Scene ID is required' },
        { status: 400 }
      );
    }

    // Get the scene
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

    // Generate a mock PixVerse prompt based on scene data
    // In a real implementation, this would call Gemini
    const prompt = generatePixversePrompt(scene);

    // Update the scene with the generated prompt
    await prisma.scene.update({
      where: { id: sceneId },
      data: {
        pixversePrompt: prompt.prompt,
        negativePrompt: prompt.negativePrompt,
        shotType: prompt.shotType,
        cameraMovement: prompt.cameraMovement,
        focalLength: prompt.focalLength,
        mood: prompt.mood,
        lightingDesc: prompt.lighting,
        audioAmbient: prompt.audioAmbient,
        audioMusic: prompt.audioMusic,
        audioPacing: prompt.audioPacing,
        status: 'SUBMITTING',
      },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error generating prompt:', error);
    return NextResponse.json(
      { error: 'Failed to generate prompt' },
      { status: 500 }
    );
  }
}

function generatePixversePrompt(scene: any) {
  // This is a mock implementation
  // In reality, this would call Gemini to generate a proper prompt
  const location = scene.location || 'unknown location';
  const timeOfDay = scene.timeOfDay || 'day';
  const characters = scene.characters?.join(', ') || 'characters';
  
  return {
    prompt: `Cinematic shot in ${location}, ${timeOfDay.toLowerCase()}. ${characters} in frame. Professional cinematography, 35mm film look, shallow depth of field, dramatic lighting.`,
    negativePrompt: 'blurry, text, watermark, low quality, distorted',
    shotType: 'medium',
    cameraMovement: 'Static',
    focalLength: '50mm',
    mood: 'dramatic',
    lighting: 'natural daylight',
    audioAmbient: 'ambient room tone',
    audioMusic: 'sparse piano',
    audioPacing: 'medium',
  };
}
