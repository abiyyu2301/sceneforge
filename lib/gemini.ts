import { VertexAI } from '@google-cloud/vertexai';

// Initialize Vertex AI
const vertexAi = new VertexAI({
  project: process.env.GOOGLE_CLOUD_PROJECT || '',
  location: process.env.GOOGLE_CLOUD_LOCATION || 'us-central1',
});

// Get the Gemini model
const model = vertexAi.preview.getGenerativeModel({
  model: process.env.GEMINI_MODEL || 'gemini-2.5-pro',
});

export interface SceneParseResult {
  scene_number: number;
  heading: string;
  location: string;
  time_of_day: string;
  characters: string[];
  action_text: string;
  dialogue: { character: string; line: string }[];
  emotional_register: string;
  pacing: string;
}

export interface PromptGenResult {
  prompt: string;
  negative_prompt: string;
  shot_type: string;
  camera_movement: string;
  focal_length: string;
  mood: string;
  lighting: string;
  audio_direction: {
    ambient: string;
    music: string;
    pacing: string;
  };
}

const SCREENPLAY_PARSE_PROMPT = `You are an expert screenplay analyst. Parse the following screenplay and return ONLY a valid JSON array. No markdown, no explanation, no code fences — raw JSON only.

Each element in the array represents one scene (defined by a scene heading line starting with INT., EXT., INT./EXT., or I/E.).

For each scene return:
{
  "scene_number": <integer, 1-indexed>,
  "heading": "<full scene heading exactly as written>",
  "location": "<location name only, e.g. COFFEE SHOP>",
  "time_of_day": "<DAY | NIGHT | MORNING | EVENING | CONTINUOUS | LATER>",
  "characters": ["<CHARACTER NAME>", ...],
  "action_text": "<all action/description lines concatenated with newlines>",
  "dialogue": [
    { "character": "<NAME>", "line": "<dialogue text>" }
  ],
  "emotional_register": "<tense | intimate | dramatic | contemplative | action | horror | comedic>",
  "pacing": "<slow | medium | fast>"
}

Rules:
- characters array must contain ONLY names that appear as character cues in this scene
- action_text must preserve line breaks using \n
- If a scene has no dialogue, dialogue is an empty array []
- emotional_register and pacing are your interpretation based on content
- Return ONLY the JSON array, starting with [ and ending with ]`;

const PROMPT_GENERATION_PROMPT = `You are an expert cinematographer and PixVerse V6 prompt engineer. Your job is to translate a screenplay scene into a precise, cinematographically-informed PixVerse V6 prompt.

PixVerse V6 capabilities to leverage:
- Focal length: specify as "24mm wide angle lens", "50mm standard lens", "85mm portrait lens", "135mm telephoto lens"
- Aperture/DOF: specify as "f/1.8 shallow depth of field with bokeh", "f/8 everything in sharp focus"
- Camera movement: will be set separately via API parameter — do NOT include camera movement in the prompt text
- Lens effects: "subtle chromatic aberration", "soft lens vignette", "anamorphic horizontal lens flare"
- Lighting: be specific — "practical fluorescent ceiling lights casting cool shadows", "single practical lamp creating warm side light"
- Color grade: "desaturated with cool blue tones", "high contrast noir", "warm golden hour", "clinical white balance"

CHARACTER DESCRIPTIONS (inject these for any character present in the scene):
{CHARACTER_CONTEXT}

ADJUSTMENTS (override defaults if provided):
{ADJUSTMENTS_CONTEXT}

Output ONLY valid JSON with this exact structure:
{
  "prompt": "<PixVerse V6 text prompt, max 450 characters, no camera movement descriptions>",
  "negative_prompt": "<what to exclude, max 100 chars, e.g. 'blurry, text, watermark, low quality, duplicate'>",
  "shot_type": "<wide | medium | close_up | extreme_close_up | two_shot | establishing>",
  "camera_movement": "<Static | Slow Push-In | Pull Back | Tracking | Handheld | Crane Up | Pan Left | Pan Right>",
  "focal_length": "<24mm | 50mm | 85mm | 135mm>",
  "mood": "<tense | intimate | dramatic | contemplative | action | horror | comedic>",
  "lighting": "<one sentence description>",
  "audio_direction": {
    "ambient": "<background sound description, e.g. 'rain on windows, distant city traffic'>",
    "music": "<score direction, e.g. 'sparse piano, minor key, building slowly' or 'no score'>",
    "pacing": "<slow | medium | fast>"
  }
}

Return ONLY the JSON object. No markdown. No explanation.`;

export async function generateScreenplayScenes(screenplayText: string): Promise<SceneParseResult[]> {
  try {
    const result = await model.generateContent({
      contents: [
        { role: 'user', parts: [{ text: SCREENPLAY_PARSE_PROMPT + '\n\n' + screenplayText }] }
      ],
    });

    const response = result.response;
    const text = response.candidates?.[0]?.content?.parts?.[0]?.text || '';

    // Parse the JSON response
    try {
      const scenes = JSON.parse(text) as SceneParseResult[];
      return scenes;
    } catch (parseError) {
      console.error('Error parsing Gemini response:', parseError);
      // Attempt to extract JSON from the text
      const jsonMatch = text.match(/\[[\s\S]*\]/);
      if (jsonMatch) {
        return JSON.parse(jsonMatch[0]) as SceneParseResult[];
      }
      throw new Error('Failed to parse Gemini response');
    }
  } catch (error) {
    console.error('Error calling Gemini:', error);
    throw error;
  }
}

export async function generatePixversePrompt(
  scene: SceneParseResult,
  castContext: string,
  adjustments?: Record<string, string>
): Promise<PromptGenResult> {
  try {
    const adjustmentsContext = adjustments && Object.keys(adjustments).length > 0
      ? Object.entries(adjustments).map(([key, value]) => `${key}: ${value}`).join('\n')
      : 'No adjustments — use your cinematographic judgment.';

    const prompt = PROMPT_GENERATION_PROMPT
      .replace('{CHARACTER_CONTEXT}', castContext || 'No character reference provided.')
      .replace('{ADJUSTMENTS_CONTEXT}', adjustmentsContext);

    const result = await model.generateContent({
      contents: [
        { 
          role: 'user', 
          parts: [{ 
            text: prompt + '\n\nScene Heading: ' + scene.heading + '\nAction: ' + scene.action_text 
          }] 
        }
      ],
    });

    const response = result.response;
    const text = response.candidates?.[0]?.content?.parts?.[0]?.text || '';

    // Parse the JSON response
    try {
      const result = JSON.parse(text) as PromptGenResult;
      return result;
    } catch (parseError) {
      console.error('Error parsing Gemini prompt response:', parseError);
      // Attempt to extract JSON from the text
      const jsonMatch = text.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        return JSON.parse(jsonMatch[0]) as PromptGenResult;
      }
      throw new Error('Failed to parse Gemini prompt response');
    }
  } catch (error) {
    console.error('Error calling Gemini for prompt:', error);
    throw error;
  }
}
