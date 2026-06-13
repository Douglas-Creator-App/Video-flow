-- C10: permite deletar workspaces.
-- O trigger de auditoria roda AFTER DELETE e inseria audit_logs com
-- workspace_id apontando para o workspace recem-apagado, violando a FK
-- e bloqueando qualquer delete de workspace. Isso vale tambem para as
-- tabelas filhas removidas em cascata durante o delete do workspace.
-- O log passa a ser gravado com workspace_id nulo quando o workspace
-- nao existe mais (entity_id preserva o id original).

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

  -- Deletes em cascata podem rodar depois do workspace sumir; o log
  -- nao pode referenciar um workspace inexistente.
  if target_workspace_id is not null
     and not exists (select 1 from public.workspaces w where w.id = target_workspace_id) then
    target_workspace_id := null;
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
$$;
