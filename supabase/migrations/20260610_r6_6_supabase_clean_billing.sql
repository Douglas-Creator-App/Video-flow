alter table public.credit_wallets add column if not exists reserved_balance numeric(12,2) not null default 0;
alter table public.workspaces add column if not exists status text not null default 'active';

alter table public.workspaces drop constraint if exists workspaces_status_check;
alter table public.workspaces add constraint workspaces_status_check
  check (status in ('active','suspended','archived'));

alter table public.credit_wallets drop constraint if exists credit_wallets_non_negative_check;
alter table public.credit_wallets add constraint credit_wallets_non_negative_check
  check (balance >= 0 and reserved_balance >= 0 and reserved_balance <= balance);

alter table public.credit_transactions drop constraint if exists credit_transactions_type_check;
alter table public.credit_transactions add constraint credit_transactions_type_check
  check (type in ('monthly_grant','purchase','usage','refund','adjustment','expiration','reserve','release'));

create or replace function public.create_credit_wallet_for_workspace()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
declare
  default_plan public.plans%rowtype;
  initial_credits numeric(12,2);
begin
  select * into default_plan
  from public.plans
  where slug = 'basic' and status = 'active'
  limit 1;

  initial_credits := coalesce(default_plan.included_credits, 0);

  insert into public.credit_wallets(workspace_id, balance, monthly_allowance, purchased_credits, used_this_period, reset_at)
  values (new.id, initial_credits, initial_credits, 0, 0, now() + interval '30 days')
  on conflict (workspace_id) do nothing;

  if default_plan.id is not null then
    insert into public.subscriptions(workspace_id, plan_id, status, billing_cycle, provider)
    values (new.id, default_plan.id, 'trialing', 'monthly', 'placeholder')
    on conflict do nothing;
  end if;

  if initial_credits > 0 then
    insert into public.credit_transactions(workspace_id, type, amount, balance_after, description)
    values (new.id, 'monthly_grant', initial_credits, initial_credits, 'Saldo inicial automatico do workspace')
    on conflict do nothing;
  end if;

  return new;
end;
$$;

drop trigger if exists create_credit_wallet_after_workspace_insert on public.workspaces;
create trigger create_credit_wallet_after_workspace_insert
after insert on public.workspaces
for each row execute function public.create_credit_wallet_for_workspace();

drop policy if exists "members read own workspace media objects" on storage.objects;
create policy "members read own workspace media objects" on storage.objects
  for select to authenticated
  using (
    bucket_id in ('videos','thumbnails','exports','audio','images','temp')
    and array_length(storage.foldername(name), 1) >= 1
    and (storage.foldername(name))[1] ~* '^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$'
    and public.is_workspace_member((storage.foldername(name))[1]::uuid)
  );

drop policy if exists "members upload own workspace media objects" on storage.objects;
create policy "members upload own workspace media objects" on storage.objects
  for insert to authenticated
  with check (
    bucket_id in ('videos','thumbnails','exports','audio','images','temp')
    and array_length(storage.foldername(name), 1) >= 1
    and (storage.foldername(name))[1] ~* '^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$'
    and public.has_workspace_permission((storage.foldername(name))[1]::uuid, 'content.create')
  );

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
