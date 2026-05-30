// PixVerse API Integration

const PIXVERSE_BASE_URL = process.env.PIXVERSE_BASE_URL || 'https://app-api.pixverse.ai';
const PIXVERSE_API_KEY = process.env.PIXVERSE_API_KEY;

interface PixVerseVideoResponse {
  ErrCode: number;
  ErrMsg: string;
  Resp: {
    video_id: number;
  };
}

interface PixVerseImageResponse {
  ErrCode: number;
  ErrMsg: string;
  Resp: {
    img_id: number;
    img_url: string;
  };
}

interface PixVerseStatusResponse {
  ErrCode: number;
  ErrMsg: string;
  Resp: {
    status: number;
    url?: string;
  };
}

function generateTraceId(): string {
  return `${Date.now()}-${Math.random().toString(36).substring(2, 15)}`;
}

// Map camera movement to PixVerse format
function mapCameraMovement(movement: string): string {
  const map: Record<string, string> = {
    'Static': 'none',
    'Slow Push-In': 'zoom_in',
    'Pull Back': 'zoom_out',
    'Tracking': 'zoom_in',
    'Handheld': 'none',
    'Crane Up': 'tilt_up',
    'Pan Left': 'pan_left',
    'Pan Right': 'pan_right',
  };
  return map[movement] || 'none';
}

// Text to Video Generation
export async function generateTextToVideo(params: {
  prompt: string;
  negativePrompt?: string;
  cameraMovement?: string;
  duration?: 5 | 8;
  quality?: '720p' | '1080p';
}): Promise<{ videoId: string }> {
  if (!PIXVERSE_API_KEY) {
    throw new Error('PIXVERSE_API_KEY is not configured');
  }

  const traceId = generateTraceId();

  const body = {
    aspect_ratio: '16:9',
    duration: params.duration ?? 5,
    model: 'v6',
    motion_mode: 'normal',
    prompt: params.prompt,
    quality: params.quality ?? '720p',
    seed: Math.floor(Math.random() * 1000000),
    ...(params.cameraMovement && {
      camera_movement: mapCameraMovement(params.cameraMovement),
    }),
  };

  const response = await fetch(
    `${PIXVERSE_BASE_URL}/openapi/v2/video/text/generate`,
    {
      method: 'POST',
      headers: {
        'API-KEY': PIXVERSE_API_KEY,
        'Ai-trace-id': traceId,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(body),
    }
  );

  if (!response.ok) {
    throw new Error(`PixVerse API error: ${response.status} ${response.statusText}`);
  }

  const data: PixVerseVideoResponse = await response.json();

  if (data.ErrCode !== 0) {
    throw new Error(`PixVerse error: ${data.ErrMsg}`);
  }

  return { videoId: data.Resp.video_id.toString() };
}

// Image to Video Generation
export async function generateImageToVideo(params: {
  imgId: number;
  prompt: string;
  cameraMovement?: string;
  duration?: 5 | 8;
}): Promise<{ videoId: string }> {
  if (!PIXVERSE_API_KEY) {
    throw new Error('PIXVERSE_API_KEY is not configured');
  }

  const traceId = generateTraceId();

  const body = {
    img_id: params.imgId,
    duration: params.duration ?? 5,
    model: 'v6',
    motion_mode: 'normal',
    prompt: params.prompt,
    quality: '720p',
    seed: Math.floor(Math.random() * 1000000),
    ...(params.cameraMovement && {
      camera_movement: mapCameraMovement(params.cameraMovement),
    }),
  };

  const response = await fetch(
    `${PIXVERSE_BASE_URL}/openapi/v2/video/img/generate`,
    {
      method: 'POST',
      headers: {
        'API-KEY': PIXVERSE_API_KEY,
        'Ai-trace-id': traceId,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(body),
    }
  );

  if (!response.ok) {
    throw new Error(`PixVerse API error: ${response.status} ${response.statusText}`);
  }

  const data: PixVerseVideoResponse = await response.json();

  if (data.ErrCode !== 0) {
    throw new Error(`PixVerse error: ${data.ErrMsg}`);
  }

  return { videoId: data.Resp.video_id.toString() };
}

// Upload Image to PixVerse
export async function uploadImageToPixVerse(
  imageBuffer: Buffer,
  filename: string,
  mimeType: string
): Promise<{ imgId: number; imgUrl: string }> {
  if (!PIXVERSE_API_KEY) {
    throw new Error('PIXVERSE_API_KEY is not configured');
  }

  const traceId = generateTraceId();

  const formData = new FormData();
  const bytes = new Uint8Array(imageBuffer);
  const blob = new Blob([bytes], { type: mimeType });
  formData.append('image', blob, filename);

  const response = await fetch(
    `${PIXVERSE_BASE_URL}/openapi/v2/image/upload`,
    {
      method: 'POST',
      headers: {
        'API-KEY': PIXVERSE_API_KEY,
        'Ai-trace-id': traceId,
      },
      body: formData,
    }
  );

  if (!response.ok) {
    throw new Error(`PixVerse API error: ${response.status} ${response.statusText}`);
  }

  const data: PixVerseImageResponse = await response.json();

  if (data.ErrCode !== 0) {
    throw new Error(`PixVerse error: ${data.ErrMsg}`);
  }

  return { imgId: data.Resp.img_id, imgUrl: data.Resp.img_url };
}

// Poll Video Status
export async function pollVideoStatus(
  videoId: string
): Promise<{ status: 'pending' | 'done' | 'failed'; url?: string }> {
  if (!PIXVERSE_API_KEY) {
    throw new Error('PIXVERSE_API_KEY is not configured');
  }

  const traceId = generateTraceId();

  const response = await fetch(
    `${PIXVERSE_BASE_URL}/openapi/v2/video/result/${videoId}`,
    {
      headers: {
        'API-KEY': PIXVERSE_API_KEY,
        'Ai-trace-id': traceId,
      },
    }
  );

  if (!response.ok) {
    throw new Error(`PixVerse API error: ${response.status} ${response.statusText}`);
  }

  const data: PixVerseStatusResponse = await response.json();

  if (data.ErrCode !== 0) {
    throw new Error(`PixVerse error: ${data.ErrMsg}`);
  }

  // status: 1 = done, 5 = generating, 7/8 = failed
  const statusMap: Record<number, 'pending' | 'done' | 'failed'> = {
    1: 'done',
    5: 'pending',
    7: 'failed',
    8: 'failed',
  };

  return {
    status: statusMap[data.Resp.status] || 'pending',
    url: data.Resp.url,
  };
}
