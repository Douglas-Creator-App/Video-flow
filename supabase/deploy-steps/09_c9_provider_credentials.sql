-- C9: credenciais de provedores configuraveis pela UI (server-side only)

create table if not exists public.provider_credentials (
  id uuid primary key default gen_random_uuid(),
  key_name text not null unique,
  key_value text not null,
  updated_by uuid references auth.users(id) on delete set null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

comment on table public.provider_credentials is
  'Chaves de API de provedores (OpenAI, ElevenLabs, etc). Acesso apenas via service role; nunca expor ao cliente.';

alter table public.provider_credentials enable row level security;

-- Sem policies: somente o service role (backend) le e escreve.
