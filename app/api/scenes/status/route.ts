import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { pollVideoStatus } from '@/lib/pixverse';

export const dynamic = 'force-dynamic';

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const projectId = searchParams.get('projectId');

    if (!projectId) {
      return NextResponse.json(
        { error: 'Project ID is required' },
        { status: 400 }
      );
    }

    // Get all scenes for the project
    const scenes = await prisma.scene.findMany({
      where: { projectId },
      orderBy: { sceneNumber: 'asc' },
      select: {
        id: true,
        sceneNumber: true,
        heading: true,
        status: true,
        videoUrl: true,
        pixverseVideoId: true,
        errorMessage: true,
      },
    });

    // Poll PixVerse for any RENDERING scenes
    const updatedScenes = await Promise.all(
      scenes.map(async (scene) => {
        if (scene.status === 'RENDERING' && scene.pixverseVideoId) {
          try {
            const pollResult = await pollVideoStatus(scene.pixverseVideoId);
            
            if (pollResult.status === 'done' && pollResult.url) {
              // Update scene with video URL
              await prisma.scene.update({
                where: { id: scene.id },
                data: {
                  videoUrl: pollResult.url,
                  status: 'DONE',
                },
              });
              return { ...scene, status: 'DONE', videoUrl: pollResult.url };
            } else if (pollResult.status === 'failed') {
              // Mark scene as failed
              await prisma.scene.update({
                where: { id: scene.id },
                data: {
                  status: 'FAILED',
                  errorMessage: 'PixVerse generation failed',
                },
              });
              return { ...scene, status: 'FAILED', errorMessage: 'PixVerse generation failed' };
            }
            // Still pending, return as is
          } catch (pollError) {
            console.error(`Error polling scene ${scene.id}:`, pollError);
          }
        }
        return scene;
      })
    );

    return NextResponse.json({ scenes: updatedScenes });
  } catch (error) {
    console.error('Error fetching scene status:', error);
    return NextResponse.json(
      { error: 'Failed to fetch scene status' },
      { status: 500 }
    );
  }
}
