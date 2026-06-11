# Video Flow Architecture

## Overview

Video Flow is a SaaS foundation for organizing content workflows. This phase intentionally does not implement AI generation features. It delivers the product shell, authentication wiring, multi-tenant data model, granular permissions, audit logs, realtime-ready tables, and mocked dashboard data.

## Stack

- Next.js 15 with App Router
- TypeScript
- Tailwind CSS
- shadcn/ui-compatible component structure
- Supabase Auth
- Supabase PostgreSQL
- Row Level Security
- Supabase Realtime
- TanStack React Query

## Application Structure

- `src/app/auth/*`: login, Google OAuth callback, reset password, and email confirmation screens.
- `src/app/(app)/*`: authenticated SaaS shell with dashboard, product modules, and settings.
- `src/components/ui/*`: local shadcn-style UI primitives.
- `src/components/*`: app shell, auth forms, dashboard widgets, and shared page blocks.
- `src/lib/supabase/*`: browser and server Supabase clients.
- `src/lib/permissions.ts`: default role-to-permission map used by the UI.
- `supabase/schema.sql`: database schema, RLS policies, permissions, audit triggers, and realtime publication.

## Multi-Tenant Model

The tenant boundary is `workspaces`.

Core tables:

- `workspaces`: tenant records, owner, slug, plan, timestamps.
- `workspace_users`: many-to-many membership between users and workspaces.
- `roles`: role definitions scoped to a workspace.
- `permissions`: canonical permission keys.
- `role_permissions`: granular role permission assignments.
- `user_profiles`: application profile data linked to `auth.users`.
- `audit_logs`: append-only operational event stream.

Each user can belong to multiple workspaces through `workspace_users`.

## Default Roles

The app defines the following standard roles:

- Owner
- Admin
- Manager
- Editor
- Viewer

Permissions are granular and represented as stable keys such as `workspace.manage`, `users.invite`, `content.publish`, and `audit.read`.

## Security

RLS is enabled for all core tables. Access is enforced through helper functions:

- `is_workspace_member(workspace_id)`
- `has_workspace_permission(workspace_id, permission_key)`

Members can only read tenant data for workspaces where they are active members. Mutations require the related permission.

## Realtime

Realtime is enabled for:

- `workspaces`
- `workspace_users`
- `roles`
- `permissions`
- `audit_logs`

This prepares the SaaS shell for live workspace changes, member updates, permission changes, and audit activity.

## Authentication

Supabase Auth is wired for:

- Email and password login
- Google OAuth login
- Password recovery
- Email confirmation callback flow

Configure providers and redirect URLs in Supabase, then copy credentials from `.env.example` into `.env.local`.

## Audit

The schema stores:

- `login`
- `logout`
- `create`
- `delete`
- `update`

Database triggers record create/update/delete events for workspace-critical tables. Auth login/logout events are application-level events because they originate in Supabase Auth flows.

## Mocked Product Surface

The dashboard includes mocked cards and widgets:

- Conteúdos Gerados
- Projetos Ativos
- Créditos Disponíveis
- Publicações
- Conteúdo recente
- Atividade do sistema
- Consumo de créditos
- Projetos recentes

The sidebar and settings sections are complete placeholders for the next product phase.

## Phase 2 Content Organization

Phase 2 adds the organization layer for future AI agents without implementing AI:

- Projects
- Niches
- Personas
- Keywords
- Content library
- Tags
- Folders
- Favorites
- Global search
- Content metrics

See `docs/phase-2-content-structure.md` for the full technical specification.

## Phase 3 Market Intelligence

Phase 3 adds:

- Trend radar
- Competitor/reference monitoring
- Idea bank
- Mock idea generator
- Idea scores
- Idea detail
- Manual imports
- Idea history
- Intelligence reports

See `docs/phase-3-market-intelligence.md` for the full technical specification.

## Phase 4 Content AI Engine

Phase 4 adds real backend AI generation with OpenAI as the primary provider:

- AI providers
- Prompt engine
- AI generations
- Titles, hooks, scripts, carousels, posts, articles, emails, and WhatsApp generators
- AI agents
- Playground
- Credit usage
- Queue state model
- Generation history

See `docs/phase-4-content-ai-engine.md` for the full technical specification.

## Phase 5 Media Engine

Phase 5 adds:

- Voice providers
- Voice library
- Text-to-speech backend
- Image providers
- Image generation backend
- Media library
- Video projects
- Video scenes
- Scene editor
- Subtitles
- Background music
- Render job base
- Media usage logs

See `docs/phase-5-media-engine.md` for the full technical specification.

## Phase 6 Advanced Video Editor

Phase 6 adds:

- Advanced scene timeline
- Video preview workspace
- Scene property panel
- Media, subtitle, audio, and effects panels
- Visual style presets
- Image replacement workflow
- Organic motion controls
- Prepared AI image animation providers
- Advanced subtitle styles
- Per-video audio settings
- Thumbnail AI studio
- Render version history

See `docs/phase-6-advanced-video-editor.md` for the full technical specification.

## Phase 7 Magic Video Mode

Phase 7 adds:

- Magic video generation flow
- Templates for common video channels
- Advanced generation settings
- Review and estimated cost before generation
- Backend Magic pipeline
- Automatic script-to-scenes splitting
- Visual prompt generation per scene
- Voice/image/media fallback providers
- Job progress screen
- Magic job history
- Supabase tables for templates and jobs

See `docs/phase-7-magic-video-mode.md` for the full technical specification.

## Phase 8 Viral Clips Engine

Phase 8 adds:

- Viral clips job creation
- YouTube source validation
- Source video processor placeholder
- Mock transcription fallback
- Viral moment analyzer
- Review screen for suggested clips
- Manual start/end and title adjustments
- Vertical reframe modes
- Automatic subtitle style selection
- Render placeholder for selected clips
- Generated clips library
- Rights-of-use compliance checkbox
- Supabase tables for source videos, transcripts, jobs, moments, and clips

See `docs/phase-8-viral-clips-engine.md` for the full technical specification.

## Phase 9 Channels Operations Engine

Phase 9 adds:

- Channel management
- Individual channel dashboards
- Channel library
- Editorial calendar
- Production plans
- Bulk generation jobs
- Production queue
- Channel templates
- Channel cloning workflow
- Goals
- Analytics
- Operations center
- Notifications
- Channel-level permissions

See `docs/phase-9-channels-operations-engine.md` for the full technical specification.

## Phase 10 AI Video Engine

Phase 10 adds:

- AI video providers
- Text-to-video jobs
- Image-to-video jobs
- Intro and outro generation
- Talking character jobs
- AI video assets library
- Editor actions for animated images and generated video scenes
- Magic Mode AI video settings
- Credit estimates and job logs
- Mock provider fallback

See `docs/phase-10-ai-video-engine.md` for the full technical specification.
