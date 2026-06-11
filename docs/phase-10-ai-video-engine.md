# Phase 10 - AI Video Engine

## Overview

Phase 10 adds the advanced AI Video Engine to Video Flow. It supports provider configuration, text-to-video, image-to-video, intro/outro generation, talking character jobs, AI video assets, editor integration, Magic Mode options, credit estimates, queue-style status, and mock fallback.

No provider limits are bypassed. API keys remain backend-only.

## Routes

- `/app/settings/video-providers`
- `/app/ai-video`
- `/app/ai-video/history`
- `/app/talking-scenes`

## API

- `GET /api/ai-video/jobs`
- `POST /api/ai-video/jobs`

Supported job types:

- `text_to_video`
- `image_to_video`
- `intro`
- `outro`
- `talking_character`

## Providers

Prepared providers:

- Runway
- Kling
- Pika
- Luma
- Veo
- Mock Provider

The mock provider keeps the workflow functional when real credentials are unavailable.

## Editor Integration

The video editor now exposes:

- Animar imagem
- Gerar cena em video
- Gerar abertura
- Gerar encerramento

Generated outputs are represented as AI video assets and can replace scene imagery in the editor workflow.

## Magic Mode Integration

Magic Mode now includes options for:

- Generate AI intro
- Generate AI outro
- Animate first scenes
- Animate all scenes
- Animate main scenes
- Talking character intro
- Use AI video instead of static images
- AI video provider
- Max credit budget

## Database

New tables:

- `ai_video_providers`
- `image_to_video_jobs`
- `text_to_video_jobs`
- `intro_outro_generations`
- `talking_character_jobs`
- `ai_video_assets`

All new tables are workspace-scoped, protected by RLS, indexed, audited, and added to Supabase Realtime.

## Render Engine Preparedness

The render model is prepared for:

- Mixed image and video scenes
- AI video intros and outros
- Talking character assets
- Separate audio
- Synchronized captions
- Transitions between image and video assets

The current render route remains a safe placeholder.
