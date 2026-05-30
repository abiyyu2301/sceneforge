# SceneForge Local DB, Cast Upload, and Deployment Build Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use `superpowers:subagent-driven-development` (recommended) or `superpowers:executing-plans` to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Make SceneForge run reliably against a real local database, complete the cast reference-image upload flow, and ship a reproducible production build/deploy path.

**Architecture:** Keep the existing Prisma + PostgreSQL model, remove implicit mock-mode fallbacks from core flows, and finish the cast upload pipeline by persisting both local file metadata and PixVerse image IDs. Standardize deployment around the existing Docker + Cloud Run assets, and make build failures visible instead of suppressing them.

**Tech Stack:** Next.js 14 App Router, Prisma, PostgreSQL, PixVerse API, Docker, Google Cloud Run, Cloud Build

---

## Current Context
- `prisma/schema.prisma` already models `Project`, `Scene`, and `CastMember`, including `referenceImagePath` and `pixverseImgId`.
- `lib/db.ts` already provides a Prisma singleton, so DB access patterns are established.
- `app/api/cast/route.ts` accepts multipart form data but only writes a placeholder upload path.
- `app/project/[id]/cast/page.tsx` and `app/project/new/page.tsx` still fall back to mock/demo behavior when APIs fail.
- `lib/pixverse.ts` already includes `uploadImageToPixVerse()`, so the missing piece is request/file orchestration, not external API support.
- `Dockerfile` expects a standalone Next.js output.

## Decisions
- Use one DB engine everywhere: PostgreSQL via Prisma.
- Add a real local DB workflow with explicit setup, migration, and verification steps.
- Split cast metadata save and image upload responsibilities cleanly, even if both remain under `/api/cast`.
- Treat Cloud Run as the primary production target.

## Workstream 1: Local DB Baseline
- Define one local `DATABASE_URL` convention and document it in `.env.example`.
- Add Prisma helper scripts such as `db:generate`, `db:migrate`, and `db:deploy`.
- Verify `npx prisma migrate dev` creates a working local schema and the home page loads real projects with no demo fallback.

## Workstream 2: Complete Cast Upload
- Add server-side validation for image type, size, filename sanitization, and missing `projectId` / `characterName`.
- Persist uploaded files to a stable local/public path, then call `uploadImageToPixVerse()` and store both `referenceImagePath` and `pixverseImgId`.
- Return a persisted image URL in the API response so the UI no longer depends on a temporary object URL after refresh.
- Separate text-field updates from image upload state in the cast UI so blur-based text saves do not conflict with file uploads.

## Workstream 3: Production Build And Deploy
- Keep `output: 'standalone'` and remove any suppression that hides build failures.
- Add a migration step for production (`prisma migrate deploy`) and document when it runs.
- Ensure the container has everything needed at runtime for Prisma client + migrations.
- Run `npm run build` locally before deployment and treat failures as blockers.

## Acceptance Criteria
- A fresh developer can configure `.env`, run migrations, and create a real project locally.
- Cast image uploads persist across refresh, store `pixverseImgId`, and no longer use placeholder paths.
- `npm run build` passes without suppressed build errors.
- Cloud Run deployment uses env vars rather than hard-coded secrets.
