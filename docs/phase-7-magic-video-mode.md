# Phase 7 - Magic Video Mode

## Overview

Phase 7 adds the automatic video creation flow to Video Flow. The user provides a theme or a custom script, chooses production settings, reviews estimated cost, and generates a complete editable video project.

The current implementation is fully functional with mock/fallback providers. It is prepared to persist and stream progress through Supabase Realtime when connected to a real Supabase project.

## Routes

- `/app/magic`: main Magic Mode form, templates, advanced settings, review, cost estimate, generation, and result.
- `/app/magic/history`: job history with success/error status, cost, project, date, and editor links.
- `/app/magic/[id]`: job progress screen with steps, logs, current status, progress, and result actions.

## Backend

Routes:

- `GET /api/magic/jobs`
- `POST /api/magic/jobs`
- `GET /api/magic/jobs/[id]`

Pipeline module:

- `src/lib/magic/magic-pipeline.ts`

Core functions:

- `estimateMagicCost`
- `generateMockScript`
- `splitScriptIntoScenes`
- `generateSceneVisualPrompts`
- `runMagicVideoPipeline`

The pipeline creates:

- Script
- Scene plan
- Visual prompts
- Narration through the voice engine or fallback audio
- Image through the image engine or fallback image
- `video_project` shape
- `video_scenes` shape
- `subtitle_segments` shape
- Suggested thumbnail
- Logs and cost estimate

## Supported Configuration

Formats:

- Shorts
- Reels
- TikTok
- YouTube Long
- Horizontal 16:9
- Vertical 9:16
- Square 1:1

Durations:

- 30 seconds
- 60 seconds
- 90 seconds
- 3 minutes
- 5 minutes
- 8 minutes
- 10 minutes
- Custom

Narrative presets:

- Real story
- Religious story
- Curiosity
- Documentary
- Mystery
- Top 5
- Top 10
- Comparison
- Motivational
- Educational
- Dark channel
- Biography
- News
- Custom script

Visual sources:

- AI images
- Manual upload
- Media library
- Google Images placeholder
- Stock videos placeholder
- Mixed

Visual styles:

- Realistic
- Cinematic
- Black and white
- Vintage
- Anime
- Manga
- Documentary
- Religious
- Historical
- Luxury
- Dark
- Futuristic
- Kids
- Minimalist

## Database

New tables:

- `magic_templates`
- `magic_video_jobs`

Both tables are:

- Scoped by `workspace_id`
- Protected by RLS
- Indexed for workspace/project access
- Audited through `audit_logs`
- Added to Supabase Realtime publication

`magic_video_jobs` stores:

- Theme
- Format
- Aspect ratio
- Duration
- Narrative type
- Voice
- Visual style/source
- Subtitle/music/thumbnail toggles
- Advanced settings JSON
- Status
- Progress
- Current step
- Error message
- Linked `video_project_id`
- Estimated cost

## Security

The Magic flow follows the existing backend-only provider model:

- No API keys are exposed to the frontend.
- Workspace access is enforced through RLS.
- Mutations require content creation permissions.
- Provider failures fall back to mock media so the workflow remains usable.
- Future production jobs should add workspace rate limiting and credit balance checks before `runMagicVideoPipeline`.

## Out Of Scope

This phase intentionally does not implement:

- Automatic publishing
- Viral clipping
- Daily recurring automation

The focus is full video generation from a theme or script into an editable video project.
