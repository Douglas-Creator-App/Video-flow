# Phase 6 - Advanced Video Editor and Thumbnail AI

## Overview

Phase 6 turns the Video Flow media layer into a richer video production workspace. It keeps the product SaaS-ready and stores the new editor entities in Supabase, while AI video animation providers remain prepared as secure backend integrations for future activation.

## Editor Surface

The advanced editor lives at:

- `/app/videos/[id]/editor`

It includes:

- Large video preview area
- Scene timeline
- Scene property panel
- Media panel
- Subtitle panel
- Audio panel
- Visual effects panel
- Quick preview action
- Render action
- Direct thumbnail studio link

Scene operations supported in the UI:

- Add scene
- Duplicate scene
- Remove scene
- Reorder scene
- Edit script text
- Edit image prompt
- Edit duration
- Edit transition
- Edit motion type
- Lock/favorite scene affordances
- Generate replacement scene image through the backend image route

## Thumbnail Studio

The thumbnail studio lives at:

- `/app/videos/[id]/thumbnails`

It supports:

- Prompt, style, text overlay, and quantity controls
- Batch thumbnail generation through `/api/media/thumbnails`
- 16:9 thumbnail layout
- Selection, save, regenerate, and download-ready UI states
- Mock fallback when image provider keys are unavailable

## Backend Routes

Phase 6 adds:

- `POST /api/media/thumbnails`

This route never exposes provider keys to the browser. It calls the server-side image generation adapter and returns generated image URLs or a deterministic mock fallback.

Existing media routes used by the editor:

- `POST /api/media/images`
- `POST /api/media/render`

## Database Tables

New Supabase tables:

- `visual_style_presets`
- `video_effects`
- `video_ai_providers`
- `image_animations`
- `subtitle_styles`
- `audio_settings`
- `thumbnail_generations`
- `video_versions`

All new tables are scoped by `workspace_id`, protected with RLS, included in audit triggers, indexed for workspace/project access, and added to Supabase Realtime publication.

## Security

The security model follows the existing SaaS architecture:

- Workspace members can read tenant-scoped editor records.
- Content creators can write project production records.
- Library managers can manage visual presets and subtitle styles.
- Workspace managers can manage video AI provider credentials.
- API keys remain server-side and may be stored encrypted in provider tables.

## AI Video Providers

The schema prepares future integrations with:

- Runway
- Kling
- Pika
- Veo
- Luma
- Mock provider

The current phase does not call these external video APIs. The product stores provider configuration and animation job records for future implementation.

## Versioning

`video_versions` stores rendered version history with:

- Version number
- Render URL
- Thumbnail URL
- Settings snapshot
- Created timestamp

This prepares the editor for rollback, comparison, and publishing workflows.

## Current Implementation Mode

The UI is fully usable with mocked data. OpenAI image generation can be used when server environment variables are configured; otherwise the system returns mock media so the workflow remains functional without external APIs.
