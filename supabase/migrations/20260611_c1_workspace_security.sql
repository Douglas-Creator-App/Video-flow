insert into public.permissions (key, description) values
  ('admin.manage', 'Manage platform integrations, API keys, webhooks, and administrative platform settings')
on conflict (key) do update set description = excluded.description;

insert into public.role_permissions (role_id, permission_id)
select r.id, p.id
from public.roles r
cross join public.permissions p
where r.name in ('Owner', 'Admin')
  and p.key = 'admin.manage'
on conflict do nothing;

