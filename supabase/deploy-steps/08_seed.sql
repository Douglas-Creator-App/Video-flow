-- Video Flow deploy step: 08_seed.sql
-- Source: supabase\seed.sql

-- R6.6 minimal seed for a clean Supabase project.
-- Create Auth users in Supabase Auth first. Then optionally set DEMO_OWNER_ID below.

insert into public.permissions (key, description) values
  ('workspace.manage', 'Manage workspace settings'),
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
  ('Basic', 'basic', 'Seed minimo para beta interno com limites conservadores.', 97, 970, 1000, 1, 1, 3, 2, 20, 20, 5, 10, true, false, false, 'active'),
  ('Pro', 'pro', 'Seed minimo para operacao beta com producao semanal.', 197, 1970, 5000, 2, 5, 15, 5, 100, 100, 25, 50, false, true, false, 'active')
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

delete from public.feature_flags where workspace_id is null;

insert into public.feature_flags (workspace_id, feature_key, enabled, limit_value) values
  (null, 'generate_script', true, null),
  (null, 'generate_voice', true, null),
  (null, 'generate_image', true, null),
  (null, 'render_video', true, null),
  (null, 'export_package', true, null),
  (null, 'generate_thumbnail', true, null),
  (null, 'viral_clips', true, null),
  (null, 'ai_video', true, null),
  (null, 'bulk_generation', true, null),
  (null, 'create_channel', true, null),
  (null, 'create_project', true, null),
  (null, 'invite_user', true, null),
  (null, 'white_label', false, null);

insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values
  ('videos', 'videos', false, 524288000, array['video/mp4','video/webm','video/quicktime']),
  ('thumbnails', 'thumbnails', false, 20971520, array['image/png','image/jpeg','image/webp']),
  ('exports', 'exports', false, 1073741824, array['application/zip','application/octet-stream']),
  ('audio', 'audio', false, 104857600, array['audio/mpeg','audio/wav','audio/ogg','audio/mp4']),
  ('images', 'images', false, 52428800, array['image/png','image/jpeg','image/webp']),
  ('temp', 'temp', false, 1073741824, null)
on conflict (id) do update set
  public = excluded.public,
  file_size_limit = excluded.file_size_limit,
  allowed_mime_types = excluded.allowed_mime_types;

-- Optional demo workspace after creating a Supabase Auth user:
-- insert into public.workspaces (id, name, slug, plan, owner_id)
-- values ('00000000-0000-0000-0000-000000000001', 'Video Flow Demo', 'video-flow-demo', 'Basic', '<auth-user-id>')
-- on conflict (slug) do nothing;
