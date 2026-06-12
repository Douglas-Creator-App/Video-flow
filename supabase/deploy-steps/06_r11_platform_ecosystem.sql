-- Video Flow deploy step: 06_r11_platform_ecosystem.sql
-- Source: supabase\migrations\20260610_r11_platform_ecosystem.sql

create table if not exists public.public_api_keys (
  id uuid primary key default gen_random_uuid(),
  workspace_id uuid not null references public.workspaces(id) on delete cascade,
  name text not null,
  key_prefix text not null,
  key_hash text not null unique,
  scopes text[] not null default '{}',
  status text not null default 'active' check (status in ('active', 'revoked', 'expired')),
  rate_limit_per_minute integer not null default 60,
  last_used_at timestamptz,
  expires_at timestamptz,
  created_by uuid references auth.users(id) on delete set null,
  revoked_at timestamptz,
  created_at timestamptz not null default now()
);

create table if not exists public.webhook_endpoints (
  id uuid primary key default gen_random_uuid(),
  workspace_id uuid not null references public.workspaces(id) on delete cascade,
  url text not null,
  secret_encrypted text not null,
  events text[] not null default '{}',
  status text not null default 'active' check (status in ('active', 'paused', 'disabled')),
  failure_count integer not null default 0,
  last_delivery_at timestamptz,
  created_by uuid references auth.users(id) on delete set null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.webhook_deliveries (
  id uuid primary key default gen_random_uuid(),
  workspace_id uuid not null references public.workspaces(id) on delete cascade,
  endpoint_id uuid references public.webhook_endpoints(id) on delete set null,
  event_type text not null,
  payload jsonb not null default '{}'::jsonb,
  status text not null default 'pending' check (status in ('pending', 'delivered', 'failed')),
  http_status integer,
  error_message text,
  attempts integer not null default 0,
  delivered_at timestamptz,
  created_at timestamptz not null default now()
);

create table if not exists public.marketplace_listings (
  id uuid primary key default gen_random_uuid(),
  workspace_id uuid references public.workspaces(id) on delete set null,
  creator_user_id uuid references auth.users(id) on delete set null,
  type text not null check (type in ('template', 'agent', 'workflow')),
  name text not null,
  description text,
  category text,
  niche text,
  pricing_type text not null default 'free' check (pricing_type in ('free', 'premium', 'community')),
  price numeric(10,2) not null default 0,
  status text not null default 'draft' check (status in ('draft', 'review', 'published', 'rejected', 'archived')),
  is_featured boolean not null default false,
  usage_count integer not null default 0,
  revenue numeric(12,2) not null default 0,
  metadata jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.platform_usage_events (
  id uuid primary key default gen_random_uuid(),
  workspace_id uuid references public.workspaces(id) on delete cascade,
  api_key_id uuid references public.public_api_keys(id) on delete set null,
  event_type text not null,
  resource_type text,
  resource_id text,
  metadata jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now()
);

create table if not exists public.workspace_organizations (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  owner_workspace_id uuid references public.workspaces(id) on delete cascade,
  billing_workspace_id uuid references public.workspaces(id) on delete set null,
  white_label_domain text,
  status text not null default 'active' check (status in ('active', 'suspended', 'archived')),
  created_at timestamptz not null default now()
);

create table if not exists public.workspace_organization_members (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid not null references public.workspace_organizations(id) on delete cascade,
  workspace_id uuid not null references public.workspaces(id) on delete cascade,
  relationship text not null default 'child' check (relationship in ('owner', 'child', 'franchise', 'client')),
  created_at timestamptz not null default now(),
  unique (organization_id, workspace_id)
);

create table if not exists public.corporate_credit_pools (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid references public.workspace_organizations(id) on delete cascade,
  workspace_id uuid references public.workspaces(id) on delete cascade,
  name text not null,
  balance numeric(12,2) not null default 0,
  reserved numeric(12,2) not null default 0,
  monthly_limit numeric(12,2),
  status text not null default 'active' check (status in ('active', 'paused', 'closed')),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists idx_public_api_keys_workspace on public.public_api_keys(workspace_id, status);
create index if not exists idx_public_api_keys_hash on public.public_api_keys(key_hash);
create index if not exists idx_webhook_endpoints_workspace on public.webhook_endpoints(workspace_id, status);
create index if not exists idx_webhook_deliveries_workspace on public.webhook_deliveries(workspace_id, event_type, created_at desc);
create index if not exists idx_marketplace_listings_type_status on public.marketplace_listings(type, status, pricing_type);
create index if not exists idx_platform_usage_events_workspace on public.platform_usage_events(workspace_id, event_type, created_at desc);
create index if not exists idx_workspace_organizations_owner on public.workspace_organizations(owner_workspace_id, status);
create index if not exists idx_corporate_credit_pools_org on public.corporate_credit_pools(organization_id, status);

alter table public.public_api_keys enable row level security;
alter table public.webhook_endpoints enable row level security;
alter table public.webhook_deliveries enable row level security;
alter table public.marketplace_listings enable row level security;
alter table public.platform_usage_events enable row level security;
alter table public.workspace_organizations enable row level security;
alter table public.workspace_organization_members enable row level security;
alter table public.corporate_credit_pools enable row level security;

drop policy if exists "Workspace members read public API keys" on public.public_api_keys;
create policy "Workspace members read public API keys" on public.public_api_keys for select using (
  exists (select 1 from public.workspace_users wu where wu.workspace_id = public_api_keys.workspace_id and wu.user_id = auth.uid() and wu.status = 'active')
  or exists (select 1 from public.workspaces w where w.id = public_api_keys.workspace_id and w.owner_id = auth.uid())
);

drop policy if exists "Workspace members read webhook endpoints" on public.webhook_endpoints;
create policy "Workspace members read webhook endpoints" on public.webhook_endpoints for select using (
  exists (select 1 from public.workspace_users wu where wu.workspace_id = webhook_endpoints.workspace_id and wu.user_id = auth.uid() and wu.status = 'active')
  or exists (select 1 from public.workspaces w where w.id = webhook_endpoints.workspace_id and w.owner_id = auth.uid())
);

drop policy if exists "Workspace members read webhook deliveries" on public.webhook_deliveries;
create policy "Workspace members read webhook deliveries" on public.webhook_deliveries for select using (
  exists (select 1 from public.workspace_users wu where wu.workspace_id = webhook_deliveries.workspace_id and wu.user_id = auth.uid() and wu.status = 'active')
  or exists (select 1 from public.workspaces w where w.id = webhook_deliveries.workspace_id and w.owner_id = auth.uid())
);

drop policy if exists "Published marketplace listings are readable" on public.marketplace_listings;
create policy "Published marketplace listings are readable" on public.marketplace_listings for select using (status = 'published');

drop policy if exists "Workspace members read platform usage events" on public.platform_usage_events;
create policy "Workspace members read platform usage events" on public.platform_usage_events for select using (
  workspace_id is null
  or exists (select 1 from public.workspace_users wu where wu.workspace_id = platform_usage_events.workspace_id and wu.user_id = auth.uid() and wu.status = 'active')
  or exists (select 1 from public.workspaces w where w.id = platform_usage_events.workspace_id and w.owner_id = auth.uid())
);

