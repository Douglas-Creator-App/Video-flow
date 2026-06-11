# Phase 9 - Channels Engine, Calendar, and Bulk Production

## Overview

Phase 9 turns Video Flow into a multi-channel production operation. It adds channel management, channel dashboards, editorial calendar, production planning, bulk generation, queues, templates, goals, analytics, operations center, notifications, and channel-level permissions.

This phase does not implement automatic publishing, YouTube integration, or channel monetization.

## Routes

- `/app/channels`: channel workspace.
- `/app/channels/[id]`: individual channel dashboard.
- `/app/channels/[id]/library`: channel-specific library.
- `/app/calendar`: editorial calendar.
- `/app/production-plan`: production targets by channel.
- `/app/bulk-generation`: bulk production jobs.
- `/app/queue`: production queue.
- `/app/channel-templates`: reusable channel templates.
- `/app/analytics`: operational analytics.
- `/app/operations`: operations center.
- `/app/notifications`: alerts and notifications.

## Data Model

New tables:

- `channels`
- `channel_templates`
- `content_calendar`
- `production_plans`
- `bulk_jobs`
- `channel_goals`
- `channel_permissions`
- `operation_notifications`

All tables are scoped by `workspace_id`, protected with RLS, indexed for operational access, audited through `audit_logs`, and added to Supabase Realtime publication.

## Channels

Channels store:

- Name, description, niche, language, country
- Logo and banner URLs
- Channel type
- Visual style
- Default voice, template, and video format
- Status and favorite flag

Supported channel types include dark, curiosities, history, religious, stoicism, motivational, luxury, documentary, kids, anime, and custom.

## Production Operations

The system supports:

- Editorial scheduling by day/week/month
- Production targets per channel
- Bulk generation jobs
- Queue monitoring
- Channel templates
- Channel cloning workflow in UI
- Goal tracking
- Operations dashboard
- Notifications for completed jobs, failures, low credits, and congested queues

## Permissions

`channel_permissions` prepares channel-level roles:

- administrador
- editor
- operador
- visualizador

Workspace RLS is applied in this phase. Channel-specific permission checks can be layered into backend mutations when real persistence replaces mocks.

## Audit

Audit triggers cover channel creation, templates, calendar entries, plans, bulk jobs, goals, permissions, and notifications. This supports historical records such as channel created, channel duplicated, bulk generation, rendering, and errors.
