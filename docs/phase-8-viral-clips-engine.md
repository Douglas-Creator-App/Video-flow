# Phase 8 - Viral Clips Engine

## Overview

Phase 8 adds the Viral Clips Engine to Video Flow. The module lets a user paste a YouTube URL, configure output format, clip duration, number of clips, subtitle style, silence removal, vertical reframe, review estimated cost, and create a processing job.

The implementation is safe by design: it validates YouTube URLs and creates a mock/fallback processing flow. It does not bypass YouTube restrictions and does not download protected content.

## Routes

- `/app/viral-clips`: create a viral clips job.
- `/app/viral-clips/[id]/review`: review suggested viral moments, approve/reject clips, adjust title/start/end, and render selected clips.
- `/app/viral-clips/library`: generated clips library.

## Backend Routes

- `GET /api/viral-clips/jobs`
- `POST /api/viral-clips/jobs`
- `GET /api/viral-clips/jobs/[id]`
- `POST /api/viral-clips/jobs/[id]/render`

## Pipeline

Core module:

- `src/lib/viral/viral-clips-pipeline.ts`

Functions:

- `validateSourceUrl`
- `estimateViralCost`
- `runViralClipsPipeline`
- `aspectRatioForOutput`
- `secondsForClipDuration`

The pipeline performs:

- URL validation
- Source video placeholder creation
- Audio extraction placeholder
- Mock transcription
- Viral moment analysis
- Clip placeholder rendering
- Cost estimate
- Logs for processing history

## Compliance

The UI includes:

- A visible rights notice
- A required checkbox: "Confirmo que tenho direito de uso deste conteudo."

Jobs are blocked unless the checkbox is enabled.

## Database

New tables:

- `source_videos`
- `video_transcripts`
- `viral_clip_jobs`
- `viral_moments`
- `viral_clips`

All tables are:

- Scoped by `workspace_id`
- Protected with RLS
- Indexed for workspace, job, and source access
- Included in audit triggers
- Added to Supabase Realtime publication

## Review Workflow

The review screen shows:

- Title
- Start/end
- Duration
- Hook
- Reason
- Viral, retention, and clarity scores
- Transcript excerpt

Actions:

- Approve/reject moment
- Adjust start/end
- Edit title
- Choose subtitle style
- Choose reframe mode
- Render selected clips

## Reframe Support

Implemented UI modes:

- Center crop
- Blurred background

Prepared placeholders:

- Smart crop
- Split screen
- Original fit with blur

## Out Of Scope

This phase intentionally does not implement:

- Automatic publishing
- Channel monitoring
- Bypassing YouTube restrictions
- Downloading protected content when technically blocked
