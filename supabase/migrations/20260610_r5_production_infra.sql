create table if not exists public.background_jobs (
  id uuid primary key default gen_random_uuid(),
  workspace_id uuid not null references public.workspaces(id) on delete cascade,
  user_id uuid references auth.users(id) on delete set null,
  type text not null check (type in ('magic_video','ai_generation','tts_generation','image_generation','render_video','export_package','viral_clip','text_to_video','image_to_video','talking_character','backup','factory_generation')),
  status text not null default 'queued' check (status in ('queued','running','completed','failed','cancelled','retrying')),
  priority integer not null default 5,
  payload jsonb not null default '{}'::jsonb,
  result jsonb,
  progress integer not null default 0 check (progress between 0 and 100),
  current_step text not null default 'Na fila',
  attempts integer not null default 0,
  max_attempts integer not null default 3,
  error_message text,
  scheduled_at timestamptz not null default now(),
  started_at timestamptz,
  completed_at timestamptz,
  cancelled_at timestamptz,
  cancel_requested boolean not null default false,
  locked_at timestamptz,
  locked_by text,
  lock_expired_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.background_job_logs (
  id uuid primary key default gen_random_uuid(),
  job_id uuid not null references public.background_jobs(id) on delete cascade,
  workspace_id uuid not null references public.workspaces(id) on delete cascade,
  level text not null check (level in ('info','warning','error','debug')),
  message text not null,
  metadata jsonb,
  created_at timestamptz not null default now()
);

create table if not exists public.worker_heartbeats (
  id uuid primary key default gen_random_uuid(),
  worker_id text not null unique,
  status text not null check (status in ('active','idle','stopped')),
  last_seen_at timestamptz not null default now(),
  metadata jsonb
);

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

alter table public.credit_wallets add column if not exists reserved_balance numeric(12,2) not null default 0;

alter table public.credit_transactions drop constraint if exists credit_transactions_type_check;
alter table public.credit_transactions add constraint credit_transactions_type_check
  check (type in ('monthly_grant','purchase','usage','refund','adjustment','expiration','reserve','release'));

alter table public.media_usage_logs drop constraint if exists media_usage_logs_action_type_check;
alter table public.media_usage_logs add constraint media_usage_logs_action_type_check
  check (action_type in ('tts_generation','image_generation','video_render','render_video','ai_generation','ai_animation','upload','export_package','magic_video','viral_clip','factory_generation'));

alter table public.export_packages drop constraint if exists export_packages_status_check;
alter table public.export_packages add constraint export_packages_status_check
  check (status in ('draft','preparing','generating_metadata','creating_zip','uploading','ready','downloaded','marked_as_published','failed'));

create index if not exists idx_background_jobs_queue on public.background_jobs(status, scheduled_at, priority desc);
create index if not exists idx_background_jobs_workspace on public.background_jobs(workspace_id, created_at desc);
create index if not exists idx_background_jobs_type_status on public.background_jobs(type, status);
create index if not exists idx_background_jobs_lock on public.background_jobs(status, locked_at, lock_expired_at);
create index if not exists idx_background_job_logs_job on public.background_job_logs(job_id, created_at);
create index if not exists idx_background_job_logs_workspace on public.background_job_logs(workspace_id, created_at desc);
create index if not exists idx_worker_heartbeats_seen on public.worker_heartbeats(last_seen_at desc);
create index if not exists idx_provider_usage_workspace on public.provider_usage_logs(workspace_id, created_at desc);
create index if not exists idx_provider_usage_provider on public.provider_usage_logs(provider, task_type, status);

alter table public.background_jobs enable row level security;
alter table public.background_job_logs enable row level security;
alter table public.worker_heartbeats enable row level security;
alter table public.provider_usage_logs enable row level security;

drop policy if exists "members read background jobs" on public.background_jobs;
create policy "members read background jobs" on public.background_jobs
  for select to authenticated using (public.is_workspace_member(workspace_id) or public.is_platform_admin('support'));

drop policy if exists "creators create background jobs" on public.background_jobs;
create policy "creators create background jobs" on public.background_jobs
  for insert to authenticated with check (public.has_workspace_permission(workspace_id, 'content.create') or public.is_platform_admin('support'));

drop policy if exists "creators update own workspace jobs" on public.background_jobs;
create policy "creators update own workspace jobs" on public.background_jobs
  for update to authenticated using (public.has_workspace_permission(workspace_id, 'content.create') or public.is_platform_admin('support'))
  with check (public.has_workspace_permission(workspace_id, 'content.create') or public.is_platform_admin('support'));

drop policy if exists "members read background job logs" on public.background_job_logs;
create policy "members read background job logs" on public.background_job_logs
  for select to authenticated using (public.is_workspace_member(workspace_id) or public.is_platform_admin('support'));

drop policy if exists "creators write background job logs" on public.background_job_logs;
create policy "creators write background job logs" on public.background_job_logs
  for insert to authenticated with check (public.has_workspace_permission(workspace_id, 'content.create') or public.is_platform_admin('support'));

drop policy if exists "platform admins read worker heartbeats" on public.worker_heartbeats;
create policy "platform admins read worker heartbeats" on public.worker_heartbeats
  for select to authenticated using (public.is_platform_admin('support') or public.is_platform_admin('admin'));

drop policy if exists "members read provider usage logs" on public.provider_usage_logs;
create policy "members read provider usage logs" on public.provider_usage_logs
  for select to authenticated using (public.is_workspace_member(workspace_id) or public.is_platform_admin('support'));

drop policy if exists "service writers provider usage logs" on public.provider_usage_logs;
create policy "service writers provider usage logs" on public.provider_usage_logs
  for insert to authenticated with check (public.has_workspace_permission(workspace_id, 'content.create') or public.is_platform_admin('support'));

create or replace function public.claim_background_job(worker_id_input text, lock_minutes_input integer default 15)
returns setof public.background_jobs
language plpgsql
security definer
set search_path = public
as $$
declare
  claimed_id uuid;
begin
  select id into claimed_id
  from public.background_jobs
  where status in ('queued','retrying')
    and scheduled_at <= now()
  order by priority desc, created_at asc
  for update skip locked
  limit 1;

  if claimed_id is null then
    return;
  end if;

  update public.background_jobs
  set status = 'running',
      attempts = attempts + 1,
      started_at = coalesce(started_at, now()),
      locked_at = now(),
      locked_by = worker_id_input,
      lock_expired_at = now() + make_interval(mins => lock_minutes_input),
      current_step = 'Processando tentativa ' || (attempts + 1)::text,
      updated_at = now()
  where id = claimed_id;

  insert into public.background_job_logs(job_id, workspace_id, level, message, metadata)
  select id, workspace_id, 'info', 'Job travado pelo worker', jsonb_build_object('workerId', worker_id_input)
  from public.background_jobs
  where id = claimed_id;

  return query select * from public.background_jobs where id = claimed_id;
end;
$$;

create or replace function public.reserve_credits_for_job(
  workspace_id_input uuid,
  user_id_input uuid,
  job_id_input uuid,
  job_type_input text,
  amount_input numeric
)
returns jsonb
language plpgsql
security definer
set search_path = public
as $$
declare
  wallet public.credit_wallets%rowtype;
begin
  if amount_input <= 0 then
    return jsonb_build_object('reserved', false);
  end if;

  select * into wallet
  from public.credit_wallets
  where workspace_id = workspace_id_input
  for update;

  if not found then
    raise exception 'Carteira de creditos nao encontrada.';
  end if;

  if wallet.balance - wallet.reserved_balance < amount_input then
    raise exception 'Creditos insuficientes para reservar.';
  end if;

  update public.credit_wallets
  set reserved_balance = reserved_balance + amount_input,
      updated_at = now()
  where workspace_id = workspace_id_input
  returning * into wallet;

  insert into public.credit_transactions(workspace_id, user_id, type, amount, balance_after, description, reference_type, reference_id)
  values (workspace_id_input, user_id_input, 'reserve', amount_input, wallet.balance - wallet.reserved_balance, 'Reserva para job ' || job_type_input, 'background_job', job_id_input);

  return jsonb_build_object('reserved', true, 'balance_after', wallet.balance - wallet.reserved_balance);
end;
$$;

create or replace function public.settle_reserved_credits_for_job(
  workspace_id_input uuid,
  user_id_input uuid,
  job_id_input uuid,
  job_type_input text,
  amount_input numeric,
  consumed_input boolean
)
returns jsonb
language plpgsql
security definer
set search_path = public
as $$
declare
  wallet public.credit_wallets%rowtype;
  transaction_type text;
  transaction_amount numeric;
  description_text text;
begin
  if amount_input <= 0 then
    return jsonb_build_object('settled', false);
  end if;

  select * into wallet
  from public.credit_wallets
  where workspace_id = workspace_id_input
  for update;

  if not found then
    raise exception 'Carteira de creditos nao encontrada.';
  end if;

  if consumed_input then
    update public.credit_wallets
    set balance = greatest(0, balance - amount_input),
        reserved_balance = greatest(0, reserved_balance - amount_input),
        used_this_period = used_this_period + amount_input,
        updated_at = now()
    where workspace_id = workspace_id_input
    returning * into wallet;
    transaction_type := 'usage';
    transaction_amount := -amount_input;
    description_text := 'Debito de creditos do job ' || job_type_input;
  else
    update public.credit_wallets
    set reserved_balance = greatest(0, reserved_balance - amount_input),
        updated_at = now()
    where workspace_id = workspace_id_input
    returning * into wallet;
    transaction_type := 'release';
    transaction_amount := amount_input;
    description_text := 'Estorno de reserva do job ' || job_type_input;
  end if;

  insert into public.credit_transactions(workspace_id, user_id, type, amount, balance_after, description, reference_type, reference_id)
  values (workspace_id_input, user_id_input, transaction_type, transaction_amount, wallet.balance - wallet.reserved_balance, description_text, 'background_job', job_id_input);

  return jsonb_build_object('settled', true, 'consumed', consumed_input, 'balance_after', wallet.balance - wallet.reserved_balance);
end;
$$;

insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values
  ('videos', 'videos', false, 524288000, array['video/mp4','video/webm','video/quicktime']),
  ('thumbnails', 'thumbnails', false, 20971520, array['image/png','image/jpeg','image/webp']),
  ('exports', 'exports', false, 1073741824, array['application/zip','application/octet-stream']),
  ('audio', 'audio', false, 104857600, array['audio/mpeg','audio/wav','audio/ogg','audio/mp4']),
  ('images', 'images', false, 52428800, array['image/png','image/jpeg','image/webp']),
  ('temp', 'temp', false, 1073741824, null)
on conflict (id) do update set public = excluded.public;

drop policy if exists "members read own workspace media objects" on storage.objects;
create policy "members read own workspace media objects" on storage.objects
  for select to authenticated
  using (
    bucket_id in ('videos','thumbnails','exports','audio','images','temp')
    and (storage.foldername(name))[1] ~* '^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$'
    and public.is_workspace_member((storage.foldername(name))[1]::uuid)
  );

do $$
begin
  alter publication supabase_realtime add table public.background_jobs;
exception
  when duplicate_object then null;
end $$;

do $$
begin
  alter publication supabase_realtime add table public.background_job_logs;
exception
  when duplicate_object then null;
end $$;

do $$
begin
  alter publication supabase_realtime add table public.worker_heartbeats;
exception
  when duplicate_object then null;
end $$;

do $$
begin
  alter publication supabase_realtime add table public.provider_usage_logs;
exception
  when duplicate_object then null;
end $$;
