# Phase 5: Media Engine

## Scope

Phase 5 adds the media pipeline for turning scripts into video structures:

Script -> Narration -> Images -> Scenes -> Subtitles -> Editor -> Render

This phase does not implement automatic publishing, viral clipping, AI thumbnails, or advanced AI video generation.

## Backend Integrations

All external provider calls are server-side only.

Routes:

- `POST /api/media/tts`
- `POST /api/media/images`
- `POST /api/media/render`

OpenAI integrations:

- Text-to-speech uses `POST https://api.openai.com/v1/audio/speech`
- Image generation uses `POST https://api.openai.com/v1/images/generations`

If `OPENAI_API_KEY` is missing, the backend returns mock assets so the full user flow remains testable.

## Modules

### Voice Providers

Route:

- `/app/settings/voice-providers`

Providers:

- ElevenLabs
- OpenAI TTS
- CapCut Voice manual placeholder
- Mock provider

Table:

- `voice_providers`

### Voice Library

Route:

- `/app/voices`

Table:

- `voices`

Supports filtering by provider, language, and favorites.

### Text to Speech

Backend route:

- `/api/media/tts`

Table:

- `audio_generations`

States:

- queued
- processing
- completed
- failed

### Image Providers

Route:

- `/app/settings/image-providers`

Providers:

- OpenAI Images
- Flux placeholder
- Ideogram placeholder
- Google/manual placeholder
- Mock provider

Table:

- `image_providers`

### Image Generation

Backend route:

- `/api/media/images`

Table:

- `image_generations`

Supports aspect ratios:

- 16:9
- 9:16
- 1:1
- 4:5

### Media Library

Route:

- `/app/media-library`

Table:

- `media_assets`

Supported media types:

- image
- video
- audio
- music
- thumbnail

### Video Projects

Route:

- `/app/videos`

Table:

- `video_projects`

Formats:

- short
- reels
- tiktok
- youtube_long
- square
- horizontal

### Video Scenes

Table:

- `video_scenes`

Each video is composed of ordered scenes with script text, prompts, media asset, duration, motion, transition, and status.

### Editor Base

Route:

- `/app/videos/[id]/editor`

The editor supports:

- ordered scene visualization
- add scene
- duplicate scene
- remove scene
- edit scene image prompt
- edit script text
- adjust duration
- select motion/transition
- render fallback
- download final render URL

### Subtitles

Table:

- `subtitle_segments`

Styles:

- clean
- popup
- tiktok
- documentary
- bold
- minimal

### Background Music

Table:

- `music_tracks`

Moods:

- epic
- emotional
- suspense
- calm
- cinematic
- energetic
- religious
- documentary

### Render Engine Base

Backend route:

- `/api/media/render`

Table:

- `video_renders`

This phase returns a fallback render job result. The schema and route are prepared for FFmpeg or Remotion integration.

### Credits and Usage

Table:

- `media_usage_logs`

Actions:

- tts_generation
- image_generation
- video_render
- ai_animation
- upload

## Security

- API keys never go to the frontend.
- Provider keys are represented as encrypted fields in Supabase.
- RLS is enabled on all Media Engine tables.
- Reads require workspace membership.
- Writes require content/library/workspace permissions depending on entity.
- Usage and render activity are logged.

## Future Work

- Persist generated data from API routes into Supabase service-role calls.
- Add Supabase Storage upload and signed URLs.
- Replace fallback render with FFmpeg or Remotion worker.
- Add real ElevenLabs integration.
- Add real Flux/Ideogram integrations.
- Add advanced AI animation and thumbnail phases later.
