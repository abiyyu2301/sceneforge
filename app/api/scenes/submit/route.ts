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
    });

    if (!scene) {
      return NextResponse.json(
        { error: 'Scene not found' },
        { status: 404 }
      );
    }

    // In a real implementation, this would submit to PixVerse
    // For now, we'll simulate by creating a mock video ID
    const mockVideoId = `mock_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;

    // Update the scene with the video ID and status
    await prisma.scene.update({
      where: { id: sceneId },
      data: {
        pixverseVideoId: mockVideoId,
        status: 'RENDERING',
      },
    });

    // In a real implementation, you would start polling here
    // For now, we'll simulate completion after a delay
    setTimeout(async () => {
      try {
        // Simulate a mock video URL
        const mockVideoUrl = `https://example.com/mock-video-${mockVideoId}.mp4`;
        
        await prisma.scene.update({
          where: { id: sceneId },
          data: {
            videoUrl: mockVideoUrl,
            status: 'DONE',
          },
        });
      } catch (error) {
        console.error('Error updating scene after render:', error);
      }
    }, 5000); // 5 second mock render time

    return NextResponse.json({ 
      success: true, 
      videoId: mockVideoId 
    });
  } catch (error) {
    console.error('Error submitting scene:', error);
    return NextResponse.json(
      { error: 'Failed to submit scene' },
      { status: 500 }
    );
  }
}
