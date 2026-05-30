import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { generateScreenplayScenes } from '@/lib/gemini';

// Fallback simple screenplay parser
function parseScreenplayFallback(screenplayText: string) {
  const scenes = [];
  const lines = screenplayText.split('\n');
  
  let currentScene: any = null;
  let sceneNumber = 0;
  
  const sceneHeadingRegex = /^(INT\.?|EXT\.?|INT\.?\/EXT\.?|I\.?\/E\.?)[\.\s]/i;
  
  for (let i = 0; i < lines.length; i++) {
    const line = lines[i].trim();
    
    if (sceneHeadingRegex.test(line)) {
      if (currentScene) {
        scenes.push(currentScene);
      }
      
      sceneNumber++;
      
      const locationMatch = line.match(/^(INT\.?|EXT\.?|INT\.?\/EXT\.?|I\.?\/E\.?)\s+(.+?)(?:\s*-\s*(DAY|NIGHT|MORNING|EVENING|CONTINUOUS|LATER))?$/i);
      
      const heading = line;
      const location = locationMatch ? locationMatch[2].trim() : 'UNKNOWN';
      const timeOfDay = locationMatch && locationMatch[3] ? locationMatch[3].toUpperCase() : 'DAY';
      
      currentScene = {
        sceneNumber,
        heading,
        location,
        timeOfDay,
        characters: [],
        actionText: '',
        dialogueJson: [],
        emotionalRegister: 'dramatic',
        pacing: 'medium',
      };
    } else if (currentScene) {
      const charMatch = line.match(/^([A-Z][A-Z\s]+)$/);
      if (charMatch && line.length > 1 && line.length < 30) {
        const charName = charMatch[1].trim();
        if (!currentScene.characters.includes(charName)) {
          currentScene.characters.push(charName);
        }
      }
      
      if (!charMatch) {
        currentScene.actionText += line + '\n';
      }
    }
  }
  
  if (currentScene) {
    scenes.push(currentScene);
  }
  
  return scenes;
}

export async function POST(req: NextRequest) {
  try {
    const { projectId, screenplayText } = await req.json();
    
    if (!projectId || !screenplayText) {
      return NextResponse.json(
        { error: 'Project ID and screenplay text are required' },
        { status: 400 }
      );
    }

    // Update project with screenplay text
    await prisma.project.update({
      where: { id: projectId },
      data: { screenplayText },
    });

    // Parse screenplay
    const scenes = parseScreenplay(screenplayText);
    
    // Extract unique character names
    const allCharacters = new Set<string>();
    scenes.forEach(scene => {
      scene.characters.forEach((char: string) => allCharacters.add(char));
    });

    // Create scenes in database
    await prisma.$transaction(
      scenes.map(scene => 
        prisma.scene.create({
          data: {
            projectId,
            sceneNumber: scene.sceneNumber,
            heading: scene.heading,
            location: scene.location,
            timeOfDay: scene.timeOfDay,
            characters: scene.characters,
            actionText: scene.actionText,
            dialogueJson: scene.dialogueJson,
            emotionalRegister: scene.emotionalRegister,
            pacing: scene.pacing,
          },
        })
      )
    );

    // Create cast members for each unique character
    const existingCast = await prisma.castMember.findMany({
      where: { projectId },
      select: { characterName: true },
    });
    const existingNames = new Set(existingCast.map((c: { characterName: string }) => c.characterName));

    const newCharacters = Array.from(allCharacters).filter(
      name => !existingNames.has(name)
    );

    if (newCharacters.length > 0) {
      await prisma.$transaction(
        newCharacters.map(name =>
          prisma.castMember.create({
            data: {
              projectId,
              characterName: name,
            },
          })
        )
      );
    }

    return NextResponse.json({ 
      sceneCount: scenes.length,
      characterCount: allCharacters.size,
      projectId,
    });
  } catch (error) {
    console.error('Error parsing screenplay:', error);
    return NextResponse.json(
      { error: 'Failed to parse screenplay' },
      { status: 500 }
    );
  }
}
