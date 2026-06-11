# Phase 3: Idea Engine, Trends, and Market Intelligence

## Scope

This phase creates the intelligence layer for organizing trends, competitors, inspiration sources, and content ideas. It does not call OpenAI, Gemini, YouTube, TikTok, Instagram, Google Trends, or any external API.

All data is mockable in the UI and persistable in Supabase through the database schema.

## Routes

- `/app/trends`: trend radar
- `/app/competitors`: competitors and references
- `/app/ideas`: idea bank, mock generator, kanban, calendar, detail, reports, and manual imports

## Modules

### Trend Radar

Table: `trends`

Fields include title, description, platform, niche, main keyword, estimated volume, estimated growth, competition level, viral potential, discovery date, status, source, and optional external URL.

Filters include project, niche, country, language, platform, period/status/potential UI controls.

### Competitors

Tables:

- `competitors`
- `competitor_insights`

The UI supports listing, search, filters, registration, edit/delete affordances, and mocked analysis with content count, average views, top themes, top formats, posting frequency, recurring hooks, and CTAs.

### Idea Bank

Tables:

- `content_ideas`
- `idea_scores`
- `idea_sources`
- `idea_events`

The idea is a central entity with project, niche, persona, source, platform origin, format suggestion, hook, angle, objective, funnel stage, scores, status, tags, notes, creator, and timestamps.

### Mock Idea Generator

The generator creates local mock ideas based on:

- project
- niche
- persona context
- format
- objective
- quantity
- tone
- platform

No external AI or API is used.

### Visual Scores

Scores are displayed with bars, badges, and semantic colors:

- Viral Score
- Commercial Score
- Difficulty Score
- Priority Score

Priority is calculated as:

`viral_score + commercial_score - difficulty_score`

In PostgreSQL, `idea_scores.priority_score` is a generated stored column.

### Idea Detail

The detail panel shows title, description, hook, angle, persona context, niche, objective, funnel stage, tags, scores, origin, history, notes, and actions.

Transformation buttons are UI-only in this phase and represent future creation of records in the content library without AI generation.

### Manual Import

Table: `idea_sources`

Supports storing reference URLs/texts with title, notes, platform, niche, and project.

### History

Table: `idea_events`

Tracks:

- idea created
- idea approved
- idea discarded
- idea transformed
- idea edited
- idea duplicated

Database-level audit triggers also record changes into `audit_logs`.

### Reports

The dashboard includes:

- ideas by niche
- ideas by origin
- ideas by status
- average viral score
- average commercial score
- best ideas
- most promising trends

## Security

All Phase 3 tables have RLS enabled.

Read access requires active workspace membership. Writes require existing content/library permissions:

- Trends and competitors use `library.manage`
- Ideas, scores, sources, and idea events use `content.create`

## Realtime

Realtime publication is enabled for:

- `trends`
- `competitors`
- `competitor_insights`
- `content_ideas`
- `idea_scores`
- `idea_sources`
- `idea_events`

## Future Integration Points

The database and UI are ready for future connectors to:

- OpenAI
- Gemini
- YouTube
- TikTok
- Instagram
- Google Trends
- news APIs
- Reddit
- X/Twitter
- LinkedIn

Those integrations should populate the Phase 3 tables rather than bypassing the data model.
