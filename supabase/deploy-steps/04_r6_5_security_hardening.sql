-- Video Flow deploy step: 04_r6_5_security_hardening.sql
-- Source: supabase\migrations\20260610_r6_5_security_hardening.sql

create table if not exists public.rate_limit_events (
  id uuid primary key default gen_random_uuid(),
  workspace_id uuid not null references public.workspaces(id) on delete cascade,
  user_id uuid references auth.users(id) on delete set null,
  feature text not null,
  route text not null,
  metadata jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now()
);

create index if not exists idx_rate_limit_events_workspace on public.rate_limit_events(workspace_id, feature, created_at desc);
create index if not exists idx_rate_limit_events_user on public.rate_limit_events(user_id, created_at desc);

alter table public.rate_limit_events enable row level security;

drop policy if exists "members read rate limit events" on public.rate_limit_events;
create policy "members read rate limit events" on public.rate_limit_events
  for select to authenticated using (public.is_workspace_member(workspace_id) or public.is_platform_admin('support'));

drop policy if exists "service writers rate limit events" on public.rate_limit_events;
create policy "service writers rate limit events" on public.rate_limit_events
  for insert to authenticated with check (public.has_workspace_permission(workspace_id, 'audit.read') or public.is_platform_admin('support'));

do $$
begin
  alter publication supabase_realtime add table public.rate_limit_events;
exception
  when duplicate_object then null;
end $$;
