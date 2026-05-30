# SceneForge - AI Screenplay Visualizer

Transform screenplays into cinematic video storyboards with AI. SceneForge parses your screenplay, generates AI prompts for each scene, and creates video storyboards using PixVerse.

## 🎬 Features

- **Screenplay Parser** - Automatically parse screenplays into scenes
- **Cast Registry** - Manage characters with reference photos
- **AI Prompt Generation** - Generate cinematographic prompts for each scene
- **Video Generation** - Create video storyboards via PixVerse
- **Storyboard Viewer** - View all scenes with video playback
- **Scene Adjustment** - Fine-tune shot type, mood, lighting, and more

## 🚀 Quick Start

### Prerequisites

- Node.js 18+
- PostgreSQL database
- Google Cloud account (for Vertex AI)
- PixVerse account (for video generation)

### Installation

1. **Clone and install dependencies:**
```bash
cd sceneforge
npm install
```

2. **Set up environment variables:**
```bash
cp .env.example .env.local
```

Edit `.env.local` with your configuration:
```env
# Database
DATABASE_URL="postgresql://USER:PASSWORD@localhost:5432/sceneforge"

# Google Cloud / Vertex AI
GOOGLE_CLOUD_PROJECT=your-gcp-project-id
GOOGLE_CLOUD_LOCATION=us-central1
GEMINI_MODEL=gemini-2.5-pro

# PixVerse
PIXVERSE_API_KEY=your-pixverse-api-key

# App
NEXT_PUBLIC_APP_URL="http://localhost:3000"
```

3. **Set up the database:**
```bash
npx prisma migrate dev --name init
npx prisma generate
```

4. **Run the development server:**
```bash
npm run dev
```

5. **Open in browser:**
http://localhost:3000

## 📁 Project Structure

```
sceneforge/
├── app/                          # Next.js App Router
│   ├── api/                      # API routes
│   │   ├── cast/route.ts         # Cast member CRUD
│   │   ├── projects/             # Project CRUD
│   │   ├── scenes/               # Scene generation
│   │   └── screenplay/parse/     # Screenplay parser
│   ├── project/[id]/
│   │   ├── cast/page.tsx         # Cast registry page
│   │   ├── generate/page.tsx     # Scene generation page
│   │   └── storyboard/           # Storyboard viewer
│   │       ├── components/       # Storyboard components
│   │       └── page.tsx
│   ├── project/new/page.tsx      # Create project page
│   ├── globals.css               # Global styles
│   ├── layout.tsx                # Root layout
│   └── page.tsx                  # Home page
├── components/                   # Reusable components
│   ├── CastCard.tsx
│   └── ProjectCard.tsx
├── lib/                          # Utilities
│   ├── db.ts                     # Prisma client
│   └── gemini.ts                 # Vertex AI integration
├── prisma/
│   └── schema.prisma             # Database schema
└── next.config.js
```

## 🎯 Usage Flow

1. **Create Project**: Enter title and paste your screenplay
2. **Cast Registry**: Upload reference photos for characters (optional)
3. **Generate Scenes**: AI generates prompts and creates videos
4. **View Storyboard**: Browse all scenes with video playback
5. **Adjust Scenes**: Fine-tune shot type, mood, lighting, and regenerate

## 🔧 Development

### Database Commands
```bash
# Generate Prisma client
npx prisma generate

# Run migrations
npx prisma migrate dev

# Open Prisma Studio
npx prisma studio
```

### Build for Production
```bash
npm run build
npm start
```

## 📝 License

MIT License - feel free to use this for your projects!

## 🙏 Acknowledgments

- Built with Next.js, Tailwind CSS, and Prisma
- Video generation powered by PixVerse
- AI prompts generated with Google Vertex AI Gemini
