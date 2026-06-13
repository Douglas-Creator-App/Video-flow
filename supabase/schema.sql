create extension if not exists "pgcrypto";

create table if not exists public.user_profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  full_name text,
  avatar_url text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.workspaces (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  slug text not null unique,
  plan text not null default 'Starter',
  owner_id uuid not null references auth.users(id) on delete restrict,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.roles (
  id uuid primary key default gen_random_uuid(),
  workspace_id uuid references public.workspaces(id) on delete cascade,
  name text not null,
  description text,
  is_system boolean not null default false,
  created_at timestamptz not null default now(),
  unique (workspace_id, name)
);

create table if not exists public.permissions (
  id uuid primary key default gen_random_uuid(),
  key text not null unique,
  description text not null
);

create table if not exists public.role_permissions (
  role_id uuid not null references public.roles(id) on delete cascade,
  permission_id uuid not null references public.permissions(id) on delete cascade,
  primary key (role_id, permission_id)
);

create table if not exists public.workspace_users (
  id uuid primary key default gen_random_uuid(),
  workspace_id uuid not null references public.workspaces(id) on delete cascade,
  user_id uuid not null references auth.users(id) on delete cascade,
  role_id uuid not null references public.roles(id) on delete restrict,
  status text not null default 'active' check (status in ('active', 'pending', 'suspended')),
  invited_by uuid references auth.users(id) on delete set null,
  created_at timestamptz not null default now(),
  unique (workspace_id, user_id)
);

create table if not exists public.audit_logs (
  id uuid primary key default gen_random_uuid(),
  workspace_id uuid references public.workspaces(id) on delete cascade,
  actor_id uuid references auth.users(id) on delete set null,
  action text not null check (action in ('login', 'logout', 'create', 'delete', 'update')),
  entity_type text,
  entity_id uuid,
  metadata jsonb not null default '{}'::jsonb,
  ip_address inet,
  user_agent text,
  created_at timestamptz not null default now()
);

create table if not exists public.projects (
  id uuid primary key default gen_random_uuid(),
  workspace_id uuid not null references public.workspaces(id) on delete cascade,
  name text not null,
  description text,
  main_niche text not null,
  logo text,
  primary_color text not null default '#0f9f7a',
  language text not null default 'pt-BR',
  country text not null default 'Brasil',
  status text not null default 'ativo' check (status in ('ativo', 'arquivado')),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.niches (
  id uuid primary key default gen_random_uuid(),
  workspace_id uuid references public.workspaces(id) on delete cascade,
  name text not null,
  is_default boolean not null default false,
  active boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (workspace_id, name)
);

create table if not exists public.personas (
  id uuid primary key default gen_random_uuid(),
  workspace_id uuid not null references public.workspaces(id) on delete cascade,
  project_id uuid not null references public.projects(id) on delete cascade,
  name text not null,
  age integer,
  gender text,
  profession text,
  pains text[] not null default '{}',
  goals text[] not null default '{}',
  objections text[] not null default '{}',
  desires text[] not null default '{}',
  interests text[] not null default '{}',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.keywords (
  id uuid primary key default gen_random_uuid(),
  workspace_id uuid not null references public.workspaces(id) on delete cascade,
  project_id uuid references public.projects(id) on delete set null,
  niche_id uuid references public.niches(id) on delete set null,
  word text not null,
  volume integer not null default 0,
  difficulty integer not null default 0 check (difficulty between 0 and 100),
  intent text not null check (intent in ('informacional', 'comercial', 'transacional', 'navegacional')),
  category text not null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.tags (
  id uuid primary key default gen_random_uuid(),
  workspace_id uuid not null references public.workspaces(id) on delete cascade,
  name text not null,
  color text not null default '#0f9f7a',
  active boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (workspace_id, name)
);

create table if not exists public.content_folders (
  id uuid primary key default gen_random_uuid(),
  workspace_id uuid not null references public.workspaces(id) on delete cascade,
  project_id uuid not null references public.projects(id) on delete cascade,
  name text not null,
  type text not null check (type in ('ideias', 'roteiros', 'videos', 'carrosseis', 'anuncios', 'publicados')),
  archived boolean not null default false,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (project_id, type)
);

create table if not exists public.content_items (
  id uuid primary key default gen_random_uuid(),
  workspace_id uuid not null references public.workspaces(id) on delete cascade,
  project_id uuid not null references public.projects(id) on delete cascade,
  folder_id uuid references public.content_folders(id) on delete set null,
  type text not null check (type in ('Ideia', 'Roteiro', 'Artigo', 'Carrossel', 'VÃƒÆ’Ã†â€™Ãƒâ€ Ã¢â‚¬â„¢ÃƒÆ’Ã¢â‚¬Â ÃƒÂ¢Ã¢â€šÂ¬Ã¢â€žÂ¢ÃƒÆ’Ã†â€™ÃƒÂ¢Ã¢â€šÂ¬Ã…Â¡ÃƒÆ’Ã¢â‚¬Å¡Ãƒâ€šÃ‚Â­deo', 'Shorts', 'Reels', 'Email', 'Copy', 'AnÃƒÆ’Ã†â€™Ãƒâ€ Ã¢â‚¬â„¢ÃƒÆ’Ã¢â‚¬Â ÃƒÂ¢Ã¢â€šÂ¬Ã¢â€žÂ¢ÃƒÆ’Ã†â€™ÃƒÂ¢Ã¢â€šÂ¬Ã…Â¡ÃƒÆ’Ã¢â‚¬Å¡Ãƒâ€šÃ‚Âºncio')),
  title text not null,
  description text,
  category text not null,
  status text not null default 'rascunho' check (status in ('rascunho', 'aprovado', 'publicado', 'arquivado')),
  author_id uuid references auth.users(id) on delete set null,
  author_name text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.content_item_tags (
  content_item_id uuid not null references public.content_items(id) on delete cascade,
  tag_id uuid not null references public.tags(id) on delete cascade,
  workspace_id uuid not null references public.workspaces(id) on delete cascade,
  primary key (content_item_id, tag_id)
);

create table if not exists public.favorites (
  id uuid primary key default gen_random_uuid(),
  workspace_id uuid not null references public.workspaces(id) on delete cascade,
  user_id uuid not null references auth.users(id) on delete cascade,
  entity_type text not null check (entity_type in ('content', 'project', 'keyword', 'persona')),
  entity_id uuid not null,
  created_at timestamptz not null default now(),
  unique (workspace_id, user_id, entity_type, entity_id)
);

create table if not exists public.trends (
  id uuid primary key default gen_random_uuid(),
  workspace_id uuid not null references public.workspaces(id) on delete cascade,
  project_id uuid references public.projects(id) on delete set null,
  title text not null,
  description text,
  platform text not null,
  niche text not null,
  country text not null default 'Brasil',
  language text not null default 'pt-BR',
  main_keyword text not null,
  estimated_volume integer not null default 0,
  estimated_growth integer not null default 0,
  competition_level text not null check (competition_level in ('baixa', 'mÃƒÆ’Ã†â€™Ãƒâ€ Ã¢â‚¬â„¢ÃƒÆ’Ã¢â‚¬Â ÃƒÂ¢Ã¢â€šÂ¬Ã¢â€žÂ¢ÃƒÆ’Ã†â€™ÃƒÂ¢Ã¢â€šÂ¬Ã…Â¡ÃƒÆ’Ã¢â‚¬Å¡Ãƒâ€šÃ‚Â©dia', 'alta')),
  viral_potential integer not null default 0 check (viral_potential between 0 and 100),
  discovered_at date not null default current_date,
  status text not null default 'nova' check (status in ('nova', 'analisada', 'aprovada', 'descartada', 'transformada em ideia')),
  source text not null,
  external_url text,
  deleted_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.competitors (
  id uuid primary key default gen_random_uuid(),
  workspace_id uuid not null references public.workspaces(id) on delete cascade,
  project_id uuid references public.projects(id) on delete set null,
  name text not null,
  platform text not null,
  url text,
  niche text not null,
  country text not null default 'Brasil',
  language text not null default 'pt-BR',
  notes text,
  status text not null default 'monitorando' check (status in ('ativo', 'monitorando', 'pausado', 'arquivado')),
  deleted_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.competitor_insights (
  id uuid primary key default gen_random_uuid(),
  workspace_id uuid not null references public.workspaces(id) on delete cascade,
  competitor_id uuid not null references public.competitors(id) on delete cascade,
  content_count integer not null default 0,
  average_views integer not null default 0,
  top_themes text[] not null default '{}',
  top_formats text[] not null default '{}',
  posting_frequency text,
  recurring_hooks text[] not null default '{}',
  ctas text[] not null default '{}',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.content_ideas (
  id uuid primary key default gen_random_uuid(),
  workspace_id uuid not null references public.workspaces(id) on delete cascade,
  project_id uuid references public.projects(id) on delete set null,
  title text not null,
  description text,
  niche text not null,
  persona_id uuid references public.personas(id) on delete set null,
  source_type text not null check (source_type in ('manual', 'trend', 'competitor', 'keyword', 'ai_suggestion', 'imported')),
  source_url text,
  platform_origin text,
  format_suggestion text not null check (format_suggestion in ('short_video', 'long_video', 'carousel', 'post', 'article', 'email', 'ad', 'whatsapp_message')),
  hook text,
  angle text,
  objective text not null check (objective in ('awareness', 'engagement', 'lead_generation', 'sales', 'authority', 'education', 'retention')),
  funnel_stage text not null check (funnel_stage in ('topo', 'meio', 'fundo', 'pÃƒÆ’Ã†â€™Ãƒâ€ Ã¢â‚¬â„¢ÃƒÆ’Ã¢â‚¬Â ÃƒÂ¢Ã¢â€šÂ¬Ã¢â€žÂ¢ÃƒÆ’Ã†â€™ÃƒÂ¢Ã¢â€šÂ¬Ã…Â¡ÃƒÆ’Ã¢â‚¬Å¡Ãƒâ€šÃ‚Â³s-venda')),
  status text not null default 'rascunho' check (status in ('rascunho', 'em_anÃƒÆ’Ã†â€™Ãƒâ€ Ã¢â‚¬â„¢ÃƒÆ’Ã¢â‚¬Â ÃƒÂ¢Ã¢â€šÂ¬Ã¢â€žÂ¢ÃƒÆ’Ã†â€™ÃƒÂ¢Ã¢â€šÂ¬Ã…Â¡ÃƒÆ’Ã¢â‚¬Å¡Ãƒâ€šÃ‚Â¡lise', 'aprovada', 'em_produÃƒÆ’Ã†â€™Ãƒâ€ Ã¢â‚¬â„¢ÃƒÆ’Ã¢â‚¬Â ÃƒÂ¢Ã¢â€šÂ¬Ã¢â€žÂ¢ÃƒÆ’Ã†â€™ÃƒÂ¢Ã¢â€šÂ¬Ã…Â¡ÃƒÆ’Ã¢â‚¬Å¡Ãƒâ€šÃ‚Â§ÃƒÆ’Ã†â€™Ãƒâ€ Ã¢â‚¬â„¢ÃƒÆ’Ã¢â‚¬Â ÃƒÂ¢Ã¢â€šÂ¬Ã¢â€žÂ¢ÃƒÆ’Ã†â€™ÃƒÂ¢Ã¢â€šÂ¬Ã…Â¡ÃƒÆ’Ã¢â‚¬Å¡Ãƒâ€šÃ‚Â£o', 'produzida', 'publicada', 'arquivada', 'descartada')),
  tags text[] not null default '{}',
  notes text,
  created_by uuid references auth.users(id) on delete set null,
  created_by_name text,
  deleted_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.idea_scores (
  id uuid primary key default gen_random_uuid(),
  workspace_id uuid not null references public.workspaces(id) on delete cascade,
  idea_id uuid not null references public.content_ideas(id) on delete cascade,
  viral_score integer not null check (viral_score between 0 and 100),
  commercial_score integer not null check (commercial_score between 0 and 100),
  difficulty_score integer not null check (difficulty_score between 0 and 100),
  priority_score integer generated always as (viral_score + commercial_score - difficulty_score) stored,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (idea_id)
);

create table if not exists public.idea_sources (
  id uuid primary key default gen_random_uuid(),
  workspace_id uuid not null references public.workspaces(id) on delete cascade,
  project_id uuid references public.projects(id) on delete set null,
  url text,
  title text not null,
  notes text,
  platform text,
  niche text not null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.idea_events (
  id uuid primary key default gen_random_uuid(),
  workspace_id uuid not null references public.workspaces(id) on delete cascade,
  idea_id uuid not null references public.content_ideas(id) on delete cascade,
  event text not null check (event in ('ideia criada', 'ideia aprovada', 'ideia descartada', 'ideia transformada', 'ideia editada', 'ideia duplicada')),
  actor_id uuid references auth.users(id) on delete set null,
  actor_name text,
  metadata jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now()
);

create table if not exists public.ai_providers (
  id uuid primary key default gen_random_uuid(),
  workspace_id uuid not null references public.workspaces(id) on delete cascade,
  name text not null,
  provider text not null check (provider in ('openai', 'gemini', 'claude')),
  api_key_encrypted text,
  status text not null default 'inactive' check (status in ('active', 'inactive', 'error')),
  default_model text not null,
  temperature numeric(3,2) not null default 0.70,
  max_tokens integer not null default 1200,
  input_cost numeric(12,6) not null default 0,
  output_cost numeric(12,6) not null default 0,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.prompt_templates (
  id uuid primary key default gen_random_uuid(),
  workspace_id uuid not null references public.workspaces(id) on delete cascade,
  name text not null,
  category text not null check (category in ('roteiro', 'tÃƒÆ’Ã†â€™Ãƒâ€ Ã¢â‚¬â„¢ÃƒÆ’Ã¢â‚¬Â ÃƒÂ¢Ã¢â€šÂ¬Ã¢â€žÂ¢ÃƒÆ’Ã†â€™ÃƒÂ¢Ã¢â€šÂ¬Ã…Â¡ÃƒÆ’Ã¢â‚¬Å¡Ãƒâ€šÃ‚Â­tulo', 'gancho', 'carrossel', 'artigo', 'email', 'anÃƒÆ’Ã†â€™Ãƒâ€ Ã¢â‚¬â„¢ÃƒÆ’Ã¢â‚¬Â ÃƒÂ¢Ã¢â€šÂ¬Ã¢â€žÂ¢ÃƒÆ’Ã†â€™ÃƒÂ¢Ã¢â€šÂ¬Ã…Â¡ÃƒÆ’Ã¢â‚¬Å¡Ãƒâ€šÃ‚Âºncio', 'whatsapp', 'descriÃƒÆ’Ã†â€™Ãƒâ€ Ã¢â‚¬â„¢ÃƒÆ’Ã¢â‚¬Â ÃƒÂ¢Ã¢â€šÂ¬Ã¢â€žÂ¢ÃƒÆ’Ã†â€™ÃƒÂ¢Ã¢â€šÂ¬Ã…Â¡ÃƒÆ’Ã¢â‚¬Å¡Ãƒâ€šÃ‚Â§ÃƒÆ’Ã†â€™Ãƒâ€ Ã¢â‚¬â„¢ÃƒÆ’Ã¢â‚¬Â ÃƒÂ¢Ã¢â€šÂ¬Ã¢â€žÂ¢ÃƒÆ’Ã†â€™ÃƒÂ¢Ã¢â€šÂ¬Ã…Â¡ÃƒÆ’Ã¢â‚¬Å¡Ãƒâ€šÃ‚Â£o youtube', 'seo')),
  description text,
  prompt_system text not null,
  prompt_user text not null,
  provider text not null check (provider in ('openai', 'gemini', 'claude')),
  model text not null,
  status text not null default 'draft' check (status in ('active', 'draft', 'archived')),
  version integer not null default 1,
  parent_template_id uuid references public.prompt_templates(id) on delete set null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.ai_generations (
  id uuid primary key default gen_random_uuid(),
  workspace_id uuid not null references public.workspaces(id) on delete cascade,
  project_id uuid references public.projects(id) on delete set null,
  content_id uuid references public.content_items(id) on delete set null,
  provider text not null check (provider in ('openai', 'gemini', 'claude')),
  model text not null,
  prompt text not null,
  response text,
  input_tokens integer not null default 0,
  output_tokens integer not null default 0,
  cost numeric(12,6) not null default 0,
  duration_ms integer not null default 0,
  status text not null default 'aguardando' check (status in ('aguardando', 'processando', 'concluÃƒÆ’Ã†â€™Ãƒâ€ Ã¢â‚¬â„¢ÃƒÆ’Ã¢â‚¬Â ÃƒÂ¢Ã¢â€šÂ¬Ã¢â€žÂ¢ÃƒÆ’Ã†â€™ÃƒÂ¢Ã¢â€šÂ¬Ã…Â¡ÃƒÆ’Ã¢â‚¬Å¡Ãƒâ€šÃ‚Â­do', 'erro')),
  error_message text,
  created_by uuid references auth.users(id) on delete set null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.ai_generation_jobs (
  id uuid primary key default gen_random_uuid(),
  workspace_id uuid not null references public.workspaces(id) on delete cascade,
  generation_id uuid references public.ai_generations(id) on delete cascade,
  status text not null default 'aguardando' check (status in ('aguardando', 'processando', 'concluÃƒÆ’Ã†â€™Ãƒâ€ Ã¢â‚¬â„¢ÃƒÆ’Ã¢â‚¬Â ÃƒÂ¢Ã¢â€šÂ¬Ã¢â€žÂ¢ÃƒÆ’Ã†â€™ÃƒÂ¢Ã¢â€šÂ¬Ã…Â¡ÃƒÆ’Ã¢â‚¬Å¡Ãƒâ€šÃ‚Â­do', 'erro')),
  payload jsonb not null default '{}'::jsonb,
  attempts integer not null default 0,
  started_at timestamptz,
  finished_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.ai_agents (
  id uuid primary key default gen_random_uuid(),
  workspace_id uuid not null references public.workspaces(id) on delete cascade,
  name text not null,
  description text,
  personality text,
  objective text,
  prompt_system text not null,
  provider text not null check (provider in ('openai', 'gemini', 'claude')),
  model text not null,
  is_default boolean not null default false,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.playground_messages (
  id uuid primary key default gen_random_uuid(),
  workspace_id uuid not null references public.workspaces(id) on delete cascade,
  agent_id uuid references public.ai_agents(id) on delete set null,
  provider text not null check (provider in ('openai', 'gemini', 'claude')),
  model text not null,
  role text not null check (role in ('user', 'assistant', 'system')),
  content text not null,
  generation_id uuid references public.ai_generations(id) on delete set null,
  created_by uuid references auth.users(id) on delete set null,
  created_at timestamptz not null default now()
);

create table if not exists public.ai_credit_usage (
  id uuid primary key default gen_random_uuid(),
  workspace_id uuid not null references public.workspaces(id) on delete cascade,
  user_id uuid references auth.users(id) on delete set null,
  generation_id uuid references public.ai_generations(id) on delete set null,
  provider text not null check (provider in ('openai', 'gemini', 'claude')),
  model text not null,
  input_tokens integer not null default 0,
  output_tokens integer not null default 0,
  cost numeric(12,6) not null default 0,
  created_at timestamptz not null default now()
);

create table if not exists public.voice_providers (
  id uuid primary key default gen_random_uuid(),
  workspace_id uuid not null references public.workspaces(id) on delete cascade,
  name text not null,
  provider text not null check (provider in ('elevenlabs', 'openai_tts', 'capcut_manual', 'mock')),
  api_key_encrypted text,
  status text not null default 'inactive' check (status in ('active', 'inactive', 'error')),
  default_voice_id text,
  default_model text,
  cost_per_character numeric(12,8) not null default 0,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.voices (
  id uuid primary key default gen_random_uuid(),
  workspace_id uuid not null references public.workspaces(id) on delete cascade,
  provider text not null,
  voice_id text not null,
  name text not null,
  gender text,
  language text,
  accent text,
  style text,
  preview_url text,
  is_favorite boolean not null default false,
  status text not null default 'active' check (status in ('active', 'inactive', 'error')),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.audio_generations (
  id uuid primary key default gen_random_uuid(),
  workspace_id uuid not null references public.workspaces(id) on delete cascade,
  project_id uuid references public.projects(id) on delete set null,
  content_id uuid references public.content_items(id) on delete set null,
  script_id uuid references public.content_items(id) on delete set null,
  provider text not null,
  voice_id text,
  input_text text not null,
  audio_url text,
  duration_seconds numeric(10,2),
  characters_count integer not null default 0,
  cost numeric(12,6) not null default 0,
  status text not null default 'queued' check (status in ('queued', 'processing', 'completed', 'failed')),
  error_message text,
  created_at timestamptz not null default now()
);

create table if not exists public.image_providers (
  id uuid primary key default gen_random_uuid(),
  workspace_id uuid not null references public.workspaces(id) on delete cascade,
  name text not null,
  provider text not null check (provider in ('openai_images', 'flux', 'ideogram', 'google_manual', 'mock')),
  api_key_encrypted text,
  status text not null default 'inactive' check (status in ('active', 'inactive', 'error')),
  default_model text,
  cost_per_image numeric(12,6) not null default 0,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.image_generations (
  id uuid primary key default gen_random_uuid(),
  workspace_id uuid not null references public.workspaces(id) on delete cascade,
  project_id uuid references public.projects(id) on delete set null,
  content_id uuid references public.content_items(id) on delete set null,
  provider text not null,
  prompt text not null,
  negative_prompt text,
  style text,
  aspect_ratio text not null check (aspect_ratio in ('16:9', '9:16', '1:1', '4:5')),
  image_url text,
  cost numeric(12,6) not null default 0,
  status text not null default 'queued' check (status in ('queued', 'processing', 'completed', 'failed')),
  error_message text,
  created_at timestamptz not null default now()
);

create table if not exists public.media_assets (
  id uuid primary key default gen_random_uuid(),
  workspace_id uuid not null references public.workspaces(id) on delete cascade,
  project_id uuid references public.projects(id) on delete set null,
  content_id uuid references public.content_items(id) on delete set null,
  type text not null check (type in ('image', 'video', 'audio', 'music', 'thumbnail')),
  source text not null check (source in ('upload', 'ai_generated', 'google', 'stock', 'external_url')),
  file_url text not null,
  thumbnail_url text,
  title text not null,
  description text,
  tags text[] not null default '{}',
  duration_seconds numeric(10,2),
  width integer,
  height integer,
  size_bytes bigint,
  created_by uuid references auth.users(id) on delete set null,
  created_at timestamptz not null default now()
);

create table if not exists public.video_projects (
  id uuid primary key default gen_random_uuid(),
  workspace_id uuid not null references public.workspaces(id) on delete cascade,
  project_id uuid references public.projects(id) on delete set null,
  content_id uuid references public.content_items(id) on delete set null,
  title text not null,
  format text not null check (format in ('short', 'reels', 'tiktok', 'youtube_long', 'square', 'horizontal')),
  aspect_ratio text not null check (aspect_ratio in ('9:16', '16:9', '1:1')),
  duration_target integer not null default 60,
  narration_audio_url text,
  background_music_url text,
  subtitle_enabled boolean not null default true,
  subtitle_style text not null default 'clean',
  visual_style text,
  status text not null default 'draft' check (status in ('draft', 'generating_assets', 'editing', 'ready_to_render', 'rendering', 'completed', 'failed')),
  render_url text,
  thumbnail_url text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.video_scenes (
  id uuid primary key default gen_random_uuid(),
  workspace_id uuid not null references public.workspaces(id) on delete cascade,
  video_project_id uuid not null references public.video_projects(id) on delete cascade,
  order_index integer not null,
  script_text text not null,
  narration_start numeric(10,2),
  narration_end numeric(10,2),
  media_asset_id uuid references public.media_assets(id) on delete set null,
  image_prompt text,
  video_prompt text,
  duration_seconds numeric(10,2) not null default 5,
  motion_type text not null default 'none',
  transition_type text not null default 'none',
  zoom_enabled boolean not null default false,
  organic_motion_enabled boolean not null default false,
  status text not null default 'queued' check (status in ('queued', 'processing', 'completed', 'failed')),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.subtitle_segments (
  id uuid primary key default gen_random_uuid(),
  workspace_id uuid not null references public.workspaces(id) on delete cascade,
  video_project_id uuid not null references public.video_projects(id) on delete cascade,
  start_time numeric(10,2) not null,
  end_time numeric(10,2) not null,
  text text not null,
  style text not null default 'clean',
  position text not null default 'bottom',
  created_at timestamptz not null default now()
);

create table if not exists public.music_tracks (
  id uuid primary key default gen_random_uuid(),
  workspace_id uuid not null references public.workspaces(id) on delete cascade,
  title text not null,
  source text not null,
  file_url text not null,
  mood text not null,
  duration_seconds numeric(10,2),
  is_favorite boolean not null default false,
  created_at timestamptz not null default now()
);

create table if not exists public.video_renders (
  id uuid primary key default gen_random_uuid(),
  workspace_id uuid not null references public.workspaces(id) on delete cascade,
  video_project_id uuid not null references public.video_projects(id) on delete cascade,
  render_url text,
  status text not null default 'queued' check (status in ('queued', 'processing', 'completed', 'failed')),
  duration_seconds numeric(10,2),
  file_size bigint,
  logs text[] not null default '{}',
  error_message text,
  created_at timestamptz not null default now()
);

create table if not exists public.media_usage_logs (
  id uuid primary key default gen_random_uuid(),
  workspace_id uuid not null references public.workspaces(id) on delete cascade,
  user_id uuid references auth.users(id) on delete set null,
  provider text not null,
  action_type text not null check (action_type in ('tts_generation', 'image_generation', 'video_render', 'ai_animation', 'upload')),
  units numeric(12,2) not null default 0,
  cost numeric(12,6) not null default 0,
  reference_id uuid,
  created_at timestamptz not null default now()
);

create table if not exists public.visual_style_presets (
  id uuid primary key default gen_random_uuid(),
  workspace_id uuid not null references public.workspaces(id) on delete cascade,
  name text not null,
  description text,
  prompt_prefix text,
  prompt_suffix text,
  negative_prompt text,
  default_aspect_ratio text not null default '9:16',
  status text not null default 'active' check (status in ('active', 'inactive', 'error')),
  created_at timestamptz not null default now()
);

create table if not exists public.video_effects (
  id uuid primary key default gen_random_uuid(),
  workspace_id uuid not null references public.workspaces(id) on delete cascade,
  video_project_id uuid not null references public.video_projects(id) on delete cascade,
  scene_id uuid references public.video_scenes(id) on delete cascade,
  effect_type text not null,
  intensity integer not null default 50 check (intensity between 0 and 100),
  applies_to text not null check (applies_to in ('scene', 'video')),
  created_at timestamptz not null default now()
);

create table if not exists public.video_ai_providers (
  id uuid primary key default gen_random_uuid(),
  workspace_id uuid not null references public.workspaces(id) on delete cascade,
  name text not null,
  provider text not null check (provider in ('runway', 'kling', 'pika', 'veo', 'luma', 'mock')),
  api_key_encrypted text,
  status text not null default 'inactive' check (status in ('active', 'inactive', 'error')),
  default_model text,
  cost_per_generation numeric(12,6) not null default 0,
  created_at timestamptz not null default now()
);

create table if not exists public.image_animations (
  id uuid primary key default gen_random_uuid(),
  workspace_id uuid not null references public.workspaces(id) on delete cascade,
  video_project_id uuid not null references public.video_projects(id) on delete cascade,
  scene_id uuid not null references public.video_scenes(id) on delete cascade,
  provider text not null,
  input_image_url text,
  prompt text not null,
  output_video_url text,
  duration_seconds numeric(10,2) not null default 5,
  cost numeric(12,6) not null default 0,
  status text not null default 'queued' check (status in ('queued', 'processing', 'completed', 'failed')),
  error_message text,
  created_at timestamptz not null default now()
);

create table if not exists public.subtitle_styles (
  id uuid primary key default gen_random_uuid(),
  workspace_id uuid not null references public.workspaces(id) on delete cascade,
  name text not null,
  font_family text not null,
  font_size integer not null,
  font_weight text,
  text_color text,
  background_color text,
  outline_color text,
  shadow boolean not null default false,
  position text not null default 'bottom',
  animation text,
  created_at timestamptz not null default now()
);

create table if not exists public.audio_settings (
  id uuid primary key default gen_random_uuid(),
  workspace_id uuid not null references public.workspaces(id) on delete cascade,
  video_project_id uuid not null references public.video_projects(id) on delete cascade,
  narration_volume integer not null default 90 check (narration_volume between 0 and 100),
  music_volume integer not null default 25 check (music_volume between 0 and 100),
  fade_in_seconds numeric(10,2) not null default 0,
  fade_out_seconds numeric(10,2) not null default 0,
  loop_music boolean not null default true,
  created_at timestamptz not null default now(),
  unique (video_project_id)
);

create table if not exists public.thumbnail_generations (
  id uuid primary key default gen_random_uuid(),
  workspace_id uuid not null references public.workspaces(id) on delete cascade,
  video_project_id uuid not null references public.video_projects(id) on delete cascade,
  provider text not null,
  prompt text not null,
  style text not null,
  text_overlay text,
  quantity integer not null default 6,
  image_urls text[] not null default '{}',
  selected_image_url text,
  status text not null default 'queued' check (status in ('queued', 'processing', 'completed', 'failed')),
  cost numeric(12,6) not null default 0,
  created_at timestamptz not null default now()
);

create table if not exists public.video_versions (
  id uuid primary key default gen_random_uuid(),
  workspace_id uuid not null references public.workspaces(id) on delete cascade,
  video_project_id uuid not null references public.video_projects(id) on delete cascade,
  version_number integer not null,
  render_url text not null,
  thumbnail_url text,
  settings_snapshot jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(),
  unique (video_project_id, version_number)
);

create table if not exists public.magic_templates (
  id uuid primary key default gen_random_uuid(),
  workspace_id uuid not null references public.workspaces(id) on delete cascade,
  name text not null,
  description text,
  narrative_type text not null,
  format text not null,
  duration_target text not null,
  visual_style text not null,
  voice_preset text,
  advanced_settings jsonb not null default '{}'::jsonb,
  status text not null default 'active' check (status in ('active', 'archived')),
  created_at timestamptz not null default now()
);

create table if not exists public.magic_video_jobs (
  id uuid primary key default gen_random_uuid(),
  workspace_id uuid not null references public.workspaces(id) on delete cascade,
  project_id uuid references public.projects(id) on delete set null,
  user_id uuid references auth.users(id) on delete set null,
  theme text not null,
  format text not null,
  aspect_ratio text not null,
  duration_target integer not null,
  narrative_type text not null,
  voice_id text,
  visual_style text not null,
  visual_source text not null,
  subtitle_enabled boolean not null default true,
  music_enabled boolean not null default true,
  auto_thumbnail boolean not null default true,
  advanced_settings jsonb not null default '{}'::jsonb,
  status text not null default 'queued' check (status in ('queued', 'generating_script', 'generating_voice', 'generating_scenes', 'generating_images', 'generating_subtitles', 'selecting_music', 'generating_thumbnail', 'creating_video_project', 'ready_for_editor', 'failed', 'cancelled')),
  progress integer not null default 0 check (progress between 0 and 100),
  current_step text not null default 'Aguardando',
  error_message text,
  video_project_id uuid references public.video_projects(id) on delete set null,
  estimated_cost numeric(12,4) not null default 0,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.source_videos (
  id uuid primary key default gen_random_uuid(),
  workspace_id uuid not null references public.workspaces(id) on delete cascade,
  project_id uuid references public.projects(id) on delete set null,
  source_url text not null,
  source_type text not null default 'youtube',
  title text not null,
  duration_seconds integer not null default 0,
  thumbnail_url text,
  local_video_url text,
  local_audio_url text,
  transcript_id uuid,
  status text not null default 'queued' check (status in ('queued', 'processing', 'ready', 'failed')),
  created_at timestamptz not null default now()
);

create table if not exists public.video_transcripts (
  id uuid primary key default gen_random_uuid(),
  workspace_id uuid not null references public.workspaces(id) on delete cascade,
  source_video_id uuid not null references public.source_videos(id) on delete cascade,
  provider text not null default 'mock',
  language text not null default 'pt-BR',
  full_text text not null default '',
  segments jsonb not null default '[]'::jsonb,
  duration_seconds integer not null default 0,
  status text not null default 'queued' check (status in ('queued', 'processing', 'completed', 'failed')),
  created_at timestamptz not null default now()
);

do $$
begin
  if not exists (
    select 1
    from pg_constraint
    where conname = 'source_videos_transcript_id_fkey'
      and conrelid = 'public.source_videos'::regclass
  ) then
    alter table public.source_videos
      add constraint source_videos_transcript_id_fkey foreign key (transcript_id) references public.video_transcripts(id) on delete set null;
  end if;
end $$;

create table if not exists public.viral_clip_jobs (
  id uuid primary key default gen_random_uuid(),
  workspace_id uuid not null references public.workspaces(id) on delete cascade,
  project_id uuid references public.projects(id) on delete set null,
  user_id uuid references auth.users(id) on delete set null,
  source_url text not null,
  source_type text not null default 'youtube',
  output_format text not null,
  aspect_ratio text not null,
  clip_duration_mode text not null,
  clip_duration_seconds integer,
  clips_quantity integer not null default 5,
  subtitle_style text not null default 'tiktok',
  remove_silence boolean not null default true,
  reframe_vertical boolean not null default true,
  reframe_mode text not null default 'blurred_background',
  rights_confirmed boolean not null default false,
  status text not null default 'queued' check (status in ('queued', 'downloading_source', 'extracting_audio', 'transcribing', 'analyzing_moments', 'generating_clips', 'rendering', 'completed', 'failed', 'cancelled')),
  progress integer not null default 0 check (progress between 0 and 100),
  current_step text not null default 'Aguardando',
  error_message text,
  estimated_cost numeric(12,4) not null default 0,
  final_cost numeric(12,4),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.viral_moments (
  id uuid primary key default gen_random_uuid(),
  workspace_id uuid not null references public.workspaces(id) on delete cascade,
  viral_clip_job_id uuid not null references public.viral_clip_jobs(id) on delete cascade,
  source_video_id uuid not null references public.source_videos(id) on delete cascade,
  start_time numeric(10,2) not null,
  end_time numeric(10,2) not null,
  title text not null,
  hook text not null,
  reason text not null,
  viral_score integer not null default 0 check (viral_score between 0 and 100),
  retention_score integer not null default 0 check (retention_score between 0 and 100),
  clarity_score integer not null default 0 check (clarity_score between 0 and 100),
  transcript_excerpt text,
  status text not null default 'suggested' check (status in ('suggested', 'approved', 'rejected', 'rendered')),
  created_at timestamptz not null default now()
);

create table if not exists public.viral_clips (
  id uuid primary key default gen_random_uuid(),
  workspace_id uuid not null references public.workspaces(id) on delete cascade,
  viral_clip_job_id uuid not null references public.viral_clip_jobs(id) on delete cascade,
  source_video_id uuid not null references public.source_videos(id) on delete cascade,
  viral_moment_id uuid references public.viral_moments(id) on delete set null,
  title text not null,
  start_time numeric(10,2) not null,
  end_time numeric(10,2) not null,
  duration_seconds numeric(10,2) not null,
  aspect_ratio text not null,
  subtitle_style text not null,
  reframe_mode text not null default 'blurred_background',
  render_url text,
  thumbnail_url text,
  status text not null default 'queued' check (status in ('queued', 'rendering', 'completed', 'failed')),
  created_at timestamptz not null default now()
);

create table if not exists public.channels (
  id uuid primary key default gen_random_uuid(),
  workspace_id uuid not null references public.workspaces(id) on delete cascade,
  name text not null,
  description text,
  niche text not null,
  language text not null default 'pt-BR',
  country text not null default 'Brasil',
  logo_url text,
  banner_url text,
  channel_type text not null default 'custom',
  visual_style text,
  default_voice_id text,
  default_template_id uuid,
  default_video_format text not null default 'short',
  status text not null default 'ativo' check (status in ('ativo', 'pausado', 'arquivado')),
  is_favorite boolean not null default false,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.channel_templates (
  id uuid primary key default gen_random_uuid(),
  workspace_id uuid not null references public.workspaces(id) on delete cascade,
  channel_id uuid references public.channels(id) on delete cascade,
  name text not null,
  description text,
  voice_id text,
  visual_style text,
  duration_seconds integer not null default 60,
  format text not null default 'short',
  prompt_system text,
  prompt_user text,
  subtitle_style text,
  thumbnail_style text,
  status text not null default 'active' check (status in ('active', 'archived')),
  created_at timestamptz not null default now()
);

do $$
begin
  if not exists (
    select 1
    from pg_constraint
    where conname = 'channels_default_template_id_fkey'
      and conrelid = 'public.channels'::regclass
  ) then
    alter table public.channels
      add constraint channels_default_template_id_fkey foreign key (default_template_id) references public.channel_templates(id) on delete set null;
  end if;
end $$;

create table if not exists public.content_calendar (
  id uuid primary key default gen_random_uuid(),
  workspace_id uuid not null references public.workspaces(id) on delete cascade,
  channel_id uuid not null references public.channels(id) on delete cascade,
  content_type text not null,
  content_id uuid,
  title text not null,
  scheduled_date timestamptz not null,
  status text not null default 'planejado' check (status in ('planejado', 'em_producao', 'pronto', 'publicado', 'cancelado')),
  notes text,
  created_at timestamptz not null default now()
);

create table if not exists public.production_plans (
  id uuid primary key default gen_random_uuid(),
  workspace_id uuid not null references public.workspaces(id) on delete cascade,
  channel_id uuid not null references public.channels(id) on delete cascade,
  videos_per_day integer not null default 0,
  videos_per_week integer not null default 0,
  shorts_per_day integer not null default 0,
  long_videos_per_week integer not null default 0,
  notes text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (channel_id)
);

create table if not exists public.bulk_jobs (
  id uuid primary key default gen_random_uuid(),
  workspace_id uuid not null references public.workspaces(id) on delete cascade,
  channel_id uuid not null references public.channels(id) on delete cascade,
  quantity integer not null,
  content_type text not null,
  template_id uuid references public.channel_templates(id) on delete set null,
  status text not null default 'queued' check (status in ('queued', 'generating', 'rendering', 'completed', 'failed')),
  progress integer not null default 0 check (progress between 0 and 100),
  current_step text not null default 'Na fila',
  credits_consumed numeric(12,4) not null default 0,
  created_at timestamptz not null default now()
);

create table if not exists public.channel_goals (
  id uuid primary key default gen_random_uuid(),
  workspace_id uuid not null references public.workspaces(id) on delete cascade,
  channel_id uuid not null references public.channels(id) on delete cascade,
  goal_type text not null,
  target integer not null,
  period text not null,
  current_value integer not null default 0,
  created_at timestamptz not null default now()
);

create table if not exists public.channel_permissions (
  id uuid primary key default gen_random_uuid(),
  workspace_id uuid not null references public.workspaces(id) on delete cascade,
  channel_id uuid not null references public.channels(id) on delete cascade,
  user_id uuid references auth.users(id) on delete cascade,
  role text not null default 'visualizador' check (role in ('administrador', 'editor', 'operador', 'visualizador')),
  created_at timestamptz not null default now(),
  unique (channel_id, user_id)
);

create table if not exists public.operation_notifications (
  id uuid primary key default gen_random_uuid(),
  workspace_id uuid not null references public.workspaces(id) on delete cascade,
  channel_id uuid references public.channels(id) on delete cascade,
  title text not null,
  description text,
  type text not null,
  status text not null default 'unread' check (status in ('unread', 'read', 'archived')),
  created_at timestamptz not null default now()
);

create table if not exists public.ai_video_providers (
  id uuid primary key default gen_random_uuid(),
  workspace_id uuid not null references public.workspaces(id) on delete cascade,
  name text not null,
  provider text not null,
  api_key_encrypted text,
  default_model text,
  status text not null default 'inactive' check (status in ('active', 'inactive', 'error')),
  cost_per_second numeric(12,6) not null default 0,
  cost_per_generation numeric(12,6) not null default 0,
  max_duration_seconds integer not null default 10,
  supported_aspect_ratios text[] not null default '{"9:16","16:9","1:1"}',
  supports_image_to_video boolean not null default true,
  supports_text_to_video boolean not null default true,
  supports_talking_character boolean not null default false,
  is_default boolean not null default false,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.image_to_video_jobs (
  id uuid primary key default gen_random_uuid(),
  workspace_id uuid not null references public.workspaces(id) on delete cascade,
  video_project_id uuid references public.video_projects(id) on delete cascade,
  scene_id uuid references public.video_scenes(id) on delete set null,
  provider text not null,
  input_image_url text,
  motion_prompt text not null,
  duration_seconds integer not null default 5,
  aspect_ratio text not null default '9:16',
  output_video_url text,
  status text not null default 'queued' check (status in ('queued', 'processing', 'completed', 'failed', 'cancelled')),
  progress integer not null default 0 check (progress between 0 and 100),
  cost numeric(12,4) not null default 0,
  error_message text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.text_to_video_jobs (
  id uuid primary key default gen_random_uuid(),
  workspace_id uuid not null references public.workspaces(id) on delete cascade,
  project_id uuid references public.projects(id) on delete set null,
  provider text not null,
  prompt text not null,
  negative_prompt text,
  visual_style text,
  duration_seconds integer not null default 5,
  aspect_ratio text not null default '9:16',
  camera_motion text,
  quality text not null default 'standard',
  output_video_url text,
  thumbnail_url text,
  status text not null default 'queued' check (status in ('queued', 'processing', 'completed', 'failed', 'cancelled')),
  progress integer not null default 0 check (progress between 0 and 100),
  cost numeric(12,4) not null default 0,
  error_message text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.intro_outro_generations (
  id uuid primary key default gen_random_uuid(),
  workspace_id uuid not null references public.workspaces(id) on delete cascade,
  video_project_id uuid references public.video_projects(id) on delete cascade,
  type text not null check (type in ('intro', 'outro')),
  provider text not null,
  prompt text not null,
  duration_seconds integer not null default 5,
  aspect_ratio text not null default '9:16',
  output_video_url text,
  status text not null default 'queued' check (status in ('queued', 'processing', 'completed', 'failed', 'cancelled')),
  cost numeric(12,4) not null default 0,
  created_at timestamptz not null default now()
);

create table if not exists public.talking_character_jobs (
  id uuid primary key default gen_random_uuid(),
  workspace_id uuid not null references public.workspaces(id) on delete cascade,
  project_id uuid references public.projects(id) on delete set null,
  input_image_url text,
  character_description text,
  speech_text text not null,
  voice_id text,
  provider text not null,
  output_video_url text,
  status text not null default 'queued' check (status in ('queued', 'processing', 'completed', 'failed', 'cancelled')),
  progress integer not null default 0 check (progress between 0 and 100),
  cost numeric(12,4) not null default 0,
  error_message text,
  created_at timestamptz not null default now()
);

create table if not exists public.ai_video_assets (
  id uuid primary key default gen_random_uuid(),
  workspace_id uuid not null references public.workspaces(id) on delete cascade,
  project_id uuid references public.projects(id) on delete set null,
  video_project_id uuid references public.video_projects(id) on delete set null,
  source text not null,
  title text not null,
  provider text not null,
  thumbnail_url text,
  video_url text not null,
  duration_seconds integer not null default 0,
  aspect_ratio text not null default '9:16',
  cost numeric(12,4) not null default 0,
  created_at timestamptz not null default now()
);

create index if not exists idx_workspace_users_user_id on public.workspace_users(user_id);
create index if not exists idx_workspace_users_workspace_id on public.workspace_users(workspace_id);
create index if not exists idx_roles_workspace_id on public.roles(workspace_id);
create index if not exists idx_audit_logs_workspace_id_created_at on public.audit_logs(workspace_id, created_at desc);
create index if not exists idx_projects_workspace_id_status on public.projects(workspace_id, status);
create index if not exists idx_niches_workspace_id_active on public.niches(workspace_id, active);
create index if not exists idx_personas_project_id on public.personas(project_id);
create index if not exists idx_keywords_filters on public.keywords(workspace_id, niche_id, project_id, category);
create index if not exists idx_tags_workspace_id on public.tags(workspace_id);
create index if not exists idx_content_folders_project_id on public.content_folders(project_id);
create index if not exists idx_content_items_filters on public.content_items(workspace_id, project_id, type, status, category);
create index if not exists idx_content_items_search on public.content_items using gin (to_tsvector('portuguese', coalesce(title, '') || ' ' || coalesce(description, '') || ' ' || coalesce(category, '')));
create index if not exists idx_content_item_tags_tag_id on public.content_item_tags(tag_id);
create index if not exists idx_favorites_user_workspace on public.favorites(user_id, workspace_id);
create index if not exists idx_trends_filters on public.trends(workspace_id, project_id, niche, platform, status, viral_potential);
create index if not exists idx_competitors_filters on public.competitors(workspace_id, project_id, platform, status);
create index if not exists idx_competitor_insights_competitor_id on public.competitor_insights(competitor_id);
create index if not exists idx_content_ideas_filters on public.content_ideas(workspace_id, project_id, niche, source_type, status, format_suggestion);
create index if not exists idx_content_ideas_search on public.content_ideas using gin (to_tsvector('portuguese', coalesce(title, '') || ' ' || coalesce(description, '') || ' ' || coalesce(hook, '') || ' ' || coalesce(angle, '')));
create index if not exists idx_idea_sources_workspace on public.idea_sources(workspace_id, project_id, niche);
create index if not exists idx_idea_events_idea_id on public.idea_events(idea_id, created_at desc);
create index if not exists idx_ai_providers_workspace on public.ai_providers(workspace_id, provider, status);
create index if not exists idx_prompt_templates_workspace on public.prompt_templates(workspace_id, category, status);
create index if not exists idx_ai_generations_workspace on public.ai_generations(workspace_id, status, created_at desc);
create index if not exists idx_ai_generation_jobs_status on public.ai_generation_jobs(workspace_id, status, created_at);
create index if not exists idx_ai_agents_workspace on public.ai_agents(workspace_id, is_default);
create index if not exists idx_playground_messages_workspace on public.playground_messages(workspace_id, agent_id, created_at);
create index if not exists idx_ai_credit_usage_workspace on public.ai_credit_usage(workspace_id, created_at desc);
create index if not exists idx_voice_providers_workspace on public.voice_providers(workspace_id, provider, status);
create index if not exists idx_voices_filters on public.voices(workspace_id, provider, language, gender, style, is_favorite);
create index if not exists idx_audio_generations_workspace on public.audio_generations(workspace_id, status, created_at desc);
create index if not exists idx_image_providers_workspace on public.image_providers(workspace_id, provider, status);
create index if not exists idx_image_generations_workspace on public.image_generations(workspace_id, status, created_at desc);
create index if not exists idx_media_assets_filters on public.media_assets(workspace_id, project_id, type, source, created_at desc);
create index if not exists idx_video_projects_workspace on public.video_projects(workspace_id, status, created_at desc);
create index if not exists idx_video_scenes_project_order on public.video_scenes(video_project_id, order_index);
create index if not exists idx_subtitle_segments_project_time on public.subtitle_segments(video_project_id, start_time);
create index if not exists idx_music_tracks_workspace on public.music_tracks(workspace_id, mood, is_favorite);
create index if not exists idx_video_renders_project on public.video_renders(video_project_id, created_at desc);
create index if not exists idx_media_usage_workspace on public.media_usage_logs(workspace_id, created_at desc);
create index if not exists idx_visual_style_presets_workspace on public.visual_style_presets(workspace_id, status);
create index if not exists idx_video_effects_project on public.video_effects(video_project_id, scene_id);
create index if not exists idx_video_ai_providers_workspace on public.video_ai_providers(workspace_id, provider, status);
create index if not exists idx_image_animations_scene on public.image_animations(video_project_id, scene_id, status);
create index if not exists idx_subtitle_styles_workspace on public.subtitle_styles(workspace_id);
create index if not exists idx_audio_settings_project on public.audio_settings(video_project_id);
create index if not exists idx_thumbnail_generations_project on public.thumbnail_generations(video_project_id, created_at desc);
create index if not exists idx_video_versions_project on public.video_versions(video_project_id, version_number desc);
create index if not exists idx_magic_templates_workspace on public.magic_templates(workspace_id, status, created_at desc);
create index if not exists idx_magic_video_jobs_workspace on public.magic_video_jobs(workspace_id, status, created_at desc);
create index if not exists idx_magic_video_jobs_project on public.magic_video_jobs(project_id, created_at desc);
create index if not exists idx_source_videos_workspace on public.source_videos(workspace_id, source_type, created_at desc);
create index if not exists idx_video_transcripts_source on public.video_transcripts(source_video_id, created_at desc);
create index if not exists idx_viral_clip_jobs_workspace on public.viral_clip_jobs(workspace_id, status, created_at desc);
create index if not exists idx_viral_moments_job on public.viral_moments(viral_clip_job_id, status, viral_score desc);
create index if not exists idx_viral_clips_job on public.viral_clips(viral_clip_job_id, status, created_at desc);
create index if not exists idx_channels_workspace on public.channels(workspace_id, status, channel_type);
create index if not exists idx_channel_templates_workspace on public.channel_templates(workspace_id, channel_id, status);
create index if not exists idx_content_calendar_channel on public.content_calendar(channel_id, scheduled_date, status);
create index if not exists idx_production_plans_channel on public.production_plans(channel_id);
create index if not exists idx_bulk_jobs_workspace on public.bulk_jobs(workspace_id, status, created_at desc);
create index if not exists idx_channel_goals_channel on public.channel_goals(channel_id, goal_type, period);
create index if not exists idx_channel_permissions_user on public.channel_permissions(user_id, channel_id);
create index if not exists idx_operation_notifications_workspace on public.operation_notifications(workspace_id, status, created_at desc);
create index if not exists idx_ai_video_providers_workspace on public.ai_video_providers(workspace_id, provider, status);
create index if not exists idx_image_to_video_jobs_project on public.image_to_video_jobs(video_project_id, scene_id, status);
create index if not exists idx_text_to_video_jobs_workspace on public.text_to_video_jobs(workspace_id, status, created_at desc);
create index if not exists idx_intro_outro_generations_video on public.intro_outro_generations(video_project_id, type, created_at desc);
create index if not exists idx_talking_character_jobs_workspace on public.talking_character_jobs(workspace_id, status, created_at desc);
create index if not exists idx_ai_video_assets_workspace on public.ai_video_assets(workspace_id, source, created_at desc);

create table if not exists public.plans (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  slug text not null unique,
  description text,
  monthly_price numeric(10,2) not null default 0,
  yearly_price numeric(10,2) not null default 0,
  included_credits integer not null default 0,
  max_workspaces integer not null default 1,
  max_channels integer not null default 1,
  max_projects integer not null default 1,
  max_team_members integer not null default 1,
  max_videos_per_month integer not null default 0,
  max_renders_per_month integer not null default 0,
  max_ai_video_generations integer not null default 0,
  max_viral_clips integer not null default 0,
  watermark_enabled boolean not null default true,
  priority_queue boolean not null default false,
  white_label_enabled boolean not null default false,
  status text not null default 'active' check (status in ('active', 'inactive', 'archived')),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.subscriptions (
  id uuid primary key default gen_random_uuid(),
  workspace_id uuid not null references public.workspaces(id) on delete cascade,
  plan_id uuid not null references public.plans(id) on delete restrict,
  status text not null default 'trialing' check (status in ('trialing', 'active', 'past_due', 'canceled', 'expired')),
  billing_cycle text not null default 'monthly' check (billing_cycle in ('monthly', 'yearly')),
  current_period_start timestamptz not null default now(),
  current_period_end timestamptz not null default now() + interval '30 days',
  trial_ends_at timestamptz,
  cancel_at_period_end boolean not null default false,
  provider text not null default 'placeholder' check (provider in ('placeholder', 'stripe', 'mercado_pago')),
  provider_subscription_id text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.credit_wallets (
  id uuid primary key default gen_random_uuid(),
  workspace_id uuid not null unique references public.workspaces(id) on delete cascade,
  balance numeric(12,2) not null default 0,
  monthly_allowance numeric(12,2) not null default 0,
  purchased_credits numeric(12,2) not null default 0,
  used_this_period numeric(12,2) not null default 0,
  reset_at timestamptz not null default now() + interval '30 days',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.credit_transactions (
  id uuid primary key default gen_random_uuid(),
  workspace_id uuid not null references public.workspaces(id) on delete cascade,
  user_id uuid references auth.users(id) on delete set null,
  type text not null check (type in ('monthly_grant', 'purchase', 'usage', 'refund', 'adjustment', 'expiration')),
  amount numeric(12,2) not null,
  balance_after numeric(12,2) not null,
  description text not null,
  reference_type text,
  reference_id uuid,
  created_at timestamptz not null default now()
);

create table if not exists public.credit_packages (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  credits integer not null,
  price numeric(10,2) not null,
  bonus_credits integer not null default 0,
  status text not null default 'active' check (status in ('active', 'inactive', 'archived')),
  created_at timestamptz not null default now()
);

create table if not exists public.billing_events (
  id uuid primary key default gen_random_uuid(),
  workspace_id uuid references public.workspaces(id) on delete cascade,
  provider text not null default 'placeholder' check (provider in ('placeholder', 'stripe', 'mercado_pago')),
  event_type text not null,
  payload jsonb not null default '{}'::jsonb,
  status text not null default 'mocked' check (status in ('mocked', 'pending', 'processed', 'failed')),
  created_at timestamptz not null default now()
);

create table if not exists public.invoices (
  id uuid primary key default gen_random_uuid(),
  workspace_id uuid not null references public.workspaces(id) on delete cascade,
  subscription_id uuid references public.subscriptions(id) on delete set null,
  provider_invoice_id text,
  amount numeric(10,2) not null,
  currency text not null default 'BRL',
  status text not null default 'draft' check (status in ('draft', 'open', 'paid', 'void', 'uncollectible')),
  invoice_url text,
  paid_at timestamptz,
  created_at timestamptz not null default now()
);

create table if not exists public.platform_admins (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  role text not null check (role in ('owner', 'admin', 'support', 'finance')),
  status text not null default 'active' check (status in ('active', 'inactive')),
  created_at timestamptz not null default now(),
  unique (user_id)
);

create table if not exists public.feature_flags (
  id uuid primary key default gen_random_uuid(),
  workspace_id uuid references public.workspaces(id) on delete cascade,
  feature_key text not null,
  enabled boolean not null default true,
  limit_value integer,
  created_at timestamptz not null default now(),
  unique (workspace_id, feature_key)
);

create index if not exists idx_subscriptions_workspace on public.subscriptions(workspace_id, status, current_period_end);
create index if not exists idx_credit_wallets_workspace on public.credit_wallets(workspace_id);
create index if not exists idx_credit_transactions_workspace on public.credit_transactions(workspace_id, created_at desc);
create index if not exists idx_billing_events_workspace on public.billing_events(workspace_id, created_at desc);
create index if not exists idx_invoices_workspace on public.invoices(workspace_id, created_at desc);
create index if not exists idx_platform_admins_user on public.platform_admins(user_id, status);
create index if not exists idx_feature_flags_workspace on public.feature_flags(workspace_id, feature_key);

create table if not exists public.export_packages (
  id uuid primary key default gen_random_uuid(),
  workspace_id uuid not null references public.workspaces(id) on delete cascade,
  channel_id uuid references public.channels(id) on delete set null,
  video_project_id uuid not null references public.video_projects(id) on delete cascade,
  title text not null,
  target_platform text not null check (target_platform in ('youtube', 'youtube_shorts', 'tiktok', 'instagram_reels', 'facebook_reels')),
  package_url text,
  status text not null default 'draft' check (status in ('draft', 'preparing', 'ready', 'downloaded', 'marked_as_published', 'failed')),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.video_metadata (
  id uuid primary key default gen_random_uuid(),
  workspace_id uuid not null references public.workspaces(id) on delete cascade,
  video_project_id uuid not null references public.video_projects(id) on delete cascade,
  platform text not null check (platform in ('youtube', 'youtube_shorts', 'tiktok', 'instagram_reels', 'facebook_reels')),
  title text not null,
  title_variations text[] not null default '{}',
  description text not null,
  hashtags text[] not null default '{}',
  tags text[] not null default '{}',
  pinned_comment text,
  cta text,
  status text not null default 'generated' check (status in ('draft', 'generated', 'edited', 'approved')),
  created_at timestamptz not null default now()
);

create table if not exists public.bulk_export_jobs (
  id uuid primary key default gen_random_uuid(),
  workspace_id uuid not null references public.workspaces(id) on delete cascade,
  user_id uuid references auth.users(id) on delete set null,
  selected_video_ids uuid[] not null default '{}',
  target_platform text not null check (target_platform in ('youtube', 'youtube_shorts', 'tiktok', 'instagram_reels', 'facebook_reels')),
  status text not null default 'queued' check (status in ('queued', 'preparing', 'ready', 'downloaded', 'failed')),
  package_url text,
  created_at timestamptz not null default now()
);

create table if not exists public.manual_publications (
  id uuid primary key default gen_random_uuid(),
  workspace_id uuid not null references public.workspaces(id) on delete cascade,
  video_project_id uuid not null references public.video_projects(id) on delete cascade,
  export_package_id uuid references public.export_packages(id) on delete set null,
  platform text not null check (platform in ('youtube', 'youtube_shorts', 'tiktok', 'instagram_reels', 'facebook_reels')),
  published_url text,
  published_at timestamptz not null default now(),
  notes text,
  created_at timestamptz not null default now()
);

create index if not exists idx_export_packages_workspace on public.export_packages(workspace_id, target_platform, status, created_at desc);
create index if not exists idx_export_packages_video on public.export_packages(video_project_id, status);
create index if not exists idx_video_metadata_video on public.video_metadata(video_project_id, platform, created_at desc);
create index if not exists idx_bulk_export_jobs_workspace on public.bulk_export_jobs(workspace_id, status, created_at desc);
create index if not exists idx_manual_publications_workspace on public.manual_publications(workspace_id, platform, published_at desc);

create table if not exists public.asset_sources (
  id uuid primary key default gen_random_uuid(),
  workspace_id uuid not null references public.workspaces(id) on delete cascade,
  name text not null,
  provider text not null check (provider in ('upload', 'pexels', 'pixabay', 'unsplash', 'internal_ai', 'owned_library')),
  api_key_encrypted text,
  status text not null default 'active' check (status in ('active', 'inactive', 'error')),
  created_at timestamptz not null default now()
);

create table if not exists public.assets (
  id uuid primary key default gen_random_uuid(),
  workspace_id uuid not null references public.workspaces(id) on delete cascade,
  project_id uuid references public.projects(id) on delete set null,
  channel_id uuid references public.channels(id) on delete set null,
  type text not null check (type in ('image', 'video', 'audio', 'music', 'thumbnail')),
  source text not null check (source in ('upload', 'pexels', 'pixabay', 'unsplash', 'ai_image', 'ai_video', 'generated')),
  title text not null,
  description text,
  tags text[] not null default '{}',
  file_url text not null,
  thumbnail_url text,
  preview_url text,
  duration_seconds integer,
  width integer,
  height integer,
  file_size bigint,
  mime_type text,
  favorite boolean not null default false,
  usage_count integer not null default 0,
  quality_score integer not null default 0 check (quality_score between 0 and 100),
  hash text,
  created_by text,
  created_at timestamptz not null default now()
);

create table if not exists public.asset_collections (
  id uuid primary key default gen_random_uuid(),
  workspace_id uuid not null references public.workspaces(id) on delete cascade,
  name text not null,
  description text,
  thumbnail_url text,
  created_at timestamptz not null default now()
);

create table if not exists public.asset_collection_items (
  id uuid primary key default gen_random_uuid(),
  workspace_id uuid not null references public.workspaces(id) on delete cascade,
  collection_id uuid not null references public.asset_collections(id) on delete cascade,
  asset_id uuid not null references public.assets(id) on delete cascade,
  created_at timestamptz not null default now(),
  unique (collection_id, asset_id)
);

create table if not exists public.asset_usage (
  id uuid primary key default gen_random_uuid(),
  workspace_id uuid not null references public.workspaces(id) on delete cascade,
  asset_id uuid not null references public.assets(id) on delete cascade,
  video_project_id uuid references public.video_projects(id) on delete set null,
  scene_id uuid references public.video_scenes(id) on delete set null,
  used_at timestamptz not null default now()
);

create table if not exists public.asset_search_cache (
  id uuid primary key default gen_random_uuid(),
  workspace_id uuid not null references public.workspaces(id) on delete cascade,
  provider text not null check (provider in ('pexels', 'pixabay', 'unsplash')),
  query text not null,
  results jsonb not null default '[]'::jsonb,
  created_at timestamptz not null default now(),
  unique (workspace_id, provider, query)
);

create table if not exists public.premium_templates (
  id uuid primary key default gen_random_uuid(),
  workspace_id uuid references public.workspaces(id) on delete cascade,
  name text not null,
  description text,
  category text not null,
  niche text not null,
  language text not null default 'pt-BR',
  visual_style text not null,
  narrative_type text not null,
  default_voice_id text,
  default_duration text not null,
  default_format text not null,
  script_prompt text not null,
  image_prompt_style text not null,
  thumbnail_prompt text not null,
  subtitle_style text not null,
  music_mood text not null,
  tags text[] not null default '{}',
  status text not null default 'active' check (status in ('active', 'draft', 'archived', 'inactive')),
  prompts jsonb not null default '{}'::jsonb,
  topic_examples text[] not null default '{}',
  title_examples text[] not null default '{}',
  preview_image_url text,
  score jsonb not null default '{}'::jsonb,
  favorite boolean not null default false,
  usage_count integer not null default 0,
  videos_generated integer not null default 0,
  credits_consumed integer not null default 0,
  channels_created integer not null default 0,
  completion_rate integer not null default 0 check (completion_rate between 0 and 100),
  is_global boolean not null default false,
  is_featured boolean not null default false,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.template_packs (
  id uuid primary key default gen_random_uuid(),
  workspace_id uuid references public.workspaces(id) on delete cascade,
  name text not null,
  description text,
  category text not null,
  templates_count integer not null default 0,
  status text not null default 'active' check (status in ('active', 'draft', 'archived')),
  created_at timestamptz not null default now()
);

create table if not exists public.template_pack_items (
  id uuid primary key default gen_random_uuid(),
  workspace_id uuid references public.workspaces(id) on delete cascade,
  template_pack_id uuid not null references public.template_packs(id) on delete cascade,
  template_id uuid not null references public.premium_templates(id) on delete cascade,
  created_at timestamptz not null default now(),
  unique (template_pack_id, template_id)
);

create table if not exists public.onboarding_progress (
  id uuid primary key default gen_random_uuid(),
  workspace_id uuid not null references public.workspaces(id) on delete cascade,
  user_id uuid not null references auth.users(id) on delete cascade,
  current_step text not null default 'objective',
  completed_steps text[] not null default '{}',
  completed boolean not null default false,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (workspace_id, user_id)
);

create table if not exists public.onboarding_events (
  id uuid primary key default gen_random_uuid(),
  workspace_id uuid not null references public.workspaces(id) on delete cascade,
  user_id uuid not null references auth.users(id) on delete cascade,
  event_name text not null check (event_name in ('onboarding_started', 'template_selected', 'channel_created', 'first_video_generated', 'first_render_completed', 'onboarding_completed')),
  step text not null,
  created_at timestamptz not null default now()
);

create table if not exists public.video_quality_scores (
  id uuid primary key default gen_random_uuid(),
  workspace_id uuid not null references public.workspaces(id) on delete cascade,
  video_project_id uuid not null references public.video_projects(id) on delete cascade,
  overall_score integer not null check (overall_score between 0 and 100),
  hook_score integer not null check (hook_score between 0 and 100),
  script_score integer not null check (script_score between 0 and 100),
  visual_score integer not null check (visual_score between 0 and 100),
  subtitle_score integer not null check (subtitle_score between 0 and 100),
  thumbnail_score integer not null check (thumbnail_score between 0 and 100),
  retention_score integer not null check (retention_score between 0 and 100),
  cta_score integer not null check (cta_score between 0 and 100),
  recommendations text[] not null default '{}',
  created_at timestamptz not null default now()
);

create table if not exists public.video_recommendations (
  id uuid primary key default gen_random_uuid(),
  workspace_id uuid not null references public.workspaces(id) on delete cascade,
  video_project_id uuid not null references public.video_projects(id) on delete cascade,
  type text not null check (type in ('hook', 'script', 'visual', 'subtitle', 'thumbnail', 'pacing', 'metadata')),
  severity text not null check (severity in ('low', 'medium', 'high', 'critical')),
  message text not null,
  suggestion text not null,
  applied boolean not null default false,
  ignored boolean not null default false,
  created_at timestamptz not null default now()
);

create table if not exists public.trend_topics (
  id uuid primary key default gen_random_uuid(),
  category text not null,
  language text not null default 'pt-BR',
  title text not null,
  description text,
  trend_score integer not null default 0 check (trend_score between 0 and 100),
  source text not null default 'internal',
  created_at timestamptz not null default now()
);

create table if not exists public.idea_bank (
  id uuid primary key default gen_random_uuid(),
  workspace_id uuid not null references public.workspaces(id) on delete cascade,
  channel_id uuid references public.channels(id) on delete set null,
  title text not null,
  description text,
  niche text not null,
  status text not null default 'idea' check (status in ('idea', 'approved', 'generating', 'produced', 'archived')),
  score integer not null default 0 check (score between 0 and 100),
  created_at timestamptz not null default now()
);

create table if not exists public.tracked_channels (
  id uuid primary key default gen_random_uuid(),
  workspace_id uuid not null references public.workspaces(id) on delete cascade,
  name text not null,
  niche text not null,
  platform text not null,
  notes text,
  created_at timestamptz not null default now()
);

create table if not exists public.content_factories (
  id uuid primary key default gen_random_uuid(),
  workspace_id uuid not null references public.workspaces(id) on delete cascade,
  name text not null,
  description text,
  channel_id uuid references public.channels(id) on delete set null,
  template_id uuid references public.premium_templates(id) on delete set null,
  status text not null default 'active' check (status in ('active', 'paused', 'archived')),
  language text not null default 'pt-BR',
  default_voice_id text,
  visual_style text,
  default_format text not null default 'shorts',
  default_duration text,
  production_frequency text,
  quality_gate_threshold integer not null default 70 check (quality_gate_threshold between 0 and 100),
  require_review boolean not null default true,
  resource_priority text[] not null default '{}',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.production_rules (
  id uuid primary key default gen_random_uuid(),
  factory_id uuid not null references public.content_factories(id) on delete cascade,
  rule_type text not null,
  value text not null,
  created_at timestamptz not null default now()
);

create table if not exists public.factory_schedules (
  id uuid primary key default gen_random_uuid(),
  factory_id uuid not null references public.content_factories(id) on delete cascade,
  frequency text not null check (frequency in ('hourly', 'daily', 'weekly', 'monthly')),
  run_time text not null,
  timezone text not null default 'America/Sao_Paulo',
  enabled boolean not null default true,
  created_at timestamptz not null default now()
);

create table if not exists public.content_series (
  id uuid primary key default gen_random_uuid(),
  workspace_id uuid not null references public.workspaces(id) on delete cascade,
  channel_id uuid references public.channels(id) on delete set null,
  name text not null,
  description text,
  status text not null default 'active',
  created_at timestamptz not null default now()
);

create table if not exists public.factory_queue_jobs (
  id uuid primary key default gen_random_uuid(),
  workspace_id uuid not null references public.workspaces(id) on delete cascade,
  factory_id uuid not null references public.content_factories(id) on delete cascade,
  title text not null,
  status text not null default 'queued' check (status in ('queued', 'generating', 'review', 'rendering', 'completed', 'failed')),
  current_step text not null default 'queued',
  progress integer not null default 0 check (progress between 0 and 100),
  estimated_time text,
  credits_consumed integer not null default 0,
  quality_score integer not null default 0 check (quality_score between 0 and 100),
  created_at timestamptz not null default now()
);

create table if not exists public.review_queue_items (
  id uuid primary key default gen_random_uuid(),
  workspace_id uuid not null references public.workspaces(id) on delete cascade,
  factory_id uuid not null references public.content_factories(id) on delete cascade,
  video_project_id uuid references public.video_projects(id) on delete set null,
  title text not null,
  reason text not null,
  quality_score integer not null default 0 check (quality_score between 0 and 100),
  status text not null default 'pending' check (status in ('pending', 'approved', 'rejected', 'edited', 'resent')),
  created_at timestamptz not null default now()
);

create table if not exists public.factory_alerts (
  id uuid primary key default gen_random_uuid(),
  workspace_id uuid not null references public.workspaces(id) on delete cascade,
  factory_id uuid references public.content_factories(id) on delete cascade,
  type text not null check (type in ('low_credits', 'queue_congested', 'generation_failed', 'review_pending', 'limit_reached')),
  title text not null,
  description text not null,
  severity text not null default 'medium' check (severity in ('low', 'medium', 'high', 'critical')),
  created_at timestamptz not null default now()
);

create table if not exists public.backup_jobs (
  id uuid primary key default gen_random_uuid(),
  workspace_id uuid not null references public.workspaces(id) on delete cascade,
  type text not null check (type in ('database_export', 'assets_export', 'workspace_export', 'full_backup')),
  status text not null default 'queued' check (status in ('queued', 'running', 'completed', 'failed')),
  file_url text,
  started_at timestamptz not null default now(),
  completed_at timestamptz,
  error_message text
);

create table if not exists public.data_retention_policies (
  id uuid primary key default gen_random_uuid(),
  workspace_id uuid not null references public.workspaces(id) on delete cascade,
  temp_files_days integer not null default 7,
  failed_jobs_days integer not null default 30,
  logs_days integer not null default 180,
  deleted_assets_days integer not null default 30,
  created_at timestamptz not null default now()
);

create table if not exists public.security_events (
  id uuid primary key default gen_random_uuid(),
  workspace_id uuid not null references public.workspaces(id) on delete cascade,
  user_id uuid references auth.users(id) on delete set null,
  event_type text not null check (event_type in ('login', 'failed_login', 'permission_denied', 'api_key_changed', 'workspace_suspended', 'provider_error', 'credit_block', 'admin_action')),
  severity text not null default 'low' check (severity in ('low', 'medium', 'high', 'critical')),
  ip_address text,
  user_agent text,
  metadata jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now()
);

create table if not exists public.rate_limits (
  id uuid primary key default gen_random_uuid(),
  workspace_id uuid not null references public.workspaces(id) on delete cascade,
  feature text not null,
  limit_count integer not null,
  window_seconds integer not null,
  created_at timestamptz not null default now()
);

create table if not exists public.error_logs (
  id uuid primary key default gen_random_uuid(),
  workspace_id uuid not null references public.workspaces(id) on delete cascade,
  user_id uuid references auth.users(id) on delete set null,
  module text not null,
  message text not null,
  stack text,
  severity text not null default 'medium' check (severity in ('low', 'medium', 'high', 'critical')),
  metadata jsonb not null default '{}'::jsonb,
  resolved boolean not null default false,
  created_at timestamptz not null default now()
);

create table if not exists public.user_legal_acceptances (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  terms_version text not null,
  privacy_version text not null,
  accepted_at timestamptz not null default now()
);

create table if not exists public.data_requests (
  id uuid primary key default gen_random_uuid(),
  workspace_id uuid not null references public.workspaces(id) on delete cascade,
  user_id uuid references auth.users(id) on delete set null,
  type text not null check (type in ('workspace_export', 'account_export', 'personal_data_download', 'delete_request')),
  status text not null default 'requested' check (status in ('requested', 'processing', 'ready', 'completed', 'rejected')),
  created_at timestamptz not null default now()
);

create table if not exists public.smoke_test_video_results (
  id uuid primary key default gen_random_uuid(),
  workspace_id uuid not null references public.workspaces(id) on delete cascade,
  channel text not null,
  title text not null,
  format text not null,
  aspect_ratio text not null,
  duration_seconds integer not null,
  status text not null,
  execution_mode text not null check (execution_mode in ('real', 'mocked', 'hybrid')),
  generation_time_seconds integer not null default 0,
  credits_consumed integer not null default 0,
  errors_found text[] not null default '{}',
  quality_score integer not null default 0 check (quality_score between 0 and 100),
  thumbnail_score integer not null default 0 check (thumbnail_score between 0 and 100),
  retention_score integer not null default 0 check (retention_score between 0 and 100),
  subtitle_score integer not null default 0 check (subtitle_score between 0 and 100),
  quality_decision text not null check (quality_decision in ('approved', 'needs_review', 'rejected')),
  render_url text,
  export_package_url text,
  created_at timestamptz not null default now()
);

create index if not exists idx_asset_sources_workspace on public.asset_sources(workspace_id, provider, status);
create index if not exists idx_assets_workspace_type on public.assets(workspace_id, type, source, created_at desc);
create index if not exists idx_assets_project_channel on public.assets(project_id, channel_id, created_at desc);
create index if not exists idx_assets_tags on public.assets using gin(tags);
create index if not exists idx_asset_collections_workspace on public.asset_collections(workspace_id, created_at desc);
create index if not exists idx_asset_collection_items_collection on public.asset_collection_items(collection_id);
create index if not exists idx_asset_usage_asset on public.asset_usage(asset_id, used_at desc);
create index if not exists idx_asset_search_cache_lookup on public.asset_search_cache(workspace_id, provider, query);
create index if not exists idx_premium_templates_workspace on public.premium_templates(workspace_id, category, status, created_at desc);
create index if not exists idx_premium_templates_global on public.premium_templates(is_global, is_featured, category, status);
create index if not exists idx_premium_templates_tags on public.premium_templates using gin(tags);
create index if not exists idx_template_packs_workspace on public.template_packs(workspace_id, category, status, created_at desc);
create index if not exists idx_template_pack_items_pack on public.template_pack_items(template_pack_id);
create index if not exists idx_onboarding_progress_workspace on public.onboarding_progress(workspace_id, completed, updated_at desc);
create index if not exists idx_onboarding_events_workspace on public.onboarding_events(workspace_id, event_name, created_at desc);
create index if not exists idx_video_quality_scores_video on public.video_quality_scores(video_project_id, created_at desc);
create index if not exists idx_video_quality_scores_workspace on public.video_quality_scores(workspace_id, overall_score desc, created_at desc);
create index if not exists idx_video_recommendations_video on public.video_recommendations(video_project_id, severity, applied, ignored);
create index if not exists idx_video_recommendations_workspace on public.video_recommendations(workspace_id, type, severity, created_at desc);
create index if not exists idx_trend_topics_lookup on public.trend_topics(category, language, trend_score desc, created_at desc);
create index if not exists idx_idea_bank_workspace on public.idea_bank(workspace_id, channel_id, status, score desc, created_at desc);
create index if not exists idx_tracked_channels_workspace on public.tracked_channels(workspace_id, platform, niche, created_at desc);
create index if not exists idx_content_factories_workspace on public.content_factories(workspace_id, channel_id, status, created_at desc);
create index if not exists idx_production_rules_factory on public.production_rules(factory_id, rule_type);
create index if not exists idx_factory_schedules_factory on public.factory_schedules(factory_id, enabled, frequency);
create index if not exists idx_content_series_workspace on public.content_series(workspace_id, channel_id, status, created_at desc);
create index if not exists idx_factory_queue_jobs_workspace on public.factory_queue_jobs(workspace_id, factory_id, status, created_at desc);
create index if not exists idx_review_queue_items_workspace on public.review_queue_items(workspace_id, factory_id, status, created_at desc);
create index if not exists idx_factory_alerts_workspace on public.factory_alerts(workspace_id, factory_id, severity, created_at desc);
create index if not exists idx_backup_jobs_workspace on public.backup_jobs(workspace_id, status, started_at desc);
create index if not exists idx_data_retention_workspace on public.data_retention_policies(workspace_id, created_at desc);
create index if not exists idx_security_events_workspace on public.security_events(workspace_id, event_type, severity, created_at desc);
create index if not exists idx_rate_limits_workspace_feature on public.rate_limits(workspace_id, feature);
create index if not exists idx_error_logs_workspace on public.error_logs(workspace_id, module, severity, resolved, created_at desc);
create index if not exists idx_user_legal_acceptances_user on public.user_legal_acceptances(user_id, accepted_at desc);
create index if not exists idx_data_requests_workspace on public.data_requests(workspace_id, user_id, status, created_at desc);
create index if not exists idx_smoke_test_video_results_workspace on public.smoke_test_video_results(workspace_id, channel, status, created_at desc);

create or replace function public.touch_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;drop trigger if exists touch_user_profiles_updated_at on public.user_profiles;


create trigger touch_user_profiles_updated_at
before update on public.user_profiles
for each row execute function public.touch_updated_at();drop trigger if exists touch_workspaces_updated_at on public.workspaces;


create trigger touch_workspaces_updated_at
before update on public.workspaces
for each row execute function public.touch_updated_at();drop trigger if exists touch_projects_updated_at on public.projects;


create trigger touch_projects_updated_at
before update on public.projects
for each row execute function public.touch_updated_at();drop trigger if exists touch_content_factories_updated_at on public.content_factories;


create trigger touch_content_factories_updated_at
before update on public.content_factories
for each row execute function public.touch_updated_at();drop trigger if exists touch_niches_updated_at on public.niches;


create trigger touch_niches_updated_at
before update on public.niches
for each row execute function public.touch_updated_at();drop trigger if exists touch_personas_updated_at on public.personas;


create trigger touch_personas_updated_at
before update on public.personas
for each row execute function public.touch_updated_at();drop trigger if exists touch_keywords_updated_at on public.keywords;


create trigger touch_keywords_updated_at
before update on public.keywords
for each row execute function public.touch_updated_at();drop trigger if exists touch_tags_updated_at on public.tags;


create trigger touch_tags_updated_at
before update on public.tags
for each row execute function public.touch_updated_at();drop trigger if exists touch_content_folders_updated_at on public.content_folders;


create trigger touch_content_folders_updated_at
before update on public.content_folders
for each row execute function public.touch_updated_at();drop trigger if exists touch_content_items_updated_at on public.content_items;


create trigger touch_content_items_updated_at
before update on public.content_items
for each row execute function public.touch_updated_at();drop trigger if exists touch_trends_updated_at on public.trends;


create trigger touch_trends_updated_at before update on public.trends for each row execute function public.touch_updated_at();drop trigger if exists touch_competitors_updated_at on public.competitors;

create trigger touch_competitors_updated_at before update on public.competitors for each row execute function public.touch_updated_at();drop trigger if exists touch_competitor_insights_updated_at on public.competitor_insights;

create trigger touch_competitor_insights_updated_at before update on public.competitor_insights for each row execute function public.touch_updated_at();drop trigger if exists touch_content_ideas_updated_at on public.content_ideas;

create trigger touch_content_ideas_updated_at before update on public.content_ideas for each row execute function public.touch_updated_at();drop trigger if exists touch_idea_scores_updated_at on public.idea_scores;

create trigger touch_idea_scores_updated_at before update on public.idea_scores for each row execute function public.touch_updated_at();drop trigger if exists touch_idea_sources_updated_at on public.idea_sources;

create trigger touch_idea_sources_updated_at before update on public.idea_sources for each row execute function public.touch_updated_at();drop trigger if exists touch_ai_providers_updated_at on public.ai_providers;

create trigger touch_ai_providers_updated_at before update on public.ai_providers for each row execute function public.touch_updated_at();drop trigger if exists touch_prompt_templates_updated_at on public.prompt_templates;

create trigger touch_prompt_templates_updated_at before update on public.prompt_templates for each row execute function public.touch_updated_at();drop trigger if exists touch_ai_generations_updated_at on public.ai_generations;

create trigger touch_ai_generations_updated_at before update on public.ai_generations for each row execute function public.touch_updated_at();drop trigger if exists touch_ai_generation_jobs_updated_at on public.ai_generation_jobs;

create trigger touch_ai_generation_jobs_updated_at before update on public.ai_generation_jobs for each row execute function public.touch_updated_at();drop trigger if exists touch_ai_agents_updated_at on public.ai_agents;

create trigger touch_ai_agents_updated_at before update on public.ai_agents for each row execute function public.touch_updated_at();drop trigger if exists touch_voice_providers_updated_at on public.voice_providers;

create trigger touch_voice_providers_updated_at before update on public.voice_providers for each row execute function public.touch_updated_at();drop trigger if exists touch_voices_updated_at on public.voices;

create trigger touch_voices_updated_at before update on public.voices for each row execute function public.touch_updated_at();drop trigger if exists touch_image_providers_updated_at on public.image_providers;

create trigger touch_image_providers_updated_at before update on public.image_providers for each row execute function public.touch_updated_at();drop trigger if exists touch_video_projects_updated_at on public.video_projects;

create trigger touch_video_projects_updated_at before update on public.video_projects for each row execute function public.touch_updated_at();drop trigger if exists touch_video_scenes_updated_at on public.video_scenes;

create trigger touch_video_scenes_updated_at before update on public.video_scenes for each row execute function public.touch_updated_at();drop trigger if exists touch_magic_video_jobs_updated_at on public.magic_video_jobs;

create trigger touch_magic_video_jobs_updated_at before update on public.magic_video_jobs for each row execute function public.touch_updated_at();drop trigger if exists touch_viral_clip_jobs_updated_at on public.viral_clip_jobs;

create trigger touch_viral_clip_jobs_updated_at before update on public.viral_clip_jobs for each row execute function public.touch_updated_at();drop trigger if exists touch_channels_updated_at on public.channels;

create trigger touch_channels_updated_at before update on public.channels for each row execute function public.touch_updated_at();drop trigger if exists touch_production_plans_updated_at on public.production_plans;

create trigger touch_production_plans_updated_at before update on public.production_plans for each row execute function public.touch_updated_at();drop trigger if exists touch_ai_video_providers_updated_at on public.ai_video_providers;

create trigger touch_ai_video_providers_updated_at before update on public.ai_video_providers for each row execute function public.touch_updated_at();drop trigger if exists touch_image_to_video_jobs_updated_at on public.image_to_video_jobs;

create trigger touch_image_to_video_jobs_updated_at before update on public.image_to_video_jobs for each row execute function public.touch_updated_at();drop trigger if exists touch_text_to_video_jobs_updated_at on public.text_to_video_jobs;

create trigger touch_text_to_video_jobs_updated_at before update on public.text_to_video_jobs for each row execute function public.touch_updated_at();drop trigger if exists touch_premium_templates_updated_at on public.premium_templates;

create trigger touch_premium_templates_updated_at before update on public.premium_templates for each row execute function public.touch_updated_at();drop trigger if exists touch_onboarding_progress_updated_at on public.onboarding_progress;

create trigger touch_onboarding_progress_updated_at before update on public.onboarding_progress for each row execute function public.touch_updated_at();

create or replace function public.audit_row_change()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
declare
  target_workspace_id uuid;
  target_entity_id uuid;
begin
  if tg_table_name = 'workspaces' then
    if tg_op = 'DELETE' then
      target_workspace_id := null;
    else
      target_workspace_id := coalesce(new.id, old.id);
    end if;
    target_entity_id := coalesce(new.id, old.id);
  elsif tg_table_name = 'content_item_tags' then
    target_workspace_id := coalesce(new.workspace_id, old.workspace_id);
    target_entity_id := coalesce(new.content_item_id, old.content_item_id);
  elsif tg_table_name in ('production_rules', 'factory_schedules') then
    select cf.workspace_id into target_workspace_id
    from public.content_factories cf
    where cf.id = coalesce(new.factory_id, old.factory_id);
    target_entity_id := coalesce(new.id, old.id);
  else
    target_workspace_id := coalesce(new.workspace_id, old.workspace_id);
    target_entity_id := coalesce(new.id, old.id);
  end if;

  insert into public.audit_logs (
    workspace_id,
    actor_id,
    action,
    entity_type,
    entity_id,
    metadata
  )
  values (
    target_workspace_id,
    auth.uid(),
    case tg_op
      when 'INSERT' then 'create'
      when 'UPDATE' then 'update'
      when 'DELETE' then 'delete'
    end,
    tg_table_name,
    target_entity_id,
    jsonb_build_object('operation', tg_op)
  );

  return coalesce(new, old);
end;
$$;drop trigger if exists audit_workspaces_change on public.workspaces;


create trigger audit_workspaces_change
after insert or update or delete on public.workspaces
for each row execute function public.audit_row_change();drop trigger if exists audit_workspace_users_change on public.workspace_users;


create trigger audit_workspace_users_change
after insert or update or delete on public.workspace_users
for each row execute function public.audit_row_change();drop trigger if exists audit_roles_change on public.roles;


create trigger audit_roles_change
after insert or update or delete on public.roles
for each row execute function public.audit_row_change();drop trigger if exists audit_projects_change on public.projects;


create trigger audit_projects_change
after insert or update or delete on public.projects
for each row execute function public.audit_row_change();drop trigger if exists audit_niches_change on public.niches;


create trigger audit_niches_change
after insert or update or delete on public.niches
for each row execute function public.audit_row_change();drop trigger if exists audit_personas_change on public.personas;


create trigger audit_personas_change
after insert or update or delete on public.personas
for each row execute function public.audit_row_change();drop trigger if exists audit_keywords_change on public.keywords;


create trigger audit_keywords_change
after insert or update or delete on public.keywords
for each row execute function public.audit_row_change();drop trigger if exists audit_tags_change on public.tags;


create trigger audit_tags_change
after insert or update or delete on public.tags
for each row execute function public.audit_row_change();drop trigger if exists audit_content_folders_change on public.content_folders;


create trigger audit_content_folders_change
after insert or update or delete on public.content_folders
for each row execute function public.audit_row_change();drop trigger if exists audit_content_items_change on public.content_items;


create trigger audit_content_items_change
after insert or update or delete on public.content_items
for each row execute function public.audit_row_change();drop trigger if exists audit_content_item_tags_change on public.content_item_tags;


create trigger audit_content_item_tags_change
after insert or update or delete on public.content_item_tags
for each row execute function public.audit_row_change();drop trigger if exists audit_favorites_change on public.favorites;


create trigger audit_favorites_change
after insert or update or delete on public.favorites
for each row execute function public.audit_row_change();drop trigger if exists audit_trends_change on public.trends;


create trigger audit_trends_change after insert or update or delete on public.trends for each row execute function public.audit_row_change();drop trigger if exists audit_competitors_change on public.competitors;

create trigger audit_competitors_change after insert or update or delete on public.competitors for each row execute function public.audit_row_change();drop trigger if exists audit_competitor_insights_change on public.competitor_insights;

create trigger audit_competitor_insights_change after insert or update or delete on public.competitor_insights for each row execute function public.audit_row_change();drop trigger if exists audit_content_ideas_change on public.content_ideas;

create trigger audit_content_ideas_change after insert or update or delete on public.content_ideas for each row execute function public.audit_row_change();drop trigger if exists audit_idea_scores_change on public.idea_scores;

create trigger audit_idea_scores_change after insert or update or delete on public.idea_scores for each row execute function public.audit_row_change();drop trigger if exists audit_idea_sources_change on public.idea_sources;

create trigger audit_idea_sources_change after insert or update or delete on public.idea_sources for each row execute function public.audit_row_change();drop trigger if exists audit_idea_events_change on public.idea_events;

create trigger audit_idea_events_change after insert or update or delete on public.idea_events for each row execute function public.audit_row_change();drop trigger if exists audit_ai_providers_change on public.ai_providers;

create trigger audit_ai_providers_change after insert or update or delete on public.ai_providers for each row execute function public.audit_row_change();drop trigger if exists audit_prompt_templates_change on public.prompt_templates;

create trigger audit_prompt_templates_change after insert or update or delete on public.prompt_templates for each row execute function public.audit_row_change();drop trigger if exists audit_ai_generations_change on public.ai_generations;

create trigger audit_ai_generations_change after insert or update or delete on public.ai_generations for each row execute function public.audit_row_change();drop trigger if exists audit_ai_generation_jobs_change on public.ai_generation_jobs;

create trigger audit_ai_generation_jobs_change after insert or update or delete on public.ai_generation_jobs for each row execute function public.audit_row_change();drop trigger if exists audit_ai_agents_change on public.ai_agents;

create trigger audit_ai_agents_change after insert or update or delete on public.ai_agents for each row execute function public.audit_row_change();drop trigger if exists audit_playground_messages_change on public.playground_messages;

create trigger audit_playground_messages_change after insert or update or delete on public.playground_messages for each row execute function public.audit_row_change();drop trigger if exists audit_ai_credit_usage_change on public.ai_credit_usage;

create trigger audit_ai_credit_usage_change after insert or update or delete on public.ai_credit_usage for each row execute function public.audit_row_change();drop trigger if exists audit_voice_providers_change on public.voice_providers;

create trigger audit_voice_providers_change after insert or update or delete on public.voice_providers for each row execute function public.audit_row_change();drop trigger if exists audit_voices_change on public.voices;

create trigger audit_voices_change after insert or update or delete on public.voices for each row execute function public.audit_row_change();drop trigger if exists audit_audio_generations_change on public.audio_generations;

create trigger audit_audio_generations_change after insert or update or delete on public.audio_generations for each row execute function public.audit_row_change();drop trigger if exists audit_image_providers_change on public.image_providers;

create trigger audit_image_providers_change after insert or update or delete on public.image_providers for each row execute function public.audit_row_change();drop trigger if exists audit_image_generations_change on public.image_generations;

create trigger audit_image_generations_change after insert or update or delete on public.image_generations for each row execute function public.audit_row_change();drop trigger if exists audit_media_assets_change on public.media_assets;

create trigger audit_media_assets_change after insert or update or delete on public.media_assets for each row execute function public.audit_row_change();drop trigger if exists audit_video_projects_change on public.video_projects;

create trigger audit_video_projects_change after insert or update or delete on public.video_projects for each row execute function public.audit_row_change();drop trigger if exists audit_video_scenes_change on public.video_scenes;

create trigger audit_video_scenes_change after insert or update or delete on public.video_scenes for each row execute function public.audit_row_change();drop trigger if exists audit_subtitle_segments_change on public.subtitle_segments;

create trigger audit_subtitle_segments_change after insert or update or delete on public.subtitle_segments for each row execute function public.audit_row_change();drop trigger if exists audit_music_tracks_change on public.music_tracks;

create trigger audit_music_tracks_change after insert or update or delete on public.music_tracks for each row execute function public.audit_row_change();drop trigger if exists audit_video_renders_change on public.video_renders;

create trigger audit_video_renders_change after insert or update or delete on public.video_renders for each row execute function public.audit_row_change();drop trigger if exists audit_media_usage_logs_change on public.media_usage_logs;

create trigger audit_media_usage_logs_change after insert or update or delete on public.media_usage_logs for each row execute function public.audit_row_change();drop trigger if exists audit_visual_style_presets_change on public.visual_style_presets;

create trigger audit_visual_style_presets_change after insert or update or delete on public.visual_style_presets for each row execute function public.audit_row_change();drop trigger if exists audit_video_effects_change on public.video_effects;

create trigger audit_video_effects_change after insert or update or delete on public.video_effects for each row execute function public.audit_row_change();drop trigger if exists audit_video_ai_providers_change on public.video_ai_providers;

create trigger audit_video_ai_providers_change after insert or update or delete on public.video_ai_providers for each row execute function public.audit_row_change();drop trigger if exists audit_image_animations_change on public.image_animations;

create trigger audit_image_animations_change after insert or update or delete on public.image_animations for each row execute function public.audit_row_change();drop trigger if exists audit_subtitle_styles_change on public.subtitle_styles;

create trigger audit_subtitle_styles_change after insert or update or delete on public.subtitle_styles for each row execute function public.audit_row_change();drop trigger if exists audit_audio_settings_change on public.audio_settings;

create trigger audit_audio_settings_change after insert or update or delete on public.audio_settings for each row execute function public.audit_row_change();drop trigger if exists audit_thumbnail_generations_change on public.thumbnail_generations;

create trigger audit_thumbnail_generations_change after insert or update or delete on public.thumbnail_generations for each row execute function public.audit_row_change();drop trigger if exists audit_video_versions_change on public.video_versions;

create trigger audit_video_versions_change after insert or update or delete on public.video_versions for each row execute function public.audit_row_change();drop trigger if exists audit_magic_templates_change on public.magic_templates;

create trigger audit_magic_templates_change after insert or update or delete on public.magic_templates for each row execute function public.audit_row_change();drop trigger if exists audit_magic_video_jobs_change on public.magic_video_jobs;

create trigger audit_magic_video_jobs_change after insert or update or delete on public.magic_video_jobs for each row execute function public.audit_row_change();drop trigger if exists audit_source_videos_change on public.source_videos;

create trigger audit_source_videos_change after insert or update or delete on public.source_videos for each row execute function public.audit_row_change();drop trigger if exists audit_video_transcripts_change on public.video_transcripts;

create trigger audit_video_transcripts_change after insert or update or delete on public.video_transcripts for each row execute function public.audit_row_change();drop trigger if exists audit_viral_clip_jobs_change on public.viral_clip_jobs;

create trigger audit_viral_clip_jobs_change after insert or update or delete on public.viral_clip_jobs for each row execute function public.audit_row_change();drop trigger if exists audit_viral_moments_change on public.viral_moments;

create trigger audit_viral_moments_change after insert or update or delete on public.viral_moments for each row execute function public.audit_row_change();drop trigger if exists audit_viral_clips_change on public.viral_clips;

create trigger audit_viral_clips_change after insert or update or delete on public.viral_clips for each row execute function public.audit_row_change();drop trigger if exists audit_channels_change on public.channels;

create trigger audit_channels_change after insert or update or delete on public.channels for each row execute function public.audit_row_change();drop trigger if exists audit_channel_templates_change on public.channel_templates;

create trigger audit_channel_templates_change after insert or update or delete on public.channel_templates for each row execute function public.audit_row_change();drop trigger if exists audit_content_calendar_change on public.content_calendar;

create trigger audit_content_calendar_change after insert or update or delete on public.content_calendar for each row execute function public.audit_row_change();drop trigger if exists audit_production_plans_change on public.production_plans;

create trigger audit_production_plans_change after insert or update or delete on public.production_plans for each row execute function public.audit_row_change();drop trigger if exists audit_bulk_jobs_change on public.bulk_jobs;

create trigger audit_bulk_jobs_change after insert or update or delete on public.bulk_jobs for each row execute function public.audit_row_change();drop trigger if exists audit_channel_goals_change on public.channel_goals;

create trigger audit_channel_goals_change after insert or update or delete on public.channel_goals for each row execute function public.audit_row_change();drop trigger if exists audit_channel_permissions_change on public.channel_permissions;

create trigger audit_channel_permissions_change after insert or update or delete on public.channel_permissions for each row execute function public.audit_row_change();drop trigger if exists audit_operation_notifications_change on public.operation_notifications;

create trigger audit_operation_notifications_change after insert or update or delete on public.operation_notifications for each row execute function public.audit_row_change();drop trigger if exists audit_ai_video_providers_change on public.ai_video_providers;

create trigger audit_ai_video_providers_change after insert or update or delete on public.ai_video_providers for each row execute function public.audit_row_change();drop trigger if exists audit_image_to_video_jobs_change on public.image_to_video_jobs;

create trigger audit_image_to_video_jobs_change after insert or update or delete on public.image_to_video_jobs for each row execute function public.audit_row_change();drop trigger if exists audit_text_to_video_jobs_change on public.text_to_video_jobs;

create trigger audit_text_to_video_jobs_change after insert or update or delete on public.text_to_video_jobs for each row execute function public.audit_row_change();drop trigger if exists audit_intro_outro_generations_change on public.intro_outro_generations;

create trigger audit_intro_outro_generations_change after insert or update or delete on public.intro_outro_generations for each row execute function public.audit_row_change();drop trigger if exists audit_talking_character_jobs_change on public.talking_character_jobs;

create trigger audit_talking_character_jobs_change after insert or update or delete on public.talking_character_jobs for each row execute function public.audit_row_change();drop trigger if exists audit_ai_video_assets_change on public.ai_video_assets;

create trigger audit_ai_video_assets_change after insert or update or delete on public.ai_video_assets for each row execute function public.audit_row_change();drop trigger if exists audit_content_factories_change on public.content_factories;

create trigger audit_content_factories_change after insert or update or delete on public.content_factories for each row execute function public.audit_row_change();drop trigger if exists audit_production_rules_change on public.production_rules;

create trigger audit_production_rules_change after insert or update or delete on public.production_rules for each row execute function public.audit_row_change();drop trigger if exists audit_factory_schedules_change on public.factory_schedules;

create trigger audit_factory_schedules_change after insert or update or delete on public.factory_schedules for each row execute function public.audit_row_change();drop trigger if exists audit_content_series_change on public.content_series;

create trigger audit_content_series_change after insert or update or delete on public.content_series for each row execute function public.audit_row_change();drop trigger if exists audit_factory_queue_jobs_change on public.factory_queue_jobs;

create trigger audit_factory_queue_jobs_change after insert or update or delete on public.factory_queue_jobs for each row execute function public.audit_row_change();drop trigger if exists audit_review_queue_items_change on public.review_queue_items;

create trigger audit_review_queue_items_change after insert or update or delete on public.review_queue_items for each row execute function public.audit_row_change();drop trigger if exists audit_factory_alerts_change on public.factory_alerts;

create trigger audit_factory_alerts_change after insert or update or delete on public.factory_alerts for each row execute function public.audit_row_change();drop trigger if exists audit_backup_jobs_change on public.backup_jobs;

create trigger audit_backup_jobs_change after insert or update or delete on public.backup_jobs for each row execute function public.audit_row_change();drop trigger if exists audit_data_retention_policies_change on public.data_retention_policies;

create trigger audit_data_retention_policies_change after insert or update or delete on public.data_retention_policies for each row execute function public.audit_row_change();drop trigger if exists audit_security_events_change on public.security_events;

create trigger audit_security_events_change after insert or update or delete on public.security_events for each row execute function public.audit_row_change();drop trigger if exists audit_rate_limits_change on public.rate_limits;

create trigger audit_rate_limits_change after insert or update or delete on public.rate_limits for each row execute function public.audit_row_change();drop trigger if exists audit_error_logs_change on public.error_logs;

create trigger audit_error_logs_change after insert or update or delete on public.error_logs for each row execute function public.audit_row_change();drop trigger if exists audit_data_requests_change on public.data_requests;

create trigger audit_data_requests_change after insert or update or delete on public.data_requests for each row execute function public.audit_row_change();drop trigger if exists audit_smoke_test_video_results_change on public.smoke_test_video_results;

create trigger audit_smoke_test_video_results_change after insert or update or delete on public.smoke_test_video_results for each row execute function public.audit_row_change();

alter table public.user_profiles enable row level security;
alter table public.workspaces enable row level security;
alter table public.roles enable row level security;
alter table public.permissions enable row level security;
alter table public.role_permissions enable row level security;
alter table public.workspace_users enable row level security;
alter table public.audit_logs enable row level security;
alter table public.projects enable row level security;
alter table public.niches enable row level security;
alter table public.personas enable row level security;
alter table public.keywords enable row level security;
alter table public.tags enable row level security;
alter table public.content_folders enable row level security;
alter table public.content_items enable row level security;
alter table public.content_item_tags enable row level security;
alter table public.favorites enable row level security;
alter table public.trends enable row level security;
alter table public.competitors enable row level security;
alter table public.competitor_insights enable row level security;
alter table public.content_ideas enable row level security;
alter table public.idea_scores enable row level security;
alter table public.idea_sources enable row level security;
alter table public.idea_events enable row level security;
alter table public.ai_providers enable row level security;
alter table public.prompt_templates enable row level security;
alter table public.ai_generations enable row level security;
alter table public.ai_generation_jobs enable row level security;
alter table public.ai_agents enable row level security;
alter table public.playground_messages enable row level security;
alter table public.ai_credit_usage enable row level security;
alter table public.voice_providers enable row level security;
alter table public.voices enable row level security;
alter table public.audio_generations enable row level security;
alter table public.image_providers enable row level security;
alter table public.image_generations enable row level security;
alter table public.media_assets enable row level security;
alter table public.video_projects enable row level security;
alter table public.video_scenes enable row level security;
alter table public.subtitle_segments enable row level security;
alter table public.music_tracks enable row level security;
alter table public.video_renders enable row level security;
alter table public.media_usage_logs enable row level security;
alter table public.visual_style_presets enable row level security;
alter table public.video_effects enable row level security;
alter table public.video_ai_providers enable row level security;
alter table public.image_animations enable row level security;
alter table public.subtitle_styles enable row level security;
alter table public.audio_settings enable row level security;
alter table public.thumbnail_generations enable row level security;
alter table public.video_versions enable row level security;
alter table public.magic_templates enable row level security;
alter table public.magic_video_jobs enable row level security;
alter table public.source_videos enable row level security;
alter table public.video_transcripts enable row level security;
alter table public.viral_clip_jobs enable row level security;
alter table public.viral_moments enable row level security;
alter table public.viral_clips enable row level security;
alter table public.channels enable row level security;
alter table public.channel_templates enable row level security;
alter table public.content_calendar enable row level security;
alter table public.production_plans enable row level security;
alter table public.bulk_jobs enable row level security;
alter table public.channel_goals enable row level security;
alter table public.channel_permissions enable row level security;
alter table public.operation_notifications enable row level security;
alter table public.ai_video_providers enable row level security;
alter table public.image_to_video_jobs enable row level security;
alter table public.text_to_video_jobs enable row level security;
alter table public.intro_outro_generations enable row level security;
alter table public.talking_character_jobs enable row level security;
alter table public.ai_video_assets enable row level security;
alter table public.plans enable row level security;
alter table public.subscriptions enable row level security;
alter table public.credit_wallets enable row level security;
alter table public.credit_transactions enable row level security;
alter table public.credit_packages enable row level security;
alter table public.billing_events enable row level security;
alter table public.invoices enable row level security;
alter table public.platform_admins enable row level security;
alter table public.feature_flags enable row level security;
alter table public.export_packages enable row level security;
alter table public.video_metadata enable row level security;
alter table public.bulk_export_jobs enable row level security;
alter table public.manual_publications enable row level security;
alter table public.asset_sources enable row level security;
alter table public.assets enable row level security;
alter table public.asset_collections enable row level security;
alter table public.asset_collection_items enable row level security;
alter table public.asset_usage enable row level security;
alter table public.asset_search_cache enable row level security;
alter table public.premium_templates enable row level security;
alter table public.template_packs enable row level security;
alter table public.template_pack_items enable row level security;
alter table public.onboarding_progress enable row level security;
alter table public.onboarding_events enable row level security;
alter table public.video_quality_scores enable row level security;
alter table public.video_recommendations enable row level security;
alter table public.trend_topics enable row level security;
alter table public.idea_bank enable row level security;
alter table public.tracked_channels enable row level security;
alter table public.content_factories enable row level security;
alter table public.production_rules enable row level security;
alter table public.factory_schedules enable row level security;
alter table public.content_series enable row level security;
alter table public.factory_queue_jobs enable row level security;
alter table public.review_queue_items enable row level security;
alter table public.factory_alerts enable row level security;
alter table public.backup_jobs enable row level security;
alter table public.data_retention_policies enable row level security;
alter table public.security_events enable row level security;
alter table public.rate_limits enable row level security;
alter table public.error_logs enable row level security;
alter table public.user_legal_acceptances enable row level security;
alter table public.data_requests enable row level security;
alter table public.smoke_test_video_results enable row level security;

create or replace function public.is_platform_admin(required_role text default null)
returns boolean
language sql
security definer
set search_path = public
as $$
  select exists (
    select 1
    from public.platform_admins pa
    where pa.user_id = auth.uid()
      and pa.status = 'active'
      and (
        required_role is null
        or pa.role = required_role
        or pa.role in ('owner', 'admin')
      )
  );
$$;

create or replace function public.is_workspace_member(target_workspace_id uuid)
returns boolean
language sql
security definer
set search_path = public
stable
as $$
  select exists (
    select 1
    from public.workspace_users wu
    where wu.workspace_id = target_workspace_id
      and wu.user_id = auth.uid()
      and wu.status = 'active'
  );
$$;

create or replace function public.has_workspace_permission(target_workspace_id uuid, permission_key text)
returns boolean
language sql
security definer
set search_path = public
stable
as $$
  select exists (
    select 1
    from public.workspace_users wu
    join public.role_permissions rp on rp.role_id = wu.role_id
    join public.permissions p on p.id = rp.permission_id
    where wu.workspace_id = target_workspace_id
      and wu.user_id = auth.uid()
      and wu.status = 'active'
      and p.key = permission_key
  );
$$;drop policy if exists "profiles are visible to signed users" on public.user_profiles;


create policy "profiles are visible to signed users"
on public.user_profiles for select
to authenticated
using (true);drop policy if exists "users update own profile" on public.user_profiles;


create policy "users update own profile"
on public.user_profiles for update
to authenticated
using (id = auth.uid())
with check (id = auth.uid());drop policy if exists "users create own profile" on public.user_profiles;


create policy "users create own profile"
on public.user_profiles for insert
to authenticated
with check (id = auth.uid());drop policy if exists "members read workspaces" on public.workspaces;


create policy "members read workspaces"
on public.workspaces for select
to authenticated
using (public.is_workspace_member(id));drop policy if exists "owners create workspaces" on public.workspaces;


create policy "owners create workspaces"
on public.workspaces for insert
to authenticated
with check (owner_id = auth.uid());drop policy if exists "workspace managers update workspaces" on public.workspaces;


create policy "workspace managers update workspaces"
on public.workspaces for update
to authenticated
using (public.has_workspace_permission(id, 'workspace.manage'))
with check (public.has_workspace_permission(id, 'workspace.manage'));drop policy if exists "members read workspace users" on public.workspace_users;


create policy "members read workspace users"
on public.workspace_users for select
to authenticated
using (public.is_workspace_member(workspace_id));drop policy if exists "admins invite users" on public.workspace_users;


create policy "admins invite users"
on public.workspace_users for insert
to authenticated
with check (public.has_workspace_permission(workspace_id, 'users.invite'));drop policy if exists "admins remove users" on public.workspace_users;


create policy "admins remove users"
on public.workspace_users for delete
to authenticated
using (public.has_workspace_permission(workspace_id, 'users.remove'));drop policy if exists "members read roles" on public.roles;


create policy "members read roles"
on public.roles for select
to authenticated
using (workspace_id is null or public.is_workspace_member(workspace_id));drop policy if exists "role managers write roles" on public.roles;


create policy "role managers write roles"
on public.roles for all
to authenticated
using (workspace_id is not null and public.has_workspace_permission(workspace_id, 'roles.manage'))
with check (workspace_id is not null and public.has_workspace_permission(workspace_id, 'roles.manage'));drop policy if exists "authenticated read permissions" on public.permissions;


create policy "authenticated read permissions"
on public.permissions for select
to authenticated
using (true);drop policy if exists "members read role permissions" on public.role_permissions;


create policy "members read role permissions"
on public.role_permissions for select
to authenticated
using (
  exists (
    select 1 from public.roles r
    where r.id = role_id
      and (r.workspace_id is null or public.is_workspace_member(r.workspace_id))
  )
);drop policy if exists "role managers write role permissions" on public.role_permissions;


create policy "role managers write role permissions"
on public.role_permissions for all
to authenticated
using (
  exists (
    select 1 from public.roles r
    where r.id = role_id
      and r.workspace_id is not null
      and public.has_workspace_permission(r.workspace_id, 'roles.manage')
  )
)
with check (
  exists (
    select 1 from public.roles r
    where r.id = role_id
      and r.workspace_id is not null
      and public.has_workspace_permission(r.workspace_id, 'roles.manage')
  )
);drop policy if exists "members create audit logs" on public.audit_logs;


create policy "members create audit logs"
on public.audit_logs for insert
to authenticated
with check (workspace_id is null or public.is_workspace_member(workspace_id));drop policy if exists "auditors read audit logs" on public.audit_logs;


create policy "auditors read audit logs"
on public.audit_logs for select
to authenticated
using (workspace_id is not null and public.has_workspace_permission(workspace_id, 'audit.read'));drop policy if exists "members read projects" on public.projects;


create policy "members read projects"
on public.projects for select
to authenticated
using (public.is_workspace_member(workspace_id));drop policy if exists "project creators create projects" on public.projects;


create policy "project creators create projects"
on public.projects for insert
to authenticated
with check (public.has_workspace_permission(workspace_id, 'projects.create'));drop policy if exists "project editors update projects" on public.projects;


create policy "project editors update projects"
on public.projects for update
to authenticated
using (public.has_workspace_permission(workspace_id, 'projects.update'))
with check (public.has_workspace_permission(workspace_id, 'projects.update'));drop policy if exists "project editors delete projects" on public.projects;


create policy "project editors delete projects"
on public.projects for delete
to authenticated
using (public.has_workspace_permission(workspace_id, 'projects.update'));drop policy if exists "members read niches" on public.niches;


create policy "members read niches"
on public.niches for select
to authenticated
using (workspace_id is null or public.is_workspace_member(workspace_id));drop policy if exists "library managers write niches" on public.niches;


create policy "library managers write niches"
on public.niches for all
to authenticated
using (workspace_id is not null and public.has_workspace_permission(workspace_id, 'library.manage'))
with check (workspace_id is not null and public.has_workspace_permission(workspace_id, 'library.manage'));drop policy if exists "members read personas" on public.personas;


create policy "members read personas"
on public.personas for select
to authenticated
using (public.is_workspace_member(workspace_id));drop policy if exists "content creators write personas" on public.personas;


create policy "content creators write personas"
on public.personas for all
to authenticated
using (public.has_workspace_permission(workspace_id, 'content.create'))
with check (public.has_workspace_permission(workspace_id, 'content.create'));drop policy if exists "members read keywords" on public.keywords;


create policy "members read keywords"
on public.keywords for select
to authenticated
using (public.is_workspace_member(workspace_id));drop policy if exists "library managers write keywords" on public.keywords;


create policy "library managers write keywords"
on public.keywords for all
to authenticated
using (public.has_workspace_permission(workspace_id, 'library.manage'))
with check (public.has_workspace_permission(workspace_id, 'library.manage'));drop policy if exists "members read tags" on public.tags;


create policy "members read tags"
on public.tags for select
to authenticated
using (public.is_workspace_member(workspace_id));drop policy if exists "library managers write tags" on public.tags;


create policy "library managers write tags"
on public.tags for all
to authenticated
using (public.has_workspace_permission(workspace_id, 'library.manage'))
with check (public.has_workspace_permission(workspace_id, 'library.manage'));drop policy if exists "members read content folders" on public.content_folders;


create policy "members read content folders"
on public.content_folders for select
to authenticated
using (public.is_workspace_member(workspace_id));drop policy if exists "library managers write content folders" on public.content_folders;


create policy "library managers write content folders"
on public.content_folders for all
to authenticated
using (public.has_workspace_permission(workspace_id, 'library.manage'))
with check (public.has_workspace_permission(workspace_id, 'library.manage'));drop policy if exists "members read content items" on public.content_items;


create policy "members read content items"
on public.content_items for select
to authenticated
using (public.is_workspace_member(workspace_id));drop policy if exists "content creators create content items" on public.content_items;


create policy "content creators create content items"
on public.content_items for insert
to authenticated
with check (public.has_workspace_permission(workspace_id, 'content.create'));drop policy if exists "content creators update content items" on public.content_items;


create policy "content creators update content items"
on public.content_items for update
to authenticated
using (public.has_workspace_permission(workspace_id, 'content.create'))
with check (public.has_workspace_permission(workspace_id, 'content.create'));drop policy if exists "content creators delete content items" on public.content_items;


create policy "content creators delete content items"
on public.content_items for delete
to authenticated
using (public.has_workspace_permission(workspace_id, 'content.create'));drop policy if exists "members read content tags" on public.content_item_tags;


create policy "members read content tags"
on public.content_item_tags for select
to authenticated
using (public.is_workspace_member(workspace_id));drop policy if exists "library managers write content tags" on public.content_item_tags;


create policy "library managers write content tags"
on public.content_item_tags for all
to authenticated
using (public.has_workspace_permission(workspace_id, 'library.manage'))
with check (public.has_workspace_permission(workspace_id, 'library.manage'));drop policy if exists "users read own favorites" on public.favorites;


create policy "users read own favorites"
on public.favorites for select
to authenticated
using (public.is_workspace_member(workspace_id) and user_id = auth.uid());drop policy if exists "users write own favorites" on public.favorites;


create policy "users write own favorites"
on public.favorites for all
to authenticated
using (public.is_workspace_member(workspace_id) and user_id = auth.uid())
with check (public.is_workspace_member(workspace_id) and user_id = auth.uid());drop policy if exists "members read trends" on public.trends;


create policy "members read trends"
on public.trends for select
to authenticated
using (public.is_workspace_member(workspace_id) and deleted_at is null);drop policy if exists "library managers write trends" on public.trends;


create policy "library managers write trends"
on public.trends for all
to authenticated
using (public.has_workspace_permission(workspace_id, 'library.manage'))
with check (public.has_workspace_permission(workspace_id, 'library.manage'));drop policy if exists "members read competitors" on public.competitors;


create policy "members read competitors"
on public.competitors for select
to authenticated
using (public.is_workspace_member(workspace_id) and deleted_at is null);drop policy if exists "library managers write competitors" on public.competitors;


create policy "library managers write competitors"
on public.competitors for all
to authenticated
using (public.has_workspace_permission(workspace_id, 'library.manage'))
with check (public.has_workspace_permission(workspace_id, 'library.manage'));drop policy if exists "members read competitor insights" on public.competitor_insights;


create policy "members read competitor insights"
on public.competitor_insights for select
to authenticated
using (public.is_workspace_member(workspace_id));drop policy if exists "library managers write competitor insights" on public.competitor_insights;


create policy "library managers write competitor insights"
on public.competitor_insights for all
to authenticated
using (public.has_workspace_permission(workspace_id, 'library.manage'))
with check (public.has_workspace_permission(workspace_id, 'library.manage'));drop policy if exists "members read content ideas" on public.content_ideas;


create policy "members read content ideas"
on public.content_ideas for select
to authenticated
using (public.is_workspace_member(workspace_id) and deleted_at is null);drop policy if exists "content creators write content ideas" on public.content_ideas;


create policy "content creators write content ideas"
on public.content_ideas for all
to authenticated
using (public.has_workspace_permission(workspace_id, 'content.create'))
with check (public.has_workspace_permission(workspace_id, 'content.create'));drop policy if exists "members read idea scores" on public.idea_scores;


create policy "members read idea scores"
on public.idea_scores for select
to authenticated
using (public.is_workspace_member(workspace_id));drop policy if exists "content creators write idea scores" on public.idea_scores;


create policy "content creators write idea scores"
on public.idea_scores for all
to authenticated
using (public.has_workspace_permission(workspace_id, 'content.create'))
with check (public.has_workspace_permission(workspace_id, 'content.create'));drop policy if exists "members read idea sources" on public.idea_sources;


create policy "members read idea sources"
on public.idea_sources for select
to authenticated
using (public.is_workspace_member(workspace_id));drop policy if exists "content creators write idea sources" on public.idea_sources;


create policy "content creators write idea sources"
on public.idea_sources for all
to authenticated
using (public.has_workspace_permission(workspace_id, 'content.create'))
with check (public.has_workspace_permission(workspace_id, 'content.create'));drop policy if exists "members read idea events" on public.idea_events;


create policy "members read idea events"
on public.idea_events for select
to authenticated
using (public.is_workspace_member(workspace_id));drop policy if exists "content creators create idea events" on public.idea_events;


create policy "content creators create idea events"
on public.idea_events for insert
to authenticated
with check (public.has_workspace_permission(workspace_id, 'content.create'));drop policy if exists "members read ai providers" on public.ai_providers;


create policy "members read ai providers"
on public.ai_providers for select
to authenticated
using (public.is_workspace_member(workspace_id));drop policy if exists "workspace managers write ai providers" on public.ai_providers;


create policy "workspace managers write ai providers"
on public.ai_providers for all
to authenticated
using (public.has_workspace_permission(workspace_id, 'workspace.manage'))
with check (public.has_workspace_permission(workspace_id, 'workspace.manage'));drop policy if exists "members read prompt templates" on public.prompt_templates;


create policy "members read prompt templates"
on public.prompt_templates for select
to authenticated
using (public.is_workspace_member(workspace_id));drop policy if exists "content creators write prompt templates" on public.prompt_templates;


create policy "content creators write prompt templates"
on public.prompt_templates for all
to authenticated
using (public.has_workspace_permission(workspace_id, 'content.create'))
with check (public.has_workspace_permission(workspace_id, 'content.create'));drop policy if exists "members read ai generations" on public.ai_generations;


create policy "members read ai generations"
on public.ai_generations for select
to authenticated
using (public.is_workspace_member(workspace_id));drop policy if exists "content creators write ai generations" on public.ai_generations;


create policy "content creators write ai generations"
on public.ai_generations for all
to authenticated
using (public.has_workspace_permission(workspace_id, 'content.create'))
with check (public.has_workspace_permission(workspace_id, 'content.create'));drop policy if exists "members read ai generation jobs" on public.ai_generation_jobs;


create policy "members read ai generation jobs"
on public.ai_generation_jobs for select
to authenticated
using (public.is_workspace_member(workspace_id));drop policy if exists "content creators write ai generation jobs" on public.ai_generation_jobs;


create policy "content creators write ai generation jobs"
on public.ai_generation_jobs for all
to authenticated
using (public.has_workspace_permission(workspace_id, 'content.create'))
with check (public.has_workspace_permission(workspace_id, 'content.create'));drop policy if exists "members read ai agents" on public.ai_agents;


create policy "members read ai agents"
on public.ai_agents for select
to authenticated
using (public.is_workspace_member(workspace_id));drop policy if exists "content creators write ai agents" on public.ai_agents;


create policy "content creators write ai agents"
on public.ai_agents for all
to authenticated
using (public.has_workspace_permission(workspace_id, 'content.create'))
with check (public.has_workspace_permission(workspace_id, 'content.create'));drop policy if exists "members read playground messages" on public.playground_messages;


create policy "members read playground messages"
on public.playground_messages for select
to authenticated
using (public.is_workspace_member(workspace_id));drop policy if exists "content creators write playground messages" on public.playground_messages;


create policy "content creators write playground messages"
on public.playground_messages for all
to authenticated
using (public.has_workspace_permission(workspace_id, 'content.create'))
with check (public.has_workspace_permission(workspace_id, 'content.create'));drop policy if exists "members read ai credit usage" on public.ai_credit_usage;


create policy "members read ai credit usage"
on public.ai_credit_usage for select
to authenticated
using (public.is_workspace_member(workspace_id));drop policy if exists "content creators write ai credit usage" on public.ai_credit_usage;


create policy "content creators write ai credit usage"
on public.ai_credit_usage for all
to authenticated
using (public.has_workspace_permission(workspace_id, 'content.create'))
with check (public.has_workspace_permission(workspace_id, 'content.create'));drop policy if exists "members read voice providers" on public.voice_providers;


create policy "members read voice providers" on public.voice_providers for select to authenticated using (public.is_workspace_member(workspace_id));drop policy if exists "workspace managers write voice providers" on public.voice_providers;

create policy "workspace managers write voice providers" on public.voice_providers for all to authenticated using (public.has_workspace_permission(workspace_id, 'workspace.manage')) with check (public.has_workspace_permission(workspace_id, 'workspace.manage'));drop policy if exists "members read voices" on public.voices;


create policy "members read voices" on public.voices for select to authenticated using (public.is_workspace_member(workspace_id));drop policy if exists "library managers write voices" on public.voices;

create policy "library managers write voices" on public.voices for all to authenticated using (public.has_workspace_permission(workspace_id, 'library.manage')) with check (public.has_workspace_permission(workspace_id, 'library.manage'));drop policy if exists "members read audio generations" on public.audio_generations;


create policy "members read audio generations" on public.audio_generations for select to authenticated using (public.is_workspace_member(workspace_id));drop policy if exists "content creators write audio generations" on public.audio_generations;

create policy "content creators write audio generations" on public.audio_generations for all to authenticated using (public.has_workspace_permission(workspace_id, 'content.create')) with check (public.has_workspace_permission(workspace_id, 'content.create'));drop policy if exists "members read image providers" on public.image_providers;


create policy "members read image providers" on public.image_providers for select to authenticated using (public.is_workspace_member(workspace_id));drop policy if exists "workspace managers write image providers" on public.image_providers;

create policy "workspace managers write image providers" on public.image_providers for all to authenticated using (public.has_workspace_permission(workspace_id, 'workspace.manage')) with check (public.has_workspace_permission(workspace_id, 'workspace.manage'));drop policy if exists "members read image generations" on public.image_generations;


create policy "members read image generations" on public.image_generations for select to authenticated using (public.is_workspace_member(workspace_id));drop policy if exists "content creators write image generations" on public.image_generations;

create policy "content creators write image generations" on public.image_generations for all to authenticated using (public.has_workspace_permission(workspace_id, 'content.create')) with check (public.has_workspace_permission(workspace_id, 'content.create'));drop policy if exists "members read media assets" on public.media_assets;


create policy "members read media assets" on public.media_assets for select to authenticated using (public.is_workspace_member(workspace_id));drop policy if exists "library managers write media assets" on public.media_assets;

create policy "library managers write media assets" on public.media_assets for all to authenticated using (public.has_workspace_permission(workspace_id, 'library.manage')) with check (public.has_workspace_permission(workspace_id, 'library.manage'));drop policy if exists "members read video projects" on public.video_projects;


create policy "members read video projects" on public.video_projects for select to authenticated using (public.is_workspace_member(workspace_id));drop policy if exists "content creators write video projects" on public.video_projects;

create policy "content creators write video projects" on public.video_projects for all to authenticated using (public.has_workspace_permission(workspace_id, 'content.create')) with check (public.has_workspace_permission(workspace_id, 'content.create'));drop policy if exists "members read video scenes" on public.video_scenes;


create policy "members read video scenes" on public.video_scenes for select to authenticated using (public.is_workspace_member(workspace_id));drop policy if exists "content creators write video scenes" on public.video_scenes;

create policy "content creators write video scenes" on public.video_scenes for all to authenticated using (public.has_workspace_permission(workspace_id, 'content.create')) with check (public.has_workspace_permission(workspace_id, 'content.create'));drop policy if exists "members read subtitle segments" on public.subtitle_segments;


create policy "members read subtitle segments" on public.subtitle_segments for select to authenticated using (public.is_workspace_member(workspace_id));drop policy if exists "content creators write subtitle segments" on public.subtitle_segments;

create policy "content creators write subtitle segments" on public.subtitle_segments for all to authenticated using (public.has_workspace_permission(workspace_id, 'content.create')) with check (public.has_workspace_permission(workspace_id, 'content.create'));drop policy if exists "members read music tracks" on public.music_tracks;


create policy "members read music tracks" on public.music_tracks for select to authenticated using (public.is_workspace_member(workspace_id));drop policy if exists "library managers write music tracks" on public.music_tracks;

create policy "library managers write music tracks" on public.music_tracks for all to authenticated using (public.has_workspace_permission(workspace_id, 'library.manage')) with check (public.has_workspace_permission(workspace_id, 'library.manage'));drop policy if exists "members read video renders" on public.video_renders;


create policy "members read video renders" on public.video_renders for select to authenticated using (public.is_workspace_member(workspace_id));drop policy if exists "content creators write video renders" on public.video_renders;

create policy "content creators write video renders" on public.video_renders for all to authenticated using (public.has_workspace_permission(workspace_id, 'content.create')) with check (public.has_workspace_permission(workspace_id, 'content.create'));drop policy if exists "members read media usage logs" on public.media_usage_logs;


create policy "members read media usage logs" on public.media_usage_logs for select to authenticated using (public.is_workspace_member(workspace_id));drop policy if exists "content creators write media usage logs" on public.media_usage_logs;

create policy "content creators write media usage logs" on public.media_usage_logs for all to authenticated using (public.has_workspace_permission(workspace_id, 'content.create')) with check (public.has_workspace_permission(workspace_id, 'content.create'));drop policy if exists "members read visual style presets" on public.visual_style_presets;


create policy "members read visual style presets" on public.visual_style_presets for select to authenticated using (public.is_workspace_member(workspace_id));drop policy if exists "library managers write visual style presets" on public.visual_style_presets;

create policy "library managers write visual style presets" on public.visual_style_presets for all to authenticated using (public.has_workspace_permission(workspace_id, 'library.manage')) with check (public.has_workspace_permission(workspace_id, 'library.manage'));drop policy if exists "members read video effects" on public.video_effects;


create policy "members read video effects" on public.video_effects for select to authenticated using (public.is_workspace_member(workspace_id));drop policy if exists "content creators write video effects" on public.video_effects;

create policy "content creators write video effects" on public.video_effects for all to authenticated using (public.has_workspace_permission(workspace_id, 'content.create')) with check (public.has_workspace_permission(workspace_id, 'content.create'));drop policy if exists "members read video ai providers" on public.video_ai_providers;


create policy "members read video ai providers" on public.video_ai_providers for select to authenticated using (public.is_workspace_member(workspace_id));drop policy if exists "workspace managers write video ai providers" on public.video_ai_providers;

create policy "workspace managers write video ai providers" on public.video_ai_providers for all to authenticated using (public.has_workspace_permission(workspace_id, 'workspace.manage')) with check (public.has_workspace_permission(workspace_id, 'workspace.manage'));drop policy if exists "members read image animations" on public.image_animations;


create policy "members read image animations" on public.image_animations for select to authenticated using (public.is_workspace_member(workspace_id));drop policy if exists "content creators write image animations" on public.image_animations;

create policy "content creators write image animations" on public.image_animations for all to authenticated using (public.has_workspace_permission(workspace_id, 'content.create')) with check (public.has_workspace_permission(workspace_id, 'content.create'));drop policy if exists "members read subtitle styles" on public.subtitle_styles;


create policy "members read subtitle styles" on public.subtitle_styles for select to authenticated using (public.is_workspace_member(workspace_id));drop policy if exists "library managers write subtitle styles" on public.subtitle_styles;

create policy "library managers write subtitle styles" on public.subtitle_styles for all to authenticated using (public.has_workspace_permission(workspace_id, 'library.manage')) with check (public.has_workspace_permission(workspace_id, 'library.manage'));drop policy if exists "members read audio settings" on public.audio_settings;


create policy "members read audio settings" on public.audio_settings for select to authenticated using (public.is_workspace_member(workspace_id));drop policy if exists "content creators write audio settings" on public.audio_settings;

create policy "content creators write audio settings" on public.audio_settings for all to authenticated using (public.has_workspace_permission(workspace_id, 'content.create')) with check (public.has_workspace_permission(workspace_id, 'content.create'));drop policy if exists "members read thumbnail generations" on public.thumbnail_generations;


create policy "members read thumbnail generations" on public.thumbnail_generations for select to authenticated using (public.is_workspace_member(workspace_id));drop policy if exists "content creators write thumbnail generations" on public.thumbnail_generations;

create policy "content creators write thumbnail generations" on public.thumbnail_generations for all to authenticated using (public.has_workspace_permission(workspace_id, 'content.create')) with check (public.has_workspace_permission(workspace_id, 'content.create'));drop policy if exists "members read video versions" on public.video_versions;


create policy "members read video versions" on public.video_versions for select to authenticated using (public.is_workspace_member(workspace_id));drop policy if exists "content creators write video versions" on public.video_versions;

create policy "content creators write video versions" on public.video_versions for all to authenticated using (public.has_workspace_permission(workspace_id, 'content.create')) with check (public.has_workspace_permission(workspace_id, 'content.create'));drop policy if exists "members read magic templates" on public.magic_templates;


create policy "members read magic templates" on public.magic_templates for select to authenticated using (public.is_workspace_member(workspace_id));drop policy if exists "content creators write magic templates" on public.magic_templates;

create policy "content creators write magic templates" on public.magic_templates for all to authenticated using (public.has_workspace_permission(workspace_id, 'content.create')) with check (public.has_workspace_permission(workspace_id, 'content.create'));drop policy if exists "members read magic video jobs" on public.magic_video_jobs;


create policy "members read magic video jobs" on public.magic_video_jobs for select to authenticated using (public.is_workspace_member(workspace_id));drop policy if exists "content creators write magic video jobs" on public.magic_video_jobs;

create policy "content creators write magic video jobs" on public.magic_video_jobs for all to authenticated using (public.has_workspace_permission(workspace_id, 'content.create')) with check (public.has_workspace_permission(workspace_id, 'content.create'));drop policy if exists "members read source videos" on public.source_videos;


create policy "members read source videos" on public.source_videos for select to authenticated using (public.is_workspace_member(workspace_id));drop policy if exists "content creators write source videos" on public.source_videos;

create policy "content creators write source videos" on public.source_videos for all to authenticated using (public.has_workspace_permission(workspace_id, 'content.create')) with check (public.has_workspace_permission(workspace_id, 'content.create'));drop policy if exists "members read video transcripts" on public.video_transcripts;


create policy "members read video transcripts" on public.video_transcripts for select to authenticated using (public.is_workspace_member(workspace_id));drop policy if exists "content creators write video transcripts" on public.video_transcripts;

create policy "content creators write video transcripts" on public.video_transcripts for all to authenticated using (public.has_workspace_permission(workspace_id, 'content.create')) with check (public.has_workspace_permission(workspace_id, 'content.create'));drop policy if exists "members read viral clip jobs" on public.viral_clip_jobs;


create policy "members read viral clip jobs" on public.viral_clip_jobs for select to authenticated using (public.is_workspace_member(workspace_id));drop policy if exists "content creators write viral clip jobs" on public.viral_clip_jobs;

create policy "content creators write viral clip jobs" on public.viral_clip_jobs for all to authenticated using (public.has_workspace_permission(workspace_id, 'content.create')) with check (public.has_workspace_permission(workspace_id, 'content.create'));drop policy if exists "members read viral moments" on public.viral_moments;


create policy "members read viral moments" on public.viral_moments for select to authenticated using (public.is_workspace_member(workspace_id));drop policy if exists "content creators write viral moments" on public.viral_moments;

create policy "content creators write viral moments" on public.viral_moments for all to authenticated using (public.has_workspace_permission(workspace_id, 'content.create')) with check (public.has_workspace_permission(workspace_id, 'content.create'));drop policy if exists "members read viral clips" on public.viral_clips;


create policy "members read viral clips" on public.viral_clips for select to authenticated using (public.is_workspace_member(workspace_id));drop policy if exists "content creators write viral clips" on public.viral_clips;

create policy "content creators write viral clips" on public.viral_clips for all to authenticated using (public.has_workspace_permission(workspace_id, 'content.create')) with check (public.has_workspace_permission(workspace_id, 'content.create'));drop policy if exists "members read channels" on public.channels;


create policy "members read channels" on public.channels for select to authenticated using (public.is_workspace_member(workspace_id));drop policy if exists "content creators write channels" on public.channels;

create policy "content creators write channels" on public.channels for all to authenticated using (public.has_workspace_permission(workspace_id, 'content.create')) with check (public.has_workspace_permission(workspace_id, 'content.create'));drop policy if exists "members read channel templates" on public.channel_templates;


create policy "members read channel templates" on public.channel_templates for select to authenticated using (public.is_workspace_member(workspace_id));drop policy if exists "content creators write channel templates" on public.channel_templates;

create policy "content creators write channel templates" on public.channel_templates for all to authenticated using (public.has_workspace_permission(workspace_id, 'content.create')) with check (public.has_workspace_permission(workspace_id, 'content.create'));drop policy if exists "members read content calendar" on public.content_calendar;


create policy "members read content calendar" on public.content_calendar for select to authenticated using (public.is_workspace_member(workspace_id));drop policy if exists "content creators write content calendar" on public.content_calendar;

create policy "content creators write content calendar" on public.content_calendar for all to authenticated using (public.has_workspace_permission(workspace_id, 'content.create')) with check (public.has_workspace_permission(workspace_id, 'content.create'));drop policy if exists "members read production plans" on public.production_plans;


create policy "members read production plans" on public.production_plans for select to authenticated using (public.is_workspace_member(workspace_id));drop policy if exists "content creators write production plans" on public.production_plans;

create policy "content creators write production plans" on public.production_plans for all to authenticated using (public.has_workspace_permission(workspace_id, 'content.create')) with check (public.has_workspace_permission(workspace_id, 'content.create'));drop policy if exists "members read bulk jobs" on public.bulk_jobs;


create policy "members read bulk jobs" on public.bulk_jobs for select to authenticated using (public.is_workspace_member(workspace_id));drop policy if exists "content creators write bulk jobs" on public.bulk_jobs;

create policy "content creators write bulk jobs" on public.bulk_jobs for all to authenticated using (public.has_workspace_permission(workspace_id, 'content.create')) with check (public.has_workspace_permission(workspace_id, 'content.create'));drop policy if exists "members read channel goals" on public.channel_goals;


create policy "members read channel goals" on public.channel_goals for select to authenticated using (public.is_workspace_member(workspace_id));drop policy if exists "content creators write channel goals" on public.channel_goals;

create policy "content creators write channel goals" on public.channel_goals for all to authenticated using (public.has_workspace_permission(workspace_id, 'content.create')) with check (public.has_workspace_permission(workspace_id, 'content.create'));drop policy if exists "members read channel permissions" on public.channel_permissions;


create policy "members read channel permissions" on public.channel_permissions for select to authenticated using (public.is_workspace_member(workspace_id));drop policy if exists "workspace managers write channel permissions" on public.channel_permissions;

create policy "workspace managers write channel permissions" on public.channel_permissions for all to authenticated using (public.has_workspace_permission(workspace_id, 'workspace.manage')) with check (public.has_workspace_permission(workspace_id, 'workspace.manage'));drop policy if exists "members read operation notifications" on public.operation_notifications;


create policy "members read operation notifications" on public.operation_notifications for select to authenticated using (public.is_workspace_member(workspace_id));drop policy if exists "content creators write operation notifications" on public.operation_notifications;

create policy "content creators write operation notifications" on public.operation_notifications for all to authenticated using (public.has_workspace_permission(workspace_id, 'content.create')) with check (public.has_workspace_permission(workspace_id, 'content.create'));drop policy if exists "members read ai video providers" on public.ai_video_providers;


create policy "members read ai video providers" on public.ai_video_providers for select to authenticated using (public.is_workspace_member(workspace_id));drop policy if exists "workspace managers write ai video providers" on public.ai_video_providers;

create policy "workspace managers write ai video providers" on public.ai_video_providers for all to authenticated using (public.has_workspace_permission(workspace_id, 'workspace.manage')) with check (public.has_workspace_permission(workspace_id, 'workspace.manage'));drop policy if exists "members read image to video jobs" on public.image_to_video_jobs;


create policy "members read image to video jobs" on public.image_to_video_jobs for select to authenticated using (public.is_workspace_member(workspace_id));drop policy if exists "content creators write image to video jobs" on public.image_to_video_jobs;

create policy "content creators write image to video jobs" on public.image_to_video_jobs for all to authenticated using (public.has_workspace_permission(workspace_id, 'content.create')) with check (public.has_workspace_permission(workspace_id, 'content.create'));drop policy if exists "members read text to video jobs" on public.text_to_video_jobs;


create policy "members read text to video jobs" on public.text_to_video_jobs for select to authenticated using (public.is_workspace_member(workspace_id));drop policy if exists "content creators write text to video jobs" on public.text_to_video_jobs;

create policy "content creators write text to video jobs" on public.text_to_video_jobs for all to authenticated using (public.has_workspace_permission(workspace_id, 'content.create')) with check (public.has_workspace_permission(workspace_id, 'content.create'));drop policy if exists "members read intro outro generations" on public.intro_outro_generations;


create policy "members read intro outro generations" on public.intro_outro_generations for select to authenticated using (public.is_workspace_member(workspace_id));drop policy if exists "content creators write intro outro generations" on public.intro_outro_generations;

create policy "content creators write intro outro generations" on public.intro_outro_generations for all to authenticated using (public.has_workspace_permission(workspace_id, 'content.create')) with check (public.has_workspace_permission(workspace_id, 'content.create'));drop policy if exists "members read talking character jobs" on public.talking_character_jobs;


create policy "members read talking character jobs" on public.talking_character_jobs for select to authenticated using (public.is_workspace_member(workspace_id));drop policy if exists "content creators write talking character jobs" on public.talking_character_jobs;

create policy "content creators write talking character jobs" on public.talking_character_jobs for all to authenticated using (public.has_workspace_permission(workspace_id, 'content.create')) with check (public.has_workspace_permission(workspace_id, 'content.create'));drop policy if exists "members read ai video assets" on public.ai_video_assets;


create policy "members read ai video assets" on public.ai_video_assets for select to authenticated using (public.is_workspace_member(workspace_id));drop policy if exists "content creators write ai video assets" on public.ai_video_assets;

create policy "content creators write ai video assets" on public.ai_video_assets for all to authenticated using (public.has_workspace_permission(workspace_id, 'content.create')) with check (public.has_workspace_permission(workspace_id, 'content.create'));drop policy if exists "authenticated read active plans" on public.plans;


create policy "authenticated read active plans" on public.plans for select to authenticated using (status = 'active' or public.is_platform_admin());drop policy if exists "platform admins manage plans" on public.plans;

create policy "platform admins manage plans" on public.plans for all to authenticated using (public.is_platform_admin('finance')) with check (public.is_platform_admin('finance'));drop policy if exists "authenticated read active credit packages" on public.credit_packages;


create policy "authenticated read active credit packages" on public.credit_packages for select to authenticated using (status = 'active' or public.is_platform_admin('finance'));drop policy if exists "platform admins manage credit packages" on public.credit_packages;

create policy "platform admins manage credit packages" on public.credit_packages for all to authenticated using (public.is_platform_admin('finance')) with check (public.is_platform_admin('finance'));drop policy if exists "members read subscriptions" on public.subscriptions;


create policy "members read subscriptions" on public.subscriptions for select to authenticated using (public.is_workspace_member(workspace_id) or public.is_platform_admin('support'));drop policy if exists "billing managers write subscriptions" on public.subscriptions;

create policy "billing managers write subscriptions" on public.subscriptions for all to authenticated using (public.has_workspace_permission(workspace_id, 'billing.manage') or public.is_platform_admin('finance')) with check (public.has_workspace_permission(workspace_id, 'billing.manage') or public.is_platform_admin('finance'));drop policy if exists "members read credit wallets" on public.credit_wallets;


create policy "members read credit wallets" on public.credit_wallets for select to authenticated using (public.is_workspace_member(workspace_id) or public.is_platform_admin('support'));drop policy if exists "billing managers write credit wallets" on public.credit_wallets;

create policy "billing managers write credit wallets" on public.credit_wallets for all to authenticated using (public.has_workspace_permission(workspace_id, 'billing.manage') or public.is_platform_admin('finance')) with check (public.has_workspace_permission(workspace_id, 'billing.manage') or public.is_platform_admin('finance'));drop policy if exists "members read credit transactions" on public.credit_transactions;


create policy "members read credit transactions" on public.credit_transactions for select to authenticated using (public.is_workspace_member(workspace_id) or public.is_platform_admin('support'));drop policy if exists "billing managers write credit transactions" on public.credit_transactions;

create policy "billing managers write credit transactions" on public.credit_transactions for all to authenticated using (public.has_workspace_permission(workspace_id, 'billing.manage') or public.has_workspace_permission(workspace_id, 'content.create') or public.is_platform_admin('finance')) with check (public.has_workspace_permission(workspace_id, 'billing.manage') or public.has_workspace_permission(workspace_id, 'content.create') or public.is_platform_admin('finance'));drop policy if exists "members read billing events" on public.billing_events;


create policy "members read billing events" on public.billing_events for select to authenticated using ((workspace_id is not null and public.is_workspace_member(workspace_id)) or public.is_platform_admin('support'));drop policy if exists "billing managers write billing events" on public.billing_events;

create policy "billing managers write billing events" on public.billing_events for all to authenticated using ((workspace_id is not null and public.has_workspace_permission(workspace_id, 'billing.manage')) or public.is_platform_admin('finance')) with check ((workspace_id is not null and public.has_workspace_permission(workspace_id, 'billing.manage')) or public.is_platform_admin('finance'));drop policy if exists "members read invoices" on public.invoices;


create policy "members read invoices" on public.invoices for select to authenticated using (public.is_workspace_member(workspace_id) or public.is_platform_admin('finance'));drop policy if exists "billing managers write invoices" on public.invoices;

create policy "billing managers write invoices" on public.invoices for all to authenticated using (public.has_workspace_permission(workspace_id, 'billing.manage') or public.is_platform_admin('finance')) with check (public.has_workspace_permission(workspace_id, 'billing.manage') or public.is_platform_admin('finance'));drop policy if exists "platform admins read admin registry" on public.platform_admins;


create policy "platform admins read admin registry" on public.platform_admins for select to authenticated using (user_id = auth.uid() or public.is_platform_admin('support'));drop policy if exists "platform owners manage admin registry" on public.platform_admins;

create policy "platform owners manage admin registry" on public.platform_admins for all to authenticated using (public.is_platform_admin('owner')) with check (public.is_platform_admin('owner'));drop policy if exists "members read feature flags" on public.feature_flags;


create policy "members read feature flags" on public.feature_flags for select to authenticated using ((workspace_id is null) or public.is_workspace_member(workspace_id) or public.is_platform_admin('support'));drop policy if exists "billing managers write feature flags" on public.feature_flags;

create policy "billing managers write feature flags" on public.feature_flags for all to authenticated using ((workspace_id is not null and public.has_workspace_permission(workspace_id, 'billing.manage')) or public.is_platform_admin('support')) with check ((workspace_id is not null and public.has_workspace_permission(workspace_id, 'billing.manage')) or public.is_platform_admin('support'));drop policy if exists "members read export packages" on public.export_packages;


create policy "members read export packages" on public.export_packages for select to authenticated using (public.is_workspace_member(workspace_id));drop policy if exists "export users write export packages" on public.export_packages;

create policy "export users write export packages" on public.export_packages for all to authenticated using (public.has_workspace_permission(workspace_id, 'export_video')) with check (public.has_workspace_permission(workspace_id, 'export_video'));drop policy if exists "members read video metadata" on public.video_metadata;


create policy "members read video metadata" on public.video_metadata for select to authenticated using (public.is_workspace_member(workspace_id));drop policy if exists "metadata editors write video metadata" on public.video_metadata;

create policy "metadata editors write video metadata" on public.video_metadata for all to authenticated using (public.has_workspace_permission(workspace_id, 'edit_metadata')) with check (public.has_workspace_permission(workspace_id, 'edit_metadata'));drop policy if exists "members read bulk export jobs" on public.bulk_export_jobs;


create policy "members read bulk export jobs" on public.bulk_export_jobs for select to authenticated using (public.is_workspace_member(workspace_id));drop policy if exists "downloaders write bulk export jobs" on public.bulk_export_jobs;

create policy "downloaders write bulk export jobs" on public.bulk_export_jobs for all to authenticated using (public.has_workspace_permission(workspace_id, 'download_package')) with check (public.has_workspace_permission(workspace_id, 'download_package'));drop policy if exists "members read manual publications" on public.manual_publications;


create policy "members read manual publications" on public.manual_publications for select to authenticated using (public.is_workspace_member(workspace_id));drop policy if exists "publish markers write manual publications" on public.manual_publications;

create policy "publish markers write manual publications" on public.manual_publications for all to authenticated using (public.has_workspace_permission(workspace_id, 'mark_as_published')) with check (public.has_workspace_permission(workspace_id, 'mark_as_published'));drop policy if exists "members read asset sources" on public.asset_sources;


create policy "members read asset sources" on public.asset_sources for select to authenticated using (public.is_workspace_member(workspace_id));drop policy if exists "asset managers write asset sources" on public.asset_sources;

create policy "asset managers write asset sources" on public.asset_sources for all to authenticated using (public.has_workspace_permission(workspace_id, 'import_external_asset')) with check (public.has_workspace_permission(workspace_id, 'import_external_asset'));drop policy if exists "members read assets" on public.assets;


create policy "members read assets" on public.assets for select to authenticated using (public.is_workspace_member(workspace_id));drop policy if exists "asset uploaders write assets" on public.assets;

create policy "asset uploaders write assets" on public.assets for insert to authenticated with check (public.has_workspace_permission(workspace_id, 'upload_asset') or public.has_workspace_permission(workspace_id, 'import_external_asset'));drop policy if exists "asset editors update assets" on public.assets;

create policy "asset editors update assets" on public.assets for update to authenticated using (public.has_workspace_permission(workspace_id, 'edit_asset') or public.has_workspace_permission(workspace_id, 'favorite_asset')) with check (public.has_workspace_permission(workspace_id, 'edit_asset') or public.has_workspace_permission(workspace_id, 'favorite_asset'));drop policy if exists "asset deleters delete assets" on public.assets;

create policy "asset deleters delete assets" on public.assets for delete to authenticated using (public.has_workspace_permission(workspace_id, 'delete_asset'));drop policy if exists "members read asset collections" on public.asset_collections;


create policy "members read asset collections" on public.asset_collections for select to authenticated using (public.is_workspace_member(workspace_id));drop policy if exists "collection creators write asset collections" on public.asset_collections;

create policy "collection creators write asset collections" on public.asset_collections for all to authenticated using (public.has_workspace_permission(workspace_id, 'create_collection')) with check (public.has_workspace_permission(workspace_id, 'create_collection'));drop policy if exists "members read asset collection items" on public.asset_collection_items;


create policy "members read asset collection items" on public.asset_collection_items for select to authenticated using (public.is_workspace_member(workspace_id));drop policy if exists "collection creators write asset collection items" on public.asset_collection_items;

create policy "collection creators write asset collection items" on public.asset_collection_items for all to authenticated using (public.has_workspace_permission(workspace_id, 'create_collection')) with check (public.has_workspace_permission(workspace_id, 'create_collection'));drop policy if exists "members read asset usage" on public.asset_usage;


create policy "members read asset usage" on public.asset_usage for select to authenticated using (public.is_workspace_member(workspace_id));drop policy if exists "content creators write asset usage" on public.asset_usage;

create policy "content creators write asset usage" on public.asset_usage for all to authenticated using (public.has_workspace_permission(workspace_id, 'content.create')) with check (public.has_workspace_permission(workspace_id, 'content.create'));drop policy if exists "members read asset search cache" on public.asset_search_cache;


create policy "members read asset search cache" on public.asset_search_cache for select to authenticated using (public.is_workspace_member(workspace_id));drop policy if exists "importers write asset search cache" on public.asset_search_cache;

create policy "importers write asset search cache" on public.asset_search_cache for all to authenticated using (public.has_workspace_permission(workspace_id, 'import_external_asset')) with check (public.has_workspace_permission(workspace_id, 'import_external_asset'));drop policy if exists "members read premium templates" on public.premium_templates;


create policy "members read premium templates" on public.premium_templates for select to authenticated using (is_global or public.is_workspace_member(workspace_id));drop policy if exists "template creators insert premium templates" on public.premium_templates;

create policy "template creators insert premium templates" on public.premium_templates for insert to authenticated with check (workspace_id is not null and public.has_workspace_permission(workspace_id, 'create_template'));drop policy if exists "template editors update premium templates" on public.premium_templates;

create policy "template editors update premium templates" on public.premium_templates for update to authenticated using ((workspace_id is not null and public.has_workspace_permission(workspace_id, 'edit_template')) or public.is_platform_admin('support')) with check ((workspace_id is not null and public.has_workspace_permission(workspace_id, 'edit_template')) or public.is_platform_admin('support'));drop policy if exists "template deleters delete premium templates" on public.premium_templates;

create policy "template deleters delete premium templates" on public.premium_templates for delete to authenticated using ((workspace_id is not null and public.has_workspace_permission(workspace_id, 'delete_template')) or public.is_platform_admin('support'));drop policy if exists "members read template packs" on public.template_packs;


create policy "members read template packs" on public.template_packs for select to authenticated using (workspace_id is null or public.is_workspace_member(workspace_id));drop policy if exists "pack managers write template packs" on public.template_packs;

create policy "pack managers write template packs" on public.template_packs for all to authenticated using ((workspace_id is not null and public.has_workspace_permission(workspace_id, 'manage_template_packs')) or public.is_platform_admin('support')) with check ((workspace_id is not null and public.has_workspace_permission(workspace_id, 'manage_template_packs')) or public.is_platform_admin('support'));drop policy if exists "members read template pack items" on public.template_pack_items;


create policy "members read template pack items" on public.template_pack_items for select to authenticated using (workspace_id is null or public.is_workspace_member(workspace_id));drop policy if exists "pack managers write template pack items" on public.template_pack_items;

create policy "pack managers write template pack items" on public.template_pack_items for all to authenticated using ((workspace_id is not null and public.has_workspace_permission(workspace_id, 'manage_template_packs')) or public.is_platform_admin('support')) with check ((workspace_id is not null and public.has_workspace_permission(workspace_id, 'manage_template_packs')) or public.is_platform_admin('support'));drop policy if exists "members read onboarding progress" on public.onboarding_progress;


create policy "members read onboarding progress" on public.onboarding_progress for select to authenticated using (public.is_workspace_member(workspace_id) or public.is_platform_admin('support'));drop policy if exists "users write own onboarding progress" on public.onboarding_progress;

create policy "users write own onboarding progress" on public.onboarding_progress for all to authenticated using (user_id = auth.uid() and public.is_workspace_member(workspace_id)) with check (user_id = auth.uid() and public.is_workspace_member(workspace_id));drop policy if exists "members read onboarding events" on public.onboarding_events;


create policy "members read onboarding events" on public.onboarding_events for select to authenticated using (public.is_workspace_member(workspace_id) or public.is_platform_admin('support'));drop policy if exists "users write own onboarding events" on public.onboarding_events;

create policy "users write own onboarding events" on public.onboarding_events for insert to authenticated with check (user_id = auth.uid() and public.is_workspace_member(workspace_id));drop policy if exists "members read video quality scores" on public.video_quality_scores;


create policy "members read video quality scores" on public.video_quality_scores for select to authenticated using (public.is_workspace_member(workspace_id));drop policy if exists "content creators write video quality scores" on public.video_quality_scores;

create policy "content creators write video quality scores" on public.video_quality_scores for all to authenticated using (public.has_workspace_permission(workspace_id, 'content.create')) with check (public.has_workspace_permission(workspace_id, 'content.create'));drop policy if exists "members read video recommendations" on public.video_recommendations;


create policy "members read video recommendations" on public.video_recommendations for select to authenticated using (public.is_workspace_member(workspace_id));drop policy if exists "content creators write video recommendations" on public.video_recommendations;

create policy "content creators write video recommendations" on public.video_recommendations for all to authenticated using (public.has_workspace_permission(workspace_id, 'content.create')) with check (public.has_workspace_permission(workspace_id, 'content.create'));drop policy if exists "authenticated read trend topics" on public.trend_topics;


create policy "authenticated read trend topics" on public.trend_topics for select to authenticated using (true);drop policy if exists "content creators write trend topics" on public.trend_topics;

create policy "content creators write trend topics" on public.trend_topics for all to authenticated using (public.is_platform_admin('support')) with check (public.is_platform_admin('support'));drop policy if exists "members read idea bank" on public.idea_bank;


create policy "members read idea bank" on public.idea_bank for select to authenticated using (public.is_workspace_member(workspace_id));drop policy if exists "content creators write idea bank" on public.idea_bank;

create policy "content creators write idea bank" on public.idea_bank for all to authenticated using (public.has_workspace_permission(workspace_id, 'content.create')) with check (public.has_workspace_permission(workspace_id, 'content.create'));drop policy if exists "members read tracked channels" on public.tracked_channels;


create policy "members read tracked channels" on public.tracked_channels for select to authenticated using (public.is_workspace_member(workspace_id));drop policy if exists "content creators write tracked channels" on public.tracked_channels;

create policy "content creators write tracked channels" on public.tracked_channels for all to authenticated using (public.has_workspace_permission(workspace_id, 'content.create')) with check (public.has_workspace_permission(workspace_id, 'content.create'));drop policy if exists "members read content factories" on public.content_factories;


create policy "members read content factories" on public.content_factories for select to authenticated using (public.is_workspace_member(workspace_id));drop policy if exists "ai managers write content factories" on public.content_factories;

create policy "ai managers write content factories" on public.content_factories for all to authenticated using (public.has_workspace_permission(workspace_id, 'ai.manage')) with check (public.has_workspace_permission(workspace_id, 'ai.manage'));drop policy if exists "members read production rules" on public.production_rules;


create policy "members read production rules" on public.production_rules for select to authenticated using (
  exists (select 1 from public.content_factories cf where cf.id = production_rules.factory_id and public.is_workspace_member(cf.workspace_id))
);drop policy if exists "ai managers write production rules" on public.production_rules;

create policy "ai managers write production rules" on public.production_rules for all to authenticated using (
  exists (select 1 from public.content_factories cf where cf.id = production_rules.factory_id and public.has_workspace_permission(cf.workspace_id, 'ai.manage'))
) with check (
  exists (select 1 from public.content_factories cf where cf.id = production_rules.factory_id and public.has_workspace_permission(cf.workspace_id, 'ai.manage'))
);drop policy if exists "members read factory schedules" on public.factory_schedules;


create policy "members read factory schedules" on public.factory_schedules for select to authenticated using (
  exists (select 1 from public.content_factories cf where cf.id = factory_schedules.factory_id and public.is_workspace_member(cf.workspace_id))
);drop policy if exists "ai managers write factory schedules" on public.factory_schedules;

create policy "ai managers write factory schedules" on public.factory_schedules for all to authenticated using (
  exists (select 1 from public.content_factories cf where cf.id = factory_schedules.factory_id and public.has_workspace_permission(cf.workspace_id, 'ai.manage'))
) with check (
  exists (select 1 from public.content_factories cf where cf.id = factory_schedules.factory_id and public.has_workspace_permission(cf.workspace_id, 'ai.manage'))
);drop policy if exists "members read content series" on public.content_series;


create policy "members read content series" on public.content_series for select to authenticated using (public.is_workspace_member(workspace_id));drop policy if exists "content creators write content series" on public.content_series;

create policy "content creators write content series" on public.content_series for all to authenticated using (public.has_workspace_permission(workspace_id, 'content.create')) with check (public.has_workspace_permission(workspace_id, 'content.create'));drop policy if exists "members read factory queue jobs" on public.factory_queue_jobs;


create policy "members read factory queue jobs" on public.factory_queue_jobs for select to authenticated using (public.is_workspace_member(workspace_id));drop policy if exists "ai generators write factory queue jobs" on public.factory_queue_jobs;

create policy "ai generators write factory queue jobs" on public.factory_queue_jobs for all to authenticated using (public.has_workspace_permission(workspace_id, 'ai.generate')) with check (public.has_workspace_permission(workspace_id, 'ai.generate'));drop policy if exists "members read review queue items" on public.review_queue_items;


create policy "members read review queue items" on public.review_queue_items for select to authenticated using (public.is_workspace_member(workspace_id));drop policy if exists "content creators write review queue items" on public.review_queue_items;

create policy "content creators write review queue items" on public.review_queue_items for all to authenticated using (public.has_workspace_permission(workspace_id, 'content.create')) with check (public.has_workspace_permission(workspace_id, 'content.create'));drop policy if exists "members read factory alerts" on public.factory_alerts;


create policy "members read factory alerts" on public.factory_alerts for select to authenticated using (public.is_workspace_member(workspace_id));drop policy if exists "ai generators write factory alerts" on public.factory_alerts;

create policy "ai generators write factory alerts" on public.factory_alerts for all to authenticated using (public.has_workspace_permission(workspace_id, 'ai.generate')) with check (public.has_workspace_permission(workspace_id, 'ai.generate'));drop policy if exists "members read backup jobs" on public.backup_jobs;


create policy "members read backup jobs" on public.backup_jobs for select to authenticated using (public.is_workspace_member(workspace_id) or public.is_platform_admin('support'));drop policy if exists "workspace managers write backup jobs" on public.backup_jobs;

create policy "workspace managers write backup jobs" on public.backup_jobs for all to authenticated using (public.has_workspace_permission(workspace_id, 'workspace.manage') or public.is_platform_admin('support')) with check (public.has_workspace_permission(workspace_id, 'workspace.manage') or public.is_platform_admin('support'));drop policy if exists "members read data retention policies" on public.data_retention_policies;


create policy "members read data retention policies" on public.data_retention_policies for select to authenticated using (public.is_workspace_member(workspace_id));drop policy if exists "workspace managers write data retention policies" on public.data_retention_policies;

create policy "workspace managers write data retention policies" on public.data_retention_policies for all to authenticated using (public.has_workspace_permission(workspace_id, 'workspace.manage')) with check (public.has_workspace_permission(workspace_id, 'workspace.manage'));drop policy if exists "security readers read security events" on public.security_events;


create policy "security readers read security events" on public.security_events for select to authenticated using (public.has_workspace_permission(workspace_id, 'audit.read') or public.is_platform_admin('support'));drop policy if exists "platform writes security events" on public.security_events;

create policy "platform writes security events" on public.security_events for insert to authenticated with check (public.is_workspace_member(workspace_id) or public.is_platform_admin('support'));drop policy if exists "members read rate limits" on public.rate_limits;


create policy "members read rate limits" on public.rate_limits for select to authenticated using (public.is_workspace_member(workspace_id));drop policy if exists "workspace managers write rate limits" on public.rate_limits;

create policy "workspace managers write rate limits" on public.rate_limits for all to authenticated using (public.has_workspace_permission(workspace_id, 'workspace.manage')) with check (public.has_workspace_permission(workspace_id, 'workspace.manage'));drop policy if exists "security readers read error logs" on public.error_logs;


create policy "security readers read error logs" on public.error_logs for select to authenticated using (public.has_workspace_permission(workspace_id, 'audit.read') or public.is_platform_admin('support'));drop policy if exists "members insert error logs" on public.error_logs;

create policy "members insert error logs" on public.error_logs for insert to authenticated with check (public.is_workspace_member(workspace_id));drop policy if exists "security readers update error logs" on public.error_logs;

create policy "security readers update error logs" on public.error_logs for update to authenticated using (public.has_workspace_permission(workspace_id, 'audit.read') or public.is_platform_admin('support')) with check (public.has_workspace_permission(workspace_id, 'audit.read') or public.is_platform_admin('support'));drop policy if exists "users read own legal acceptances" on public.user_legal_acceptances;


create policy "users read own legal acceptances" on public.user_legal_acceptances for select to authenticated using (user_id = auth.uid());drop policy if exists "users insert own legal acceptances" on public.user_legal_acceptances;

create policy "users insert own legal acceptances" on public.user_legal_acceptances for insert to authenticated with check (user_id = auth.uid());drop policy if exists "members read data requests" on public.data_requests;


create policy "members read data requests" on public.data_requests for select to authenticated using (public.is_workspace_member(workspace_id) or user_id = auth.uid());drop policy if exists "members create data requests" on public.data_requests;

create policy "members create data requests" on public.data_requests for insert to authenticated with check (public.is_workspace_member(workspace_id) and (user_id is null or user_id = auth.uid()));drop policy if exists "workspace managers update data requests" on public.data_requests;

create policy "workspace managers update data requests" on public.data_requests for update to authenticated using (public.has_workspace_permission(workspace_id, 'workspace.manage') or public.is_platform_admin('support')) with check (public.has_workspace_permission(workspace_id, 'workspace.manage') or public.is_platform_admin('support'));drop policy if exists "members read smoke test video results" on public.smoke_test_video_results;


create policy "members read smoke test video results" on public.smoke_test_video_results for select to authenticated using (public.is_workspace_member(workspace_id) or public.is_platform_admin('support'));drop policy if exists "audit writers write smoke test video results" on public.smoke_test_video_results;

create policy "audit writers write smoke test video results" on public.smoke_test_video_results for all to authenticated using (public.has_workspace_permission(workspace_id, 'audit.read') or public.is_platform_admin('support')) with check (public.has_workspace_permission(workspace_id, 'audit.read') or public.is_platform_admin('support'));

insert into public.permissions (key, description) values
  ('workspace.manage', 'Manage workspace settings'),
  ('admin.manage', 'Manage platform integrations, API keys, webhooks, and administrative platform settings'),
  ('users.invite', 'Invite users'),
  ('users.remove', 'Remove users'),
  ('roles.manage', 'Manage roles and permissions'),
  ('projects.create', 'Create projects'),
  ('projects.update', 'Update projects'),
  ('content.create', 'Create content'),
  ('content.publish', 'Publish content'),
  ('library.manage', 'Manage library assets'),
  ('content.organize', 'Move, copy, duplicate, and archive content'),
  ('keywords.manage', 'Manage keyword libraries'),
  ('personas.manage', 'Manage project personas'),
  ('ai.generate', 'Run AI generations'),
  ('ai.manage', 'Manage AI providers, prompts, agents, and costs'),
  ('media.generate', 'Generate narration, images, subtitles, and renders'),
  ('media.manage', 'Manage media providers, libraries, assets, and video projects'),
  ('billing.manage', 'Manage billing and credits'),
  ('export_video', 'Create export packages and publication kits'),
  ('download_package', 'Download export packages and bulk exports'),
  ('mark_as_published', 'Mark manual publications as completed'),
  ('edit_metadata', 'Edit publication metadata and SEO fields'),
  ('upload_asset', 'Upload assets to the central library'),
  ('delete_asset', 'Delete assets from the central library'),
  ('edit_asset', 'Edit asset metadata'),
  ('favorite_asset', 'Favorite assets'),
  ('create_collection', 'Create asset collections'),
  ('import_external_asset', 'Import assets from external providers'),
  ('view_templates', 'View premium templates and packs'),
  ('create_template', 'Create personal templates'),
  ('edit_template', 'Edit template configuration'),
  ('delete_template', 'Delete templates'),
  ('use_template', 'Use templates in Magic Mode, channels, and bulk generation'),
  ('manage_template_packs', 'Manage template packs'),
  ('audit.read', 'Read audit logs')
on conflict (key) do nothing;

insert into public.plans (
  name, slug, description, monthly_price, yearly_price, included_credits,
  max_workspaces, max_channels, max_projects, max_team_members,
  max_videos_per_month, max_renders_per_month, max_ai_video_generations,
  max_viral_clips, watermark_enabled, priority_queue, white_label_enabled, status
) values
  ('Starter', 'starter', 'Para validar canais e gerar os primeiros videos com watermark.', 97, 970, 1000, 1, 1, 3, 2, 20, 20, 5, 10, true, false, false, 'active'),
  ('Pro', 'pro', 'Para criadores e pequenas equipes com producao semanal.', 197, 1970, 5000, 2, 5, 15, 5, 100, 100, 25, 50, false, true, false, 'active'),
  ('Agency', 'agency', 'Para operacoes multi-canal e clientes recorrentes.', 497, 4970, 18000, 10, 30, 80, 20, 500, 500, 120, 250, false, true, true, 'active'),
  ('Enterprise', 'enterprise', 'Limites customizados, suporte dedicado e white label completo.', 1497, 14970, 75000, 50, 200, 500, 100, 2500, 2500, 750, 1500, false, true, true, 'active')
on conflict (slug) do update set
  name = excluded.name,
  description = excluded.description,
  monthly_price = excluded.monthly_price,
  yearly_price = excluded.yearly_price,
  included_credits = excluded.included_credits,
  max_workspaces = excluded.max_workspaces,
  max_channels = excluded.max_channels,
  max_projects = excluded.max_projects,
  max_team_members = excluded.max_team_members,
  max_videos_per_month = excluded.max_videos_per_month,
  max_renders_per_month = excluded.max_renders_per_month,
  max_ai_video_generations = excluded.max_ai_video_generations,
  max_viral_clips = excluded.max_viral_clips,
  watermark_enabled = excluded.watermark_enabled,
  priority_queue = excluded.priority_queue,
  white_label_enabled = excluded.white_label_enabled,
  status = excluded.status,
  updated_at = now();

insert into public.credit_packages (name, credits, price, bonus_credits, status) values
  ('1.000 creditos', 1000, 49, 0, 'active'),
  ('5.000 creditos', 5000, 199, 500, 'active'),
  ('10.000 creditos', 10000, 349, 1500, 'active'),
  ('50.000 creditos', 50000, 1497, 10000, 'active')
on conflict do nothing;

insert into public.niches (name, is_default, active) values
  ('Marketing', true, true),
  ('Vendas', true, true),
  ('FinanÃƒÆ’Ã†â€™Ãƒâ€ Ã¢â‚¬â„¢ÃƒÆ’Ã¢â‚¬Â ÃƒÂ¢Ã¢â€šÂ¬Ã¢â€žÂ¢ÃƒÆ’Ã†â€™ÃƒÂ¢Ã¢â€šÂ¬Ã…Â¡ÃƒÆ’Ã¢â‚¬Å¡Ãƒâ€šÃ‚Â§as', true, true),
  ('Investimentos', true, true),
  ('SaÃƒÆ’Ã†â€™Ãƒâ€ Ã¢â‚¬â„¢ÃƒÆ’Ã¢â‚¬Â ÃƒÂ¢Ã¢â€šÂ¬Ã¢â€žÂ¢ÃƒÆ’Ã†â€™ÃƒÂ¢Ã¢â€šÂ¬Ã…Â¡ÃƒÆ’Ã¢â‚¬Å¡Ãƒâ€šÃ‚Âºde', true, true),
  ('Emagrecimento', true, true),
  ('Fitness', true, true),
  ('Desenvolvimento Pessoal', true, true),
  ('Relacionamentos', true, true),
  ('EducaÃƒÆ’Ã†â€™Ãƒâ€ Ã¢â‚¬â„¢ÃƒÆ’Ã¢â‚¬Â ÃƒÂ¢Ã¢â€šÂ¬Ã¢â€žÂ¢ÃƒÆ’Ã†â€™ÃƒÂ¢Ã¢â€šÂ¬Ã…Â¡ÃƒÆ’Ã¢â‚¬Å¡Ãƒâ€šÃ‚Â§ÃƒÆ’Ã†â€™Ãƒâ€ Ã¢â‚¬â„¢ÃƒÆ’Ã¢â‚¬Â ÃƒÂ¢Ã¢â€šÂ¬Ã¢â€žÂ¢ÃƒÆ’Ã†â€™ÃƒÂ¢Ã¢â€šÂ¬Ã…Â¡ÃƒÆ’Ã¢â‚¬Å¡Ãƒâ€šÃ‚Â£o', true, true),
  ('Tecnologia', true, true),
  ('InteligÃƒÆ’Ã†â€™Ãƒâ€ Ã¢â‚¬â„¢ÃƒÆ’Ã¢â‚¬Â ÃƒÂ¢Ã¢â€šÂ¬Ã¢â€žÂ¢ÃƒÆ’Ã†â€™ÃƒÂ¢Ã¢â€šÂ¬Ã…Â¡ÃƒÆ’Ã¢â‚¬Å¡Ãƒâ€šÃ‚Âªncia Artificial', true, true),
  ('E-commerce', true, true),
  ('ImÃƒÆ’Ã†â€™Ãƒâ€ Ã¢â‚¬â„¢ÃƒÆ’Ã¢â‚¬Â ÃƒÂ¢Ã¢â€šÂ¬Ã¢â€žÂ¢ÃƒÆ’Ã†â€™ÃƒÂ¢Ã¢â€šÂ¬Ã…Â¡ÃƒÆ’Ã¢â‚¬Å¡Ãƒâ€šÃ‚Â³veis', true, true),
  ('Seguros', true, true),
  ('ProteÃƒÆ’Ã†â€™Ãƒâ€ Ã¢â‚¬â„¢ÃƒÆ’Ã¢â‚¬Â ÃƒÂ¢Ã¢â€šÂ¬Ã¢â€žÂ¢ÃƒÆ’Ã†â€™ÃƒÂ¢Ã¢â€šÂ¬Ã…Â¡ÃƒÆ’Ã¢â‚¬Å¡Ãƒâ€šÃ‚Â§ÃƒÆ’Ã†â€™Ãƒâ€ Ã¢â‚¬â„¢ÃƒÆ’Ã¢â‚¬Â ÃƒÂ¢Ã¢â€šÂ¬Ã¢â€žÂ¢ÃƒÆ’Ã†â€™ÃƒÂ¢Ã¢â€šÂ¬Ã…Â¡ÃƒÆ’Ã¢â‚¬Å¡Ãƒâ€šÃ‚Â£o Veicular', true, true),
  ('JurÃƒÆ’Ã†â€™Ãƒâ€ Ã¢â‚¬â„¢ÃƒÆ’Ã¢â‚¬Â ÃƒÂ¢Ã¢â€šÂ¬Ã¢â€žÂ¢ÃƒÆ’Ã†â€™ÃƒÂ¢Ã¢â€šÂ¬Ã…Â¡ÃƒÆ’Ã¢â‚¬Å¡Ãƒâ€šÃ‚Â­dico', true, true),
  ('Turismo', true, true)
on conflict (workspace_id, name) do nothing;

do $$
begin
  alter publication supabase_realtime add table public.workspaces;
exception
  when duplicate_object then null;
end $$;
do $$
begin
  alter publication supabase_realtime add table public.workspace_users;
exception
  when duplicate_object then null;
end $$;
do $$
begin
  alter publication supabase_realtime add table public.roles;
exception
  when duplicate_object then null;
end $$;
do $$
begin
  alter publication supabase_realtime add table public.permissions;
exception
  when duplicate_object then null;
end $$;
do $$
begin
  alter publication supabase_realtime add table public.audit_logs;
exception
  when duplicate_object then null;
end $$;
do $$
begin
  alter publication supabase_realtime add table public.projects;
exception
  when duplicate_object then null;
end $$;
do $$
begin
  alter publication supabase_realtime add table public.niches;
exception
  when duplicate_object then null;
end $$;
do $$
begin
  alter publication supabase_realtime add table public.personas;
exception
  when duplicate_object then null;
end $$;
do $$
begin
  alter publication supabase_realtime add table public.keywords;
exception
  when duplicate_object then null;
end $$;
do $$
begin
  alter publication supabase_realtime add table public.tags;
exception
  when duplicate_object then null;
end $$;
do $$
begin
  alter publication supabase_realtime add table public.content_folders;
exception
  when duplicate_object then null;
end $$;
do $$
begin
  alter publication supabase_realtime add table public.content_items;
exception
  when duplicate_object then null;
end $$;
do $$
begin
  alter publication supabase_realtime add table public.content_item_tags;
exception
  when duplicate_object then null;
end $$;
do $$
begin
  alter publication supabase_realtime add table public.favorites;
exception
  when duplicate_object then null;
end $$;
do $$
begin
  alter publication supabase_realtime add table public.trends;
exception
  when duplicate_object then null;
end $$;
do $$
begin
  alter publication supabase_realtime add table public.competitors;
exception
  when duplicate_object then null;
end $$;
do $$
begin
  alter publication supabase_realtime add table public.competitor_insights;
exception
  when duplicate_object then null;
end $$;
do $$
begin
  alter publication supabase_realtime add table public.content_ideas;
exception
  when duplicate_object then null;
end $$;
do $$
begin
  alter publication supabase_realtime add table public.idea_scores;
exception
  when duplicate_object then null;
end $$;
do $$
begin
  alter publication supabase_realtime add table public.idea_sources;
exception
  when duplicate_object then null;
end $$;
do $$
begin
  alter publication supabase_realtime add table public.idea_events;
exception
  when duplicate_object then null;
end $$;
do $$
begin
  alter publication supabase_realtime add table public.ai_providers;
exception
  when duplicate_object then null;
end $$;
do $$
begin
  alter publication supabase_realtime add table public.prompt_templates;
exception
  when duplicate_object then null;
end $$;
do $$
begin
  alter publication supabase_realtime add table public.ai_generations;
exception
  when duplicate_object then null;
end $$;
do $$
begin
  alter publication supabase_realtime add table public.ai_generation_jobs;
exception
  when duplicate_object then null;
end $$;
do $$
begin
  alter publication supabase_realtime add table public.ai_agents;
exception
  when duplicate_object then null;
end $$;
do $$
begin
  alter publication supabase_realtime add table public.playground_messages;
exception
  when duplicate_object then null;
end $$;
do $$
begin
  alter publication supabase_realtime add table public.ai_credit_usage;
exception
  when duplicate_object then null;
end $$;
do $$
begin
  alter publication supabase_realtime add table public.voice_providers;
exception
  when duplicate_object then null;
end $$;
do $$
begin
  alter publication supabase_realtime add table public.voices;
exception
  when duplicate_object then null;
end $$;
do $$
begin
  alter publication supabase_realtime add table public.audio_generations;
exception
  when duplicate_object then null;
end $$;
do $$
begin
  alter publication supabase_realtime add table public.image_providers;
exception
  when duplicate_object then null;
end $$;
do $$
begin
  alter publication supabase_realtime add table public.image_generations;
exception
  when duplicate_object then null;
end $$;
do $$
begin
  alter publication supabase_realtime add table public.media_assets;
exception
  when duplicate_object then null;
end $$;
do $$
begin
  alter publication supabase_realtime add table public.video_projects;
exception
  when duplicate_object then null;
end $$;
do $$
begin
  alter publication supabase_realtime add table public.video_scenes;
exception
  when duplicate_object then null;
end $$;
do $$
begin
  alter publication supabase_realtime add table public.subtitle_segments;
exception
  when duplicate_object then null;
end $$;
do $$
begin
  alter publication supabase_realtime add table public.music_tracks;
exception
  when duplicate_object then null;
end $$;
do $$
begin
  alter publication supabase_realtime add table public.video_renders;
exception
  when duplicate_object then null;
end $$;
do $$
begin
  alter publication supabase_realtime add table public.media_usage_logs;
exception
  when duplicate_object then null;
end $$;
do $$
begin
  alter publication supabase_realtime add table public.visual_style_presets;
exception
  when duplicate_object then null;
end $$;
do $$
begin
  alter publication supabase_realtime add table public.video_effects;
exception
  when duplicate_object then null;
end $$;
do $$
begin
  alter publication supabase_realtime add table public.video_ai_providers;
exception
  when duplicate_object then null;
end $$;
do $$
begin
  alter publication supabase_realtime add table public.image_animations;
exception
  when duplicate_object then null;
end $$;
do $$
begin
  alter publication supabase_realtime add table public.subtitle_styles;
exception
  when duplicate_object then null;
end $$;
do $$
begin
  alter publication supabase_realtime add table public.audio_settings;
exception
  when duplicate_object then null;
end $$;
do $$
begin
  alter publication supabase_realtime add table public.thumbnail_generations;
exception
  when duplicate_object then null;
end $$;
do $$
begin
  alter publication supabase_realtime add table public.video_versions;
exception
  when duplicate_object then null;
end $$;
do $$
begin
  alter publication supabase_realtime add table public.magic_templates;
exception
  when duplicate_object then null;
end $$;
do $$
begin
  alter publication supabase_realtime add table public.magic_video_jobs;
exception
  when duplicate_object then null;
end $$;
do $$
begin
  alter publication supabase_realtime add table public.source_videos;
exception
  when duplicate_object then null;
end $$;
do $$
begin
  alter publication supabase_realtime add table public.video_transcripts;
exception
  when duplicate_object then null;
end $$;
do $$
begin
  alter publication supabase_realtime add table public.viral_clip_jobs;
exception
  when duplicate_object then null;
end $$;
do $$
begin
  alter publication supabase_realtime add table public.viral_moments;
exception
  when duplicate_object then null;
end $$;
do $$
begin
  alter publication supabase_realtime add table public.viral_clips;
exception
  when duplicate_object then null;
end $$;
do $$
begin
  alter publication supabase_realtime add table public.channels;
exception
  when duplicate_object then null;
end $$;
do $$
begin
  alter publication supabase_realtime add table public.channel_templates;
exception
  when duplicate_object then null;
end $$;
do $$
begin
  alter publication supabase_realtime add table public.content_calendar;
exception
  when duplicate_object then null;
end $$;
do $$
begin
  alter publication supabase_realtime add table public.production_plans;
exception
  when duplicate_object then null;
end $$;
do $$
begin
  alter publication supabase_realtime add table public.bulk_jobs;
exception
  when duplicate_object then null;
end $$;
do $$
begin
  alter publication supabase_realtime add table public.channel_goals;
exception
  when duplicate_object then null;
end $$;
do $$
begin
  alter publication supabase_realtime add table public.channel_permissions;
exception
  when duplicate_object then null;
end $$;
do $$
begin
  alter publication supabase_realtime add table public.operation_notifications;
exception
  when duplicate_object then null;
end $$;
do $$
begin
  alter publication supabase_realtime add table public.ai_video_providers;
exception
  when duplicate_object then null;
end $$;
do $$
begin
  alter publication supabase_realtime add table public.image_to_video_jobs;
exception
  when duplicate_object then null;
end $$;
do $$
begin
  alter publication supabase_realtime add table public.text_to_video_jobs;
exception
  when duplicate_object then null;
end $$;
do $$
begin
  alter publication supabase_realtime add table public.intro_outro_generations;
exception
  when duplicate_object then null;
end $$;
do $$
begin
  alter publication supabase_realtime add table public.talking_character_jobs;
exception
  when duplicate_object then null;
end $$;
do $$
begin
  alter publication supabase_realtime add table public.ai_video_assets;
exception
  when duplicate_object then null;
end $$;
do $$
begin
  alter publication supabase_realtime add table public.plans;
exception
  when duplicate_object then null;
end $$;
do $$
begin
  alter publication supabase_realtime add table public.subscriptions;
exception
  when duplicate_object then null;
end $$;
do $$
begin
  alter publication supabase_realtime add table public.credit_wallets;
exception
  when duplicate_object then null;
end $$;
do $$
begin
  alter publication supabase_realtime add table public.credit_transactions;
exception
  when duplicate_object then null;
end $$;
do $$
begin
  alter publication supabase_realtime add table public.credit_packages;
exception
  when duplicate_object then null;
end $$;
do $$
begin
  alter publication supabase_realtime add table public.billing_events;
exception
  when duplicate_object then null;
end $$;
do $$
begin
  alter publication supabase_realtime add table public.invoices;
exception
  when duplicate_object then null;
end $$;
do $$
begin
  alter publication supabase_realtime add table public.platform_admins;
exception
  when duplicate_object then null;
end $$;
do $$
begin
  alter publication supabase_realtime add table public.feature_flags;
exception
  when duplicate_object then null;
end $$;
do $$
begin
  alter publication supabase_realtime add table public.export_packages;
exception
  when duplicate_object then null;
end $$;
do $$
begin
  alter publication supabase_realtime add table public.video_metadata;
exception
  when duplicate_object then null;
end $$;
do $$
begin
  alter publication supabase_realtime add table public.bulk_export_jobs;
exception
  when duplicate_object then null;
end $$;
do $$
begin
  alter publication supabase_realtime add table public.manual_publications;
exception
  when duplicate_object then null;
end $$;
do $$
begin
  alter publication supabase_realtime add table public.asset_sources;
exception
  when duplicate_object then null;
end $$;
do $$
begin
  alter publication supabase_realtime add table public.assets;
exception
  when duplicate_object then null;
end $$;
do $$
begin
  alter publication supabase_realtime add table public.asset_collections;
exception
  when duplicate_object then null;
end $$;
do $$
begin
  alter publication supabase_realtime add table public.asset_collection_items;
exception
  when duplicate_object then null;
end $$;
do $$
begin
  alter publication supabase_realtime add table public.asset_usage;
exception
  when duplicate_object then null;
end $$;
do $$
begin
  alter publication supabase_realtime add table public.asset_search_cache;
exception
  when duplicate_object then null;
end $$;
do $$
begin
  alter publication supabase_realtime add table public.premium_templates;
exception
  when duplicate_object then null;
end $$;
do $$
begin
  alter publication supabase_realtime add table public.template_packs;
exception
  when duplicate_object then null;
end $$;
do $$
begin
  alter publication supabase_realtime add table public.template_pack_items;
exception
  when duplicate_object then null;
end $$;
do $$
begin
  alter publication supabase_realtime add table public.onboarding_progress;
exception
  when duplicate_object then null;
end $$;
do $$
begin
  alter publication supabase_realtime add table public.onboarding_events;
exception
  when duplicate_object then null;
end $$;
do $$
begin
  alter publication supabase_realtime add table public.video_quality_scores;
exception
  when duplicate_object then null;
end $$;
do $$
begin
  alter publication supabase_realtime add table public.video_recommendations;
exception
  when duplicate_object then null;
end $$;
do $$
begin
  alter publication supabase_realtime add table public.trend_topics;
exception
  when duplicate_object then null;
end $$;
do $$
begin
  alter publication supabase_realtime add table public.idea_bank;
exception
  when duplicate_object then null;
end $$;
do $$
begin
  alter publication supabase_realtime add table public.tracked_channels;
exception
  when duplicate_object then null;
end $$;
do $$
begin
  alter publication supabase_realtime add table public.content_factories;
exception
  when duplicate_object then null;
end $$;
do $$
begin
  alter publication supabase_realtime add table public.production_rules;
exception
  when duplicate_object then null;
end $$;
do $$
begin
  alter publication supabase_realtime add table public.factory_schedules;
exception
  when duplicate_object then null;
end $$;
do $$
begin
  alter publication supabase_realtime add table public.content_series;
exception
  when duplicate_object then null;
end $$;
do $$
begin
  alter publication supabase_realtime add table public.factory_queue_jobs;
exception
  when duplicate_object then null;
end $$;
do $$
begin
  alter publication supabase_realtime add table public.review_queue_items;
exception
  when duplicate_object then null;
end $$;
do $$
begin
  alter publication supabase_realtime add table public.factory_alerts;
exception
  when duplicate_object then null;
end $$;
do $$
begin
  alter publication supabase_realtime add table public.backup_jobs;
exception
  when duplicate_object then null;
end $$;
do $$
begin
  alter publication supabase_realtime add table public.data_retention_policies;
exception
  when duplicate_object then null;
end $$;
do $$
begin
  alter publication supabase_realtime add table public.security_events;
exception
  when duplicate_object then null;
end $$;
do $$
begin
  alter publication supabase_realtime add table public.rate_limits;
exception
  when duplicate_object then null;
end $$;
do $$
begin
  alter publication supabase_realtime add table public.error_logs;
exception
  when duplicate_object then null;
end $$;
do $$
begin
  alter publication supabase_realtime add table public.user_legal_acceptances;
exception
  when duplicate_object then null;
end $$;
do $$
begin
  alter publication supabase_realtime add table public.data_requests;
exception
  when duplicate_object then null;
end $$;
do $$
begin
  alter publication supabase_realtime add table public.smoke_test_video_results;
exception
  when duplicate_object then null;
end $$;
