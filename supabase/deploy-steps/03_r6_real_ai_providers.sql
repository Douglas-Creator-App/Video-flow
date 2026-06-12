-- Video Flow deploy step: 03_r6_real_ai_providers.sql
-- Source: supabase\migrations\20260610_r6_real_ai_providers.sql

create table if not exists public.provider_usage_logs (
  id uuid primary key default gen_random_uuid(),
  workspace_id uuid not null references public.workspaces(id) on delete cascade,
  user_id uuid references auth.users(id) on delete set null,
  job_id uuid references public.background_jobs(id) on delete set null,
  provider text not null,
  model text,
  task_type text not null,
  input_units numeric(12,2) not null default 0,
  output_units numeric(12,2) not null default 0,
  cost_estimate numeric(12,6) not null default 0,
  credits_charged numeric(12,2) not null default 0,
  status text not null check (status in ('completed','failed','blocked')),
  error_message text,
  metadata jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now()
);

create index if not exists idx_provider_usage_workspace on public.provider_usage_logs(workspace_id, created_at desc);
create index if not exists idx_provider_usage_provider on public.provider_usage_logs(provider, task_type, status);

alter table public.provider_usage_logs enable row level security;

drop policy if exists "members read provider usage logs" on public.provider_usage_logs;
create policy "members read provider usage logs" on public.provider_usage_logs
  for select to authenticated using (public.is_workspace_member(workspace_id) or public.is_platform_admin('support'));

drop policy if exists "content creators write provider usage logs" on public.provider_usage_logs;
create policy "content creators write provider usage logs" on public.provider_usage_logs
  for insert to authenticated with check (public.has_workspace_permission(workspace_id, 'content.create') or public.is_platform_admin('support'));

alter table public.media_usage_logs drop constraint if exists media_usage_logs_action_type_check;
alter table public.media_usage_logs add constraint media_usage_logs_action_type_check
  check (action_type in ('tts_generation','image_generation','video_render','render_video','ai_generation','ai_animation','upload','export_package','magic_video','viral_clip','factory_generation','thumbnail_generation','video_ai_generation'));

do $$
begin
  alter publication supabase_realtime add table public.provider_usage_logs;
exception
  when duplicate_object then null;
end $$;
