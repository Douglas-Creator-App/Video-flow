# Phase 2: Projects, Niches, Personas, Keywords, and Content Library

## Scope

This phase creates the organizational layer that future AI agents will use. No AI functionality, external API calls, or generation workflows were implemented.

## Product Modules

### Projects

Table: `projects`

Core fields:

- `id`
- `workspace_id`
- `name`
- `description`
- `main_niche`
- `logo`
- `primary_color`
- `language`
- `country`
- `status`
- `created_at`
- `updated_at`

Implemented UX:

- Create project
- Edit project
- Archive project
- Duplicate project
- Delete project
- Search by name, description, niche, or country

### Niches

Table: `niches`

Default niches are seeded in `supabase/schema.sql`, including Marketing, Vendas, Finanças, Investimentos, Saúde, Emagrecimento, Fitness, Desenvolvimento Pessoal, Relacionamentos, Educação, Tecnologia, Inteligência Artificial, E-commerce, Imóveis, Seguros, Proteção Veicular, Jurídico, and Turismo.

Implemented UX:

- Add custom niche
- Edit niche
- Activate/deactivate niche
- Distinguish default and custom niches

### Personas

Table: `personas`

Each persona belongs to one project and workspace.

Fields:

- `name`
- `age`
- `gender`
- `profession`
- `pains`
- `goals`
- `objections`
- `desires`
- `interests`

Implemented UX:

- Create persona by project
- View persona cards with pains, goals, objections, desires, and interests
- Favorite persona affordance

### Keywords

Table: `keywords`

Fields:

- `word`
- `volume`
- `difficulty`
- `intent`
- `category`
- `niche_id`
- `project_id`

Implemented UX:

- Keyword library
- Filters by niche, project, and category
- Favorite keyword affordance

### Content Library

Table: `content_items`

Supported content types:

- Ideia
- Roteiro
- Artigo
- Carrossel
- Vídeo
- Shorts
- Reels
- Email
- Copy
- Anúncio

Statuses:

- `rascunho`
- `aprovado`
- `publicado`
- `arquivado`

Implemented UX:

- Central content library
- Filters by project, type, status, and text query
- Move/copy/duplicate/archive affordances
- Favorite content affordance

### Tags

Tables:

- `tags`
- `content_item_tags`

Tags are global per workspace and can be attached many-to-many to content items.

### Folders

Table: `content_folders`

Default project structure:

- Ideias
- Roteiros
- Vídeos
- Carrosséis
- Anúncios
- Publicados

Implemented UX:

- Folder board grouped by project
- Move, copy, and archive affordances

### Favorites

Table: `favorites`

Supports:

- content
- project
- keyword
- persona

Favorites are scoped to `workspace_id` and `user_id`.

### Global Search

Implemented search surface over:

- projects
- content
- personas
- tags
- keywords

The UI includes entity filters and full text-like matching over local fields. The database includes a GIN index on `content_items` for future PostgreSQL full-text search.

### Content Metrics

Dashboard includes:

- total content
- content by category
- content by status
- content by project
- content by niche

## Database Security

All Phase 2 tables have RLS enabled.

Policies follow the workspace boundary:

- Read access requires active membership in `workspace_users`.
- Project creation requires `projects.create`.
- Project updates/deletes require `projects.update`.
- Content creation/update/delete requires `content.create`.
- Library management requires `library.manage`.
- Favorites are only visible and writable by the owning user.

## Audit

Create, update, and delete events are audited for:

- `projects`
- `niches`
- `personas`
- `keywords`
- `tags`
- `content_folders`
- `content_items`
- `favorites`

Audit entries are stored in `audit_logs`.

## Realtime

Realtime publication is enabled for the Phase 2 tables:

- `projects`
- `niches`
- `personas`
- `keywords`
- `tags`
- `content_folders`
- `content_items`
- `content_item_tags`
- `favorites`

## Implementation Notes

The UI currently uses typed local mock data so the SaaS can be reviewed without a configured Supabase project. The persistence contract is implemented in:

- `supabase/schema.sql`
- `src/lib/content-repository.ts`

Once `.env.local` has Supabase credentials and auth users/workspaces exist, the local state managers can be swapped to React Query calls using `createContentRepository`.
